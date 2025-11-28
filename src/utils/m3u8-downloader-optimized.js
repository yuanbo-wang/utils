// import innerMuxjs from 'mux.js';
import {baseUrl} from '@/utils/baseConfig'

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
        maxMemoryUsage: 500, // 500MB内存限制
        batchSize: 5, // 批处理大小
        useWebWorker: true, // 默认使用Web Worker
        enableStreaming: true, // 启用流式处理
        maxRetries: 3, // 最大重试次数
        ...options
    };

    // 状态管理
    let isDownloading = false;
    let isCancelled = false;
    let downloadInstance = null;
    
    // 完成状态列表
    let finishList = [];
    
    // 内存管理
    const memoryManager = {
        usedMemory: 0,
        maxMemory: config.maxMemoryUsage * 1024 * 1024, // 转换为字节
        
        // 获取当前内存使用情况
        getMemoryUsage() {
            if (performance.memory) {
                return {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                };
            }
            return null;
        },
        
        // 检查是否超出内存限制
        isMemoryExceeded() {
            const usage = this.getMemoryUsage();
            if (usage) {
                return usage.used > this.maxMemory;
            }
            return false;
        },
        
        // 估算数据块大小
        estimateChunkSize(data) {
            return data instanceof ArrayBuffer ? data.byteLength : 
                   data instanceof Uint8Array ? data.byteLength : 
                   (data && data.byteLength) || 0;
        },
        
        // 内存压力检查
        checkMemoryPressure() {
            if (this.isMemoryExceeded()) {
                // 触发垃圾回收（如果可用）
                if (window.gc) {
                    window.gc();
                }
                
                // 如果仍然超出限制，返回true表示需要暂停
                return this.isMemoryExceeded();
            }
            return false;
        }
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
                
                this.worker.onmessage = (e) => {
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
                this.worker.postMessage({
                    id,
                    type: 'convert',
                    data: data,
                    config: {
                        duration: config.duration,
                        isFirstChunk: config.isFirstChunk
                    }
                }, [data]);
            });
        },
        
        terminate() {
            if (this.worker) {
                this.worker.terminate();
                this.worker = null;
            }
            this.activeTasks.clear();
        }
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
                    return this.downloadFile(url, retries - 1);
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
        }
    };

    // 批处理器
    const batchProcessor = {
        queue: [],
        processing: false,
        batchSize: config.batchSize,
        
        addTask(task) {
            this.queue.push(task);
            this.processQueue();
        },
        
        async processQueue() {
            if (this.processing || this.queue.length === 0 || memoryManager.checkMemoryPressure()) {
                return;
            }
            
            this.processing = true;
            
            while (this.queue.length > 0 && !isCancelled) {
                // 内存压力检查
                if (memoryManager.checkMemoryPressure()) {
                    console.log('内存压力过大，暂停处理');
                    break;
                }
                
                const batch = this.queue.splice(0, this.batchSize);
                await Promise.allSettled(batch.map(task => task()));
                
                // 批次间短暂延迟，避免阻塞
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            this.processing = false;
        }
    };

    // 流式处理器
    const streamingProcessor = {
        chunks: [],
        
        async init() {
            // 流式处理现在使用简单的数组存储，WritableStream支持检测
            if (!config.enableStreaming) return false;
            
            try {
                // 检测WritableStream支持
                if (typeof WritableStream !== 'undefined') {
                    this.writer = new WritableStream({
                        write: (chunk) => {
                            this.chunks.push(chunk);
                        }
                    });
                }
                return true;
            } catch (error) {
                console.warn('流式处理初始化失败:', error);
                return false;
            }
        },
        
        addChunk(data) {
            this.chunks.push(data);
        },
        
        getAllChunks() {
            return this.chunks;
        },
        
        reset() {
            this.chunks = [];
        }
    };

    // 主要下载函数
    const startDownload = async () => {
        if (isDownloading) {
            config.onError && config.onError(new Error('正在下载中，请稍后...'));
            return;
        }

        if (!m3u8Url) {
            config.onError && config.onError(new Error('请提供M3U8链接'));
            return;
        }

        if (m3u8Url.toLowerCase().indexOf('m3u8') === -1) {
            config.onError && config.onError(new Error('链接格式不正确，请确保是M3U8格式'));
            return;
        }

        isDownloading = true;
        isCancelled = false;

        try {
            // 初始化组件
            const useWorker = await workerManager.init();
            const useStreaming = await streamingProcessor.init();
            
            config.onProgress && config.onProgress(0, 0, 0, '开始下载M3U8文件...');
            
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
                durationSecond += parseFloat(item.split('#EXTINF:')[1]) || 0;
            }
        });

        if (tsUrls.length === 0) {
            throw new Error('没有找到有效的视频片段');
        }

        config.onProgress && config.onProgress(0, tsUrls.length, 0, `找到${tsUrls.length}个视频片段，开始下载...`);
        
        // 分批处理视频片段
        for (let i = 0; i < tsUrls.length; i++) {
            const task = () => processSegment(tsUrls[i], i, tsUrls.length, durationSecond, useWorker, useStreaming);
            batchProcessor.addTask(task);
        }
        
        // 等待所有任务完成
        while (batchProcessor.queue.length > 0 || batchProcessor.processing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 检查是否有错误
        const finishedCount = finishList.filter(f => f.status === 'finished').length;
        const errorCount = finishList.filter(f => f.status === 'error').length;
        
        if (finishedCount > 0) {
            config.onProgress && config.onProgress(finishedCount, tsUrls.length, errorCount, '所有片段处理完成，开始保存文件...');
            
            // 保存文件
            saveFile();
        } else {
            throw new Error('没有成功处理任何片段');
        }
    }

    // 处理单个视频片段
    async function processSegment(url, index, total, duration, useWorker, useStreaming) {
        try {
            if (isCancelled) return;
            
            finishList[index].status = 'downloading';
            
            // 下载TS文件（下载二进制数据）
            const tsData = await downloadManager.downloadFile(url, false);
            
            if (isCancelled) return;
            
            finishList[index].status = 'converting';
            
            // 转换为MP4
            let mp4Data;
            if (useWorker) {
                mp4Data = await workerManager.convertInWorker(tsData, {
                    duration,
                    isFirstChunk: index === 0
                });
            } else {
                // 后备的串行转换
                mp4Data = await convertInMainThread(tsData, duration, index === 0);
            }
            
            if (isCancelled) return;
            
            // 添加到流式处理器
            if (useStreaming) {
                streamingProcessor.addChunk(mp4Data);
            }
            
            // 存储转换后的数据
            finishList[index].mp4Data = mp4Data;
            finishList[index].status = 'finished';
            const completed = finishList.filter(f => f.status === 'finished').length;
            config.onProgress && config.onProgress(completed, total, 0, `处理进度: ${completed}/${total}`);
            
        } catch (error) {
            console.error(`处理片段 ${index} 失败:`, error);
            finishList[index].status = 'error';
            
            const completed = finishList.filter(f => f.status === 'finished').length;
            const errors = finishList.filter(f => f.status === 'error').length;
            config.onProgress && config.onProgress(completed, total, errors, `处理进度: ${completed}/${total}, 错误: ${errors}`);
        }
    }

    // 后备的主线程转换
    function convertInMainThread(data, duration, isFirstChunk) {
        return new Promise((resolve, reject) => {
            if (isCancelled) {
                reject(new Error('下载已取消'));
                return;
            }
            
            try {
                const transmuxer = new muxjs.mp4.Transmuxer({
                    keepOriginalTimestamps: true,
                    duration: parseInt(duration),
                });
                
                transmuxer.on('data', segment => {
                    if (isCancelled) {
                        reject(new Error('下载已取消'));
                        return;
                    }
                    
                    if (isFirstChunk) {
                        if (segment.initSegment && segment.data) {
                            const combinedData = new Uint8Array(
                                segment.initSegment.byteLength + segment.data.byteLength
                            );
                            combinedData.set(segment.initSegment, 0);
                            combinedData.set(segment.data, segment.initSegment.byteLength);
                            // 确保返回ArrayBuffer以保持与Worker一致
                            resolve(combinedData.buffer);
                        } else {
                            reject(new Error('缺少initSegment或data'));
                        }
                    } else {
                        if (segment.data) {
                            // 确保返回ArrayBuffer以保持与Worker一致
                            resolve(segment.data.buffer || segment.data);
                        } else {
                            reject(new Error('缺少data'));
                        }
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

    // 保存文件
    function saveFile() {
        if (isCancelled) return;
        
        const fileName = config.filename || formatTime(new Date(), 'YYYY_MM_DD hh_mm_ss');
        let chunks = streamingProcessor.getAllChunks();
        
        // 如果没有使用流式处理，直接合并所有数据
        if (chunks.length === 0) {
            chunks = finishList
                .map((item, index) => item.mp4Data)
                .filter(Boolean);
        }
        
        if (chunks.length === 0) {
            console.error('保存文件失败: 没有可用的视频数据', {
                finishList: finishList.map(item => ({ status: item.status, hasData: !!item.mp4Data })),
                streamingChunks: streamingProcessor.getAllChunks().length
            });
            throw new Error('没有可用的视频数据');
        }
        
        console.log('正在保存文件:', {
            chunksCount: chunks.length,
            totalSize: chunks.reduce((sum, chunk) => sum + (chunk.byteLength || chunk.length || 0), 0),
            fileName: fileName + '.mp4'
        });
        
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const filename = fileName + '.mp4';
        
        // 触发下载
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        config.onSuccess && config.onSuccess({
            blob,
            filename,
            mimeType: 'video/mp4',
            size: blob.size,
            chunks: chunks.length
        });
    }

    // 清理资源
    function cleanup() {
        downloadManager.cancelAll();
        workerManager.terminate();
        batchProcessor.queue.length = 0;
        streamingProcessor.reset();
    }

    // 取消下载
    const cancelDownload = () => {
        isCancelled = true;
        isDownloading = false;
        cleanup();
        config.onError && config.onError(new Error('下载已取消'));
    };

    // 启动下载
    startDownload();

    downloadInstance = {
        cancel: cancelDownload,
        getMemoryUsage: () => memoryManager.getMemoryUsage(),
        getProgress: () => {
            const total = finishList.length;
            const completed = finishList.filter(f => f.status === 'finished').length;
            const errors = finishList.filter(f => f.status === 'error').length;
            return { completed, total, errors };
        }
    };

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
    
    return formatStr.replace(
        /Y+|M+|D+|h+|m+|s+/g,
        target => (new Array(target.length).join('0') + formatType[target[0]]).substr(-target.length)
    );
}