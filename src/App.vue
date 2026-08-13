<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { marked } from 'marked'
import {
  BookOpen,
  Boxes,
  Cpu,
  Download,
  FileVideo,
  GitFork,
  Heart,
  ImageUp,
  Languages,
  Layers3,
  Play,
  ScanFace,
  Sparkles,
  Zap,
} from '@lucide/vue'

type Lang = 'en' | 'zh'
type Edition = {
  id: string
  name: string
  label: string
  desc: string
  specs: string[]
  recommended?: boolean
}

const copy = {
  en: {
    nav: ['Features', 'Pipeline', 'Models', 'Download', 'Docs'],
    heroBadge: 'Free and open source',
    titleA: 'AI-powered',
    titleB: 'image and video super-resolution',
    desc:
      'Upscale images and videos with local AI models. QualityScaler-Go supports Real-ESRGAN, BSRGAN, CodeFormer, TensorRT acceleration, face enhancement, and batch processing.',
    download: 'Download free',
    github: 'View on GitHub',
    terminalTitle: 'QualityScaler-Go pipeline',
    terminalLines: [
      '$ qualityscaler --input photo.jpg --model realesrgan-x4 --scale 4',
      '[1/4] Loading model: Real-ESRGAN x4 ... OK',
      '[2/4] Backend selected: TensorRT (NVIDIA GeForce RTX 4090)',
      '[3/4] Processing: 1920x1080 -> 7680x4320',
      '[4/4] Saved: photo_4x.png',
    ],
    stats: [
      ['10+', 'AI models'],
      ['2x-4x', 'Upscale factor'],
      ['FP16', 'Fast inference'],
      ['MIT', 'Open source'],
    ],
    featuresKicker: 'Features',
    featuresTitle: 'Everything you need for local AI upscaling',
    featuresDesc: 'A complete desktop pipeline for media restoration, performance tuning, and batch export.',
    features: [
      ['Image upscaling', '2x, 3x, and 4x image enhancement with Real-ESRGAN, BSRGAN, Real-CUGAN, and more.'],
      ['Video upscaling', 'Frame-by-frame AI processing with FFmpeg while preserving audio, frame rate, and output format.'],
      ['Face enhancement', 'Detect faces, restore with CodeFormer, then blend them back into the final frame.'],
      ['Auto backend selection', 'TensorRT -> ONNX CUDA -> ONNX CPU fallback keeps the app usable on different hardware.'],
      ['Batch processing', 'Drop folders, queue media, and let the pipeline keep inference and saving work moving.'],
      ['FP16 acceleration', 'Half precision TensorRT inference improves throughput while keeping quality practical.'],
    ],
    stepsKicker: 'How it works',
    stepsTitle: 'Three steps to a higher resolution result',
    stepsDesc: 'No cloud upload. Every frame stays on your machine.',
    steps: [
      ['Drop your files', 'Add images, videos, or a folder.'],
      ['Choose a model', 'Pick the restoration model and hardware backend.'],
      ['Export and enjoy', 'Save the upscaled result locally.'],
    ],
    pipelineKicker: 'Pipeline modes',
    pipelineTitle: 'Memory for speed. Disk for recoverability.',
    pipelineDesc:
      'QualityScaler-Go can stream video frames directly through memory, or write intermediate frames to disk when the job needs VFR support, resume, or frame-level inspection.',
    pipelineModes: [
      ['Memory pipeline', 'No temporary frame files, lower I/O, and the fastest path for common constant-frame-rate video.', ['Fastest path', '0 GB temp frames', 'Best for ordinary CFR video']],
      ['Disk pipeline', 'A file-based pipeline that is slower, but much easier to recover, debug, and use with variable-frame-rate sources.', ['VFR compatible', 'Resume friendly', 'Inspectable frames']],
    ],
    pipelineFlow: ['Decode', 'AI inference', 'Blend', 'Encode'],
    modelsKicker: 'AI models',
    modelsTitle: '10+ restoration models',
    modelsDesc: 'Choose a model based on real photos, anime, faces, noise, blur, and restoration strength.',
    downloadKicker: 'Download',
    downloadTitle: 'Choose your edition',
    downloadDesc: 'Four builds target different hardware. If you are unsure, choose Full.',
    recommended: 'Recommended',
    editions: [
      ['full', 'QualityScaler Full', 'All backends + auto-detect', 'The complete package with TensorRT, ONNX CUDA, ONNX CPU, and OpenCV.', ['Auto detect', 'TensorRT', 'CUDA', 'CPU'], true],
      ['tensorrt', 'TensorRT GPU', 'Maximum performance', 'Optimized for NVIDIA GPUs with TensorRT acceleration.', ['TensorRT', 'CUDA'], false],
      ['cuda', 'ONNX CUDA', 'NVIDIA GPU via ONNX', 'CUDA-accelerated ONNX Runtime for a simpler GPU setup.', ['CUDA'], false],
      ['cpu', 'ONNX CPU', 'Universal compatibility', 'Pure CPU inference. Works without a dedicated GPU.', ['CPU'], false],
    ],
    docsTitle: 'Manuals and setup notes',
    docsDesc: 'CUDA, cuDNN, TensorRT, model choices, VRAM tiers, and troubleshooting.',
    englishManual: 'English manual',
    chineseManual: 'Chinese manual',
    source: 'Source repository',
    sponsor: 'Sponsor on Ko-fi',
  },
  zh: {
    nav: ['功能', '管线', '模型', '下载', '文档'],
    heroBadge: '免费开源',
    titleA: 'AI 驱动',
    titleB: '图像与视频超分辨率',
    desc:
      '使用本地 AI 模型放大图片和视频。QualityScaler-Go 支持 Real-ESRGAN、BSRGAN、CodeFormer、TensorRT 加速、人脸增强和批量处理。',
    download: '免费下载',
    github: '在 GitHub 查看',
    terminalTitle: 'QualityScaler-Go 处理流水线',
    terminalLines: [
      '$ qualityscaler --input photo.jpg --model realesrgan-x4 --scale 4',
      '[1/4] 加载模型: Real-ESRGAN x4 ... OK',
      '[2/4] 已选择后端: TensorRT (NVIDIA GeForce RTX 4090)',
      '[3/4] 处理中: 1920x1080 -> 7680x4320',
      '[4/4] 已保存: photo_4x.png',
    ],
    stats: [
      ['10+', 'AI 模型'],
      ['2x-4x', '放大倍率'],
      ['FP16', '高速推理'],
      ['MIT', '开源协议'],
    ],
    featuresKicker: '功能',
    featuresTitle: '本地 AI 超分所需的一切',
    featuresDesc: '完整桌面管线，覆盖媒体修复、性能调优和批量导出。',
    features: [
      ['图像超分辨率', '支持 Real-ESRGAN、BSRGAN、Real-CUGAN 等模型的 2x、3x、4x 增强。'],
      ['视频超分辨率', '基于 FFmpeg 的逐帧 AI 处理，保留音频、帧率和输出格式。'],
      ['人脸增强', '检测人脸，使用 CodeFormer 修复，再融合回最终画面。'],
      ['自动后端选择', 'TensorRT -> ONNX CUDA -> ONNX CPU 兜底，适配不同硬件。'],
      ['批量处理', '拖入文件夹，排队处理媒体，让推理和保存流程持续运行。'],
      ['FP16 加速', 'TensorRT 半精度推理提升吞吐，同时保持实用画质。'],
    ],
    stepsKicker: '使用流程',
    stepsTitle: '三步获得更高分辨率结果',
    stepsDesc: '无需云端上传，每一帧都留在本机。',
    steps: [
      ['拖入文件', '添加图片、视频或文件夹。'],
      ['选择模型', '选择修复模型和硬件后端。'],
      ['导出享用', '在本地保存超分结果。'],
    ],
    pipelineKicker: '管线模式',
    pipelineTitle: 'Memory 追求速度，Disk 追求可恢复。',
    pipelineDesc:
      'QualityScaler-Go 可以把视频帧直接走内存流，也可以写入中间帧文件。前者更快，后者适合 VFR、断点恢复和逐帧排查。',
    pipelineModes: [
      ['Memory 管线', '不生成临时帧文件，I/O 更低，是普通恒定帧率视频的最快路径。', ['最快路径', '0 GB 临时帧', '适合 CFR 视频']],
      ['Disk 管线', '基于文件的处理管线会慢一些，但更容易恢复、排查，也能兼容可变帧率源。', ['兼容 VFR', '支持恢复', '可检查帧文件']],
    ],
    pipelineFlow: ['解码', 'AI 推理', '融合', '编码'],
    modelsKicker: 'AI 模型',
    modelsTitle: '10+ 个修复模型',
    modelsDesc: '根据真实照片、动漫、人脸、噪声、模糊和修复强度选择模型。',
    downloadKicker: '下载',
    downloadTitle: '选择你的版本',
    downloadDesc: '四种构建适配不同硬件。不确定时选择 Full。',
    recommended: '推荐',
    editions: [
      ['full', 'QualityScaler Full', '全部后端 + 自动检测', '完整包，包含 TensorRT、ONNX CUDA、ONNX CPU 和 OpenCV。', ['自动检测', 'TensorRT', 'CUDA', 'CPU'], true],
      ['tensorrt', 'TensorRT GPU', '最高性能', '面向 NVIDIA GPU 的 TensorRT 加速版本。', ['TensorRT', 'CUDA'], false],
      ['cuda', 'ONNX CUDA', 'ONNX 方式调用 NVIDIA GPU', 'CUDA 加速的 ONNX Runtime，配置更简单。', ['CUDA'], false],
      ['cpu', 'ONNX CPU', '通用兼容', '纯 CPU 推理，无需独立显卡。', ['CPU'], false],
    ],
    docsTitle: '手册与安装说明',
    docsDesc: 'CUDA、cuDNN、TensorRT、模型选择、显存分级和故障排查。',
    englishManual: '英文手册',
    chineseManual: '中文手册',
    source: '源码仓库',
    sponsor: '赞助项目',
  },
} as const

const routePath = window.location.pathname
const lang = ref<Lang>(routePath === '/en' || routePath.startsWith('/en/') ? 'en' : 'zh')
const version = ref('v5.0.1-rc1')
const downloadUrl = ref('https://github.com/Ling0727-ai/qs-go-website/releases/')
const terminalStep = ref(0)
const isDocPage = ref(routePath.startsWith('/doc') || routePath.startsWith('/en/doc'))
const docHtml = ref('')
const docLoading = ref(false)
const docError = ref('')
const tocItems = ref<Array<{ id: string; text: string; level: 2 | 3 }>>([])
const activeHeading = ref('')
const docSidebarDocked = ref(false)
let removeTocScrollListener: (() => void) | null = null
let lastAutoScrolledTocId = ''

const t = computed(() => copy[lang.value])
const navTargets = ['features', 'pipeline', 'models', 'download', 'docs']
const featureIcons = [ImageUp, FileVideo, ScanFace, Cpu, Layers3, Zap]
const models = ['Real-ESRGAN x4', 'Real-ESRGAN Anime', 'BSRGAN x2', 'BSRGAN x4', 'Real-CUGAN v3 x2', 'Real-CUGAN v3 x3', 'Real-CUGAN v3 x4', 'CodeFormer', 'Face Enhance x4', 'SCUNet GAN', 'SCUNet PSNR', 'DeblurGAN v2', 'IRCNN', 'MSharpx4']

const editions = computed<Edition[]>(() =>
  t.value.editions.map(([id, name, label, desc, specs, recommended]) => ({ id, name, label, desc, specs: [...specs], recommended })),
)

const manualFile = computed(() => (lang.value === 'zh' ? '/doc/USER_MANUAL-zh_cn.md' : '/doc/USER_MANUAL-en.md'))

function toggleLang() {
  const nextLang: Lang = lang.value === 'en' ? 'zh' : 'en'
  const targetPath = isDocPage.value
    ? (nextLang === 'en' ? '/en/doc/' : '/doc/')
    : (nextLang === 'en' ? '/en/' : '/')
  localStorage.setItem('qs-site-lang', nextLang)
  window.location.assign(`${targetPath}${window.location.hash}`)
}

function navHref(target: string) {
  const homePath = lang.value === 'en' ? '/en/' : '/'
  if (target === 'docs') return lang.value === 'en' ? '/en/doc/' : '/doc/'
  return isDocPage.value ? `${homePath}#${target}` : `#${target}`
}

function makeSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
}

async function loadDoc() {
  if (!isDocPage.value) return

  docLoading.value = true
  docError.value = ''
  activeHeading.value = ''
  docSidebarDocked.value = false
  lastAutoScrolledTocId = ''
  removeTocScrollListener?.()
  removeTocScrollListener = null
  try {
    const response = await fetch(manualFile.value)
    if (!response.ok) throw new Error(`Failed to load manual: ${response.status}`)
    const markdown = await response.text()
    const rawHtml = await marked.parse(markdown)
    const parser = new DOMParser()
    const documentFragment = parser.parseFromString(`<article>${rawHtml}</article>`, 'text/html')
    const headings = Array.from(documentFragment.querySelectorAll('h2,h3'))
    tocItems.value = headings.map((heading) => {
      const id = makeSlug(heading.textContent || '')
      heading.id = id
      return { id, text: heading.textContent || '', level: heading.tagName === 'H2' ? 2 : 3 }
    })
    docHtml.value = documentFragment.body.innerHTML
    await nextTick()
    requestAnimationFrame(setupTocHighlight)
    window.setTimeout(setupTocHighlight, 80)
    document.title = lang.value === 'zh'
      ? 'QualityScaler-Go 用户手册 | 安装、模型与故障排查'
      : 'QualityScaler-Go User Manual | Setup, models and troubleshooting'
  } catch (error) {
    docError.value = error instanceof Error ? error.message : 'Failed to load documentation.'
  } finally {
    docLoading.value = false
  }
}

function setupTocHighlight() {
  removeTocScrollListener?.()
  removeTocScrollListener = null
  lastAutoScrolledTocId = ''

  const headings = Array.from(document.querySelectorAll<HTMLElement>('.doc-content h2, .doc-content h3'))
  const updateDockState = () => {
    const footer = document.querySelector<HTMLElement>('.footer')
    docSidebarDocked.value = Boolean(footer && footer.getBoundingClientRect().top < window.innerHeight - 36)
  }

  if (!headings.length) {
    updateDockState()
    return
  }

  const updateActiveHeading = () => {
    updateDockState()

    let current = headings[0].id
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= 120) {
        current = heading.id
      } else {
        break
      }
    }
    activeHeading.value = current
    if (lastAutoScrolledTocId !== current) {
      lastAutoScrolledTocId = current
      scrollTocToHeading(current)
    }
  }

  updateActiveHeading()
  window.addEventListener('scroll', updateActiveHeading, { passive: true })
  window.addEventListener('resize', updateActiveHeading, { passive: true })
  removeTocScrollListener = () => {
    window.removeEventListener('scroll', updateActiveHeading)
    window.removeEventListener('resize', updateActiveHeading)
  }
}

function scrollTocToHeading(id: string) {
  const sidebar = document.querySelector<HTMLElement>('.doc-sidebar')
  const link = sidebar?.querySelector<HTMLAnchorElement>(`a[href="#${CSS.escape(id)}"]`)
  if (!sidebar || !link) return

  const targetTop = link.offsetTop
  const maxScroll = sidebar.scrollHeight - sidebar.clientHeight
  if (targetTop < maxScroll) {
    sidebar.scrollTo({ top: targetTop, behavior: 'smooth' })
  }
}

onMounted(async () => {
  localStorage.setItem('qs-site-lang', lang.value)
  document.documentElement.lang = lang.value === 'zh' ? 'zh-CN' : 'en'

  try {
    const response = await fetch('/version.json')
    if (!response.ok) return
    const data = (await response.json()) as { version?: string; downloadUrl?: string }
    version.value = data.version || version.value
    downloadUrl.value = data.downloadUrl || downloadUrl.value
  } catch {
    // Keep the baked-in release metadata for local previews.
  }

  setInterval(() => {
    terminalStep.value = (terminalStep.value + 1) % t.value.terminalLines.length
  }, 1450)

  await loadDoc()
})

watch(lang, () => {
  void loadDoc()
}, { flush: 'post' })

onBeforeUnmount(() => {
  removeTocScrollListener?.()
})
</script>

<template>
  <div class="site-shell">
    <header class="nav-bar">
      <a class="brand" :href="isDocPage ? (lang === 'en' ? '/en/' : '/') : '#top'" aria-label="QualityScaler-Go home">
        <img src="/miao.png" alt="" width="34" height="34" />
        <span>QualityScaler-Go</span>
      </a>
      <nav aria-label="Main navigation">
        <a v-for="(item, index) in t.nav" :key="item" :href="navHref(navTargets[index])">{{ item }}</a>
        <a href="https://github.com/Ling0727-ai/QualityScaler-go" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
      <div class="nav-actions">
        <button class="lang-button" type="button" @click="toggleLang">
          <Languages :size="15" />
          {{ lang === 'en' ? '中文' : 'EN' }}
        </button>
        <a class="nav-cta" :href="downloadUrl">
          <Download :size="15" />
          {{ t.download }}
        </a>
      </div>
    </header>

    <main v-if="!isDocPage" id="top">
      <section class="hero-section" aria-labelledby="hero-title">
        <div class="hero-glow" aria-hidden="true"></div>
        <p class="hero-badge">
          <span></span>
          {{ version }} - {{ t.heroBadge }}
        </p>
        <h1 id="hero-title">
          <span>{{ t.titleA }}</span>
          {{ t.titleB }}
        </h1>
        <p class="hero-copy">{{ t.desc }}</p>
        <div class="hero-actions">
          <a class="button button-primary" :href="downloadUrl">
            <Download :size="18" />
            {{ t.download }}
          </a>
          <a class="button button-secondary" href="https://github.com/Ling0727-ai/QualityScaler-go" target="_blank" rel="noreferrer">
            <GitFork :size="18" />
            {{ t.github }}
          </a>
        </div>

        <div class="terminal" aria-label="Processing command preview">
          <div class="terminal-bar">
            <span class="dot red"></span>
            <span class="dot amber"></span>
            <span class="dot green"></span>
            <strong>{{ t.terminalTitle }}</strong>
          </div>
          <div class="terminal-body">
            <p v-for="(line, index) in t.terminalLines" :key="line" :class="{ prompt: index === 0, active: index === terminalStep }">
              {{ line }}
            </p>
            <p class="cursor-line">$ <span></span></p>
          </div>
        </div>

        <div class="hero-stats">
          <article v-for="stat in t.stats" :key="stat[0]">
            <strong>{{ stat[0] }}</strong>
            <span>{{ stat[1] }}</span>
          </article>
        </div>
      </section>

      <section id="features" class="section feature-section">
        <div class="section-head">
          <p class="section-kicker">{{ t.featuresKicker }}</p>
          <h2>{{ t.featuresTitle }}</h2>
          <p>{{ t.featuresDesc }}</p>
        </div>
        <div class="features-grid">
          <article v-for="(feature, index) in t.features" :key="feature[0]" class="feature-card reveal">
            <component :is="featureIcons[index]" :size="23" />
            <h3>{{ feature[0] }}</h3>
            <p>{{ feature[1] }}</p>
          </article>
        </div>
      </section>

      <section class="section steps-section">
        <div class="section-head center">
          <p class="section-kicker">{{ t.stepsKicker }}</p>
          <h2>{{ t.stepsTitle }}</h2>
          <p>{{ t.stepsDesc }}</p>
        </div>
        <div class="steps-grid">
          <article v-for="(step, index) in t.steps" :key="step[0]" class="step-card">
            <strong>{{ index + 1 }}</strong>
            <h3>{{ step[0] }}</h3>
            <p>{{ step[1] }}</p>
          </article>
        </div>
      </section>

      <section id="pipeline" class="section pipeline-section">
        <div class="section-head center">
          <p class="section-kicker">{{ t.pipelineKicker }}</p>
          <h2>{{ t.pipelineTitle }}</h2>
          <p>{{ t.pipelineDesc }}</p>
        </div>
        <div class="pipeline-flow" aria-label="Video processing flow">
          <span v-for="item in t.pipelineFlow" :key="item">{{ item }}</span>
        </div>
        <div class="pipeline-grid">
          <article v-for="mode in t.pipelineModes" :key="mode[0]" class="pipeline-card">
            <h3>{{ mode[0] }}</h3>
            <p>{{ mode[1] }}</p>
            <div class="pipeline-tags">
              <span v-for="tag in mode[2]" :key="tag">{{ tag }}</span>
            </div>
          </article>
        </div>
      </section>

      <section id="models" class="section">
        <div class="section-head">
          <p class="section-kicker">{{ t.modelsKicker }}</p>
          <h2>{{ t.modelsTitle }}</h2>
          <p>{{ t.modelsDesc }}</p>
        </div>
        <div class="model-grid">
          <span v-for="model in models" :key="model">{{ model }}</span>
        </div>
      </section>

      <section id="download" class="section download-section">
        <div class="section-head">
          <p class="section-kicker">{{ t.downloadKicker }}</p>
          <h2>{{ t.downloadTitle }}</h2>
          <p>{{ t.downloadDesc }}</p>
        </div>
        <div class="download-grid">
          <article v-for="edition in editions" :key="edition.id" :class="['download-card', { recommended: edition.recommended }]">
            <span v-if="edition.recommended" class="rec-badge">{{ t.recommended }}</span>
            <h3>{{ edition.name }}</h3>
            <strong>{{ edition.label }}</strong>
            <p>{{ edition.desc }}</p>
            <div class="spec-list">
              <span v-for="spec in edition.specs" :key="spec">{{ spec }}</span>
            </div>
            <a class="download-link" :href="downloadUrl">
              <Download :size="15" />
              Windows
            </a>
          </article>
        </div>
      </section>

      <section id="docs" class="docs-strip">
        <div>
          <h2>{{ t.docsTitle }}</h2>
          <p>{{ t.docsDesc }}</p>
        </div>
        <div class="doc-actions">
          <a class="button button-secondary" :href="lang === 'en' ? '/en/doc/' : '/doc/'">
            <BookOpen :size="18" />
            {{ lang === 'zh' ? t.chineseManual : t.englishManual }}
          </a>
        </div>
      </section>
    </main>

    <main v-else class="doc-page">
      <aside :class="['doc-sidebar', { docked: docSidebarDocked }]">
        <nav aria-label="Documentation table of contents">
          <a
            v-for="item in tocItems"
            :key="item.id"
            :href="`#${item.id}`"
            :class="[`toc-h${item.level}`, { active: activeHeading === item.id }]"
          >
            {{ item.text }}
          </a>
        </nav>
      </aside>
      <article class="doc-content">
        <p v-if="docLoading" class="doc-state">Loading documentation...</p>
        <p v-else-if="docError" class="doc-state error">{{ docError }}</p>
        <div v-else v-html="docHtml"></div>
      </article>
    </main>

    <footer class="footer">
      <span>
        <img src="/miao.png" alt="" width="24" height="24" />
        QualityScaler-Go
      </span>
      <div class="footer-links">
        <a href="https://ko-fi.com/lingxin07" target="_blank" rel="noreferrer">
          <Heart :size="16" />
          {{ t.sponsor }}
        </a>
        <a href="https://github.com/Ling0727-ai/QualityScaler-go" target="_blank" rel="noreferrer">
          <Boxes :size="16" />
          {{ t.source }}
        </a>
      </div>
    </footer>
  </div>
</template>
