import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.VITE_DEV_PORT);
  return {
    plugins: [
      vue(),
      vueJsx()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    // 库模式下禁用public目录
    // publicDir: process.env.BUILD_MODE !== "lib",
    build: {
      // outDir: "dist",
      outDir: process.env.BUILD_MODE === "lib" ? "dist-lib" : "dist",
      ...(process.env.BUILD_MODE === "lib"
        ? {
            lib: {
              entry: path.resolve(__dirname, "src/lib-entry.js"),
              name: "index",
              fileName: format => `index.${format}.js`
            },
            rollupOptions: {
              // 排除外部依赖
              external: ["vue", "naive-ui", "axios"],
              output: {
                // 提供全局变量以支持UMD构建模式
                globals: {
                  vue: "Vue"
                }
              }
            }
          }
        : {}) // 应用构建时使用默认配置
    },
    base: "./",
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    },
    esbuild: {
      charset: "ascii",
      drop: ["debugger"] // 构建时移
    },
    server: {
      host: "127.0.0.1",
      port,
      open: true, // 启动后自动打开浏览器
      proxy: {
        "/api": {
          target: env.VITE_APP_HOST,
          changeOrigin: true
        }
      }
    }
  };
});
