# QualityScaler-Go User Manual

> **Supported Platforms**: Windows 10/11 | **Language**: English

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [System Requirements](#2-system-requirements)
3. [Version Selection Guide](#3-version-selection-guide)
4. [AI Model Details](#4-ai-model-details)
5. [Parameter Options](#5-parameter-options)
6. [VRAM Tiers and Recommended Configurations](#6-vram-tiers-and-recommended-configurations)
7. [Pipeline Modes: Memory vs Disk](#7-pipeline-modes-memory-vs-disk)
8. [Face Enhancement](#8-face-enhancement)
9. [FAQ / Troubleshooting](#9-faq--troubleshooting)

---

## 1. Quick Start

### 1.1 Basic Workflow

1. **Add Files** — Click "Add Files" or "Add Folder" on the left, or drag and drop files into the window.
2. **Select AI Model** — Under the "AI Core" tab, choose a suitable model (default LVAx2 works for most scenarios).
3. **Set Output Directory** — Click "Browse" on the right to choose where to save results.
4. **Start Processing** — Click the "Start Processing" button.

### 1.2 Interface Overview

| Area | Function |
|------|----------|
| **Left — File List** | Add/clear pending files, display processing status |
| **Center — Processing Parameters** | 4 tabs: AI Core, Performance & Hardware, Image Processing, Video Processing |
| **Upper Right — Resolution Preview** | Real-time preview of Source → Input Scale → Model Upscale → Output Resolution |
| **Lower Right — Output/Progress/Control** | Output directory selection, progress bar, Start/Stop buttons |

---

## 2. System Requirements

### 2.1 Operating System

- **Windows 10/11 64-bit** (primary supported platform)
- **Linux** (experimental support, some features may be unavailable)

### 2.2 Mandatory Base Environment

**Visual C++ Redistributable 2015-2022** (required for all versions)

ONNX Runtime depends on the VC++ runtime libraries. If missing, the program will report DLL errors on startup (e.g., `VCRUNTIME140.dll not found`).

> 📥 Download: [vc_redist.x64.exe](https://aka.ms/vs/17/release/vc_redist.x64.exe)

### 2.3 NVIDIA GPU Acceleration Environment

GPU acceleration requires the graphics driver, CUDA, and cuDNN. See the dependency summary in [Section 2.4](#24-dependency-summary-by-version). The TensorRT runtime is included in the `tensorrt-gpu` and `full` packages and does not need to be installed separately.

#### Layer 1: NVIDIA Graphics Driver

The foundation for all GPU acceleration. It is recommended to download the latest Game Ready or Studio Driver via NVIDIA GeForce Experience or the official website.

Verification:
```powershell
nvidia-smi
```
If the command outputs GPU information, the driver is installed.

#### Layer 2: CUDA Toolkit 12.4+ (Required)

CUDA provides the fundamental parallel computing runtime libraries (`cudart64_*.dll` etc.) and is a **common prerequisite for ONNX CUDA and TensorRT**.

- **Version requirement**: CUDA 12.4 or newer
- **Installation Path**: Default `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.1\`
- **Environment Variable**: The installer usually sets `CUDA_PATH` automatically.

Verification:
```powershell
# Check CUDA version
nvcc --version
# Or check environment variable
echo $env:CUDA_PATH
```

#### Layer 3: cuDNN 9.x (Required for ONNX CUDA / TensorRT) ⚠️ Critical

**Installing only CUDA is not enough!** ONNX Runtime's CUDA provider relies on cuDNN (CUDA Deep Neural Network Library) to enable GPU acceleration. **Missing cuDNN is the most common reason GPU acceleration fails.**

- **Recommended Version**: cuDNN 9.x (v9.0 and above)
- **Installation Path**: `C:\Program Files\NVIDIA\CUDNN\v9.x\bin\`
- **Key DLL**: `cudnn_engines_runtime_compiled64_9.dll`

> 📥 Download: From the [NVIDIA cuDNN website](https://developer.nvidia.com/cudnn) (requires a free NVIDIA Developer account)

**Installation Steps:**
1. Download cuDNN 9.x for CUDA 12.x (ZIP package)
2. Extract and merge the `bin/`, `include/`, `lib/` directories into your CUDA installation directory:
   ```
   Copy cudnn\bin\*.dll      to → C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.1\bin\
   Copy cudnn\include\*.h     to → C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.1\include\
   Copy cudnn\lib\x64\*.lib   to → C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.1\lib\x64\
   ```
3. Alternatively, use the NVIDIA official installer (.exe) and install to `C:\Program Files\NVIDIA\CUDNN\v9.x\`

**Verifying cuDNN is active:**
- The program log will show `Added cuDNN to PATH: ...` at startup (indicates detection).
- If CUDA is installed but inference still runs on CPU, **it is most likely due to missing cuDNN**.

#### TensorRT runtime (tensorrt-gpu / full only)

TensorRT is enabled only in the `tensorrt-gpu` and `full` packages. The runtime, `qualityscaler_tensorrt.dll`, and the related NVIDIA DLLs are shipped with those packages. You do not need to download or install TensorRT separately from the NVIDIA website.

Keep the DLLs that come with the package. Do not replace them with files from another CUDA, cuDNN, or TensorRT installation, because mixing versions can prevent the backend from loading. For general use, the `onnx-cuda` package is sufficient.

### 2.4 Dependency Summary by Version

| Component | onnx-cpu | onnx-cuda | tensorrt-gpu | full |
|-----------|:---:|:---:|:---:|:---:|
| VC++ Redist 2015-2022 | ✅ | ✅ | ✅ | ✅ |
| ONNX Runtime DLL | ✅ | ✅ | ✅ | ✅ |
| NVIDIA GPU + Driver | ❌ | ✅ | ✅ | ✅ |
| CUDA Toolkit 12.4+ | ❌ | ✅ | ✅ | ✅ |
| **cuDNN 9.x** | ❌ | ✅ **Required** | ✅ **Required** | ✅ **Required** |
| TensorRT runtime DLLs (bundled) | ❌ | ❌ | ✅ Bundled | ✅ Bundled |
| qualityscaler_tensorrt.dll | ❌ | ❌ | ✅ Bundled | ✅ Bundled |
| OpenCV (gocv) | ❌ | ❌ | ❌ | ✅ |

### 2.5 Dependency Graph

```
Base Layer (All versions)
  └─ Visual C++ Redistributable 2015-2022
  └─ ONNX Runtime DLLs (onnxruntime.dll + onnxruntime_providers_shared.dll)

GPU Acceleration (onnx-cuda / tensorrt-gpu / full)
  ├─ NVIDIA Graphics Driver
  ├─ CUDA Toolkit 12.4+
  └─ cuDNN 9.x  ← ⚠️ Most easily missed! Without it, ONNX Runtime cannot use GPU.

TensorRT Acceleration (tensorrt-gpu / full)
  └─ TensorRT runtime and qualityscaler_tensorrt.dll are bundled
  └─ No separate TensorRT installation is required
```

### 2.6 Environment Verification Checklist

After installation, verify the environment is ready with these steps:

```powershell
# 1. Check graphics driver
nvidia-smi
# Expected: Displays GPU model, driver version, CUDA version

# 2. Check CUDA
nvcc --version
# Expected: Displays CUDA version number (e.g., 12.6)

# 3. Check cuDNN (check if DLL exists)
ls "C:\Program Files\NVIDIA\CUDNN\v9*\bin\cudnn_engines_runtime_compiled64_9.dll"
ls "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v*\bin\cudnn_engines_runtime_compiled64_9.dll"
# Expected: At least one location contains the DLL

# 4. Check VC++ Redist
# Control Panel → Programs and Features → Look for "Microsoft Visual C++ 2015-2022 Redistributable (x64)"
```

**In-Program Verification** (most reliable):
Launch QualityScaler-Go and observe the inference backend in the title bar or log:
- `TensorRT (GPU)` — All components ready, ultimate performance ✅
- `CUDA (GPU 0)` — CUDA + cuDNN working correctly, GPU acceleration active ✅
- `CPU (ONNX)` — GPU not active, please check CUDA and cuDNN installations ❌

If the program does not start, the GPU backend fails to load, or processing behaves unexpectedly, update the NVIDIA graphics driver first. An outdated driver can also prevent the GPU backend from working.

### 2.7 Common Environment Pitfalls

**❌ "I installed CUDA, why is it still doing CPU inference?"**
→ **In most cases, cuDNN is not installed.** CUDA Toolkit does not include cuDNN; it must be downloaded and installed separately. See "Layer 3: cuDNN 9.x" above.

**❌ "I installed cuDNN, but the program can't find it?"**
→ Check if cuDNN's `bin/` directory is in the system PATH. The program automatically searches `C:\Program Files\NVIDIA\CUDNN\v9*\bin\`; if you placed it elsewhere, you must add it to PATH or copy the DLLs to CUDA's `bin/` directory.

**❌ "TensorRT engine file error?"**
→ `.engine` files are tied to the specific GPU architecture (SM version) and cannot be shared across different GPUs. If you change graphics cards, delete `AI-tensorrt/*.engine` and regenerate them. Do not replace the TensorRT DLLs shipped with the package. See [3. Version Selection Guide](#3-version-selection-guide).

**❌ "ffmpeg not found / error?"**
→ The release package usually includes ffmpeg. If it is missing, download the Windows build from [ffmpeg.org](https://ffmpeg.org/download.html) and place `ffmpeg.exe` and `ffprobe.exe` in the program directory or your system PATH.

---

## 3. Version Selection Guide

QualityScaler-Go is provided in 5 versions. Choose based on your hardware:

| Version | Inference Backend | Target User | Required Environment |
|---------|-------------------|-------------|----------------------|
| **onnx-cpu** | ONNX CPU | No NVIDIA GPU, maximum compatibility | No GPU needed |
| **onnx-cuda** | ONNX + CUDA | Nvidia GPU users who don't want to set up TensorRT | NVIDIA GPU + CUDA DLLs |
| **onnx-directml** | ONNX + DirectML | Windows GPU devices with DirectML support | DirectML-compatible driver |
| **tensorrt-gpu** | TensorRT → ONNX → CPU fallback | Nvidia GPU users seeking maximum performance | Bundled TensorRT; CUDA 12.4+ required |
| **full** | All backends + gocv acceleration | One download, auto-adapts to hardware | Bundled TensorRT + OpenCV |

> **Recommendation**: Most NVIDIA GPU users should choose the **tensorrt-gpu** version for the fastest speed. Integrated graphics / no dedicated GPU users should pick **onnx-cpu**.

### 3.1 Hardware requirements by task

The two workflows have different bottlenecks. Image upscaling is primarily limited by the peak memory required for one image, the model, and optional restoration stages. Video upscaling must continuously decode, transport, infer, and encode frames, so CPU capacity, RAM, VRAM, temporary storage, and sustained cooling matter more.

| Task | Baseline requirement | Recommended configuration | Main constraints |
|------|----------------------|---------------------------|------------------|
| Image upscaling | Windows PC capable of ONNX CPU; GPU optional | 8GB+ RAM; DirectML-compatible integrated/discrete GPU or NVIDIA GPU + CUDA | Large images, BSRGAN, deblur, and face enhancement raise peak VRAM use |
| Video upscaling | Windows PC with FFmpeg support; ONNX CPU fallback available | 16GB+ RAM; GPU with a usable hardware encoder; SSD space for temporary files | Long videos, 4K output, concurrency, and Disk mode increase sustained resource use |

**Image upscaling guidance**

- Without an NVIDIA GPU, start with `onnx-cpu` or `onnx-directml`.
- On low-memory devices, use a smaller model, lower the input scale, and keep batch size at 1.
- Large images need additional RAM and VRAM headroom; after an OOM, reduce input size or switch to a lighter model first.

**Video upscaling guidance**

- Confirm that FFmpeg can decode the input and that the selected output encoder is available.
- Use Memory mode for CFR video; use Disk mode for VFR video, resume support, or frame inspection.
- For long videos, increase thread count and batch size gradually instead of starting with maximum concurrency.
- Disk mode needs free space for intermediate frames; the exact amount depends on duration, frame count, resolution, and frame format.

---

## 4. AI Model Details

### 4.1 Model Quick Reference

| Model | Scale | Type | Speed | VRAM Usage | Best For |
|-------|-------|------|------|------------|----------|
| **LVAx2** | ×2 | Light Enhancement | ⚡⚡⚡ Fastest | 🟢 Low | Light enhancement, natural look |
| **RealESR_Gx4** | ×4 | General Super-Res | ⚡⚡ Fast | 🟡 Medium | Real photos, landscapes, realistic video |
| **RealESR_Animex4** | ×4 | Anime Optimized | ⚡⚡ Fast | 🟡 Medium | Anime, illustrations, 2D game graphics |
| **BSRGANx2** | ×2 | Denoising Enhancement | ⚡⚡ Fast | 🟡 Medium | Low-quality sources, unknown degradations |
| **BSRGANx4** | ×4 | Heavy Restoration | ⚡ Slower | 🔴 High | Extremely poor quality, old sources, heavy noise |
| **MSharpx4** | ×4 | Sharpening Enhancement | ⚡⚡ Fast | 🟡 Medium | Blurry sources, need to emphasize contours |
| **IRCNN_Mx1** | ×1 | Denoising Restoration | ⚡⚡⚡ Fastest | 🟢 Low | Moderate noise removal (keeps resolution) |
| **IRCNN_Lx1** | ×1 | Heavy Restoration | ⚡⚡ Fast | 🟡 Medium | Severe image damage repair (keeps resolution) |

### 4.2 Detailed Model Descriptions

#### LVAx2 — Lightweight Natural Upscaling
- **Characteristics**: Enhances resolution while preserving extremely high edge fidelity; processing style is natural.
- **Pros**: Fast, low VRAM usage, natural-looking output without an "AI feel".
- **Cons**: Only ×2 scale, limited magnification.
- **Best for**: Low-scale upscaling needs, light enhancement tasks where you don't want the image to appear over-processed.

#### RealESR_Gx4 — Real Photo Enhancement (Recommended)
- **Characteristics**: Designed for complex real-world degradations, strong generalization ability.
- **Pros**: Balanced texture reconstruction and noise suppression, most versatile.
- **Cons**: Limited effectiveness on extremely low-quality sources.
- **Best for**: Everyday photos, landscapes, realistic video footage — **the first choice for most users**.

#### RealESR_Animex4 — Anime/Illustration Specialized
- **Characteristics**: Optimized for 2D content, emphasizes smooth lines and clean color blocks.
- **Pros**: Significantly eliminates compression artifacts (ringing/artifacts), clean lines.
- **Cons**: Poor on real photos, produces over-smoothing.
- **Best for**: Anime, illustrations, 2D game graphics, line art.

#### BSRGANx2 / BSRGANx4 — Denoising and Restoration
- **Characteristics**: Trained with a "random degradation space", very high tolerance for unknown disturbances.
- **Pros**: Good restoration even for extremely poor quality sources.
- **Cons**: Slower, may introduce subtle texture changes.
- **Best for**: Very poor quality, lots of unknown noise, multiple low-quality compression old sources.
  - x2: Mildly degraded sources
  - x4: Heavily degraded sources

#### MSharpx4 — High Contrast Sharpening
- **Characteristics**: Emphasizes high visual contrast and contour clarity.
- **Pros**: Can forcefully outline subjects from blurry sources.
- **Cons**: May over-sharpen, creating unnatural edges.
- **Best for**: Sources that are overly soft/blurry, specific scenes requiring prominent contours.

#### IRCNN_Mx1 / IRCNN_Lx1 — Denoising Restoration (No Upscaling)
- **Characteristics**: Non-upscaling restoration models focused on deconvolution and denoising while keeping original resolution.
- **Pros**: Does not change resolution, focuses purely on repair; can be cascaded with upscaling models.
- **Cons**: Does not increase resolution.
- **Best for**: Preprocessing step.
  - **IRCNN_Mx1**: Moderate noise removal
  - **IRCNN_Lx1**: Heavy image damage repair

### 4.3 Scenario Selection Guide

| Your Need | Primary Model | Alternative Model |
|-----------|---------------|-------------------|
| Upscale real photos | **RealESR_Gx4** | BSRGANx4 |
| Enhance anime/illustration | **RealESR_Animex4** | LVAx2 |
| Repair extremely poor quality | **BSRGANx4** | IRCNN_Lx1 → RealESR_Gx4 |
| Denoise without resizing | **IRCNN_Mx1** | — |
| High contrast / sharpen edges | **MSharpx4** | — |
| Light enhancement (minimize AI look) | **LVAx2** | RealESR_Gx4 (reduce output scale) |

---

## 5. Parameter Options

### 5.1 AI Core Tab

#### AI Model
Select the main super-resolution model. See [Chapter 4 AI Model Details](#4-ai-model-details).

#### Deblur Model
Preprocess the image with deblurring/denoising before super-resolution.

| Option | Description |
|--------|-------------|
| **OFF** | Disable deblur (default, recommended) |
| **SCUNet-GAN** | GAN-trained, stronger restoration, better visual quality |
| **SCUNet-PSNR** | PSNR-oriented training, higher fidelity but may retain some noise |

> ⚠️ Enabling deblur consumes an additional ~**2GB VRAM** and increases processing time by approximately 30-50%.

---

### 5.2 Performance & Hardware Tab

#### Performance Mode

| Mode | AI Threads | Batch | Fusion Intensity | Characteristics |
|------|------------|-------|------------------|----------------|
| **Balanced** (recommended) | CPU cores / 2 (≤4) | 1 | Unchanged | Balance of speed and quality |
| **Extreme Performance** | CPU cores (≤8) | 4 | Forced OFF | Fastest, suitable for batch processing |
| **Quality** | 1 | 1 | Unchanged | Most stable, best compatibility |

#### GPU
Select the graphics card for AI inference.

| Option | Description |
|--------|-------------|
| **Auto** (recommended) | Automatically select high-performance GPU |
| **GPU 1** | Corresponds to GPU 0 in Task Manager |
| **GPU 2-4** | Other GPUs in multi-GPU systems |

> ⚠️ Selecting a non-existent GPU may cause fallback to CPU, resulting in very slow speed.

#### VRAM (GB)
Limits the VRAM budget available for AI inference. **This is one of the most important performance parameters.**
- It is recommended to set this to your GPU's **actual available VRAM** (e.g., 8 for an 8GB graphics card).
- Setting too low: tile size becomes too small, slowing processing.
- Setting too high: may cause out-of-memory (OOM) errors, inference fails.
- For integrated graphics, start with **2GB**.

See [Chapter 7 VRAM Tiers and Recommended Configurations](#6-vram-tiers-and-recommended-configurations).

#### Multithreading
Controls the number of parallel threads for video frame-by-frame processing.

| Option | Suitable Scenario |
|--------|-------------------|
| **Auto** | Let the program choose based on CPU cores |
| **OFF** | Most stable, lowest memory/VRAM usage |
| **2 threads** | Light parallelism |
| **4 threads** | Moderate parallelism (recommended for 6-8 core CPUs) |
| **6 threads** | High parallelism |
| **8 threads** | Maximum parallelism (requires sufficient VRAM and RAM) |

> ⚠️ More threads can increase speed but also raise VRAM and RAM usage. If you encounter OOM, reduce threads first.

#### TRT Precision (TensorRT/Full versions only)
Controls the quantization precision of the TensorRT engine.

| Precision | Speed | VRAM Usage | Accuracy Loss | Recommended For |
|-----------|-------|------------|---------------|-----------------|
| **fp16** (recommended) | ⚡⚡⚡ Fastest | 🟢 Low | Minimal | Daily use |
| **fp32** | ⚡ Slower | 🔴 High (~2×) | None | Professional scenarios requiring highest accuracy |
| **int8** | ⚡⚡⚡ Fastest | 🟢 Lowest | Larger | When VRAM is extremely tight, requires calibration dataset |

#### Tile Overlap (px)
The number of overlapping pixels between tiles during AI inference.
- **Default**: 16px
- **Increase (32/64)**: Can eliminate tile seams, at a slight cost of inference time.
- **Decrease (0)**: Slightly faster, but visible grid-like seams may appear.
- **Range**: 0-256

#### GPU Batch
How many frames the GPU processes at once (TensorRT version only).

| Value | Description |
|-------|-------------|
| **1** (recommended) | Frame-by-frame inference, most stable |
| **2/4/6/8** | Batch processing, faster but VRAM usage multiplies |

> ⚠️ Requires the TensorRT engine to support dynamic batch dimensions, otherwise it automatically falls back to 1.

#### Pipeline Mode ⭐
Controls the data pipeline for video processing. **This is one of the most critical options.**

| Mode | Description |
|------|-------------|
| **Memory** (default) | Pure in-memory pipeline, fast, no temporary files |
| **Disk** | File-based pipeline, compatible with VFR/resume, requires disk space |

> 📖 **For detailed comparison and troubleshooting, please read [Chapter 6](#7-pipeline-modes-memory-vs-disk).**

---

### 5.3 Image Processing Tab

#### Input Scale %
Scale the image before feeding it into the AI model.
- **25% (default)**: Greatly reduces computation, fastest.
- **50%**: Preserves more original detail.
- **100%**: Original resolution into AI, best quality but slowest.
- **>100%**: Upsample before processing (not recommended, doesn't add real detail).

> 💡 For 4K video, it's recommended to use 25-50%; for 1080p video, 50-100%.

#### Output Scale %
Rescale the AI output result.
- **100% (default)**: Keep AI native output size.
- **<100%**: Downscale output, reduces file size and processing time.
- **>100%**: Only interpolation, doesn't add real detail.

> 💡 Final resolution = Source resolution × Input Scale% × Model scale × Output Scale%

#### AI Fusion
Blend the original image with the AI super-resolution result by a ratio.
- **OFF**: Fully retains AI output (clearest).
- **Low (0.3)**: 30% original + 70% AI output.
- **Medium (0.5)**: 50% original + 50% AI output.
- **High (0.7)**: 70% original + 30% AI output (closest to original).

> 💡 AI output sometimes has unnatural textures; appropriate fusion can preserve the natural feel of the original.

#### Image Format
Output image format.

| Format | Quality | File Size | Suitable Scenario |
|--------|---------|-----------|-------------------|
| **.jpg** (default) | Lossy | 🟢 Small | Daily use, web sharing |
| **.png** | Lossless | 🔴 Large | High-quality archiving, further editing |
| **.bmp** | Lossless, uncompressed | 🔴 Very large | Specific toolchain compatibility |
| **.tiff** | Lossless/lossy selectable | 🟡 Medium-Large | Professional image processing, archiving |

#### Keep Frames
Controls whether to retain intermediate frame files during video processing.
- **OFF** (default): Automatically clean up temporary frames after task completion.
- **ON**: Keep intermediate frames for troubleshooting or reuse (will consume significant disk space).

---

### 5.4 Video Processing Tab

#### Video Format
Output video container format.

| Format | Compatibility | Characteristics |
|--------|---------------|-----------------|
| **.mkv** (default) | 🟡 Good | High quality, supports multiple audio tracks/subtitles |
| **.mp4** | 🟢 Best | Compatible with almost all devices |
| **.avi** | 🟡 Fair | Suitable for specific toolchains, larger file size |
| **.mov** | 🟡 Fair | Apple ecosystem, professional editing software |

#### Video Encoder
Output video encoder. **Divided into three hardware categories**:

**CPU Software Encoding (best compatibility):**
| Encoder | Description |
|---------|-------------|
| **x264** (default ONNX version) | H.264 CPU encoding, best compatibility |
| **x265** | H.265 CPU encoding, higher quality at same bitrate, slower encoding |

**NVIDIA GPU Hardware Encoding (fastest):**
| Encoder | Description |
|---------|-------------|
| **h264_nvenc** (default TRT version) | NVIDIA H.264 hardware encoding |
| **hevc_nvenc** | NVIDIA H.265 hardware encoding |
| **av1_nvenc** | NVIDIA AV1 hardware encoding (RTX 40 series+) |

**AMD GPU Hardware Encoding:**
| Encoder | Description |
|---------|-------------|
| **h264_amf** | AMD H.264 hardware encoding |
| **hevc_amf** | AMD H.265 hardware encoding |
| **av1_amf** | AMD AV1 hardware encoding |

**Intel GPU Hardware Encoding:**
| Encoder | Description |
|---------|-------------|
| **h264_qsv** | Intel QuickSync H.264 |
| **hevc_qsv** | Intel QuickSync H.265 |
| **av1_qsv** | Intel QuickSync AV1 (Arc graphics+) |

**Universal AV1 Encoding:**
| Encoder | Description |
|---------|-------------|
| **av1_svt** | CPU AV1 encoding, highest quality at same bitrate, very slow encoding |

> 💡 Hardware encoding is 5-10× faster but slightly lower quality than software encoding at the same bitrate. For daily use, `h264_nvenc` (NVIDIA) or `x264` (others) is recommended.

#### Frame Rate Mode

| Mode | Description |
|------|-------------|
| **CFR** (default) | Constant frame rate, best compatibility, suitable for Memory pipeline |
| **VFR** | Variable frame rate, preserves original timestamps, requires Disk pipeline |

> ⚠️ VFR mode **must use the Disk pipeline**; Memory pipeline does not support VFR.

#### Bitrate Quality
Controls the output video bitrate (affects file size and visual quality).

| Level | Bitrate Multiplier | Description |
|-------|-------------------|-------------|
| **Extreme** | ×2.0 | Very large file, extreme quality |
| **High** (default) | ×1.0 | Standard high quality |
| **Medium** | ×0.75 | Moderate file size |
| **Low** | ×0.5 | Smaller file |
| **Compatible** | ×0.3 | Smallest file, compatibility priority |

---

## 6. VRAM Tiers and Recommended Configurations

### 6.1 VRAM Tiers Overview

| VRAM | Tier | GPU Examples | Recommended Models | Input Scale | Perf Mode | Multi-thread | Batch |
|------|------|--------------|--------------------|-------------|-----------|--------------|-------|
| **≤2GB** | Entry | GT 1030, Integrated | LVAx2, IRCNN | 25% | Quality | OFF | 1 |
| **4GB** | Entry+ | GTX 1050 Ti, GTX 1650 | LVAx2, RealESR_Gx4 | 25% | Quality | OFF | 1 |
| **6GB** | Mainstream | GTX 1060, GTX 1660, RTX 2060 | RealESR_Gx4, Anime | 25-50% | Balanced | 2 | 1 |
| **8GB** | Mainstream+ | RTX 2070, RTX 3070, RTX 4060 | All models | 25-50% | Balanced | 2-4 | 1-2 |
| **12GB** | High-End | RTX 3080, RTX 4070, RTX 5070 | All models | 50-100% | Extreme Perf | 4-6 | 2-4 |
| **16GB+** | Flagship | RTX 4080, RTX 4090, RTX 5080 | All models | 50-100% | Extreme Perf | 6-8 | 4-8 |
| **24GB** | Professional | RTX 3090, RTX 4090, RTX 5090 | All + Deblur + Face | 100% | Extreme Perf | 8 | 8 |

### 6.2 Tier Details

#### 🟢 Entry Level (≤4GB VRAM)

**Limitations and Notes:**
- Tile size automatically drops to 256×256, inference is slower.
- Batch must be set to 1.
- Multithreading recommended OFF or Auto.
- Avoid enabling Face Enhancement and Deblur simultaneously.

**Recommended Configuration:**
```
Model: LVAx2 or RealESR_Gx4
Input Scale: 25%
Output Scale: 100%
Performance Mode: Quality
Multithreading: OFF
Batch: 1
Deblur: OFF
Face Enhancement: Disabled
Pipeline Mode: Disk
```

#### 🟡 Mainstream Level (6-8GB VRAM)

This is the configuration range for most users, capable of running most models smoothly.

**Recommended Configuration:**
```
Model: As needed (RealESR_Gx4 recommended)
Input Scale: 25-50%
Output Scale: 100%
Performance Mode: Balanced
Multithreading: 2-4 threads
Batch: 1
Deblur: OFF (if enabled, reduce multithreading)
Face Enhancement: Optional (consumes ~1-2GB extra VRAM)
Pipeline Mode: Memory (default)
```

#### 🔴 High-End / Flagship (12GB+ VRAM)

Almost no restrictions, all enhancement features can be enabled simultaneously.

**Recommended Configuration:**
```
Model: As needed
Input Scale: 50-100%
Output Scale: As desired
Performance Mode: Extreme Performance
Multithreading: 4-8 threads
Batch: 2-8
Deblur: Optional
Face Enhancement: Enabled
Pipeline Mode: Memory
```

### 6.3 Integrated Graphics / AMD GPU Users

- Set VRAM starting at **2GB**, adjust based on actual results.
- Performance mode: **Quality**.
- Multithreading: **OFF**.
- Use **x264** CPU encoding (do not use NVENC/AMF unless confirmed working).

---

## 7. Pipeline Modes: Memory vs Disk

### 7.1 Architectural Differences

#### Memory Pipeline (Pure In-Memory Pipeline)

```
ffmpeg decode → stdout → [raw video frame data] → Go AI inference → [processed frame data] → stdin → ffmpeg encode
                    ↑                              ↑
              Zero disk I/O, all in memory          No intermediate files
```

**Characteristics:**
- ✅ **Fast**: Saves JPEG encoding/decoding and disk read/write, zero I/O overhead.
- ✅ **No temp files**: No intermediate frame files, no extra disk space usage.
- ✅ **Memory efficient**: Frame data streamed, no accumulation of massive files on disk.
- ❌ **No VFR support**: Variable frame rate video must use Disk pipeline.
- ❌ **No resume support**: Cannot resume from last progress if interrupted; must start over.
- ❌ **Potential freezes**: May hang under certain conditions (ffmpeg version compatibility, pipe blocking, etc.).

#### Disk Pipeline (File-Based Pipeline)

```
ffmpeg extract frames → write to disk → read frame files → AI inference → write upscaled frames → read upscaled frames → ffmpeg assemble video
     ↑                        ↑                      ↑
  Disk I/O                Disk I/O                Disk I/O
```

**Characteristics:**
- ✅ **Supports VFR**: Fully compatible with variable frame rate videos.
- ✅ **Resume support**: Can resume after interruption; already upscaled frames are not lost.
- ✅ **High stability**: Each stage is independent, won't hang due to pipe issues.
- ✅ **Debuggable**: Retained intermediate frame files can be inspected to check per-frame processing.
- ❌ **High disk usage**: Must store all intermediate frames (e.g., 4K video 100k frames × 1MB/frame = 100GB).
- ❌ **Slower**: Additional JPEG encoding/decoding and disk I/O increase processing time by about 10-20%.

### 7.2 How to Choose

| Scenario | Recommended Pipeline | Reason |
|----------|----------------------|--------|
| CFR video (most cases) | **Memory** | Fastest, no disk usage |
| VFR video | **Disk** (mandatory) | Memory does not support VFR |
| Very large video (>50GB source) | **Disk** | Avoid excessive memory pressure |
| Need resume capability | **Disk** | Can resume after interruption |
| Need to debug during processing | **Disk** + Keep Frames ON | Can inspect intermediate frames |
| Low disk space | **Memory** | No temporary files generated |
| Memory pipeline freezes/errors | **Disk** ⬅️ | See troubleshooting below |

### 7.3 ⚠️ Memory Pipeline Freeze Troubleshooting and Solutions

**Symptom Identification:**
- Progress bar stuck for a long time (more than 3× expected frame processing time).
- No error message, but program unresponsive.
- Task Manager shows ffmpeg process present but CPU usage at 0%.
- Logs stuck at "Upscaling video" stage.

**Common Root Causes:**
1. ffmpeg version compatibility: the rawvideo pipe is unstable in some builds.
2. Full pipe buffer: decoding is faster than AI inference, so the pipe blocks.
3. Insufficient GPU VRAM: multithreading with a large model can exhaust VRAM and stall inference.
4. Unusual input codec: some codecs can cause rawvideo decoding errors.

**Solutions (in order of priority):**

> **Step 1: Switch to Disk Pipeline**
>
> In the "Performance & Hardware" tab, change "Pipeline Mode" from **Memory** to **Disk**.
> This is the most direct troubleshooting step. In existing tests, most freeze cases completed normally after switching to Disk.
>
> The Disk pipeline is usually 10-20% slower, but it is more stable and is a good first fallback when Memory freezes.

**Step 2: Reduce concurrent load**
- Change performance mode to **Quality** or **Balanced**.
- Set multithreading to **OFF** or **2 threads**.
- Set batch size to **1**.

**Step 3: Check VRAM settings**
- Ensure VRAM (GB) is set to the actual size of your graphics card.
- If it still freezes, try reducing the VRAM value by **2GB** (e.g., set 6GB for an 8GB card).

**Step 4: Reduce input resolution**
- Lower input scale further from 25% to 10-15%.
- Or pre-downscale the video with another tool before processing.

**Step 5: Try a different AI model**
- Switch to a model with lower VRAM usage (e.g., LVAx2 instead of BSRGANx4).

### 7.4 Memory vs Disk Performance Comparison

The paper includes a preliminary set of measurements. The workload is a roughly 45-second 1080p Sintel clip exported to 2160p on an RTX 5070 Ti Laptop GPU. `I100O50` means 100% input scale and 50% output scale; `1b8t` means batch size 1 with 8 worker threads. The times below come from single runs and only show the differences observed in this setup:

| Configuration | Memory Pipeline | Disk Pipeline |
|--------------|-----------------|---------------|
| TensorRT 1b8t | 3:42 | 4:04 |
| ONNX CUDA 1b8t | 7:48 | 8:02 |
| TensorRT 1b1t | 9:52 | 10:45 |
| DirectML 1b1t | 12:25 | 12:42 |
| ONNX CUDA 1b1t | 15:28 | 15:45 |
| QualityScaler baseline | 18:41 | N/A |

In a separate `I50O100` experiment, TensorRT `1b8t` took 50 seconds in Memory mode and 95 seconds in Disk mode. The input workload is different, so these results should not be compared directly with the table above.

### 7.5 DIV2K compatibility test record

The following single-image results use `0801.jpeg` from the DIV2K Validation Set with `1b1t I50O100`:

| Platform | ONNX CPU | DirectML |
| --- | ---: | ---: |
| Intel Core Ultra 7 | 28 s | 3 s (integrated GPU) |
| 13th Gen Intel Core i5-13500H | 28 s | 4 s (integrated GPU) |

This table reflects compatibility for one image in one test environment. It should not be read as a general performance ranking across hardware or backends.

---

## 8. Face Enhancement

### 8.1 Feature Description

Face enhancement performs dedicated detail restoration on face regions after super-resolution is complete. It is suitable for video content where faces occupy a significant portion of the frame (e.g., interviews, vlogs, movies/TV series).

### 8.2 Face Models

| Model | Output Size | Quality | Description |
|-------|-------------|---------|-------------|
| **codeformer** (recommended) | Fixed 512×512 | 🟢 Best | Transformer architecture, natural restoration |
| **face_dat_x4** | 4× super-resolution | 🟡 Average | Older model, simple upscaling |

### 8.3 Parameter Descriptions

#### Color Matching
- **On**: Performs color histogram matching before blending, eliminating tonal differences between face and background.
- **Off** (default): No color matching.

#### Fidelity Weight (0.00 - 1.00)
Controls the balance between face restoration strength and original image fidelity:
- **0.0**: Strongest restoration, clearest but may produce noise/artifacts, far from original.
- **0.5** (default): Balance point, restores clarity while preserving natural feel.
- **1.0**: Fully retains original, no restoration.

> 💡 Recommended value: **0.5~0.7**. If faces appear distorted or over-smoothed, increase this value.

### 8.4 Notes
- Face enhancement requires approximately an additional **1-2GB VRAM**.
- Processing time increases by about 20-40% (depending on number and size of faces in the frame).
- For videos with no faces or very small faces (landscapes, distant shots), it is recommended to disable it to save time.

---

## 9. FAQ / Troubleshooting

### 9.1 Processing Speed Too Slow

1. **Check inference backend**: Confirm the title bar shows TensorRT or CUDA. If it shows CPU, GPU is not active.
2. **Increase input scale**: The default 25% is already fast; if still slow → lower input scale to 10-15%.
3. **Switch model**: LVAx2 is 3-5× faster than BSRGANx4.
4. **Performance mode**: Switch to Extreme Performance.
5. **Disable deblur and face enhancement**: These features significantly increase processing time.

### 9.2 Out of Memory (OOM) / Program Crashes

1. **Reduce multithreading**: Try step by step OFF → 2 threads.
2. **Reduce batch size**: Set to 1.
3. **Switch to a lower VRAM model**: BSRGANx4 → RealESR_Gx4 → LVAx2.
4. **Reduce input scale**: 25% → 15% → 10%.
5. **Disable deblur and face enhancement**.
6. **Switch to Disk pipeline** (reduces memory pressure).

### 9.3 Output Video Has No Audio

- Check if the source video has an audio track (some sources lack audio).
- Disk pipeline automatically preserves audio.
- Memory pipeline copies the audio stream via `-map 1:a?`; if the source audio codec is unusual, it may fail.

### 9.4 Grid-Like Seams Appear in Image

- Increase **Tile Overlap** parameter (16 → 32 or 64).
- Switch to Quality performance mode.
- Appropriately increase the input scale percentage.

### 9.5 AI Output Looks Too "Plasticky"

- Enable **AI Fusion**, choose Low or Medium.
- Switch to a more natural model (e.g., LVAx2).
- Use IRCNN for denoising preprocessing first.

### 9.6 Program Not Responding / White Screen on Startup

1. Verify the `Assets/` folder and ONNX Runtime DLLs exist in the running directory.
2. Install [Visual C++ Redistributable 2015-2022](https://aka.ms/vs/17/release/vc_redist.x64.exe).
3. If using TensorRT, confirm that the package's `qualityscaler_tensorrt.dll` and related DLLs have not been deleted or replaced.

---

## Appendix: Full Processing Pipeline Overview

```
Input File (Image/Video)
    │
    ├─ Image: Directly enters AI inference
    │
    └─ Video:
        │
        ├─ Memory Pipeline:
        │   ffmpeg decode → stdout → Go read → AI inference → Go write → stdin → ffmpeg encode → Output
        │
        └─ Disk Pipeline:
            ffmpeg extract frames → disk storage → AI upscale frame by frame → disk storage → ffmpeg assemble → Output
                │                                              │
                └─ [Optional] Deblur preprocessing              └─ [Optional] VFR timecodes
                └─ [Optional] Face detection + enhancement
```

---

> 📧 Feedback & Technical Support: Please submit an Issue in the project repository.
