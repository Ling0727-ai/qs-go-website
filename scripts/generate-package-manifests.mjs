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

const requiredVariants = ['cpu', 'cuda'];
const optionalVariants = ['directml'];

const findVariantAssets = (variant, required) => {
  const installers = assets.filter((asset) => new RegExp(`onnx-${variant}.*win.*setup\\.(?:exe|msi)$`, 'i').test(asset.name));
  const archives = assets.filter((asset) => new RegExp(`onnx-${variant}.*win.*\\.(?:zip|7z)$`, 'i').test(asset.name));

  if (installers.length === 1 && archives.length === 1) {
    return { variant, installer: installers[0], archive: archives[0] };
  }

  if (!required && installers.length === 0 && archives.length === 0) {
    console.log(`Skipping optional ${variant} edition: no matching Release assets.`);
    return null;
  }

  throw new Error(`${variant} edition: expected one Windows installer and one archive, found ${installers.length} installer(s) and ${archives.length} archive(s).`);
};

const variantAssets = [
  ...requiredVariants.map((variant) => findVariantAssets(variant, true)),
  ...optionalVariants.map((variant) => findVariantAssets(variant, false)),
].filter(Boolean);

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const { variant, installer: asset } of variantAssets) {
  const variantId = `${packageId}.${variant[0].toUpperCase()}${variant.slice(1)}`;
  const identifierParts = variantId.split('.');
  const wingetDir = path.join(outputDir, 'winget', 'manifests', identifierParts[0][0].toLowerCase(), ...identifierParts, version);
  fs.mkdirSync(wingetDir, { recursive: true });
  fs.writeFileSync(path.join(wingetDir, `${variantId}.yaml`), `# yaml-language-server: $schema=https://aka.ms/winget-manifest.version.1.9.0.schema.json\n\nPackageIdentifier: ${variantId}\nPackageVersion: ${version}\nDefaultLocale: en-US\nManifestType: version\nManifestVersion: 1.9.0\n`);
  fs.writeFileSync(path.join(wingetDir, `${variantId}.locale.en-US.yaml`), `# yaml-language-server: $schema=https://aka.ms/winget-manifest.defaultLocale.1.9.0.schema.json\n\nPackageIdentifier: ${variantId}\nPackageVersion: ${version}\nPackageLocale: en-US\nPublisher: ${owner}\nPublisherUrl: https://github.com/${repository.split('/')[0]}\nPackageName: ${displayName} ${variant.toUpperCase()}\nPackageUrl: https://github.com/${repository}\nLicense: Proprietary\nShortDescription: AI image and video quality scaler (${variant.toUpperCase()} edition).\nManifestType: defaultLocale\nManifestVersion: 1.9.0\n`);
  fs.writeFileSync(path.join(wingetDir, `${variantId}.installer.yaml`), `# yaml-language-server: $schema=https://aka.ms/winget-manifest.installer.1.9.0.schema.json\n\nPackageIdentifier: ${variantId}\nPackageVersion: ${version}\nInstallerType: ${asset.name.endsWith('.msi') ? 'msi' : 'nullsoft'}\nInstallers:\n  - Architecture: x64\n    InstallerUrl: ${asset.browser_download_url}\n    InstallerSha256: ${asset.digest.replace(/^sha256:/, '')}\nManifestType: installer\nManifestVersion: 1.9.0\n`);
}

const scoopDir = path.join(outputDir, 'scoop');
fs.mkdirSync(scoopDir, { recursive: true });
for (const { variant, archive: asset } of variantAssets) {
  fs.writeFileSync(path.join(scoopDir, `${packageId.toLowerCase()}-${variant}.json`), `${JSON.stringify({ version, description: `AI image and video quality scaler (${variant.toUpperCase()} edition).`, homepage: `https://github.com/${repository}`, license: 'Proprietary', architecture: { '64bit': { url: asset.browser_download_url, hash: asset.digest.replace(/^sha256:/, '') } }, bin: 'QualityScaler-Go.exe', shortcuts: [['QualityScaler-Go.exe', `${displayName} ${variant.toUpperCase()}`]] }, null, 2)}\n`);
}

console.log(`Generated manifests for ${packageId} ${version}`);
