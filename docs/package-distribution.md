# Windows package distribution

The workflow in `.github/workflows/publish-package-manifests.yml` runs when a GitHub Release is published. It generates Winget and Scoop manifests and uploads them as a workflow artifact.

Add these repository secrets to enable publishing:

- `WINGET_TOKEN`: a GitHub token that can create a fork and pull request against `microsoft/winget-pkgs`.
- `SCOOP_BUCKET_TOKEN`: a token with write access to the Scoop bucket repository.
- `SCOOP_BUCKET_REPOSITORY`: the bucket repository in `owner/repository` form.

The `full` and TensorRT editions are excluded. The workflow distributes the regular ONNX CPU, ONNX CUDA, and ONNX DirectML editions, generating separate Winget and Scoop entries for each. Each release must include complete `onnx-cpu`, `onnx-cuda`, and `onnx-directml` installers plus matching portable archives.

The current split `.exe` plus `.bin` release assets are deliberately rejected because package managers require a directly downloadable complete installer or archive.
