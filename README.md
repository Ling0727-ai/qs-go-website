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
| `onnx-directml` | DirectML-compatible Windows GPU devices |
| `tensorrt-gpu` | NVIDIA users who need the TensorRT execution path |
| `full` | Users who need the complete bundled backend set |

The Winget and Scoop automation covers the regular ONNX CPU, CUDA, and DirectML packages. `full` and TensorRT packages are excluded from those package-manager feeds.

## Documentation

- [中文用户手册](public/doc/USER_MANUAL-zh_cn.md)
- [English user manual](public/doc/USER_MANUAL-en.md)
- [Package distribution setup](docs/package-distribution.md)

The performance figures in the user manuals are guidance or preliminary examples unless they are accompanied by a reproducible workload, hardware configuration, software versions, and repeated measurements. They should not be treated as universal benchmarks.

### Preliminary performance snapshot

The accompanying paper reports a preliminary single-run comparison on a 45-second 1080p Sintel clip exported to 2160p, using an NVIDIA RTX 5070 Ti Laptop GPU. At input/output setting `I100O50`, the fastest recorded configuration was TensorRT `1b8t` in Memory mode at 3:42; the corresponding Disk run took 4:04. ONNX CUDA `1b1t` took 15:28 in Memory mode and 15:45 in Disk mode. These results are workload-specific and are not a replacement for repeated benchmarks.

### Compatibility test snapshot

Using `0801.jpeg` from the DIV2K Validation Set with `1b8t I50O100`, the recorded single-image results were:

| Platform | ONNX CPU | DirectML |
| --- | ---: | ---: |
| Intel Core Ultra 7 | 28 s | 3 s (integrated GPU) |
| 13th Gen Intel Core i5-13500H | 28 s | 4 s (integrated GPU) |

These are compatibility measurements for one image and should not be interpreted as a general CPU/GPU performance ranking.

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
