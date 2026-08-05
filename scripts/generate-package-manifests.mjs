import fs from 'node:fs';
import path from 'node:path';

const eventPath = process.env.RELEASE_METADATA_PATH ?? process.env.GITHUB_EVENT_PATH;
const outputDir = process.env.MANIFEST_OUTPUT_DIR ?? 'package-manifests';
const release = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const rawRelease = release.release ?? release;
const tag = rawRelease.tag_name
  ?? rawRelease.tagName
  ?? release.tag_name
  ?? release.tagName
  ?? process.env.RELEASE_TAG;
if (!tag) {
  throw new Error(`Release metadata does not contain a tag. Keys: ${Object.keys(rawRelease).join(', ')}`);
}
const version = tag.replace(/^v/i, '');
const assets = (rawRelease.assets ?? []).map((asset) => ({
  ...asset,
  browser_download_url: asset.browser_download_url ?? asset.browserDownloadUrl ?? asset.downloadUrl,
  digest: asset.digest ?? asset.sha256,
}));
const repository = process.env.GITHUB_REPOSITORY ?? 'Ling0727-ai/qs-go-website';
const owner = process.env.PACKAGE_PUBLISHER ?? repository.split('/')[0];
const packageId = process.env.PACKAGE_ID ?? 'Ling0727.QualityScalerGo';
const displayName = process.env.PACKAGE_NAME ?? 'QualityScaler-Go';

if (!assets.length) {
  throw new Error(`Release metadata for ${tag} does not contain assets. Keys: ${Object.keys(rawRelease).join(', ')}`);
}

const pickAsset = (pattern, description) => {
  const matches = assets.filter((asset) => pattern.test(asset.name));
  if (matches.length !== 1) {
    throw new Error(`${description}: expected exactly one matching asset, found ${matches.length}.`);
  }
  return matches[0];
};

const variants = ['cpu', 'cuda', 'directml'];
const installerAssets = variants.map((variant) => ({
  variant,
  asset: pickAsset(new RegExp(`onnx-${variant}.*setup\\.(?:exe|msi)$`, 'i'), `Winget ${variant} installer asset`),
}));
const archiveAssets = variants.map((variant) => ({
  variant,
  asset: pickAsset(new RegExp(`onnx-${variant}\\.(?:zip|7z)$`, 'i'), `Scoop ${variant} archive asset`),
}));

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const { variant, asset } of installerAssets) {
  const variantId = `${packageId}.${variant[0].toUpperCase()}${variant.slice(1)}`;
  const wingetDir = path.join(outputDir, 'winget', owner, displayName, variant, version);
  fs.mkdirSync(wingetDir, { recursive: true });
  fs.writeFileSync(path.join(wingetDir, `${variantId}.yaml`), `PackageIdentifier: ${variantId}\nPackageVersion: ${version}\nPackageLocale: en-US\nPublisher: ${owner}\nPackageName: ${displayName} ${variant.toUpperCase()}\nLicense: MIT\nShortDescription: AI image and video quality scaler (${variant.toUpperCase()} edition).\nManifestType: defaultLocale\nManifestVersion: 1.9.0\n`);
  fs.writeFileSync(path.join(wingetDir, `${variantId}.installer.yaml`), `PackageIdentifier: ${variantId}\nPackageVersion: ${version}\nInstallerType: ${asset.name.endsWith('.msi') ? 'msi' : 'inno'}\nInstallers:\n  - Architecture: x64\n    InstallerUrl: ${asset.browser_download_url}\n    InstallerSha256: ${asset.digest.replace(/^sha256:/, '')}\nManifestType: installer\nManifestVersion: 1.9.0\n`);
}

const scoopDir = path.join(outputDir, 'scoop');
fs.mkdirSync(scoopDir, { recursive: true });
for (const { variant, asset } of archiveAssets) {
  fs.writeFileSync(path.join(scoopDir, `${packageId.toLowerCase()}-${variant}.json`), `${JSON.stringify({ version, description: `AI image and video quality scaler (${variant.toUpperCase()} edition).`, homepage: `https://github.com/${repository}`, license: 'MIT', architecture: { '64bit': { url: asset.browser_download_url, hash: asset.digest.replace(/^sha256:/, '') } }, bin: 'QualityScaler-Go.exe', shortcuts: [['QualityScaler-Go.exe', `${displayName} ${variant.toUpperCase()}`]] }, null, 2)}\n`);
}

console.log(`Generated manifests for ${packageId} ${version}`);
