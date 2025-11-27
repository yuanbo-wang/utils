
import muxjs from 'mux.js';

/**
 * 主要的下载函数
 * @param {string} m3u8Url - M3U8文件的URL
 * @param {object} options - 配置选项
 * @param {function} options.onProgress - 进度回调函数 (progress, total, error)
 * @param {function} options.onSuccess - 成功回调函数 (fileBlob)
 * @param {function} options.onError - 错误回调函数 (error)
 * @param {string} options.filename - 文件名（可选，默认自动生成）
 */

export async function downloadM3U8(m3u8Url, options = {}) {
    // 局部变量 - 实现数据隔离
    let isDownloading = false;
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
        console.error('下载失败:', error);
        isDownloading = false;
        options.onError && options.onError(error);
    }

    // === 内部函数定义 - 可以直接访问外部变量 ===
    
    // 获取M3U8文件并解析
    async function getM3U8(url) {
        const m3u8Str = await ajax(url);
        
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

    // 检查是否所有片段都处理完成并保存文件
    const checkAndSave = () => {
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
                saveFile();
            }, 500);
            return true; // 返回true表示可以保存了
        }
        return false; // 返回false表示还需要继续等待
    };

    // 下载TS片段
    function downloadTS() {
        const download = () => {
            const currentDownloadIndex = downloadIndex[0];
            
            if (currentDownloadIndex >= targetSegment) {
                checkAndSave();
                return;
            }

            downloadIndex[0]++;

            if (finishList[currentDownloadIndex] && finishList[currentDownloadIndex].status === '') {
                finishList[currentDownloadIndex].status = 'downloading';
                
                ajax(tsUrlList[currentDownloadIndex], 'file')
                    .then(file => dealTS(file, currentDownloadIndex, download))
                    .catch(() => {
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

        // 建立多个下载线程
        for (let i = 0; i < Math.min(10, targetSegment); i++) {
            download();
        }
    }

    // 处理TS片段
    async function dealTS(file, index, callback) {
        try {
            const afterData = await conversionMp4(file, index);
            
            mediaFileList[index] = afterData;
            finishList[index].status = 'finish';
            finishNum[0]++; // 使用数组来确保能正确更新
            
            downloadOptions.onProgress && downloadOptions.onProgress(finishNum[0], targetSegment, errorNum[0], `下载进度: ${finishNum[0]}/${targetSegment}, 错误: ${errorNum[0]}`);
            
            // 检查是否所有片段都处理完成
            if (!checkAndSave()) {
                callback && callback();
            }
        } catch (error) {
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
        // 使用Web Worker异步执行转换，避免阻塞主线程
        const worker = new Worker(new URL('./transmuxer-worker.js', import.meta.url));
        
        worker.onmessage = function(e) {
          if (e.data.success) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error || '转换失败'));
          }
          // 转换完成后终止Worker，释放资源
          worker.terminate();
        };
        
        worker.onerror = function(error) {
          console.error('Worker执行错误:', error);
          reject(new Error('转换Worker执行失败'));
          worker.terminate();
        };
        
        // 向Worker发送数据，执行转换
        worker.postMessage({ 
          data: data, 
          mp4,
          index: index, 
          durationSecond: durationSecond 
        }, [data]); // 转移data的所有权，优化内存使用
      } catch (error) {
        console.error('创建Worker失败:', error);
        // 降级处理：如果Worker创建失败，使用主线程转换
        const transmuxer = new muxjs.mp4.Transmuxer({
          keepOriginalTimestamps: true,
          duration: parseInt(durationSecond),
        });
        
        transmuxer.on('data', segment => {
          if (index === 0) {
            const combinedData = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
            combinedData.set(segment.initSegment, 0);
            combinedData.set(segment.data, segment.initSegment.byteLength);
            resolve(combinedData.buffer);
          } else {
            resolve(segment.data);
          }
        });
        
        transmuxer.on('error', error => {
          reject(error);
        });
        
        transmuxer.push(new Uint8Array(data));
        transmuxer.flush();
      }
    });
  }

    // 保存文件
    function saveFile() {
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

function ajax(url, type = 'text') {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
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

        xhr.open('GET', url, true);
        xhr.send(null);
    });
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

// // 导出函数（如果在模块环境中）
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = { downloadM3U8 };
// }