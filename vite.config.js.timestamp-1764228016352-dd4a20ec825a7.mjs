// vite.config.js
import vue from "file:///C:/Users/yuanbo/Desktop/other_code/utils/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vi_dad1dbd62c2be67d9bcc4e646b315575/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/yuanbo/Desktop/other_code/utils/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2._51a420b318ef31851db7884e7d1650a6/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///C:/Users/yuanbo/Desktop/other_code/utils/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_less@4.4.2_terser@5.44.1/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\yuanbo\\Desktop\\other_code\\utils";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.VITE_DEV_PORT);
  return {
    plugins: [
      vue(),
      vueJsx()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "src")
      }
    },
    // 库模式下禁用public目录
    publicDir: process.env.BUILD_MODE !== "lib",
    build: {
      // outDir: "dist",
      outDir: process.env.BUILD_MODE === "lib" ? "dist-lib" : "dist",
      ...process.env.BUILD_MODE === "lib" ? {
        lib: {
          entry: path.resolve(__vite_injected_original_dirname, "src/lib-entry.js"),
          name: "index",
          fileName: (format) => `index.${format}.js`
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
      } : {}
      // 应用构建时使用默认配置
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
      drop: ["debugger"]
      // 构建时移
    },
    server: {
      host: "127.0.0.1",
      port,
      open: true,
      // 启动后自动打开浏览器
      proxy: {
        "/api": {
          target: env.VITE_APP_HOST,
          changeOrigin: true
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5dWFuYm9cXFxcRGVza3RvcFxcXFxvdGhlcl9jb2RlXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5dWFuYm9cXFxcRGVza3RvcFxcXFxvdGhlcl9jb2RlXFxcXHV0aWxzXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy95dWFuYm8vRGVza3RvcC9vdGhlcl9jb2RlL3V0aWxzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XHJcbmltcG9ydCB2dWVKc3ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcclxuICAvLyBcdTUyQTBcdThGN0RcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFwiXCIpO1xyXG4gIGNvbnN0IHBvcnQgPSBOdW1iZXIoZW52LlZJVEVfREVWX1BPUlQpO1xyXG4gIHJldHVybiB7XHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHZ1ZSgpLFxyXG4gICAgICB2dWVKc3goKVxyXG4gICAgXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIilcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIFx1NUU5M1x1NkEyMVx1NUYwRlx1NEUwQlx1Nzk4MVx1NzUyOHB1YmxpY1x1NzZFRVx1NUY1NVxyXG4gICAgcHVibGljRGlyOiBwcm9jZXNzLmVudi5CVUlMRF9NT0RFICE9PSBcImxpYlwiLFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgLy8gb3V0RGlyOiBcImRpc3RcIixcclxuICAgICAgb3V0RGlyOiBwcm9jZXNzLmVudi5CVUlMRF9NT0RFID09PSBcImxpYlwiID8gXCJkaXN0LWxpYlwiIDogXCJkaXN0XCIsXHJcbiAgICAgIC4uLihwcm9jZXNzLmVudi5CVUlMRF9NT0RFID09PSBcImxpYlwiXHJcbiAgICAgICAgPyB7XHJcbiAgICAgICAgICAgIGxpYjoge1xyXG4gICAgICAgICAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9saWItZW50cnkuanNcIiksXHJcbiAgICAgICAgICAgICAgbmFtZTogXCJpbmRleFwiLFxyXG4gICAgICAgICAgICAgIGZpbGVOYW1lOiBmb3JtYXQgPT4gYGluZGV4LiR7Zm9ybWF0fS5qc2BcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIC8vIFx1NjM5Mlx1OTY2NFx1NTkxNlx1OTBFOFx1NEY5RFx1OEQ1NlxyXG4gICAgICAgICAgICAgIGV4dGVybmFsOiBbXCJ2dWVcIiwgXCJuYWl2ZS11aVwiLCBcImF4aW9zXCJdLFxyXG4gICAgICAgICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgICAgICAgLy8gXHU2M0QwXHU0RjlCXHU1MTY4XHU1QzQwXHU1M0Q4XHU5MUNGXHU0RUU1XHU2NTJGXHU2MzAxVU1EXHU2Nzg0XHU1RUZBXHU2QTIxXHU1RjBGXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgIHZ1ZTogXCJWdWVcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIDoge30pIC8vIFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NEY3Rlx1NzUyOFx1OUVEOFx1OEJBNFx1OTE0RFx1N0Y2RVxyXG4gICAgfSxcclxuICAgIGJhc2U6IFwiLi9cIixcclxuICAgIGNzczoge1xyXG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgbGVzczoge1xyXG4gICAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBlc2J1aWxkOiB7XHJcbiAgICAgIGNoYXJzZXQ6IFwiYXNjaWlcIixcclxuICAgICAgZHJvcDogW1wiZGVidWdnZXJcIl0gLy8gXHU2Nzg0XHU1RUZBXHU2NUY2XHU3OUZCXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6IFwiMTI3LjAuMC4xXCIsXHJcbiAgICAgIHBvcnQsXHJcbiAgICAgIG9wZW46IHRydWUsIC8vIFx1NTQyRlx1NTJBOFx1NTQwRVx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFx1NkQ0Rlx1ODlDOFx1NTY2OFxyXG4gICAgICBwcm94eToge1xyXG4gICAgICAgIFwiL2FwaVwiOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IGVudi5WSVRFX0FQUF9IT1NULFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1QsT0FBTyxTQUFTO0FBQ3RVLE9BQU8sWUFBWTtBQUNuQixPQUFPLFVBQVU7QUFDakIsU0FBUyxjQUFjLGVBQWU7QUFIdEMsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sT0FBTyxPQUFPLElBQUksYUFBYTtBQUNyQyxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQ3BDO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxXQUFXLFFBQVEsSUFBSSxlQUFlO0FBQUEsSUFDdEMsT0FBTztBQUFBO0FBQUEsTUFFTCxRQUFRLFFBQVEsSUFBSSxlQUFlLFFBQVEsYUFBYTtBQUFBLE1BQ3hELEdBQUksUUFBUSxJQUFJLGVBQWUsUUFDM0I7QUFBQSxRQUNFLEtBQUs7QUFBQSxVQUNILE9BQU8sS0FBSyxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLFVBQ2pELE1BQU07QUFBQSxVQUNOLFVBQVUsWUFBVSxTQUFTLE1BQU07QUFBQSxRQUNyQztBQUFBLFFBQ0EsZUFBZTtBQUFBO0FBQUEsVUFFYixVQUFVLENBQUMsT0FBTyxZQUFZLE9BQU87QUFBQSxVQUNyQyxRQUFRO0FBQUE7QUFBQSxZQUVOLFNBQVM7QUFBQSxjQUNQLEtBQUs7QUFBQSxZQUNQO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLElBQ0EsQ0FBQztBQUFBO0FBQUEsSUFDUDtBQUFBLElBQ0EsTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osbUJBQW1CO0FBQUEsUUFDckI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsU0FBUztBQUFBLE1BQ1QsTUFBTSxDQUFDLFVBQVU7QUFBQTtBQUFBLElBQ25CO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0EsTUFBTTtBQUFBO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRLElBQUk7QUFBQSxVQUNaLGNBQWM7QUFBQSxRQUNoQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
