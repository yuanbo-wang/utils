// import innerMuxjs from 'mux.js';
import { baseUrl } from '@/utils/baseConfig';

/**
 * 优化后的M3U8下载器 - 解决大文件内存和性能问题
 * @param {string} m3u8Url - M3U8文件的URL
 * @param {object} options - 配置选项
 * @param {function} options.onProgress - 进度回调函数
 * @param {function} options.onSuccess - 成功回调函数
 * @param {function} options.onError - 错误回调函数
 * @param {string} options.filename - 文件名（可选）
 * @param {number} options.maxMemoryUsage - 最大内存使用限制(MB，默认500MB)
 * @param {number} options.batchSize - 批处理大小（默认5个片段）
 * @param {boolean} options.useWebWorker - 是否使用Web Worker（默认true）
 * @param {boolean} options.enableStreaming - 是否启用流式处理（默认true）
 * @param {number} options.maxRetries - 最大重试次数（默认3次）
 * @returns {object} - 返回包含cancel方法的对象
 */
export function downloadM3U8Optimized(m3u8Url, options = {}) {
  // 默认配置
  const config = {
    batchSize: 5, // 批处理大小
    useWebWorker: true, // 默认使用Web Worker
    enableStreaming: true, // 启用流式处理
    maxRetries: 3, // 最大重试次数
    ...options,
  };

  // 状态管理
  let isDownloading = false;
  let isCancelled = false;
  let downloadInstance = null;

  // 完成状态列表
  let finishList = [];

  // 不再需要内存管理，所有片段处理完立即存储到IndexedDB并清理内存

  // IndexedDB存储管理器 - 支持大文件存储
  const indexedDBManager = {
    dbName: 'M3U8DownloaderDB',
    storeName: 'videoChunks',
    db: null,

    // 初始化数据库
    async init() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          reject(new Error('浏览器不支持IndexedDB'));
          return;
        }

        const request = indexedDB.open(this.dbName, 1); // 使用版本1

        request.onerror = event => {
          console.error('IndexedDB打开错误:', event.target.error);

          // 如果是版本冲突错误，尝试强制删除数据库后重新初始化
          if (event.target.error && event.target.error.name === 'VersionError') {
            this.forceDeleteDB()
              .then(() => {
                this.init().then(resolve).catch(reject);
              })
              .catch(error => {
                reject(event.target.error);
              });
          } else {
            reject(event.target.error);
          }
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve(true);
        };

        request.onupgradeneeded = event => {
          const db = event.target.result;
        

          // 如果存储不存在，则创建存储（版本1的简单逻辑）
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('index', 'index', { unique: false });
          } else {
            console.log('存储已存在，无需创建:', this.storeName);
          }
        };

        request.onblocked = () => {
          console.warn('IndexedDB升级被阻塞，请关闭其他标签页');
        };
      });
    },

    // 存储转换后的MP4数据到IndexedDB
    async saveChunkToDB(index, mp4Data) {
      try {
        if (!this.db) {
          await this.init();
        }

        // 确保数据是有效的ArrayBuffer
        if (!mp4Data || !(mp4Data instanceof ArrayBuffer)) {
          console.error(`片段 ${index} 数据无效，不是ArrayBuffer类型:`, mp4Data);
          return false;
        }

        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);

          const chunkData = {
            id: `chunk_${index}`,
            data: mp4Data,
            timestamp: Date.now(),
            index: index,
          };

          const request = store.put(chunkData);

          request.onsuccess = () => {
            console.log(`片段 ${index} IndexedDB写入操作成功，数据大小: ${mp4Data.byteLength} bytes`);
          };

          request.onerror = event => {
            console.error(`片段 ${index} IndexedDB写入失败:`, event.target.error);
            reject(event.target.error);
          };

          // 等待整个事务完成，确保数据真正写入数据库
          transaction.oncomplete = () => {

            resolve(true);
          };

          transaction.onerror = event => {
            console.error(`片段 ${index} IndexedDB事务失败:`, event.target.error);
            reject(event.target.error);
          };
        });
      } catch (error) {
        console.error(`存储片段 ${index} 到IndexedDB失败:`, error);
        return false;
      }
    },

    // 从IndexedDB加载数据块
    async loadChunkFromDB(index) {
      try {
        if (!this.db) {
          await this.init();
        }

        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readonly');
          const store = transaction.objectStore(this.storeName);

          // 方法1：使用主键查询（keyPath: 'id'）
          const queryKey = `chunk_${index}`;
        
          const request = store.get(queryKey);

          request.onsuccess = () => {
         

            if (request.result && request.result.data) {
              const data = request.result.data;
              if (data instanceof ArrayBuffer && data.byteLength > 0) {
               
                resolve(data);
              } else {
                console.warn(`从IndexedDB加载片段 ${index} 失败: 数据格式无效`, {
                  isArrayBuffer: data instanceof ArrayBuffer,
                  byteLength: data.byteLength,
                  dataType: typeof data,
                  fullResult: request.result,
                });
                // 直接使用手动过滤查询
                this.loadChunkByManualFilter(index, resolve, reject);
              }
            } else {
              console.warn(`从IndexedDB加载片段 ${index} 失败: 数据不存在或为空`, {
                result: request.result,
                hasData: request.result ? !!request.result.data : false,
                resultKeys: request.result ? Object.keys(request.result) : [],
                queryKey: queryKey,
              });
              // 直接使用手动过滤查询
              this.loadChunkByManualFilter(index, resolve, reject);
            }
          };

          request.onerror = event => {
            console.error(`从IndexedDB加载片段 ${index} 错误:`, event.target.error);
            reject(event.target.error);
          };

          request.onerror = event => {
            console.error(`从IndexedDB加载片段 ${index} 错误:`, event.target.error);
            reject(event.target.error);
          };

          transaction.onerror = event => {
            console.error(`从IndexedDB加载片段 ${index} 事务错误:`, event.target.error);
          };
        });
      } catch (error) {
        console.error(`从IndexedDB加载片段 ${index} 异常:`, error);
        return null;
      }
    },

    // 方法3：手动过滤查询数据块
    async loadChunkByManualFilter(index, resolve, reject) {
      try {

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {


          // 手动过滤匹配的数据
          const matchedItem = request.result.find(item => {
            // 尝试多种匹配方式
            return item.id === `chunk_${index}` || item.index === index || (item.id && item.id.includes(`${index}`));
          });



          if (matchedItem && matchedItem.data) {
            const data = matchedItem.data;
            if (data instanceof ArrayBuffer && data.byteLength > 0) {

              resolve(data);
            } else {
              console.warn(`手动过滤查询片段 ${index} 失败: 数据格式无效`);
              resolve(null);
            }
          } else {
            console.warn(`手动过滤查询片段 ${index} 失败: 未找到匹配数据`);
            // 如果所有方法都失败，强制重建数据库
            // this.forceRebuildDatabase(index, resolve, reject);
          }
        };

        request.onerror = event => {
          console.error(`手动过滤查询片段 ${index} 错误:`, event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error(`手动过滤查询片段 ${index} 异常:`, error);
        resolve(null);
      }
    },

    // 强制重建数据库
    async forceRebuildDatabase(index, resolve, reject) {
      console.warn(`所有查询方法都失败，强制重建数据库以解决结构不一致问题`);

      try {
        // 1. 尝试删除现有数据库
        try {
          await this.forceDeleteDB();
        } catch (deleteError) {
          if (deleteError.message === '数据库删除被阻塞') {
            console.warn('数据库删除被阻塞，尝试使用备用方案：清理数据而非删除数据库');

            // 备用方案：清理数据而不是删除整个数据库
            await this.clearDB();

            // 重新初始化数据库连接
            this.db = null;
          } else {
            throw deleteError;
          }
        }

        // 2. 重新初始化数据库
        await this.init();

        // 3. 返回null，让上层逻辑重新下载数据
        console.warn(`数据库已重建，片段 ${index} 需要重新下载`);
        resolve(null);
      } catch (error) {
        console.error(`强制重建数据库失败:`, error);

        // 如果所有方法都失败，提供用户友好的提示
        if (error.message === '数据库删除被阻塞') {
          console.error(`⚠️ 无法重建数据库：请关闭其他使用此网站的标签页，然后重试下载`);
        }

        reject(error);
      }
    },

    // 获取所有已存储的片段索引
    async getAllChunkIndices() {
      try {
        if (!this.db) {
          await this.init();
        }

        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readonly');
          const store = transaction.objectStore(this.storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            // 过滤掉无效数据并排序
            const indices = request.result
              .filter(item => item && typeof item.index === 'number')
              .map(item => item.index)
              .sort((a, b) => a - b);

            resolve(indices);
          };

          request.onerror = event => {
            console.error('获取IndexedDB片段索引错误:', event.target.error);
            reject(event.target.error);
          };

          transaction.onerror = event => {
            console.error('获取IndexedDB片段索引事务错误:', event.target.error);
          };
        });
      } catch (error) {
        console.error('获取IndexedDB片段索引异常:', error);
        return [];
      }
    },

    // 强制删除整个IndexedDB数据库（解决版本冲突）
    async forceDeleteDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(this.dbName);

        request.onsuccess = () => {
          this.db = null;
          resolve(true);
        };

        request.onerror = event => {
          console.error('IndexedDB数据库删除失败:', event.target.error);
          reject(event.target.error);
        };

        request.onblocked = () => {
          console.warn('IndexedDB数据库删除被阻塞，请关闭其他标签页');
          console.error('⚠️ 数据库删除被阻塞：请关闭其他使用此网站的标签页，然后重试下载');
          reject(new Error('数据库删除被阻塞'));
        };
      });
    },

    // 清理IndexedDB的数据
    async clearDB() {
      try {
        if (!this.db) {
          await this.init();
        }

        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.clear();

          request.onsuccess = () => resolve(true);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('清理IndexedDB失败:', error);
      }
    },

    // 获取已存储的片段数量
    async getStoredChunkCount() {
      const indices = await this.getAllChunkIndices();
      return indices.length;
    },

    // 直接获取所有IndexedDB数据块
    async getAllChunks() {
      try {
        if (!this.db) {
          await this.init();
        }

        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readonly');
          const store = transaction.objectStore(this.storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            // 过滤有效数据并排序
            const validChunks = request.result
              .filter(item => item && item.data && item.data instanceof ArrayBuffer && item.data.byteLength > 0)
              .sort((a, b) => {
                // 按索引排序
                const aIndex = a.index !== undefined ? a.index : parseInt(a.id?.replace('chunk_', '') || '0');
                const bIndex = b.index !== undefined ? b.index : parseInt(b.id?.replace('chunk_', '') || '0');
                return aIndex - bIndex;
              })
              .map(item => item.data);

            resolve(validChunks);
          };

          request.onerror = event => {
            console.error('获取所有IndexedDB数据错误:', event.target.error);
            reject(event.target.error);
          };

          transaction.onerror = event => {
            console.error('获取所有IndexedDB数据事务错误:', event.target.error);
          };
        });
      } catch (error) {
        console.error('获取所有IndexedDB数据异常:', error);
        return [];
      }
    },
  };

  // Web Worker管理器
  const workerManager = {
    worker: null,
    taskQueue: [],
    activeTasks: new Map(),

    async init() {
      if (!config.useWebWorker || typeof Worker === 'undefined') {
        return false;
      }

      try {
        // 创建内联Worker代码
        const workerCode = `
                    let muxReady = false;
                    
                    try {
                        importScripts('${baseUrl}/mux.js');
                        muxReady = true;
                    } catch (error) {
                        console.warn('Worker中mux.js CDN加载失败，Worker将不可用:', error);
                    }
                    self.onmessage = function(e) {
                        const { id, type, data, config } = e.data;
                        
                        try {
                            if (!muxReady) {
                                throw new Error('mux.js在Worker中未正确加载，请使用主线程处理');
                            }
                            
                            if (type === 'convert') {
                                convertTStoMP4(data, config).then(result => {
                                    // 确保result是ArrayBuffer类型才能作为transferable传递
                                    if (result instanceof ArrayBuffer) {
                                        self.postMessage({ id, success: true, result }, [result]);
                                    } else {
                                        // 如果不是ArrayBuffer，创建新的ArrayBuffer
                                        const buffer = result.buffer || new Uint8Array(result).buffer;
                                        self.postMessage({ id, success: true, result: buffer }, [buffer]);
                                    }
                                }).catch(error => {
                                    self.postMessage({ 
                                        id, 
                                        success: false, 
                                        error: error.message 
                                    });
                                });
                            } else {
                                throw new Error('Unknown task type');
                            }
                        } catch (error) {
                            self.postMessage({ 
                                id, 
                                success: false, 
                                error: error.message 
                            });
                        }
                    };
                    
                    function convertTStoMP4(data, config) {
                        return new Promise((resolve, reject) => {
                            try {
                                const transmuxer = new muxjs.mp4.Transmuxer({
                                    keepOriginalTimestamps: true,
                                    duration: parseInt(config.duration || 0),
                                });
                                
                                transmuxer.on('data', segment => {
                                    try {
                                        if (config.isFirstChunk) {
                                            if (segment.initSegment && segment.data) {
                                                const combinedData = new Uint8Array(
                                                    segment.initSegment.byteLength + segment.data.byteLength
                                                );
                                                combinedData.set(segment.initSegment, 0);
                                                combinedData.set(segment.data, segment.initSegment.byteLength);
                                                // 确保返回ArrayBuffer
                                                resolve(combinedData.buffer);
                                            } else {
                                                reject(new Error('缺少initSegment或data'));
                                            }
                                        } else {
                                            if (segment.data) {
                                                // 确保返回ArrayBuffer
                                                resolve(segment.data.buffer);
                                            } else {
                                                reject(new Error('缺少data'));
                                            }
                                        }
                                    } catch (error) {
                                        reject(error);
                                    }
                                });
                                
                                transmuxer.on('error', reject);
                                transmuxer.push(new Uint8Array(data));
                                transmuxer.flush();
                            } catch (error) {
                                reject(error);
                            }
                        });
                    }
                `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        this.worker = new Worker(workerUrl);

        this.worker.onmessage = e => {
          const { id, success, result, error } = e.data;
          const task = this.activeTasks.get(id);
          if (task) {
            this.activeTasks.delete(id);
            if (success) {
              task.resolve(result);
            } else {
              task.reject(new Error(error));
            }
          }
        };

        return true;
      } catch (error) {
        console.warn('Web Worker初始化失败:', error);
        return false;
      }
    },

    async convertInWorker(data, config) {
      if (!this.worker) {
        throw new Error('Worker未初始化');
      }

      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36).substr(2, 9);
        this.activeTasks.set(id, { resolve, reject });

        // 将ArrayBuffer作为transferable对象传递，但不能传递config对象
        this.worker.postMessage(
          {
            id,
            type: 'convert',
            data: data,
            config: {
              duration: config.duration,
              isFirstChunk: config.isFirstChunk,
            },
          },
          [data]
        );
      });
    },

    terminate() {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
      this.activeTasks.clear();
    },
  };

  // 下载管理器
  const downloadManager = {
    activeDownloads: new Map(),
    maxConcurrent: 5,

    async downloadFile(url, isText = true, retries = config.maxRetries) {
      // 检查是否已取消
      if (isCancelled) {
        throw new Error('下载已取消');
      }

      try {
        const xhr = new XMLHttpRequest();

        if (!isText) {
          xhr.responseType = 'arraybuffer';
        }

        const downloadPromise = new Promise((resolve, reject) => {
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                if (isText) {
                  resolve(xhr.responseText);
                } else {
                  resolve(xhr.response);
                }
              } else {
                reject(new Error(`HTTP ${xhr.status}`));
              }
            }
          };

          xhr.onerror = () => reject(new Error('网络请求失败'));
          xhr.onabort = () => reject(new Error('请求已取消'));
        });

        this.activeDownloads.set(url, xhr);
        xhr.open('GET', url, true);
        xhr.send();

        return await downloadPromise;
      } catch (error) {
        if (retries > 0) {
          console.warn(`下载失败，剩余重试次数: ${retries}`, error);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.downloadFile(url, isText, retries - 1);
        }
        throw error;
      } finally {
        this.activeDownloads.delete(url);
      }
    },

    cancelAll() {
      this.activeDownloads.forEach(xhr => {
        if (xhr.readyState !== 4) {
          xhr.abort();
        }
      });
      this.activeDownloads.clear();
    },
  };

  // 批处理器
  const batchProcessor = {
    queue: [],
    processing: false,
    batchSize: config.batchSize,

    addTask(task) {
      this.queue.push(task);
      // 不立即处理，等待下载管理器的并发控制
      this.scheduleProcess();
    },

    scheduleProcess() {
      // 延迟处理，确保下载管理器有足够的时间进行并发控制
      setTimeout(() => {
        this.processQueue();
      }, 100);
    },

    async processQueue() {
      if (this.processing || this.queue.length === 0) {
        return;
      }

      // 检查下载管理器的活跃下载数，确保不超过最大并发数
      const activeDownloadCount = downloadManager.activeDownloads.size;
      if (activeDownloadCount >= downloadManager.maxConcurrent) {
        // 延迟重试
        setTimeout(() => {
          this.processQueue();
        }, 500);
        return;
      }

      this.processing = true;
      // 标记
      while (this.queue.length > 0 && !isCancelled) {
        // 检查下载管理器并发数
        const currentActiveDownloadCount = downloadManager.activeDownloads.size;
        if (currentActiveDownloadCount >= downloadManager.maxConcurrent) {
          break;
        }

        // 计算当前可处理的任务数
        const availableSlots = downloadManager.maxConcurrent - currentActiveDownloadCount;
        const processCount = Math.min(this.batchSize, this.queue.length, availableSlots);

        if (processCount === 0) {
          break;
        }

        const batch = this.queue.splice(0, processCount);
        await Promise.allSettled(batch.map(task => task()));

        // 批次间短暂延迟，避免阻塞
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      this.processing = false;

      // 如果队列中还有任务，继续调度处理
      if (this.queue.length > 0) {
        this.scheduleProcess();
      }
    },
  };

  // 流式处理器（已移除，所有片段直接存储到IndexedDB）

  // 主要下载函数
  const startDownload = async () => {
    if (isDownloading) {
      console.error('正在下载中，请稍后...');
      return;
    }

    if (!m3u8Url) {
      console.error('请提供M3U8链接');
      return;
    }

    if (m3u8Url.toLowerCase().indexOf('m3u8') === -1) {
      console.error('链接格式不正确，请确保是M3U8格式');
      return;
    }
    // 清理IndexedDB数据
    await indexedDBManager.clearDB();
    isDownloading = true;
    isCancelled = false;

    try {
      // 初始化组件
      const useWorker = await workerManager.init();
      const useStreaming = false; // 流式处理已移除

      config.onProgress && config.onProgress(1, 0, 0, '开始下载M3U8文件...');

      await processM3U8(m3u8Url, useWorker, useStreaming);
    } catch (error) {
      if (!isCancelled) {
        console.error('下载失败:', error);
        config.onError && config.onError(error);
      }
    } finally {
      isDownloading = false;
      // 清理资源
      cleanup();
    }
  };

  // 处理M3U8文件
  async function processM3U8(url, useWorker, useStreaming) {
    const m3u8Str = await downloadManager.downloadFile(url, true);

    if (isCancelled) throw new Error('下载已取消');

    const tsUrls = [];
    // 重置finishList
    finishList = [];
    let durationSecond = 0;

    // 解析M3U8内容
    m3u8Str.split('\n').forEach(item => {
      if (/^[^#]/.test(item) && item.trim()) {
        tsUrls.push(applyURL(item, url));
        finishList.push({ status: '' });
      } else if (item.toUpperCase().indexOf('#EXTINF:') > -1) {
        const extinfValue = item.split('#EXTINF:')[1];
        const segmentDuration = parseFloat(extinfValue) || 0;
        durationSecond += segmentDuration;
      }
    });

    if (tsUrls.length === 0) {
      throw new Error('没有找到有效的视频片段');
    }

    config.onProgress && config.onProgress(tsUrls.length, 0, 0, `找到${tsUrls.length}个视频片段，开始下载...`);

    // 分批处理视频片段
    for (let i = 0; i < tsUrls.length; i++) {
      const task = () => processSegment(tsUrls[i], i, tsUrls.length, durationSecond, useWorker, useStreaming);
      batchProcessor.addTask(task);
    }

    // 等待所有任务完成
    let waitCount = 0;

    // 无限等待，直到所有任务完成或取消
    while ((batchProcessor.queue.length > 0 || batchProcessor.processing) && !isCancelled) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;

      // 每10秒输出一次进度
      if (waitCount % 100 === 0) {
        const completed = finishList.filter(f => f.status === 'finished').length;
        const errors = finishList.filter(f => f.status === 'error').length;
      
      }

      // 检查是否所有任务都已完成或失败
      const completed = finishList.filter(f => f.status === 'finished').length;
      const errors = finishList.filter(f => f.status === 'error').length;

      // 如果所有片段都处理完成（成功或失败），则结束等待
      if (completed + errors >= tsUrls.length) {
        break;
      }
    }

    if (isCancelled) {
      return;
    }

    // 检查处理结果
    const finishedCount = finishList.filter(f => f.status === 'finished').length;
    const errorCount = finishList.filter(f => f.status === 'error').length;
    const totalCount = tsUrls.length;



    // 只有当成功处理了大部分片段时才保存文件
    const successRatio = finishedCount / totalCount;
    const minSuccessRatio = 0.8; // 至少80%的片段成功才保存文件

    if (finishedCount > 0 && successRatio >= minSuccessRatio) {
      config.onProgress &&
        config.onProgress(
          totalCount,
          finishedCount,
          errorCount,
          `片段处理完成 (${finishedCount}/${totalCount})，开始保存文件...`
        );

      // 保存文件
      saveFile();
    } else if (finishedCount > 0 && successRatio < minSuccessRatio) {
      console.warn(
        `成功处理的片段数量不足 (${finishedCount}/${totalCount}, ${(successRatio * 100).toFixed(1)}%)，不保存文件`
      );
      config.onError && config.onError(new Error(`下载不完整，仅完成${finishedCount}/${totalCount}个片段`));
    } else if (errorCount > 0) {
      console.warn('所有片段处理都失败了，但有部分错误信息');
      config.onError && config.onError(new Error(`所有片段处理失败，共${errorCount}个错误`));
    }
  }

  // 处理单个视频片段
  async function processSegment(url, index, total, duration, useWorker, useStreaming) {
    try {
      if (isCancelled) return;

      // 确保 finishList[index] 存在
      if (!finishList[index]) {
        console.warn(`片段 ${index} 的finishList条目不存在，创建新的条目`);
        finishList[index] = { status: '' };
      }

      finishList[index].status = 'downloading';

      // 下载TS文件（下载二进制数据）
      let tsData = await downloadManager.downloadFile(url, false);

      if (isCancelled) return;

      finishList[index].status = 'converting';

      // 转换为MP4 - 仅使用WebWorker方式
      if (!useWorker) {
        throw new Error('浏览器不支持WebWorker，无法进行视频转换');
      }

      const mp4Data = await workerManager.convertInWorker(tsData, {
        duration: duration, // 使用总时长而不是单个片段的duration
        isFirstChunk: index === 0,
      });

      if (isCancelled) return;

      // 存储转换后的数据
      finishList[index].mp4Data = mp4Data;
      finishList[index].status = 'finished';

      // 立即释放原始TS数据，避免内存泄漏
      tsData = null;

      // 每个片段处理完成后立即保存到IndexedDB并清理内存
      try {
        // 保存到IndexedDB
        const saved = await indexedDBManager.saveChunkToDB(index, mp4Data);
        if (saved) {
          // 立即释放内存，但先检查finishList[index]是否存在
          if (finishList[index]) {
            finishList[index].mp4Data = null;
          } else {
            console.warn(`片段 ${index} 的finishList条目不存在，跳过内存释放`);
          }
        } else {
          console.warn(`片段 ${index} 保存到IndexedDB失败`);
        }
      } catch (dbError) {
        console.warn(`片段 ${index} 保存到IndexedDB失败，继续处理:`, dbError);
        // IndexedDB保存失败不影响继续处理
      }

      const completed = finishList.filter(f => f.status === 'finished').length;
      const errors = finishList.filter(f => f.status === 'error').length;
      config.onProgress &&
        config.onProgress(total, completed, errors, `处理进度: ${completed}/${total}, 错误: ${errors}`);
    } catch (error) {
      console.error(`处理片段 ${index} 失败:`, error);
      finishList[index].status = 'error';

      const completed = finishList.filter(f => f.status === 'finished').length;
      const errors = finishList.filter(f => f.status === 'error').length;
      console.warn(`片段 ${index} 处理失败，继续处理其他片段，进度: ${completed}/${total}, 错误: ${errors}`);
      config.onProgress &&
        config.onProgress(total, completed, errors, `处理进度: ${completed}/${total}, 错误: ${errors}`);

      // 单个片段失败不影响整体下载过程
      // 继续处理下一个片段
    }
  }

  // 不再需要主线程转换函数，仅使用WebWorker方式

  // 保存文件
  async function saveFile() {
    if (isCancelled) return;

    const fileName = config.filename || formatTime(new Date(), 'YYYY_MM_DD hh_mm_ss');

    config.onProgress && config.onProgress(finishList.length, finishList.length, 0, '正在从IndexedDB合并文件...');

    // 直接获取所有IndexedDB数据
    const chunks = await indexedDBManager.getAllChunks();

    if (chunks.length === 0) {
      console.error('保存文件失败: 没有可用的视频数据', {
        storedIndices: storedIndices,
        storedChunks: chunks.length,
      });
      throw new Error('没有可用的视频数据');
    }

    // 数据完整性检查
    const totalSize = chunks.reduce((sum, chunk) => sum + (chunk.byteLength || chunk.length || 0), 0);
    if (totalSize === 0) {
      console.error('保存文件失败: 所有数据块大小为零', {
        chunksCount: chunks.length,
        chunksSizes: chunks.map(chunk => chunk.byteLength || chunk.length || 0),
      });
      throw new Error('视频数据无效');
    }

    const blob = new Blob(chunks, { type: 'video/mp4' });
    const filename = fileName + '.mp4';

    // 触发下载
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);

    // 添加下载完成事件监听器
    // a.addEventListener('click', async () => {
    //   // 延迟清理，确保下载完成
    //   setTimeout(async () => {
    //     console.log('下载完成，开始清理IndexedDB数据...');
    //     await indexedDBManager.clearDB();
    //     console.log('IndexedDB数据清理完成');
    //   }, 1000);
    // });

    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    config.onSuccess &&
      config.onSuccess({
        filename,
        mimeType: 'video/mp4',
        size: blob.size,
        chunks: chunks.length,
        storageMode: 'indexedDB',
      });
  }

  // 清理资源
  function cleanup() {
    // 取消所有下载任务
    downloadManager.cancelAll();

    // 终止worker
    workerManager.terminate();

    // 清空队列和状态
    batchProcessor.queue.length = 0;
    finishList = [];

    // 清理IndexedDB数据
    indexedDBManager.clearDB();

    // 重置取消标志
    isCancelled = false;

  }

  // 取消下载
  const cancelDownload = () => {
    isCancelled = true;
    isDownloading = false;
    cleanup();
    config.onError && config.onError(new Error('下载已取消'));
  };

  downloadInstance = {
    cancel: cancelDownload,
    getMemoryUsage: () => memoryManager.getMemoryUsage(),
    getProgress: () => {
      const total = finishList.length;
      const completed = finishList.filter(f => f.status === 'finished').length;
      const errors = finishList.filter(f => f.status === 'error').length;
      return { completed, total, errors };
    },
    // 添加启动方法
    start: async () => {
      await startDownload();
    },
  };

  // 立即启动下载
  downloadInstance.start().catch(error => {
    console.error('下载启动失败:', error);
    config.onError && config.onError(error);
  });

  return downloadInstance;
}

// 工具函数
function applyURL(targetURL, baseURL) {
  baseURL = baseURL || (typeof window !== 'undefined' ? window.location.href : '');

  if (targetURL.indexOf('http') === 0) {
    if (typeof window !== 'undefined' && window.location.href.indexOf('https') === 0) {
      return targetURL.replace('http://', 'https://');
    }
    return targetURL;
  } else if (targetURL[0] === '/') {
    const domain = baseURL.split('/');
    return domain[0] + '//' + domain[2] + targetURL;
  } else {
    const domain = baseURL.split('/');
    domain.pop();
    return domain.join('/') + '/' + targetURL;
  }
}

function formatTime(date, formatStr) {
  const formatType = {
    Y: date.getFullYear(),
    M: date.getMonth() + 1,
    D: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
  };

  return formatStr.replace(/Y+|M+|D+|h+|m+|s+/g, target =>
    (new Array(target.length).join('0') + formatType[target[0]]).substr(-target.length)
  );
}
