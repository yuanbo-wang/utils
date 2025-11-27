// 在Worker内部直接加载mux.js库
import muxjs from 'mux.js';

self.onmessage = function(e) {
  const { data, index, durationSecond } = e.data;
  
  try {
    // 创建Transmuxer实例
    const transmuxer = new muxjs.mp4.Transmuxer({
      keepOriginalTimestamps: true,
      duration: parseInt(durationSecond),
    });
    
    transmuxer.on('data', segment => {
      if (index === 0) {
        // 第一个片段需要合并initSegment和data
        if (segment.initSegment && segment.data) {
          const combinedData = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
          combinedData.set(segment.initSegment, 0);
          combinedData.set(segment.data, segment.initSegment.byteLength);
          self.postMessage({ success: true, index, result: combinedData.buffer }, [combinedData.buffer]);
        } else {
          self.postMessage({ success: false, index, error: '缺少initSegment或data' });
        }
      } else {
        // 后续片段只需要data
        if (segment.data) {
          self.postMessage({ success: true, index, result: segment.data }, [segment.data]);
        } else {
          self.postMessage({ success: false, index, error: '缺少data' });
        }
      }
    });
    
    transmuxer.on('error', error => {
      self.postMessage({ success: false, index, error: error.message });
    });
    
    // 处理数据
    transmuxer.push(new Uint8Array(data));
    transmuxer.flush();
  } catch (error) {
    self.postMessage({ success: false, index, error: error.message });
  }
};
