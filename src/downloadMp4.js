import { FFmpeg } from '@ffmpeg/ffmpeg';

import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { baseUrl } from '@/utils/baseConfig';

// const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';
export const downloadMp4 = async (m3u8Url, filename = `${+new Date()}`, callback) => {
  callback &&
    callback({
      message: `正在请求视频数据源`,
      length: 0,
      current: 0,
      done: false,
    });
  const response = await fetch(m3u8Url).then(response => response.text());
  const tsUrlList = [];
  response.split('\n').forEach(item => {
    // if (/.(png|image|ts|jpg|mp4|jpeg)/.test(item)) {
    // 放开片段后缀限制，下载非 # 开头的链接片段
    if (/^[^#]/.test(item)) {
      tsUrlList.push(item);
    }
  });
  callback &&
    callback({
      message: `视频数据源请求完成`,
      length: tsUrlList.length,
      current: 0,
      done: false,
    });
  async function transcode() {
    // 将 tsUrlList 分割成多个子数组
    // 测试西瓜视频的视频 10个段 大概有个60秒   这应该跟后端segment分片有关
    const chunkSize = 100;
    const chunks = [];
    let downloadNumber = 0;
    for (let i = 0; i < tsUrlList.length; i += chunkSize) {
      chunks.push(tsUrlList.slice(i, i + chunkSize));
    }
    // 对每个子数组进行处理
    for (let i = 0; i < chunks.length; i++) {
      const ffmpeg = new FFmpeg();
      ffmpeg.on('log', ({ message: msg }) => {
        console.log(msg);
      });
      const baseURL = '';
      callback &&
        callback({
          message: `正在加载合成依赖`,
          length: tsUrlList.length,
          current: downloadNumber,
          done: false,
        });
      // fetch(`${baseURL}/ffmpeg-core.wasm`)
      //   .then(response => {
      //     console.log(response, 'response');
      //     return response.arrayBuffer();
      //   })
      //   .then(text => {
      //     console.log(text, 'text');
      //   });
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });
      console.log(ffmpeg.loaded, 'ffmpeg');
      console.log(1111111111111111111111111111111111111111111);
      // await ffmpeg.writeFile('test.ts', await fetchFile('/main/123.ts'))
      // await ffmpeg.exec(['-i', 'test.ts', 'test.mp4'])
      callback &&
        callback({
          message: `合成依赖加载完成`,
          length: tsUrlList.length,
          current: downloadNumber,
          done: false,
        });
      const chunk = chunks[i];
      let execStr = `concat:`;

      for (let j = 0; j < chunk.length; j++) {
        const element = chunk[j];
        let response;
        downloadNumber++;
        try {
          // 这里临时定义一个地址  实际再调整
          response = await fetchFile(
            'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/' + element
          );
        } catch (error) {
          console.error('下载失败:', error);
          continue; // 如果下载失败，跳过当前循环，进入下一个循环
        }
        await ffmpeg.writeFile(`test${i * chunkSize + j}.ts`, response);
        execStr += `test${i * chunkSize + j}.ts|`;
        callback &&
          callback({
            message: `正在下载`,
            length: tsUrlList.length,
            current: downloadNumber,
            done: false,
          });
      }

      callback &&
        callback({
          message: `视频合成中`,
          length: tsUrlList.length,
          current: downloadNumber,
          done: false,
        });

      console.log('execStrexecStrexecStrexecStr=>', execStr.substring(0, execStr.length - 1));
      await ffmpeg.exec(['-i', execStr.substring(0, execStr.length - 1), '-c', 'copy', `test${i}.mp4`]);

      // 删除已经处理过的TS文件
      // for (let j = 0; j < chunk.length; j++) {
      //   const filename = `test${i * chunkSize + j}.ts`;
      //   ffmpeg.deleteFile(filename);
      // }

      let data = await ffmpeg.readFile(`test${i}.mp4`);
      let src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      callback &&
        callback({
          message: `视频合成完成，启动下载`,
          length: tsUrlList.length,
          current: i === chunks.length - 1 ? tsUrlList.length : downloadNumber,
          done: i === chunks.length - 1 ? true : false,
        });
      let link = document.createElement('a');
      link.href = src;
      link.download = `${filename}_${i}.mp4`; // 这里设置你想要的文件名
      link.click(); // 这将开始下载
      link.remove(); // 移除 'a' 元素
      ffmpeg.terminate();
    }
  }
  transcode();
};
