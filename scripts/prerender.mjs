import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {marked} from 'marked'

const siteUrl = 'https://qualityscaler-go.lingxin.org'
const distDir = join(process.cwd(), 'dist')
const publicDir = join(process.cwd(), 'public')
const baseHtml = await readFile(join(distDir, 'index.html'), 'utf8')

const rootPages = [
  {
    output: '',
    lang: 'zh-CN',
    canonical: `${siteUrl}/`,
    title: 'QualityScaler-Go | 免费本地 AI 图片与视频超分辨率工具',
    description: 'QualityScaler-Go 是免费的本地 AI 图片与视频超分辨率工具，支持 TensorRT、ONNX CUDA、人脸增强和批量处理，无需上传云端。',
    alternateZh: `${siteUrl}/`,
    alternateEn: `${siteUrl}/en/`,
    content: rootContent('zh'),
  },
  {
    output: 'en',
    lang: 'en',
    canonical: `${siteUrl}/en/`,
    title: 'QualityScaler-Go | Free local AI image and video upscaler',
    description: 'QualityScaler-Go is a free local AI image and video upscaler with TensorRT, ONNX CUDA, face enhancement, batch processing, and no cloud uploads.',
    alternateZh: `${siteUrl}/`,
    alternateEn: `${siteUrl}/en/`,
    content: rootContent('en'),
  },
]

const docPages = [
  {
    output: 'doc',
    lang: 'zh-CN',
    canonical: `${siteUrl}/doc/`,
    title: 'QualityScaler-Go 用户手册 | 安装、模型与故障排查',
    description: 'QualityScaler-Go 中文用户手册：安装要求、CUDA 与 cuDNN 配置、AI 模型选择、显存设置、视频管线和常见问题排查。',
    alternateZh: `${siteUrl}/doc/`,
    alternateEn: `${siteUrl}/en/doc/`,
    markdown: 'USER_MANUAL-zh_cn.md',
  },
  {
    output: join('en', 'doc'),
    lang: 'en',
    canonical: `${siteUrl}/en/doc/`,
    title: 'QualityScaler-Go User Manual | Setup, models and troubleshooting',
    description: 'QualityScaler-Go user manual covering installation, CUDA and cuDNN setup, AI model selection, VRAM settings, video pipelines, and troubleshooting.',
    alternateZh: `${siteUrl}/doc/`,
    alternateEn: `${siteUrl}/en/doc/`,
    markdown: 'USER_MANUAL-en.md',
  },
]

for (const page of rootPages) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'QualityScaler-Go',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Windows, Linux',
    description: page.description,
    url: page.canonical,
    image: `${siteUrl}/miao.png`,
    dateModified: '2026-08-04',
    license: 'https://opensource.org/licenses/MIT',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    sameAs: [
      'https://github.com/Ling0727-ai/QualityScaler-go',
      'https://github.com/Ling0727-ai/qs-go-website',
      'https://ko-fi.com/lingxin07',
    ],
  }
  await writePage(page.output, renderPage(page, structuredData))
}

for (const page of docPages) {
  const markdown = await readFile(join(publicDir, 'doc', page.markdown), 'utf8')
  const { html, toc } = renderMarkdown(markdown)
  const content = `
    <div class="site-shell">
      <main class="doc-page">
        <aside class="doc-sidebar">
          <nav aria-label="Documentation table of contents">${toc}</nav>
        </aside>
        <article class="doc-content"><div>${html}</div></article>
      </main>
    </div>`
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.title.split(' | ')[0],
    description: page.description,
    inLanguage: page.lang,
    url: page.canonical,
    dateModified: '2026-08-04',
    author: {
      '@type': 'Organization',
      name: 'QualityScaler-Go contributors',
      url: 'https://github.com/Ling0727-ai/QualityScaler-go',
    },
  }
  await writePage(page.output, renderPage({ ...page, content }, structuredData))
}

const notFound = renderPage({
  lang: 'zh-CN',
  title: '页面未找到 | QualityScaler-Go',
  description: '请求的页面不存在。',
  robots: 'noindex, nofollow',
  content: '<main><h1>页面未找到</h1><p><a href="/">返回 QualityScaler-Go 首页</a></p></main>',
})
await writeFile(join(distDir, '404.html'), notFound)

function rootContent(lang) {
  if (lang === 'en') {
    return `
      <main id="top">
        <section><h1>QualityScaler-Go local AI image and video upscaling</h1><p>Upscale images and videos locally with Real-ESRGAN, BSRGAN, CodeFormer, TensorRT, and ONNX CUDA. Your files never need to leave your computer.</p></section>
        <section><h2>Image and video upscaling</h2><p>Process individual files or folders, preserve video audio and frame rate, enhance faces, and export results in batches.</p></section>
        <section><h2>Hardware-aware acceleration</h2><p>Choose TensorRT, ONNX CUDA, or ONNX CPU builds. Automatic fallback keeps the application usable across different hardware.</p></section>
        <section><h2>AI restoration models</h2><p>Includes models for photos, anime, faces, noise, blur, and 2x to 4x super-resolution.</p></section>
        <nav aria-label="Related pages"><a href="/en/doc/">Read the user manual</a> · <a href="/">中文</a> · <a href="https://github.com/Ling0727-ai/QualityScaler-go">Source code</a> · <a href="https://ko-fi.com/lingxin07">Sponsor on Ko-fi</a></nav>
      </main>`
  }

  return `
    <main id="top">
      <section><h1>QualityScaler-Go 本地 AI 图片与视频超分辨率工具</h1><p>使用 Real-ESRGAN、BSRGAN、CodeFormer、TensorRT 和 ONNX CUDA 在本机增强图片与视频，文件无需上传云端。</p></section>
      <section><h2>图片与视频超分辨率</h2><p>支持单文件和文件夹批量处理，保留视频音频与帧率，并可进行人脸增强。</p></section>
      <section><h2>按硬件选择加速后端</h2><p>提供 TensorRT、ONNX CUDA 和 ONNX CPU 版本，并支持自动回退以适配不同硬件。</p></section>
      <section><h2>多种 AI 修复模型</h2><p>包含适用于照片、动漫、人脸、噪声与模糊素材的模型，支持 2x 至 4x 超分辨率。</p></section>
      <nav aria-label="相关页面"><a href="/doc/">阅读用户手册</a> · <a href="/en/">English</a> · <a href="https://github.com/Ling0727-ai/QualityScaler-go">源代码</a> · <a href="https://ko-fi.com/lingxin07">赞助项目</a></nav>
    </main>`
}

function renderMarkdown(markdown) {
  const usedIds = new Map()
  const toc = []
  const parsed = marked.parse(markdown)
  const html = parsed.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (_, level, innerHtml) => {
    const text = stripHtml(innerHtml)
    const baseId = slugify(text) || 'section'
    const count = usedIds.get(baseId) || 0
    usedIds.set(baseId, count + 1)
    const id = count ? `${baseId}-${count + 1}` : baseId
    if (level === '2' || level === '3') {
      toc.push(`<a class="toc-h${level}" href="#${id}">${escapeHtml(text)}</a>`)
    }
    return `<h${level} id="${id}">${innerHtml}</h${level}>`
  })
  return { html, toc: toc.join('') }
}

function renderPage(page, structuredData) {
  let html = baseHtml
    .replace(/<html lang="[^"]+">/, `<html lang="${page.lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${page.robots || 'index, follow'}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${structuredData?.['@type'] === 'TechArticle' ? 'article' : 'website'}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, page.canonical ? `<meta property="og:url" content="${page.canonical}" />` : '')
    .replace(/\s*<link rel="canonical"[^>]*\/>/, '')
    .replace(/\s*<link rel="alternate"[^>]*\/>/g, '')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')

  const seoLinks = page.canonical
    ? `
    <link rel="canonical" href="${page.canonical}" />
    <link rel="alternate" hreflang="zh-CN" href="${page.alternateZh}" />
    <link rel="alternate" hreflang="en" href="${page.alternateEn}" />
    <link rel="alternate" hreflang="x-default" href="${page.alternateZh}" />`
    : ''
  const extraHead = `${seoLinks}
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${siteUrl}/miao.png" />
    ${structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : ''}`
  html = html.replace('</head>', `${extraHead}\n  </head>`)
  return html
    .replace(/<div id="app">[\s\S]*?<\/div>/, `<div id="app">${page.content}</div>`)
    .replace(/[ \t]+$/gm, '')
}

async function writePage(relativeDir, html) {
  const outputDir = join(distDir, relativeDir)
  await mkdir(outputDir, { recursive: true })
  await writeFile(join(outputDir, 'index.html'), html)
}

function slugify(text) {
  return text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
