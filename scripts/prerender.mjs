import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {execFile} from 'node:child_process'
import {join} from 'node:path'
import {promisify} from 'node:util'
import {marked} from 'marked'

const execFileAsync = promisify(execFile)
const siteUrl = 'https://qualityscaler-go.lingxin.org'
const distDir = join(process.cwd(), 'dist')
const publicDir = join(process.cwd(), 'public')
const baseHtml = await readFile(join(distDir, 'index.html'), 'utf8')
const fallbackLastmod = '2026-08-13'
const rootSources = ['index.html', 'src/App.vue', 'src/styles.css']
const zhDocSources = ['public/doc/USER_MANUAL-zh_cn.md']
const enDocSources = ['public/doc/USER_MANUAL-en.md']

const [rootLastmod, zhDocLastmod, enDocLastmod] = await Promise.all([
  gitLastmod(rootSources),
  gitLastmod(zhDocSources),
  gitLastmod(enDocSources),
])

const rootPages = [
  {
    output: '',
    lang: 'zh-CN',
    canonical: `${siteUrl}/`,
    lastmod: rootLastmod,
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
    lastmod: rootLastmod,
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
    lastmod: zhDocLastmod,
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
    lastmod: enDocLastmod,
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
    screenshot: `${siteUrl}/pic/0801_RealESR_Gx4_InputR-50_OutputR-100.jpg`,
    downloadUrl: 'https://github.com/Ling0727-ai/QualityScaler-go/releases',
    isAccessibleForFree: true,
    featureList: [
      'Local image and video super-resolution',
      'Real-ESRGAN and BSRGAN restoration models',
      'CodeFormer face enhancement',
      'TensorRT, ONNX CUDA, and ONNX CPU editions',
      'Batch processing with preserved video audio and frame rate',
    ],
    dateModified: page.lastmod,
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
    dateModified: page.lastmod,
    author: {
      '@type': 'Organization',
      name: 'QualityScaler-Go contributors',
      url: 'https://github.com/Ling0727-ai/QualityScaler-go',
    },
  }
  await writePage(page.output, renderPage({ ...page, content }, structuredData))
}

const sitemap = renderSitemap([
  {
    loc: `${siteUrl}/`,
    lastmod: rootLastmod,
    changefreq: 'weekly',
    priority: '1.0',
    zh: `${siteUrl}/`,
    en: `${siteUrl}/en/`,
  },
  {
    loc: `${siteUrl}/en/`,
    lastmod: rootLastmod,
    changefreq: 'weekly',
    priority: '0.9',
    zh: `${siteUrl}/`,
    en: `${siteUrl}/en/`,
  },
  {
    loc: `${siteUrl}/doc/`,
    lastmod: zhDocLastmod,
    changefreq: 'monthly',
    priority: '0.8',
    zh: `${siteUrl}/doc/`,
    en: `${siteUrl}/en/doc/`,
  },
  {
    loc: `${siteUrl}/en/doc/`,
    lastmod: enDocLastmod,
    changefreq: 'monthly',
    priority: '0.8',
    zh: `${siteUrl}/doc/`,
    en: `${siteUrl}/en/doc/`,
  },
])
await writeIfChanged(join(distDir, 'sitemap.xml'), sitemap)
await writeIfChanged(join(publicDir, 'sitemap.xml'), sitemap)

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
        <section><h1>QualityScaler-Go: local AI image and video upscaling</h1><p>QualityScaler-Go is a free, open-source desktop application for restoring and enlarging images and videos on your own Windows or Linux computer. It uses Real-ESRGAN, BSRGAN, and CodeFormer; source media stays local instead of being uploaded to a cloud service.</p></section>
        <section><h2>What QualityScaler-Go processes</h2><p>Choose individual images, videos, or folders for batch work. The video pipeline preserves the original audio and frame rate while it extracts frames, applies the selected model, and assembles the result. Use it for photo restoration, anime artwork, compressed footage, face enhancement, noise reduction, blur reduction, and 2x to 4x super-resolution.</p></section>
        <section><h2>Choose an edition for your hardware</h2><p>TensorRT editions target supported NVIDIA GPUs for maximum throughput. ONNX CUDA editions use CUDA where TensorRT is unavailable, while ONNX CPU editions provide a no-GPU fallback. The application can automatically fall back when a preferred accelerator or model cannot run on the current machine.</p></section>
        <section><h2>Models and processing controls</h2><p>Real-ESRGAN x4, Real-ESRGAN Anime, BSRGAN x2 and x4, Real-CUGAN v3 x2, x3 and x4, MSharpx4, CodeFormer, Face Enhance x4, SCUNet GAN, SCUNet PSNR, DeblurGAN v2, and IRCNN cover general restoration, anime, face enhancement, denoising, sharpening, and deblurring. Browse the <a href="https://huggingface.co/lingxin07/QualityScaler-Go_models">QualityScaler-Go model weights on Hugging Face</a>. The interface exposes model selection, scale, tile and VRAM-related controls, face enhancement, and memory or disk video-pipeline modes so that long videos can be balanced against available storage and GPU memory.</p></section>
        <section><h2>Before downloading</h2><p>Review the installation requirements, edition guide, model descriptions, and troubleshooting steps in the manual. Release packages and source code are published on GitHub, where users can also report reproducible issues and verify the project license.</p></section>
      <nav aria-label="Related QualityScaler-Go resources"><a href="/en/doc/">Read the complete user manual</a> · <a href="https://huggingface.co/lingxin07/QualityScaler-Go_models">Browse model weights on Hugging Face</a> · <a href="https://github.com/Ling0727-ai/QualityScaler-go/releases">Download releases</a> · <a href="https://github.com/Ling0727-ai/QualityScaler-go">Browse source code</a> · <a href="/">中文页面</a></nav>
      </main>`
  }

  return `
    <main id="top">
      <section><h1>QualityScaler-Go：本地 AI 图片与视频超分辨率工具</h1><p>QualityScaler-Go 是免费的开源桌面软件，可在 Windows 或 Linux 本机修复和放大图片、视频。它使用 Real-ESRGAN、BSRGAN 与 CodeFormer，源文件无需上传至云端。</p></section>
      <section><h2>可处理的素材和任务</h2><p>支持选择单张图片、单个视频或文件夹批量处理。视频管线会在逐帧增强后重新合成，并保留原始音频和帧率。可用于照片修复、动漫图像、压缩视频、人脸增强、降噪、去模糊，以及 2x 至 4x 超分辨率。</p></section>
      <section><h2>按硬件选择加速版本</h2><p>TensorRT 版本面向兼容的 NVIDIA GPU，以获得更高吞吐；没有 TensorRT 环境时可选择 ONNX CUDA 版本；ONNX CPU 版本则提供不依赖独立显卡的回退方案。首选加速器或模型无法运行时，程序可自动回退以保持可用。</p></section>
      <section><h2>模型与处理控制</h2><p>Real-ESRGAN x4、Real-ESRGAN Anime、BSRGAN x2 与 x4、Real-CUGAN v3 x2/x3/x4、MSharpx4、CodeFormer、Face Enhance x4、SCUNet GAN、SCUNet PSNR、DeblurGAN v2 和 IRCNN，覆盖通用图像修复、动漫增强、人脸修复、降噪、锐化与去模糊。可在 <a href="https://huggingface.co/lingxin07/QualityScaler-Go_models">Hugging Face 查看 QualityScaler-Go 模型权重</a>。界面提供模型、倍率、分块和显存相关设置，以及人脸增强、内存/磁盘视频管线等选项，便于根据显存和存储空间平衡长视频处理。</p></section>
      <section><h2>下载前可查阅的资料</h2><p>用户手册说明安装要求、版本选择、模型用途和故障排查。发布包和完整源代码均在 GitHub 提供；用户可以核验许可证、下载版本或提交可复现的问题反馈。</p></section>
      <nav aria-label="QualityScaler-Go 相关资源"><a href="/doc/">阅读完整用户手册</a> · <a href="https://huggingface.co/lingxin07/QualityScaler-Go_models">在 Hugging Face 查看模型权重</a> · <a href="https://github.com/Ling0727-ai/QualityScaler-go/releases">下载发布版本</a> · <a href="https://github.com/Ling0727-ai/QualityScaler-go">浏览源代码</a> · <a href="/en/">English</a></nav>
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
    .replace(/\s*<meta name="twitter:title"[^>]*\/>/g, '')
    .replace(/\s*<meta name="twitter:description"[^>]*\/>/g, '')
    .replace(/\s*<meta name="twitter:image"[^>]*\/>/g, '')

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

async function writeIfChanged(path, content) {
  try {
    const existing = await readFile(path, 'utf8')
    if (existing.replace(/\r\n/g, '\n') === content) return
  } catch {
    // File does not exist yet, fall through and write it.
  }
  await writeFile(path, content)
}

async function gitLastmod(paths) {
  try {
    const {stdout} = await execFileAsync('git', ['log', '-1', '--format=%cs', '--', ...paths], {
      cwd: process.cwd(),
    })
    const value = stdout.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  } catch {
    // Fall back to the last known content change when git history is unavailable.
  }
  return fallbackLastmod
}

function renderSitemap(pages) {
  const entries = pages
    .map(
      (page) => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${page.zh}" />
    <xhtml:link rel="alternate" hreflang="en" href="${page.en}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${page.zh}" />
  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`
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
