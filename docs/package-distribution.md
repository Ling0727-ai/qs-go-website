# Windows package distribution

The workflow in `.github/workflows/publish-package-manifests.yml` runs when `public/version.json` changes on `main`, or when started manually. It reads the version, loads the matching GitHub Release, generates Winget and Scoop manifests, and uploads them as a workflow artifact.

Publishing configuration:

- `WINGET_TOKEN`: a GitHub token that can create a fork and pull request against `microsoft/winget-pkgs`.
- Scoop manifests are committed to this repository's `bucket/` directory with the workflow's built-in `GITHUB_TOKEN`; no separate Scoop token or repository setting is required.

The `full` and TensorRT editions are excluded. Complete ONNX CPU and ONNX CUDA installers and portable archives are required. ONNX DirectML is published when both matching assets exist and is otherwise skipped.

The current split `.exe` plus `.bin` release assets are deliberately rejected because package managers require a directly downloadable complete installer or archive.
