# Dingyi Li 个人网站

以图片和视频为主的作品展示网站：首页是像素粒子组成的名字和“关卡选择”，五个作品各有一个独立页面，支持中英切换。

## 本地预览

不要直接双击 `index.html`：浏览器会把本地文件当成跨域资源，首页的像素粒子效果就读不到作品图片。用一个本地服务器打开：

- **VS Code**：安装 Live Server 插件，右键 `index.html` → Open with Live Server
- **或者命令行**：在这个文件夹里运行 `python -m http.server 8000`，再打开 http://localhost:8000

## 发布到 GitHub Pages（新仓库）

1. 在 GitHub 新建一个公开仓库，例如 `dingyi-li`（不要勾选自动生成 README）。
2. 在这个文件夹里运行：

   ```
   git init
   git add .
   git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/ldy200239/dingyi-li.git
   git push -u origin main
   ```

   也可以用 GitHub Desktop：File → Add local repository → 选这个文件夹 → Publish repository。
3. 仓库页面 → Settings → Pages → Source 选 **Deploy from a branch**，分支选 `main`，目录选 `/ (root)`，保存。
4. 一两分钟后网站会出现在 `https://ldy200239.github.io/dingyi-li/`。

## 修改内容

- **文字、链接、作品信息**：都在 `js/data.js`，每段文字都有 `en` 和 `zh` 两个版本。
- **样式和颜色**：`css/site.css` 顶部的 `:root` 里是全站颜色；每个作品的主题色在 `js/data.js` 的 `accent`。
- **图片和视频**：在 `assets/` 下，按作品分文件夹。替换时保持同名即可。

## 文件结构

```
index.html          页面入口
css/site.css        全部样式
js/data.js          内容（中英文）
js/pixelfield.js    首页像素粒子效果（WebGL）
js/app.js           页面路由和所有交互
vendor/             GSAP、ScrollTrigger、Lenis（本地托管，国内也能加载）
fonts/              Archivo、Pixelify Sans（本地托管）
assets/             图片和视频
```

## 页面地址

- 首页：`#home`（`#works` 作品列表，`#about` 关于）
- `#ember-protocol` · `#gemini-afterlife` · `#can-world` · `#blind-loop` · `#aero-guide`
