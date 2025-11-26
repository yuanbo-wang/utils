<template>
  <div>

    <button @click="downloadStream">点击下载视频流</button>
  </div>
</template>

<script setup>
import downloadStream from '@/utils/downloadStream'
const url = 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/xgplayer-demo.m3u8'

</script>

<style lang="less"  scoped>

</style>
