// 推荐放在 src/utils/flyToDownload.js
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(MotionPathPlugin);

export function flyToDownloadIcon(start, end) {
  // 创建动画元素
  const animEl = document.createElement('div');
  animEl.className = 'fly-download-icon';
  animEl.style.position = 'fixed';
  animEl.style.left = start.x + 'px';
  animEl.style.top = start.y + 'px';
  animEl.style.display = 'flex';
  animEl.style.alignItems = 'center';
  animEl.style.justifyContent = 'center';

  const icon = document.createElement('i');
  icon.className = 'icon-arrowdown-outlined iconfont';

  icon.style.webkitBackgroundClip = 'text';
  icon.style.backgroundClip = 'text';
  icon.style.webkitTextFillColor = 'transparent';
  icon.style.textFillColor = 'transparent';
  icon.style.backgroundColor = 'blue';
  animEl.appendChild(icon);
  document.getElementById('fly-anim-container').appendChild(animEl);

  // 贝塞尔曲线中间点（可调整弧度）
  const mid = {
    x: -80, // 先向左飞一小段
    y: -100 // 弧线高度
  };

  gsap.to(animEl, {
    duration: 0.8,
    motionPath: {
      path: [
        // { x: start.x, y: start.y },
        mid,
        { x: end.x, y: end.y }
      ],
    },
    scale: 0.5,
    ease: "power1.inOut",
    onComplete: () => animEl.remove()
  });
}