// 导入mux.js库


self.onmessage = function(e) {
  const { data, index, durationSecond ,mp4} = e.data;
  
  try {
    // 创建Transmuxer实例
    const transmuxer = new mp4.Transmuxer({
      keepOriginalTimestamps: true,
      duration: parseInt(durationSecond),
    });
    
    transmuxer.on('data', segment => {
      if (index === 0) {
        // 第一个片段需要合并initSegment和data
        const combinedData = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
        combinedData.set(segment.initSegment, 0);
        combinedData.set(segment.data, segment.initSegment.byteLength);
        self.postMessage({ success: true, index, result: combinedData.buffer });
      } else {
        // 后续片段只需要data
        self.postMessage({ success: true, index, result: segment.data });
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
