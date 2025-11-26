import { removePadding, AESDecryptor } from './aes-decryptor'


function ajax(options) {
    options = options || {};
    let xhr = new XMLHttpRequest();
    if (options.type === 'file') {
        xhr.responseType = 'arraybuffer';
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let status = xhr.status;
            if (status >= 200 && status < 300) {
                options.success && options.success(xhr.response);
            } else {
                options.fail && options.fail(status);
            }
        }
    };

    xhr.open("GET", options.url, true);
    xhr.send(null);
}

//  合成url
function applyURL(targetURL, baseURL) {
    baseURL = baseURL || location.href
    if (targetURL.indexOf('http') === 0) {
        // 当前页面使用 https 协议时，强制使 ts 资源也使用 https 协议获取
        if (location.href.indexOf('https') === 0) {
            return targetURL.replace('http://', 'https://')
        }
        return targetURL
    } else if (targetURL[0] === '/') {
        let domain = baseURL.split('/')
        return domain[0] + '//' + domain[2] + targetURL
    } else {
        let domain = baseURL.split('/')
        domain.pop()
        return domain.join('/') + '/' + targetURL
    }
}

// 下载ts


export default function downloadStream(url) {
    if (!this.url) {
        return console.error('请输入连接')
    }
    if (this.url.toLowerCase().indexOf('m3u8') === -1) {
        return console.error('链接有误，请重新输入')
    }
    // 链接验证完毕
    // 在下载页面才触发，代码注入的页面不需要校验
    // 当前协议不一致，切换协议  项目中暂时不会遇到

    const tsUrlList = []
    const finishList = []
    const downloading = false
    const durationSecond = 0

    function downloadTs(maxAjaxNumber) {
        const currentIndex = 0

        for (let i = currentIndex; i < maxAjaxNumber; i++) {
            ajax({
                url: tsUrlList[i],
                type: 'file',
                success: (file) => {
                    dealTS(file)
                }
            })
        }


    }

    function dealTS(file) {
        // 获取 ts 文件的 aes 密钥
        const aesKey = file.slice(0, 16)
        // 获取 ts 文件的 aes 密文
        const aesCipher = file.slice(16)

        // 解密
        const decryptor = new AESDecryptor()
        decryptor.expandKey(aesKey)
        const decrypted = decryptor.decrypt(aesCipher)
    }


    ajax({
        url: url,
        success: (m3u8Str) => {
            // 提取 ts 视频片段地址
            m3u8Str.split('\n').forEach((item) => {
                // if (/.(png|image|ts|jpg|mp4|jpeg)/.test(item)) {
                // 放开片段后缀限制，下载非 # 开头的链接片段
                if (/^[^#]/.test(item)) {
                    console.log(item)
                    tsUrlList.push(applyURL(item, url))
                    finishList.push({
                        title: item,
                        status: ''
                    })
                }
            })

            // 直接下载全部


            let startSegment = 1 // 最小为 1
            let endSegment = tsUrlList.length // 最大为 tsUrlList.length


            downloading = true


            // 获取需要下载的 MP4 视频长度
            let infoIndex = 0
            m3u8Str.split('\n').forEach(item => {
                if (item.toUpperCase().indexOf('#EXTINF:') > -1) { // 计算视频总时长，设置 mp4 信息时使用
                    infoIndex++
                    if (startSegment <= infoIndex && infoIndex <= endSegment) {
                        durationSecond += parseFloat(item.split('#EXTINF:')[1])
                    }
                }
            })


        },
        fail: (e) => {
            this.alertError('链接不正确，请查看链接是否有效')
            console.error('下载失败', e)
        }
    })

}

