<template>
  <div>

    <button @click="downloadStream">点击下载视频流</button>
  </div>
</template>

<script setup>
import {downloadM3U8} from '@/utils/m3u8-downloader-core'
import { onMounted } from 'vue';
const url = 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/xgplayer-demo.m3u8'

const downloadStream = () => {
  downloadM3U8(url, {
    onProgress: (progress, total, error) => console.log(`进度: ${progress}/${total}, 错误: ${error}`),
    onSuccess: (fileBlob) => console.log('下载完成', fileBlob),
    onError: (error) => console.error('下载失败', error),
    filename: 'my-video' // 可选的文件名
  })
}



</script>

<style lang="less"  scoped>

</style>
