import muxjs from 'mux.js';

/**
 * 主要的下载函数
 * @param {string} m3u8Url - M3U8文件的URL
 * @param {object} options - 配置选项
 * @param {function} options.onProgress - 进度回调函数 (progress, total, error)
 * @param {function} options.onSuccess - 成功回调函数 (fileBlob)
 * @param {function} options.onError - 错误回调函数 (error)
 * @param {string} options.filename - 文件名（可选，默认自动生成）
 * @returns {object} - 返回一个包含cancel方法的对象，用于取消下载
 */

export function downloadM3U8(m3u8Url, options = {}) {
    // 局部变量 - 实现数据隔离
    let isDownloading = false;
    let isCancelled = false;
    let tsUrlList = [];
    let finishList = [];
    let downloadIndex = [0]; // 使用数组包装以便引用传递
    let targetSegment = 0;
    let finishNum = [0]; // 使用数组包装以便引用传递
    let errorNum = [0]; // 使用数组包装以便引用传递
    let mediaFileList = [];
    let isGetMP4 = true; // 默认转换为MP4
    let durationSecond = 0;
    let title = '';
    let beginTime = null;
    let downloadOptions = options;
    let activeDownloads = []; // 用于跟踪活跃的下载请求
    const MAX_PARALLEL_DOWNLOADS = 5; // 调整为更合理的并行下载数量
    let notificationInstance = null;

    // 取消下载的方法
    const cancelDownload = () => {
        isCancelled = true;
        isDownloading = false;
        // 取消所有活跃的下载请求
        activeDownloads.forEach(xhr => {
            if (xhr && xhr.readyState !== 4) {
                xhr.abort();
            }
        });
        activeDownloads = [];
        downloadOptions.onError && downloadOptions.onError(new Error('下载已取消'));
    };

    // 开始下载
    const startDownload = async () => {
        if (isDownloading) {
            options.onError && options.onError(new Error('正在下载中，请稍后...'));
            return;
        }

        if (!m3u8Url) {
            options.onError && options.onError(new Error('请提供M3U8链接'));
            return;
        }

        if (m3u8Url.toLowerCase().indexOf('m3u8') === -1) {
            options.onError && options.onError(new Error('链接格式不正确，请确保是M3U8格式'));
            return;
        }

        isGetMP4 = true; // 始终转换为MP4格式
        isDownloading = true;
        isCancelled = false;
        beginTime = new Date();
        
        // 提取标题
        try {
            title = new URL(m3u8Url).searchParams.get('title') || '';
        } catch (e) {
            title = '';
        }
        
        // 如果没有标题，使用文件名
        if (!title && options.filename) {
            title = options.filename;
        }

        options.onProgress && options.onProgress(0, 0, 0, '开始下载M3U8文件...');
        
        try {
            await getM3U8(m3u8Url);
            isDownloading = false;
        } catch (error) {
            if (!isCancelled) {
                console.error('下载失败:', error);
                options.onError && options.onError(error);
            }
            isDownloading = false;
        } finally {
            // 清理资源
            activeDownloads = [];
        }
    };

    // 启动下载
    startDownload();

    // 返回包含cancel方法的对象
    return { cancel: cancelDownload };

    // === 内部函数定义 - 可以直接访问外部变量 ===
    
    // 检查是否所有片段都处理完成并保存文件
    function checkAndSave() {
        // 检查是否已取消
        if (isCancelled) {
            return true;
        }
        
        // 检查是否所有片段都处理完成（包括错误和成功）
        let completedCount = 0;
        for (let i = 0; i < finishList.length; i++) {
            if (finishList[i].status === 'finish' || finishList[i].status === 'error') {
                completedCount++;
            }
        }
        
        console.log(`已完成: ${completedCount}/${targetSegment}, 成功: ${finishNum[0]}, 错误: ${errorNum[0]}`);
        
        if (completedCount === targetSegment) {
            downloadOptions.onProgress && downloadOptions.onProgress(targetSegment, targetSegment, errorNum[0], '下载完成，开始保存文件...');
            
            // 稍微延迟确保所有数据已处理
            setTimeout(() => {
                if (!isCancelled) {
                    saveFile();
                }
            }, 500);
            return true; // 返回true表示可以保存了
        }
        return false; // 返回false表示还需要继续等待
    }

    // 获取M3U8文件并解析
    async function getM3U8(url) {
        const m3u8Str = await ajax(url);
        
        // 检查是否已取消
        if (isCancelled) {
            throw new Error('下载已取消');
        }
        
        // 重置状态
        tsUrlList.length = 0;
        finishList.length = 0;
        downloadIndex[0] = 0;
        finishNum[0] = 0;
        errorNum[0] = 0;
        mediaFileList.length = 0;
        durationSecond = 0;
        
        // 解析TS链接
        m3u8Str.split('\n').forEach((item) => {
            if (/^[^#]/.test(item) && item.trim()) {
                tsUrlList.push(applyURL(item, url));
                finishList.push({
                    title: item,
                    status: ''
                });
            }
        });

        targetSegment = tsUrlList.length;
        
        if (targetSegment === 0) {
            throw new Error('没有找到有效的视频片段');
        }

        // 计算视频时长（用于MP4转换）
        if (isGetMP4) {
            let infoIndex = 0;
            m3u8Str.split('\n').forEach(item => {
                if (item.toUpperCase().indexOf('#EXTINF:') > -1) {
                    infoIndex++;
                    durationSecond += parseFloat(item.split('#EXTINF:')[1]);
                }
            });
        }

        downloadOptions.onProgress && downloadOptions.onProgress(0, targetSegment, 0, `找到${targetSegment}个视频片段，开始下载...`);
        downloadTS();
    }

    // 下载TS片段
    function downloadTS() {
        const download = () => {
            // 检查是否已取消
            if (isCancelled) {
                return;
            }
            
            const currentDownloadIndex = downloadIndex[0];
            
            if (currentDownloadIndex >= targetSegment) {
                checkAndSave();
                return;
            }

            downloadIndex[0]++;

            if (finishList[currentDownloadIndex] && finishList[currentDownloadIndex].status === '') {
                finishList[currentDownloadIndex].status = 'downloading';
                
                const xhrPromise = ajax(tsUrlList[currentDownloadIndex], 'file', (xhr) => {
                    // 保存xhr对象以便取消
                    activeDownloads.push(xhr);
                });
                
                xhrPromise
                    .then(file => dealTS(file, currentDownloadIndex, download))
                    .catch(() => {
                        if (isCancelled) {
                            return;
                        }
                        errorNum[0]++;
                        finishList[currentDownloadIndex].status = 'error';
                        const currentCompleted = finishNum[0] + errorNum[0];
                        downloadOptions.onProgress && downloadOptions.onProgress(finishNum[0], targetSegment, errorNum[0], `下载进度: ${finishNum[0]}/${targetSegment}, 错误: ${errorNum[0]}`);
                        
                        // 检查是否所有片段都处理完成
                        if (!checkAndSave()) {
                            download();
                        }
                    });
            } else {
                download();
            }
        };

        // 建立多个下载线程，但不超过MAX_PARALLEL_DOWNLOADS
        for (let i = 0; i < Math.min(MAX_PARALLEL_DOWNLOADS, targetSegment); i++) {
            download();
        }
    }

    // 处理TS片段
    async function dealTS(file, index, callback) {
        try {
            // 检查是否已取消
            if (isCancelled) {
                return;
            }
            
            const afterData = await conversionMp4(file, index);
            
            // 检查是否已取消
            if (isCancelled) {
                return;
            }
            
            mediaFileList[index] = afterData;
            finishList[index].status = 'finish';
            finishNum[0]++;
            
            downloadOptions.onProgress && downloadOptions.onProgress(finishNum[0], targetSegment, errorNum[0], `下载进度: ${finishNum[0]}/${targetSegment}, 错误: ${errorNum[0]}`);
            
            // 检查是否所有片段都处理完成
            if (!checkAndSave()) {
                callback && callback();
            }
        } catch (error) {
            if (isCancelled) {
                return;
            }
            console.error('处理TS片段失败:', error);
            errorNum[0]++;
            finishList[index].status = 'error';
            
            // 检查是否所有片段都处理完成
            if (!checkAndSave()) {
                callback && callback();
            }
        }
    }

    // 转换为MP4
  function conversionMp4(data, index) {
    return new Promise((resolve, reject) => {
      try {
        // 检查是否已取消
        if (isCancelled) {
          reject(new Error('下载已取消'));
          return;
        }
        
        // 使用requestIdleCallback来避免阻塞主线程
        const performConversion = () => {
          // 检查是否已取消
          if (isCancelled) {
            reject(new Error('下载已取消'));
            return;
          }
          
          try {
            const transmuxer = new muxjs.mp4.Transmuxer({
              keepOriginalTimestamps: true,
              duration: parseInt(durationSecond),
            });
            
            transmuxer.on('data', segment => {
              // 检查是否已取消
              if (isCancelled) {
                reject(new Error('下载已取消'));
                return;
              }
              
              if (index === 0) {
                // 第一个片段需要合并initSegment和data
                if (segment.initSegment && segment.data) {
                  const combinedData = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
                  combinedData.set(segment.initSegment, 0);
                  combinedData.set(segment.data, segment.initSegment.byteLength);
                  resolve(combinedData.buffer);
                } else {
                  reject(new Error('缺少initSegment或data'));
                }
              } else {
                // 后续片段只需要data
                if (segment.data) {
                  resolve(segment.data);
                } else {
                  reject(new Error('缺少data'));
                }
              }
            });
            
            transmuxer.on('error', error => {
              reject(error);
            });
            
            transmuxer.push(new Uint8Array(data));
            transmuxer.flush();
          } catch (error) {
            console.error('转换失败:', error);
            reject(new Error('转换失败: ' + error.message));
          }
        };
        
        // 如果浏览器支持requestIdleCallback，则使用它
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(performConversion, { timeout: 1000 });
        } else {
          // 否则使用setTimeout延迟执行
          setTimeout(performConversion, 0);
        }
      } catch (error) {
        console.error('转换初始化失败:', error);
        reject(new Error('转换初始化失败: ' + error.message));
      }
    });
  }

    // 保存文件
    function saveFile() {
        // 检查是否已取消
        if (isCancelled) {
            return;
        }
        
        const fileName = title || formatTime(beginTime, 'YYYY_MM_DD hh_mm_ss');
        
        // 只保存为MP4格式
        const blob = new Blob(mediaFileList, { type: 'video/mp4' });
        const filename = fileName + '.mp4';
        
        // 自动触发文件下载
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        downloadOptions.onSuccess && downloadOptions.onSuccess({
            blob: blob,
            filename: filename,
            mimeType: 'video/mp4',
            size: blob.size
        });
    }
}

// 更新ajax函数，支持取消功能
function ajax(url, type = 'text', onXhrCreated) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // 调用回调函数传递xhr对象
        if (typeof onXhrCreated === 'function') {
            onXhrCreated(xhr);
        }
        
        if (type === 'file') {
            xhr.responseType = 'arraybuffer';
        }

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(new Error(`HTTP ${xhr.status}`));
                }
            }
        };

        xhr.onerror = function() {
            reject(new Error('网络请求失败'));
        };
        
        xhr.onabort = function() {
            reject(new Error('请求已取消'));
        };

        xhr.open('GET', url, true);
        xhr.send(null);
    });
}

// 工具函数
function applyURL(targetURL, baseURL) {
    baseURL = baseURL || window.location.href;
    
    if (targetURL.indexOf('http') === 0) {
        if (window.location.href.indexOf('https') === 0) {
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

