# ImageCraft AI - Deployment & Hosting Guide

ImageCraft AI is designed as a zero-backend, client-side React application that runs entirely in the browser. It can be built statically and deployed to any static site hosting provider, with **Cloudflare Pages** being the recommended platform.

## Production Build Compilation

To generate the optimized production bundle, run:

```bash
npm run build
```

This compiles TypeScript definitions and runs Vite's roll-up packager, outputting clean HTML, JS, and CSS static files into the `dist/` directory.

---

## Cloudflare Pages Setup

### Method 1: Git Integration (Recommended for CI/CD)

1. Push your code to a GitHub or GitLab repository.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Set the following build settings:
   - **Framework Preset:** `Vite` (or `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js Version:** `18.x` or higher
5. Click **Save and Deploy**. Cloudflare will automatically build and publish your project on every commit.

### Method 2: Manual Drag & Drop (Direct Upload)

1. Compile the files locally by running `npm run build`.
2. Go to **Workers & Pages** > **Create application** > **Pages** > **Upload assets**.
3. Drag and drop the `dist/` folder.
4. Set your project name and click **Deploy**.

---

## Routing & Fallback Config

Since ImageCraft AI uses React Router's `createBrowserRouter` (HTML5 History API), static servers must serve `index.html` for any sub-routes (e.g. `/background-remover` or `/ocr-text-extractor`) to prevent `404 Not Found` errors on page refresh.

### For Cloudflare Pages
Create a `public/_redirects` file (Vite will copy this to `dist/_redirects` during build) with the following rule:

```text
/*    /index.html   200
```

---

## Search Console & AdSense Setup

### 1. Google Analytics
Add your GA tracking tag inside `index.html` in the `<head>` section:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 2. Google AdSense
Add your AdSense publisher script tag in the `<head>` of `index.html`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```
Once approved, replace the mockup publisher tags inside `src/components/AdPlacement.tsx` with your live ad slot ids.
