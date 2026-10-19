<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { marked } from 'marked'
import { ArrowDownToLine, ArrowUpRight, Check, Copy, Moon, Sun } from '@lucide/vue'

type Lang = 'en' | 'zh'
type Theme = 'light' | 'dark'
type Edition = {
  id: string
  name: string
  label: string
  desc: string
  specs: string[]
  recommended?: boolean
  status?: string
}

const copy = {
  en: {
    themeLight: 'Switch to light theme',
    themeDark: 'Switch to dark theme',
    nav: ['Architecture', 'Workflow', 'Pipeline', 'Models', 'Releases', 'Manual'],
    heroBadge: 'MIT Open Source · Local Inference',
    titleA: 'Local AI super-resolution.',
    titleB: 'Engineered for native throughput.',
    desc:
      'Upscale images and videos entirely on your workstation. Built on Go, FFmpeg, ONNX Runtime, and TensorRT with Real-ESRGAN, BSRGAN, and CodeFormer restoration.',
    download: 'Download Release',
    github: 'Source Repository',
    comparisonTitle: 'Spatial detail recovery',
    comparisonCaption: 'Sample 0801 · Real-ESRGAN x4 · 200% output scale',
    comparisonBefore: 'ORIGINAL',
    comparisonAfter: 'RESTORED 4X',
    comparisonHint: 'Drag to compare original and restored image',
    terminalModes: [
      {
        id: 'webui',
        label: 'Standalone WebUI',
        cmd: 'QualityScaler-Go.exe --no-window --webui-addr 0.0.0.0:7746',
        lines: [
          '$ QualityScaler-Go.exe --no-window --webui-addr 0.0.0.0:7746',
          '[01/04] runtime    TensorRT · NVIDIA GeForce RTX 4090 ...... active',
          '[02/04] webui      http://0.0.0.0:7746/?token=qs_8f42a9 .... listening',
          '[03/04] pipeline   RealESR_Gx4 (FP16) · 1920×1080 -> 4K .... 18.4ms/tile',
          '[04/04] output     photo_RealESR_Gx4.png ................... committed',
        ],
      },
      {
        id: 'winget',
        label: 'Winget',
        cmd: 'winget install --id Ling0727.QualityScalerGo.Cuda',
        lines: [
          '$ winget install --id Ling0727.QualityScalerGo.Cuda',
          '[01/03] package    Ling0727.QualityScalerGo.Cuda ........... verified',
          '[02/03] provider   ONNX Runtime CUDA + OpenCV .............. extracted',
          '[03/03] binary     QualityScaler-Go.exe --server ........... ready',
        ],
      },
      {
        id: 'scoop',
        label: 'Scoop',
        cmd: 'scoop bucket add qualityscaler-go https://github.com/Ling0727-ai/qs-go-website && scoop install qualityscaler-go/qualityscaler-go-cuda',
        lines: [
          '$ scoop bucket add qualityscaler-go https://github.com/Ling0727-ai/qs-go-website',
          '$ scoop install qualityscaler-go/qualityscaler-go-cuda',
          '[01/02] manifest   qualityscaler-go-cuda (64bit) ........... linked',
          '[02/02] shim       QualityScaler-Go.exe .................... installed',
        ],
      },
    ],
    copyCmd: 'Copy command',
    copiedCmd: 'Copied',
    stats: [
      ['14', 'Pre-configured restoration & deblur models'],
      ['2× – 4×', 'Spatial resolution scaling factors'],
      ['FP16', 'Half-precision TensorRT & CUDA execution'],
      ['0 B', 'Cloud telemetry or external media upload'],
    ],
    featuresKicker: '01 / Architecture',
    featuresTitle: 'Deterministic local media pipeline',
    featuresDesc: 'Every stage from frame demuxing to tensor tiling and audio remuxing runs natively on local silicon.',
    features: [
      ['01', 'Image Super-Resolution', '2×, 3×, and 4× spatial enhancement powered by Real-ESRGAN, BSRGAN, and Real-CUGAN architectures.', '2x / 3x / 4x'],
      ['02', 'Video Stream Processing', 'Frame-accurate AI restoration via FFmpeg while preserving source audio streams, timecodes, and container metadata.', 'FFmpeg I/O'],
      ['03', 'CodeFormer Face Restoration', 'Automated facial region detection, dedicated neural reconstruction, and seamless spatial blending into the master frame.', 'CodeFormer'],
      ['04', 'Resilient Backend Fallback', 'Automatic execution routing from TensorRT to ONNX CUDA and ONNX CPU ensures uninterrupted runs across hardware.', 'TRT -> CUDA -> CPU'],
      ['05', 'Asynchronous Batch Queue', 'Drop directories or multi-file selections to pipeline decoding, GPU inference, and disk encoding without blocking.', 'Multi-file'],
      ['06', 'FP16 Tensor Acceleration', 'Half-precision execution minimizes VRAM footprint and doubles tensor core throughput with negligible perceptual loss.', 'Half Precision'],
    ],
    stepsKicker: '02 / Workflow',
    stepsTitle: 'Three stages from source to master',
    stepsDesc: 'Zero cloud round-trips. Every frame stays on local storage.',
    steps: [
      ['01', 'Ingest Media', 'Drop individual images, video containers, or entire project directories into the local queue.'],
      ['02', 'Configure Runtime', 'Select the target neural architecture, scaling factor, tile dimensions, and execution provider.'],
      ['03', 'Commit Output', 'Run deterministic local inference and export restored assets directly to your file system.'],
    ],
    pipelineKicker: '03 / Execution Modes',
    pipelineTitle: 'Memory for velocity. Disk for recoverability.',
    pipelineDesc:
      'Stream decoded video frames directly through host memory for maximum throughput, or persist intermediate frames to disk when handling variable-frame-rate (VFR) media and long-running recoverable jobs.',
    pipelineModes: [
      ['MODE_A // MEMORY STREAM', 'Memory Pipeline', 'Zero intermediate frame files and minimal disk I/O overhead. Engineered as the fastest execution path for constant-frame-rate (CFR) video.', ['Fastest throughput', '0 GB temp storage', 'Optimal for CFR video']],
      ['MODE_B // PERSISTENT DISK', 'Disk Pipeline', 'File-backed frame staging designed for crash recovery, frame-level inspection, and strict variable-frame-rate (VFR) synchronization.', ['VFR compatible', 'Checkpoint resume', 'Inspectable frames']],
    ],
    pipelineFlow: [
      ['01', 'Demux & Decode', 'FFmpeg stream extraction'],
      ['02', 'Tensor Inference', 'Tiled GPU/CPU execution'],
      ['03', 'Spatial Blend', 'Tile & face reconstruction'],
      ['04', 'Mux & Encode', 'Audio & timecode sync'],
    ],
    modelsKicker: '04 / Model Registry',
    modelsTitle: '14 neural weights across 4 domains',
    modelsDesc: 'Select specialized weights tuned for photographic detail, 2D animation, facial structure, sensor noise, or motion blur.',
    modelWeights: 'Browse model weights on Hugging Face',
    modelGroups: [
      ['Photographic & General', [
        ['Real-ESRGAN x4', '4×', 'General photographic super-resolution'],
        ['BSRGAN x2', '2×', 'Degradation-aware real photo restoration'],
        ['BSRGAN x4', '4×', 'Heavy compression & artifact removal'],
        ['MSharpx4', '4×', 'High-acuity edge & texture sharpening'],
      ]],
      ['Animation & Illustration', [
        ['Real-ESRGAN Anime', '4×', 'Line art, cel animation & flat shading'],
        ['Real-CUGAN v3 x2', '2×', 'Conservative anime upscale & denoise'],
        ['Real-CUGAN v3 x3', '3×', 'Balanced 3× illustration restoration'],
        ['Real-CUGAN v3 x4', '4×', 'Maximum scale for 2D visual media'],
      ]],
      ['Facial Reconstruction', [
        ['CodeFormer', '1×', 'Blind face restoration & fidelity blending'],
        ['Face Enhance x4', '4×', 'Joint facial upscaling and detail synthesis'],
      ]],
      ['Denoising & Deblurring', [
        ['SCUNet GAN', '1×', 'Perceptual blind camera noise removal'],
        ['SCUNet PSNR', '1×', 'High-fidelity structural denoising'],
        ['DeblurGAN v2', '1×', 'Motion & defocus blur compensation'],
        ['IRCNN', '1×', 'Iterative convolutional image restoration'],
      ]],
    ],
    downloadKicker: '05 / Releases',
    downloadTitle: 'Select your runtime distribution',
    downloadDesc: 'Five Windows distributions tailored to specific hardware backends, plus Ubuntu support. Choose Full if you want runtime engine switching.',
    recommended: 'Default Choice',
    editions: [
      ['full', 'Full Distribution', 'Multi-engine runtime', 'Unified Windows package allowing live switching across all supported inference backends.', ['Engine switching', 'Auto fallback', 'Windows x64'], true],
      ['tensorrt', 'TensorRT GPU', 'Maximum NVIDIA throughput', 'Dedicated TensorRT execution provider compiled for modern Windows NVIDIA GPUs.', ['TensorRT', 'FP16 / CUDA', 'Windows x64'], false],
      ['cuda', 'ONNX CUDA', 'Standard NVIDIA GPU', 'CUDA-accelerated ONNX Runtime build for broad NVIDIA hardware compatibility.', ['ONNX CUDA', 'Windows x64'], false],
      ['cpu', 'ONNX CPU', 'Universal fallback', 'Pure CPU inference distribution for Windows workstations and supported Ubuntu environments.', ['CPU Only', 'Windows / Ubuntu'], false],
      ['directml', 'DirectML', 'Cross-vendor Windows GPU', 'DirectML hardware acceleration targeting AMD, Intel, and NVIDIA GPUs on Windows.', ['DirectML', 'Windows x64'], false, 'Pending'],
    ],
    docsKicker: '06 / Documentation',
    docsTitle: 'System manual & environment setup',
    docsDesc: 'Complete technical reference for CUDA, cuDNN, TensorRT provisioning, VRAM tiling budgets, and pipeline diagnostics.',
    englishManual: 'Read English Manual',
    chineseManual: '阅读中文手册',
    supportKicker: 'Open Source Sustainability',
    supportTitle: 'Support independent local AI tooling',
    supportDesc: 'QualityScaler-Go is maintained as free MIT-licensed software. Contributions directly fund hardware testing and release engineering.',
    source: 'GitHub Repository',
    sponsor: 'Sponsor via Ko-fi',
  },
  zh: {
    themeLight: '切换浅色主题',
    themeDark: '切换深色主题',
    nav: ['核心架构', '工作流', '管线模式', '模型矩阵', '发行版本', '技术手册'],
    heroBadge: 'MIT 开源许可 · 纯本地推理',
    titleA: '本地 AI 超分辨率引擎，',
    titleB: '为原生硬件吞吐而构建。',
    desc:
      '在本地工作站完成图像与视频超分修复。基于 Go、FFmpeg、ONNX Runtime 与 TensorRT 构建，集成 Real-ESRGAN、BSRGAN 与 CodeFormer 模型管线。',
    download: '获取发行版',
    github: '访问源码仓库',
    comparisonTitle: '空域细节重建对比',
    comparisonCaption: '样本 0801 · Real-ESRGAN x4 · 200% 分辨率输出',
    comparisonBefore: '原始输入',
    comparisonAfter: '4X 超分重建',
    comparisonHint: '左右拖动对比原始输入与超分重建效果',
    terminalModes: [
      {
        id: 'webui',
        label: 'WebUI 独立服务',
        cmd: 'QualityScaler-Go.exe --no-window --webui-addr 0.0.0.0:7746',
        lines: [
          '$ QualityScaler-Go.exe --no-window --webui-addr 0.0.0.0:7746',
          '[01/04] 计算后端   TensorRT · NVIDIA GeForce RTX 4090 ...... 激活',
          '[02/04] 监听服务   http://0.0.0.0:7746/?token=qs_8f42a9 .... 就绪',
          '[03/04] 张量推理   RealESR_Gx4 (FP16) · 1920×1080 -> 4K .... 18.4ms/分块',
          '[04/04] 文件写入   photo_RealESR_Gx4.png ................... 完成',
        ],
      },
      {
        id: 'winget',
        label: 'Winget 安装',
        cmd: 'winget install --id Ling0727.QualityScalerGo.Cuda',
        lines: [
          '$ winget install --id Ling0727.QualityScalerGo.Cuda',
          '[01/03] 软件包     Ling0727.QualityScalerGo.Cuda ........... 校验通过',
          '[02/03] 运行时     ONNX Runtime CUDA + OpenCV .............. 解压完成',
          '[03/03] 启动入口   QualityScaler-Go.exe --server ........... 就绪',
        ],
      },
      {
        id: 'scoop',
        label: 'Scoop 安装',
        cmd: 'scoop bucket add qualityscaler-go https://github.com/Ling0727-ai/qs-go-website && scoop install qualityscaler-go/qualityscaler-go-cuda',
        lines: [
          '$ scoop bucket add qualityscaler-go https://github.com/Ling0727-ai/qs-go-website',
          '$ scoop install qualityscaler-go/qualityscaler-go-cuda',
          '[01/02] 清单链接   qualityscaler-go-cuda (64bit) ........... 已关联',
          '[02/02] 快捷入口   QualityScaler-Go.exe .................... 安装完成',
        ],
      },
    ],
    copyCmd: '复制命令',
    copiedCmd: '已复制',
    stats: [
      ['14', '内置超分、去噪与人脸重建模型权重'],
      ['2× – 4×', '空域分辨率无损放大倍率支持'],
      ['FP16', 'TensorRT 与 CUDA 半精度高速张量推理'],
      ['0 B', '云端上传或外部遥测数据收集'],
    ],
    featuresKicker: '01 / 核心架构',
    featuresTitle: '确定性的本地媒体超分管线',
    featuresDesc: '从视频解复用、张量分块推理到音轨重封装，所有计算均在本地芯片上原生执行。',
    features: [
      ['01', '图像超分辨率重建', '基于 Real-ESRGAN、BSRGAN 与 Real-CUGAN 架构，支持 2×、3×、4× 空域细节增强。', '2x / 3x / 4x'],
      ['02', '视频流逐帧处理', '通过 FFmpeg 进行逐帧 AI 重建，完整保留源视频音轨、时间码与容器格式元数据。', 'FFmpeg I/O'],
      ['03', 'CodeFormer 人脸修复', '自动检测画面中的人脸区域，调用独立神经网络重建面部细节并平滑融合回原帧。', 'CodeFormer'],
      ['04', '多级计算后端兜底', '遵循 TensorRT -> ONNX CUDA -> ONNX CPU 的自动降级策略，确保在不同硬件环境下稳定运行。', 'TRT -> CUDA -> CPU'],
      ['05', '异步批量任务队列', '支持直接拖入目录或多文件队列，解耦解码、GPU 推理与磁盘写入，保持管线满载运行。', 'Batch Queue'],
      ['06', 'FP16 半精度加速', '利用 TensorRT FP16 半精度推理显著降低显存占用并成倍提升吞吐量，兼顾效率与画质。', 'Half Precision'],
    ],
    stepsKicker: '02 / 工作流',
    stepsTitle: '从源素材到母版输出仅需三步',
    stepsDesc: '无需漫长的云端上传与排队，每一帧数据始终留在你的本地存储中。',
    steps: [
      ['01', '导入媒体源', '将单张图像、视频文件或整个素材文件夹直接拖入本地处理队列。'],
      ['02', '配置推理管线', '按素材类型选择网络权重、放大倍率、显存分块大小及硬件执行后端。'],
      ['03', '本地导出成片', '执行确定性的本地张量推理，将超分修复后的高清媒体直接写入磁盘。'],
    ],
    pipelineKicker: '03 / 管线模式',
    pipelineTitle: 'Memory 追求极限吞吐，Disk 保障断点可恢复。',
    pipelineDesc:
      'QualityScaler-Go 支持将解码后的视频帧直接通过内存流传递以压榨极限速度，也支持将中间帧落盘以应对可变帧率（VFR）、超长视频断点续传与逐帧核验。',
    pipelineModes: [
      ['MODE_A // 内存直通流', 'Memory 内存管线', '不产生任何临时帧文件，大幅降低磁盘 I/O 开销，是常规恒定帧率（CFR）视频的最快执行路径。', ['最高吞吐路径', '0 GB 临时帧占用', 'CFR 恒定帧率首选']],
      ['MODE_B // 磁盘持久化', 'Disk 磁盘管线', '基于文件系统的中间帧暂存管线，支持任务中断恢复、逐帧结果排查，并完美兼容可变帧率（VFR）源视频。', ['兼容 VFR 可变帧率', '支持断点恢复', '可逐帧核验文件']],
    ],
    pipelineFlow: [
      ['01', '解复用与解码', 'FFmpeg 帧流提取'],
      ['02', '张量分块推理', 'GPU / CPU 并行计算'],
      ['03', '空域特征融合', '分块拼接与人脸回贴'],
      ['04', '重封装与编码', '音画同步与容器写入'],
    ],
    modelsKicker: '04 / 模型矩阵',
    modelsTitle: '覆盖 4 大修复维度的 14 款预置模型',
    modelsDesc: '针对纪实摄影、二次元动漫、面部五官、传感器噪点及运动模糊提供精细调校的神经网络权重。',
    modelWeights: '在 Hugging Face 查看模型权重',
    modelGroups: [
      ['真实摄影与通用增强', [
        ['Real-ESRGAN x4', '4×', '通用真实图像四倍超分重建'],
        ['BSRGAN x2', '2×', '针对真实退化图像的两倍细腻修复'],
        ['BSRGAN x4', '4×', '强力去除压缩伪影与四倍放大'],
        ['MSharpx4', '4×', '高锐度边缘与纹理细节强化'],
      ]],
      ['动漫与插画艺术', [
        ['Real-ESRGAN Anime', '4×', '针对线条艺术、赛璐璐动画与平涂优化'],
        ['Real-CUGAN v3 x2', '2×', '兼顾保留原有画风的动漫降噪与两倍放大'],
        ['Real-CUGAN v3 x3', '3×', '均衡的三倍二次元插画超分重建'],
        ['Real-CUGAN v3 x4', '4×', '面向二维视觉媒体的四倍极限超分'],
      ]],
      ['面部结构重建', [
        ['CodeFormer', '1×', '盲人脸修复与高保真五官特征融合'],
        ['Face Enhance x4', '4×', '面部区域联合四倍超分与细节合成'],
      ]],
      ['降噪与去模糊', [
        ['SCUNet GAN', '1×', '感知导向的相机盲噪点去除'],
        ['SCUNet PSNR', '1×', '高信噪比结构保真图像降噪'],
        ['DeblurGAN v2', '1×', '运动模糊与失焦模糊补偿修复'],
        ['IRCNN', '1×', '迭代卷积图像退化复原网络'],
      ]],
    ],
    downloadKicker: '05 / 发行版本',
    downloadTitle: '选择适配你硬件的运行环境包',
    downloadDesc: '提供五种针对不同硬件后端编译的 Windows 发行版及部分 Ubuntu 支持。若不确定硬件配置，推荐选择 Full 全量版。',
    recommended: '推荐首选',
    editions: [
      ['full', 'Full 全量版', '多推理引擎动态切换', '集成完整运行时组件的 Windows 发行包，支持在可用推理引擎之间自由切换与自动兜底。', ['多引擎切换', '自动硬件检测', 'Windows x64'], true],
      ['tensorrt', 'TensorRT GPU', 'NVIDIA 极限吞吐', '专为 Windows 平台 NVIDIA 显卡编译的 TensorRT 高性能加速版本。', ['TensorRT', 'FP16 / CUDA', 'Windows x64'], false],
      ['cuda', 'ONNX CUDA', 'NVIDIA 通用加速', '通过 ONNX Runtime 调用 CUDA 的 Windows NVIDIA GPU 加速版本，兼容性更广。', ['ONNX CUDA', 'Windows x64'], false],
      ['cpu', 'ONNX CPU', '全平台通用兼容', '纯 CPU 推理版本，适用于任意 Windows 设备及受支持的 Ubuntu 发行版。', ['纯 CPU 推理', 'Windows / Ubuntu'], false],
      ['directml', 'DirectML', 'Windows 跨厂商 GPU', '面向兼容 Windows GPU（AMD / Intel / NVIDIA）的 DirectML 硬件加速版本。', ['DirectML', 'Windows x64'], false, '即将发布'],
    ],
    docsKicker: '06 / 技术文档',
    docsTitle: '用户手册与运行时环境配置',
    docsDesc: '涵盖 CUDA、cuDNN、TensorRT 环境部署、模型选型指南、显存分块预算及常见故障排查。',
    englishManual: '阅读英文手册 (EN)',
    chineseManual: '阅读中文手册 (ZH)',
    supportKicker: '开源持续维护',
    supportTitle: '支持独立本地 AI 工具的持续演进',
    supportDesc: 'QualityScaler-Go 采用 MIT 协议完全免费开源。你的小额赞助将直接用于多硬件平台测试与版本维护。',
    source: 'GitHub 源码仓库',
    sponsor: '在 Ko-fi 赞助支持',
  },
} as const

const routePath = window.location.pathname
const lang = ref<Lang>(routePath === '/en' || routePath.startsWith('/en/') ? 'en' : 'zh')
const theme = ref<Theme>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
const version = ref('v5.0.1-rc1')
const downloadUrl = ref('https://github.com/Ling0727-ai/qs-go-website/releases/')
const terminalStep = ref(0)
const activeTerminalTab = ref(0)
const copiedTerminal = ref(false)
const hoveredNavIndex = ref<number | null>(null)
const activeSection = ref<string>('features')
const activeModelTab = ref(0)
const navContainer = ref<HTMLElement | null>(null)
const navPillStyle = ref<{ opacity: number; transform: string; width: string }>({
  opacity: 0,
  transform: 'translateX(0px)',
  width: '0px',
})

const currentTerminalMode = computed(() => t.value.terminalModes[activeTerminalTab.value] ?? t.value.terminalModes[0])

function selectTerminalTab(idx: number) {
  activeTerminalTab.value = idx
  terminalStep.value = 0
}

const comparisonPosition = ref(50)
const comparisonVisual = ref<HTMLElement | null>(null)
const isDraggingComparison = ref(false)
const isDocPage = ref(routePath.startsWith('/doc') || routePath.startsWith('/en/doc'))
const docHtml = ref('')
const docLoading = ref(false)
const docError = ref('')
const tocItems = ref<Array<{ id: string; text: string; level: 2 | 3 }>>([])
const activeHeading = ref('')
const docSidebarDocked = ref(false)
let removeTocScrollListener: (() => void) | null = null
let removeSectionScrollListener: (() => void) | null = null
let sectionObserver: IntersectionObserver | null = null
let lastAutoScrolledTocId = ''
let terminalTimer: number | null = null

const t = computed(() => copy[lang.value])
const navTargets = ['features', 'workflow', 'pipeline', 'models', 'download', 'docs']

const editions = computed<Edition[]>(() =>
  t.value.editions.map(([id, name, label, desc, specs, recommended, status]) => ({
    id,
    name,
    label,
    desc,
    specs: [...specs],
    recommended,
    status,
  })),
)

function updatePillToElement(el: HTMLElement | null, visible = true) {
  const container = navContainer.value
  if (!el || !container) return
  const containerRect = container.getBoundingClientRect()
  const targetRect = el.getBoundingClientRect()
  navPillStyle.value = {
    opacity: visible ? 1 : 0,
    transform: `translateX(${targetRect.left - containerRect.left}px)`,
    width: `${targetRect.width}px`,
  }
}

function syncActiveNavPill() {
  if (hoveredNavIndex.value !== null) return
  const container = navContainer.value
  if (!container) return
  const activeIdx = navTargets.indexOf(activeSection.value)
  if (activeIdx === -1 || isDocPage.value) {
    navPillStyle.value = { ...navPillStyle.value, opacity: 0 }
    return
  }
  const links = container.querySelectorAll<HTMLElement>('a')
  const activeEl = links[activeIdx]
  if (activeEl) {
    updatePillToElement(activeEl, true)
  }
}

function handleNavHover(index: number, event: MouseEvent) {
  hoveredNavIndex.value = index
  updatePillToElement(event.currentTarget as HTMLElement, true)
}

function handleNavLeave() {
  hoveredNavIndex.value = null
  syncActiveNavPill()
}

function handleSectionNavClick(event: MouseEvent, target: string) {
  if (target === 'docs' || isDocPage.value) return
  const el = document.getElementById(target)
  if (!el) return
  event.preventDefault()
  activeSection.value = target
  syncActiveNavPill()
  const top = el.getBoundingClientRect().top + window.scrollY - 56
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  history.replaceState(null, '', `#${target}`)
}

async function copyTerminalCommand() {
  const rawCmd = currentTerminalMode.value.cmd
  try {
    await navigator.clipboard.writeText(rawCmd)
    copiedTerminal.value = true
    window.setTimeout(() => {
      copiedTerminal.value = false
    }, 1800)
  } catch {
    // Ignore clipboard failure in restricted contexts
  }
}

function updateComparisonFromPointer(event: PointerEvent) {
  const visual = comparisonVisual.value
  if (!visual) return

  const rect = visual.getBoundingClientRect()
  const nextPosition = ((event.clientX - rect.left) / rect.width) * 100
  comparisonPosition.value = Math.min(100, Math.max(0, nextPosition))
}

function startComparisonDrag(event: PointerEvent) {
  isDraggingComparison.value = true
  updateComparisonFromPointer(event)
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

function moveComparisonDrag(event: PointerEvent) {
  if (isDraggingComparison.value) updateComparisonFromPointer(event)
}

function stopComparisonDrag() {
  isDraggingComparison.value = false
}

function adjustComparisonByKey(event: KeyboardEvent) {
  const step = event.shiftKey ? 10 : 1
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    comparisonPosition.value = Math.max(0, comparisonPosition.value - step)
    event.preventDefault()
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    comparisonPosition.value = Math.min(100, comparisonPosition.value + step)
    event.preventDefault()
  } else if (event.key === 'Home') {
    comparisonPosition.value = 0
    event.preventDefault()
  } else if (event.key === 'End') {
    comparisonPosition.value = 100
    event.preventDefault()
  }
}

const manualFile = computed(() => (lang.value === 'zh' ? '/doc/USER_MANUAL-zh_cn.md' : '/doc/USER_MANUAL-en.md'))

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme.value
  try {
    localStorage.setItem('qs-site-theme', theme.value)
  } catch {
    // Theme switching still works when persistent storage is unavailable.
  }
}

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

function setupSectionTransitions() {
  sectionObserver?.disconnect()
  removeSectionScrollListener?.()

  if (isDocPage.value) return

  const sections = Array.from(document.querySelectorAll<HTMLElement>('.observe-section'))
  if (!sections.length) return

  const revealTargets = document.querySelectorAll<HTMLElement>(
    '.section-head-side, .section-body-reveal, .spec-cell, .protocol-row, .schematic-node, .pipeline-card, .release-row, .metric-cell',
  )
  // Content stays visible if motion is disabled or observation is unavailable.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          sectionObserver?.unobserve(entry.target)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' },
    )
    revealTargets.forEach((target) => {
      target.classList.add('reveal-target')
      sectionObserver?.observe(target)
    })
  }

  const updateCurrentSection = () => {
    const triggerLine = window.innerHeight * 0.36
    let current = sections[0]?.id || 'features'

    for (const sec of sections) {
      const rect = sec.getBoundingClientRect()
      if (rect.top <= triggerLine) {
        current = sec.id
      } else {
        break
      }
    }

    if (activeSection.value !== current) {
      activeSection.value = current
      syncActiveNavPill()
    }

    sections.forEach((sec) => {
      sec.classList.toggle('is-active-section', sec.id === current)
    })
  }

  updateCurrentSection()
  window.addEventListener('scroll', updateCurrentSection, { passive: true })
  window.addEventListener('resize', syncActiveNavPill, { passive: true })
  removeSectionScrollListener = () => {
    window.removeEventListener('scroll', updateCurrentSection)
    window.removeEventListener('resize', syncActiveNavPill)
  }
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
    const usedIds = new Map<string, number>()
    tocItems.value = headings.map((heading) => {
      const baseId = makeSlug(heading.textContent || '') || 'section'
      const count = usedIds.get(baseId) || 0
      usedIds.set(baseId, count + 1)
      const id = count ? `${baseId}-${count + 1}` : baseId
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

  await nextTick()
  setupSectionTransitions()
  window.setTimeout(syncActiveNavPill, 60)

  try {
    const response = await fetch('/version.json')
    if (response.ok) {
      const data = (await response.json()) as { version?: string; downloadUrl?: string }
      version.value = data.version || version.value
      downloadUrl.value = data.downloadUrl || downloadUrl.value
    }
  } catch {
    // Keep baked-in release metadata for local previews.
  }

  terminalTimer = window.setInterval(() => {
    const lines = currentTerminalMode.value.lines
    terminalStep.value = (terminalStep.value + 1) % lines.length
  }, 1600)

  await loadDoc()
})

watch(lang, () => {
  void loadDoc()
}, { flush: 'post' })

onBeforeUnmount(() => {
  removeTocScrollListener?.()
  removeSectionScrollListener?.()
  sectionObserver?.disconnect()
  if (terminalTimer !== null) clearInterval(terminalTimer)
})
</script>

<template>
  <div class="site-shell">
    <header class="nav-bar">
      <div class="nav-inner">
        <a class="brand" :href="isDocPage ? (lang === 'en' ? '/en/' : '/') : '#top'" aria-label="QualityScaler-Go home">
          <img src="/miao.png" alt="" width="24" height="24" />
          <span class="brand-name">QualityScaler-Go</span>
          <span class="brand-version">{{ version }}</span>
        </a>

        <nav ref="navContainer" aria-label="Main navigation" @mouseleave="handleNavLeave">
          <span class="nav-hover-pill" :style="navPillStyle" aria-hidden="true"></span>
          <a
            v-for="(item, index) in t.nav"
            :key="item"
            :href="navHref(navTargets[index])"
            :class="{ 'is-current': !isDocPage && activeSection === navTargets[index] }"
            @mouseenter="handleNavHover(index, $event)"
            @click="handleSectionNavClick($event, navTargets[index])"
          >
            {{ item }}
          </a>
          <a
            href="https://github.com/Ling0727-ai/QualityScaler-go"
            target="_blank"
            rel="noreferrer"
            class="nav-external"
            @mouseenter="handleNavHover(t.nav.length, $event)"
          >
            GitHub
            <ArrowUpRight :size="13" />
          </a>
        </nav>

        <div class="nav-actions">
          <button
            class="theme-button"
            type="button"
            :aria-label="theme === 'light' ? t.themeDark : t.themeLight"
            :title="theme === 'light' ? t.themeDark : t.themeLight"
            @click="toggleTheme"
          >
            <Moon v-if="theme === 'light'" :size="16" aria-hidden="true" />
            <Sun v-else :size="16" aria-hidden="true" />
          </button>
          <button class="lang-button" type="button" @click="toggleLang">
            {{ lang === 'en' ? 'ZH' : 'EN' }}
          </button>
          <a class="nav-cta" :href="downloadUrl">
            {{ t.download }}
            <ArrowDownToLine :size="14" />
          </a>
        </div>
      </div>
    </header>

    <main v-if="!isDocPage" id="top">
      <!-- HERO: Asymmetric Swiss Split Layout (Vertically Centered Columns) -->
      <section class="hero-section" aria-labelledby="hero-title">
        <div class="hero-grid">
          <div class="hero-lead stagger-group">
            <div class="hero-status stagger-item" style="--stagger: 0">
              <span class="status-dot" aria-hidden="true"></span>
              <span class="mono-label">{{ version }}</span>
              <span class="status-sep">/</span>
              <span>{{ t.heroBadge }}</span>
            </div>

            <h1 id="hero-title" class="stagger-item" style="--stagger: 1">
              <span>{{ t.titleA }}</span>
              <span class="title-muted">{{ t.titleB }}</span>
            </h1>

            <p class="hero-copy stagger-item" style="--stagger: 2">{{ t.desc }}</p>

            <div class="hero-actions stagger-item" style="--stagger: 3">
              <a class="button button-primary" :href="downloadUrl">
                {{ t.download }}
                <ArrowDownToLine :size="15" />
              </a>
              <a
                class="button button-secondary"
                href="https://github.com/Ling0727-ai/QualityScaler-go"
                target="_blank"
                rel="noreferrer"
              >
                {{ t.github }}
                <ArrowUpRight :size="15" />
              </a>
            </div>

            <div class="terminal stagger-item" style="--stagger: 4" aria-label="Command and runtime preview">
              <div class="terminal-bar">
                <div class="terminal-tabs" role="tablist">
                  <button
                    v-for="(mode, idx) in t.terminalModes"
                    :key="mode.id"
                    type="button"
                    role="tab"
                    :aria-selected="activeTerminalTab === idx"
                    :class="['terminal-tab', { active: activeTerminalTab === idx }]"
                    @click="selectTerminalTab(idx)"
                  >
                    {{ mode.label }}
                  </button>
                </div>
                <button
                  type="button"
                  class="terminal-copy"
                  :aria-label="t.copyCmd"
                  @click="copyTerminalCommand"
                >
                  <Check v-if="copiedTerminal" :size="13" />
                  <Copy v-else :size="13" />
                  <span>{{ copiedTerminal ? t.copiedCmd : t.copyCmd }}</span>
                </button>
              </div>
              <Transition name="panel-switch" mode="out-in">
                <div :key="currentTerminalMode.id" class="terminal-body">
                  <p
                    v-for="(line, index) in currentTerminalMode.lines"
                    :key="line"
                    :class="{ prompt: line.startsWith('$ '), active: index === terminalStep }"
                  >
                    {{ line }}
                  </p>
                </div>
              </Transition>
            </div>
          </div>

          <div class="hero-stage stagger-item" style="--stagger: 2">
            <figure class="comparison-card">
              <div class="comparison-header">
                <div class="comparison-meta">
                  <strong>{{ t.comparisonTitle }}</strong>
                  <span>{{ t.comparisonCaption }}</span>
                </div>
                <output class="comparison-readout">{{ Math.round(comparisonPosition) }}%</output>
              </div>

              <div
                ref="comparisonVisual"
                class="comparison-visual"
                :class="{ dragging: isDraggingComparison }"
                @pointerdown="startComparisonDrag"
                @pointermove="moveComparisonDrag"
                @pointerup="stopComparisonDrag"
                @pointercancel="stopComparisonDrag"
              >
                <img class="comparison-image" src="/pic/0801.jpg" alt="" />
                <div class="comparison-after" :style="{ clipPath: `inset(0 0 0 ${comparisonPosition}%)` }">
                  <img class="comparison-image" src="/pic/0801_RealESR_Gx4_InputR-50_OutputR-100.jpg" alt="" />
                </div>
                <span class="comparison-label comparison-label-before">{{ t.comparisonBefore }}</span>
                <span class="comparison-label comparison-label-after">{{ t.comparisonAfter }}</span>
                <span class="comparison-divider" :style="{ left: `${comparisonPosition}%` }" aria-hidden="true">
                  <button
                    class="comparison-handle"
                    type="button"
                    role="slider"
                    :aria-label="t.comparisonHint"
                    :aria-valuenow="Math.round(comparisonPosition)"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    tabindex="0"
                    @pointerdown.stop="startComparisonDrag"
                    @keydown="adjustComparisonByKey"
                  >
                    <span class="handle-grip"></span>
                  </button>
                </span>
              </div>
            </figure>
          </div>
        </div>

        <dl class="metrics-bar">
          <div v-for="stat in t.stats" :key="stat[0]" class="metric-cell">
            <dt>{{ stat[0] }}</dt>
            <dd>{{ stat[1] }}</dd>
          </div>
        </dl>
      </section>

      <!-- 01 / ARCHITECTURE LEDGER (Left/Right vertically centered) -->
      <section id="features" class="section observe-section">
        <div class="ledger-layout">
          <div class="section-head section-head-side">
            <p class="section-kicker">
              <span class="kicker-bar" aria-hidden="true"></span>
              {{ t.featuresKicker }}
            </p>
            <h2>{{ t.featuresTitle }}</h2>
            <p class="section-desc">{{ t.featuresDesc }}</p>
          </div>

          <div class="spec-matrix section-body-reveal">
            <article
              v-for="(feature, idx) in t.features"
              :key="feature[0]"
              class="spec-cell"
              :style="{ '--item-index': idx }"
            >
              <div class="spec-cell-meta">
                <span class="spec-index">{{ feature[0] }}</span>
                <span class="spec-tag">{{ feature[3] }}</span>
              </div>
              <h3>{{ feature[1] }}</h3>
              <p>{{ feature[2] }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- 02 / WORKFLOW PROTOCOL (Left/Right vertically centered) -->
      <section id="workflow" class="section observe-section">
        <div class="ledger-layout">
          <div class="section-head section-head-side">
            <p class="section-kicker">
              <span class="kicker-bar" aria-hidden="true"></span>
              {{ t.stepsKicker }}
            </p>
            <h2>{{ t.stepsTitle }}</h2>
            <p class="section-desc">{{ t.stepsDesc }}</p>
          </div>

          <div class="protocol-stack section-body-reveal">
            <article
              v-for="(step, idx) in t.steps"
              :key="step[0]"
              class="protocol-row"
              :style="{ '--item-index': idx }"
            >
              <span class="protocol-num">{{ step[0] }}</span>
              <div class="protocol-body">
                <h3>{{ step[1] }}</h3>
                <p>{{ step[2] }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- 03 / PIPELINE ARCHITECTURE (Left/Right vertically centered) -->
      <section id="pipeline" class="section observe-section">
        <div class="ledger-layout">
          <div class="section-head section-head-side">
            <p class="section-kicker">
              <span class="kicker-bar" aria-hidden="true"></span>
              {{ t.pipelineKicker }}
            </p>
            <h2>{{ t.pipelineTitle }}</h2>
            <p class="section-desc">{{ t.pipelineDesc }}</p>
          </div>

          <div class="pipeline-content section-body-reveal">
            <div class="pipeline-schematic" aria-label="Video processing flow">
              <div
                v-for="(stage, idx) in t.pipelineFlow"
                :key="stage[0]"
                class="schematic-node"
                :style="{ '--item-index': idx }"
              >
                <span class="node-id">{{ stage[0] }}</span>
                <strong>{{ stage[1] }}</strong>
                <span class="node-sub">{{ stage[2] }}</span>
              </div>
            </div>

            <div class="pipeline-grid">
              <article
                v-for="(mode, idx) in t.pipelineModes"
                :key="mode[0]"
                class="pipeline-card"
                :style="{ '--item-index': idx + 2 }"
              >
                <div class="pipeline-card-head">
                  <span class="mono-kicker">{{ mode[0] }}</span>
                  <h3>{{ mode[1] }}</h3>
                </div>
                <p>{{ mode[2] }}</p>
                <div class="pipeline-tags">
                  <span v-for="tag in mode[3]" :key="tag">{{ tag }}</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- 04 / MODEL REGISTRY (Left/Right vertically centered + Interactive Domain Switcher) -->
      <section id="models" class="section observe-section">
        <div class="ledger-layout">
          <div class="section-head section-head-side">
            <p class="section-kicker">
              <span class="kicker-bar" aria-hidden="true"></span>
              {{ t.modelsKicker }}
            </p>
            <h2>{{ t.modelsTitle }}</h2>
            <p class="section-desc">{{ t.modelsDesc }}</p>
            <div class="strip-actions">
              <a
                class="button button-secondary"
                href="https://huggingface.co/lingxin07/QualityScaler-Go_models"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ t.modelWeights }}
                <ArrowUpRight :size="15" />
              </a>
            </div>

            <div class="domain-switcher" role="tablist" aria-label="Model categories">
              <button
                v-for="(group, idx) in t.modelGroups"
                :key="group[0]"
                type="button"
                role="tab"
                :aria-selected="activeModelTab === idx"
                :class="['domain-tab', { active: activeModelTab === idx }]"
                @click="activeModelTab = idx"
              >
                <span class="domain-tab-index">0{{ idx + 1 }}</span>
                <span class="domain-tab-label">{{ group[0] }}</span>
                <span class="domain-tab-count">{{ group[1].length }}</span>
              </button>
            </div>
          </div>

          <div class="registry-panel section-body-reveal">
            <Transition name="panel-switch" mode="out-in">
              <div :key="activeModelTab" class="registry-group">
                <div class="registry-group-header">
                  <span class="mono-kicker">DOMAIN 0{{ activeModelTab + 1 }}</span>
                  <h3 class="registry-group-title">{{ t.modelGroups[activeModelTab][0] }}</h3>
                </div>
                <div class="registry-rows">
                  <div
                    v-for="(m, rIdx) in t.modelGroups[activeModelTab][1]"
                    :key="m[0]"
                    class="registry-row"
                    :style="{ '--row-index': rIdx }"
                  >
                    <strong class="model-name">{{ m[0] }}</strong>
                    <span class="model-desc">{{ m[2] }}</span>
                    <span class="model-scale">{{ m[1] }}</span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </section>

      <!-- 05 / RELEASES (Left/Right vertically centered) -->
      <section id="download" class="section observe-section">
        <div class="ledger-layout">
          <div class="section-head section-head-side">
            <p class="section-kicker">
              <span class="kicker-bar" aria-hidden="true"></span>
              {{ t.downloadKicker }}
            </p>
            <h2>{{ t.downloadTitle }}</h2>
            <p class="section-desc">{{ t.downloadDesc }}</p>
          </div>

          <div class="release-table section-body-reveal">
            <article
              v-for="(edition, idx) in editions"
              :key="edition.id"
              :class="['release-row', { recommended: edition.recommended }]"
              :style="{ '--item-index': idx }"
            >
              <div class="release-identity">
                <div class="release-title-line">
                  <h3>{{ edition.name }}</h3>
                  <span v-if="edition.recommended" class="rec-indicator">
                    <span class="rec-dot" aria-hidden="true"></span>
                    {{ t.recommended }}
                  </span>
                  <span v-if="edition.status" class="edition-status">{{ edition.status }}</span>
                </div>
                <span class="release-sub">{{ edition.label }}</span>
              </div>

              <p class="release-desc">{{ edition.desc }}</p>

              <div class="release-specs">
                <span v-for="spec in edition.specs" :key="spec">{{ spec }}</span>
              </div>

              <div class="release-action">
                <a
                  :class="['button', edition.recommended ? 'button-primary' : 'button-secondary', 'button-compact']"
                  :href="downloadUrl"
                >
                  Windows
                  <ArrowDownToLine :size="14" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- 06 / DOCUMENTATION & OPEN SOURCE FOOTER STRIPS -->
      <section id="docs" class="section docs-strip-section observe-section">
        <div class="dual-strip section-body-reveal">
          <div class="strip-panel">
            <p class="section-kicker">
              <span class="kicker-bar" aria-hidden="true"></span>
              {{ t.docsKicker }}
            </p>
            <h2>{{ t.docsTitle }}</h2>
            <p>{{ t.docsDesc }}</p>
            <div class="strip-actions">
              <a class="button button-secondary" :href="lang === 'en' ? '/en/doc/' : '/doc/'">
                {{ lang === 'zh' ? t.chineseManual : t.englishManual }}
                <ArrowUpRight :size="15" />
              </a>
            </div>
          </div>

          <div class="strip-panel">
            <p class="section-kicker">
              <span class="kicker-bar" aria-hidden="true"></span>
              {{ t.supportKicker }}
            </p>
            <h2>{{ t.supportTitle }}</h2>
            <p>{{ t.supportDesc }}</p>
            <div class="strip-actions">
              <a class="button button-secondary" href="https://ko-fi.com/lingxin07" target="_blank" rel="noreferrer">
                {{ t.sponsor }}
                <ArrowUpRight :size="15" />
              </a>
            </div>
          </div>
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
      <div class="footer-brand">
        <img src="/miao.png" alt="" width="20" height="20" />
        <span>QualityScaler-Go</span>
        <span class="footer-meta">MIT License · Local AI Super-Resolution</span>
      </div>
      <div class="footer-links">
        <a :href="lang === 'en' ? '/en/doc/' : '/doc/'">
          {{ lang === 'zh' ? t.chineseManual : t.englishManual }}
        </a>
        <a href="https://github.com/Ling0727-ai/QualityScaler-go" target="_blank" rel="noreferrer">
          {{ t.source }}
          <ArrowUpRight :size="13" />
        </a>
      </div>
    </footer>
  </div>
</template>
