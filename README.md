# QualityScaler-Go

QualityScaler-Go is a Windows desktop application for local AI image and video upscaling. It combines restoration models with FFmpeg media processing and supports memory and disk-based video pipelines.

## Features

- Image and video super-resolution
- Real-ESRGAN, BSRGAN, denoising, sharpening, and face-enhancement models
- ONNX CPU, ONNX CUDA, ONNX DirectML, and TensorRT backends
- Memory pipeline for lower intermediate-file overhead
- Disk pipeline for VFR video, resume, and frame-level inspection
- CPU, NVIDIA NVENC, AMD AMF, and Intel QSV output encoders where available
- Windows release packages with bundled runtime components where applicable

## Download

Download the latest Windows packages from the [Releases page](https://github.com/Ling0727-ai/qs-go-website/releases).

Choose the backend that matches your machine:

| Package | Best for |
| --- | --- |
| `onnx-cpu` | Maximum compatibility and machines without a supported GPU |
| `onnx-cuda` | NVIDIA GPUs with CUDA and cuDNN available |
| `onnx-directml` | DirectML-compatible Windows GPU devices - coming soon / 敬请期待 |
| `tensorrt-gpu` | NVIDIA users who need the TensorRT execution path |
| `full` | Users who need the complete bundled backend set |

The Winget and Scoop automation currently publishes the regular ONNX CPU and CUDA packages. DirectML support is coming soon and will be published automatically when release assets become available. `full` and TensorRT packages are excluded from those package-manager feeds.

The distribution workflow starts automatically when `public/version.json` changes on `main`. It reads the `version` field, locates the matching GitHub Release, and publishes the package manifests for that release. The Release assets must already be uploaded before the workflow runs.

### Install with Winget

After the Winget manifests have been accepted into the community source:

```powershell
winget install --id Ling0727.QualityScalerGo.Cpu
winget install --id Ling0727.QualityScalerGo.Cuda
```

Upgrade an installed package with:

```powershell
winget upgrade --id Ling0727.QualityScalerGo.Cpu
```

Replace `Cpu` with `Cuda` when upgrading the CUDA edition. The DirectML package is coming soon.

### Install with Scoop

Add this repository as the project Scoop bucket, then install the edition you need:

```powershell
scoop bucket add qualityscaler-go https://github.com/Ling0727-ai/qs-go-website
scoop install qualityscaler-go/qualityscaler-go-cpu
```

Other editions:

```powershell
scoop install qualityscaler-go/qualityscaler-go-cuda
```

The DirectML Scoop package is coming soon / 敬请期待.

Update an installed package with:

```powershell
scoop update qualityscaler-go
scoop update qualityscaler-go/qualityscaler-go-cpu
```

## Documentation

- [中文用户手册](public/doc/USER_MANUAL-zh_cn.md)
- [English user manual](public/doc/USER_MANUAL-en.md)
- [Package distribution setup](docs/package-distribution.md)

Unless a result includes a reproducible workload, hardware configuration, software versions, and repeated measurements, treat the performance figures in the user manuals as preliminary guidance rather than universal benchmarks.

### Preliminary performance snapshot

The paper includes a preliminary single-run comparison using a 45-second 1080p Sintel clip exported to 2160p on an NVIDIA RTX 5070 Ti Laptop GPU. With `I100O50`, TensorRT `1b8t` was the fastest recorded configuration at 3:42 in Memory mode and 4:04 in Disk mode. ONNX CUDA `1b1t` took 15:28 in Memory mode and 15:45 in Disk mode. These times apply only to this workload and are not a substitute for repeated benchmarks.

### Compatibility test snapshot

The following single-image results use `0801.jpeg` from the DIV2K Validation Set with `1b1t I50O100`:

| Platform | ONNX CPU | DirectML |
| --- | ---: | ---: |
| Intel Core Ultra 7 | 28 s | 3 s (integrated GPU) |
| 13th Gen Intel Core i5-13500H | 28 s | 4 s (integrated GPU) |

These measurements reflect one image and one test environment. They should not be interpreted as a general CPU/GPU performance ranking.

## Website development

This repository contains the release website and documentation.

```bash
npm install
npm run dev
```

Build the static site with:

```bash
npm run build
```

## License and project status

See the repository and release notes for the current source-availability and licensing details. The accompanying paper is an evolving systems evaluation; preliminary observations are kept separate from completed experimental results.
