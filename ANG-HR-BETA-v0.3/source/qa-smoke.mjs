import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import http from 'node:http';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const sourcePath = path.join(root, 'src', 'main.jsx');
const source = await readFile(sourcePath, 'utf8');
const index = await readFile(path.join(dist, 'index.html'), 'utf8');

const buildInputs = [
  sourcePath,
  path.join(root, 'src', 'styles.css'),
  path.join(root, 'index.html'),
  path.join(root, 'package.json'),
];
for (const input of buildInputs) {
  const info = await stat(input);
  assert.ok(info.isFile() && info.size > 0, `required build input is missing or empty: ${path.relative(root, input)}`);
}

assert.match(source, /const APP_VERSION = 'BETA-v0\.3'/, 'source must expose the active Beta release version');

const temporaryAccounts = [
  { label: 'Business Basic', account: 'ANG-BETA-BASIC', email: 'basic@ang-beta.test', secretKey: 'password', secret: 'AngBeta#2026', role: 'admin', planKey: 'business-basic' },
  { label: 'Business Pro', account: 'ANG-BETA-PRO', email: 'pro@ang-beta.test', secretKey: 'password', secret: 'AngBeta#2026', role: 'admin', planKey: 'business-pro' },
  { label: 'Business Premium', account: 'ANG-BETA-PREMIUM', email: 'premium@ang-beta.test', secretKey: 'password', secret: 'AngBeta#2026', role: 'admin', planKey: 'business-premium' },
  { label: 'Personal Solo', account: 'ANG-SOLO-01', email: 'solo@ang-beta.test', secretKey: 'password', secret: 'AngBeta#2026', role: 'employee', planKey: 'personal-solo' },
  { label: 'Personal Performance', account: 'ANG-PERFORMANCE-01', email: 'performance@ang-beta.test', secretKey: 'password', secret: 'AngBeta#2026', role: 'employee', planKey: 'personal-performance' },
  { label: 'Personal Lite', account: 'FREE-PERSONAL-LITE', email: 'personal-lite@ang-beta.test', secretKey: 'code', secret: '123456', role: 'employee', planKey: 'free-personal-lite' },
  { label: 'Business Lite', account: 'FREE-BUSINESS-LITE', email: 'business-lite@ang-beta.test', secretKey: 'code', secret: '123456', role: 'admin', planKey: 'free-business-lite' },
];

assert.equal(temporaryAccounts.length, 7, 'the Beta matrix must define exactly seven temporary plan accounts');
assert.equal(new Set(temporaryAccounts.map(item => item.planKey)).size, 7, 'every temporary account must use a unique planKey');

const temporaryAccountSource = source.match(/const BETA_TEMP_ACCOUNTS = \{([\s\S]*?)\n\};/)?.[1];
assert.ok(temporaryAccountSource, 'source must define BETA_TEMP_ACCOUNTS');
const sourceAccountIds = [...temporaryAccountSource.matchAll(/\baccount:\s*'([^']+)'/g)].map(match => match[1]);
const sourcePlanKeys = [...temporaryAccountSource.matchAll(/\bplanKey:\s*'([^']+)'/g)].map(match => match[1]);
assert.equal(sourceAccountIds.length, 7, 'source must define exactly seven temporary accounts');
assert.equal(sourcePlanKeys.length, 7, 'every source temporary account must define a planKey');
assert.equal(new Set(sourcePlanKeys).size, 7, 'source temporary account planKeys must be unique');

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const temporaryAccount of temporaryAccounts) {
  for (const value of [temporaryAccount.account, temporaryAccount.email, temporaryAccount.secret, temporaryAccount.planKey]) {
    assert.ok(source.includes(value), `${temporaryAccount.label} temporary credential is missing from source: ${value}`);
  }
  const sourceObjectPattern = new RegExp(
    `\\{[^{}]*account:\\s*'${escapeRegExp(temporaryAccount.account)}'[^{}]*email:\\s*'${escapeRegExp(temporaryAccount.email)}'[^{}]*${temporaryAccount.secretKey}:\\s*'${escapeRegExp(temporaryAccount.secret)}'[^{}]*role:\\s*'${temporaryAccount.role}'[^{}]*planKey:\\s*'${temporaryAccount.planKey}'[^{}]*\\}`,
  );
  assert.match(temporaryAccountSource, sourceObjectPattern, `${temporaryAccount.label} source account does not match its expected role, secret, and planKey`);
}

assert.equal(temporaryAccounts.find(item => item.planKey === 'free-business-lite')?.role, 'admin', 'Business Lite must enter the admin role');
assert.equal(temporaryAccounts.find(item => item.planKey === 'free-personal-lite')?.role, 'employee', 'Personal Lite must enter the employee role');

// Role entry must always carry a validated account object. Literal role-only
// handlers would restore the old direct-access bypass.
assert.doesNotMatch(source, /\bonEnter\s*\(\s*['"`](?:admin|employee)['"`]/, 'a UI path still enters a role without a validated temporary account');
assert.doesNotMatch(source, /\bsetRole\s*\(\s*['"`](?:admin|employee)['"`]/, 'a UI path still sets a role directly');
assert.match(source, /onEnter\(expected\.role, expected\)/, 'admin/employee login must pass its validated temporary account');
assert.match(source, /onEnter\(account\.role, account\)/, 'free login must pass its validated temporary account');
assert.match(source, /const readDemoSessionAccount = \(\) =>/, 'session restore must use the canonical account validator');
assert.match(source, /getCanonicalBetaAccount\(candidate\)/, 'stored account must be matched against the fixed Beta matrix');
assert.match(source, /canonicalAccount\?\.role === nextRole/, 'role changes must fail closed when account and role do not match');
assert.match(source, /<button disabled>Google（尚未串接）<\/button><button disabled>LINE（尚未串接）<\/button>/, 'unconnected social-login controls must remain disabled');

const referencedAssets = [...index.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(match => match[1])
  .filter(item => item.startsWith('/') || item.startsWith('./'));
const assetPath = asset => asset.replace(/^\.\//, '').replace(/^\//, '');
assert.ok(referencedAssets.length >= 2, 'built index does not reference hashed JS/CSS assets');
assert.ok(referencedAssets.some(asset => /^(?:\.\/|\/)assets\/index-[\w-]+\.js$/.test(asset)), 'built index does not reference a hashed JavaScript bundle');
assert.ok(referencedAssets.some(asset => /^(?:\.\/|\/)assets\/index-[\w-]+\.css$/.test(asset)), 'built index does not reference a hashed CSS bundle');
for (const asset of referencedAssets) {
  const output = path.join(dist, assetPath(asset));
  await access(output);
  assert.ok((await stat(output)).size > 0, `built asset is empty: ${asset}`);
}

const builtJavaScript = (
  await Promise.all(
    referencedAssets
      .filter(asset => asset.endsWith('.js'))
      .map(asset => readFile(path.join(dist, assetPath(asset)), 'utf8')),
  )
).join('\n');
assert.ok(builtJavaScript.includes('BETA-v0.3'), 'built JavaScript does not contain the release version');
for (const temporaryAccount of temporaryAccounts) {
  for (const value of [temporaryAccount.account, temporaryAccount.email, temporaryAccount.secret, temporaryAccount.planKey]) {
    assert.ok(builtJavaScript.includes(value), `${temporaryAccount.label} temporary account value is missing from the built JavaScript: ${value}`);
  }
}
assert.ok(builtJavaScript.includes('Google（尚未串接）') && builtJavaScript.includes('LINE（尚未串接）'), 'built JavaScript does not preserve disabled social-login labels');

const backgroundNames = ['ang-entry-bg-day.png', 'ang-entry-bg-night.png'];
for (const name of backgroundNames) {
  const inputPath = path.join(root, 'public', name);
  const outputPath = path.join(dist, name);
  const [inputBuffer, outputBuffer] = await Promise.all([readFile(inputPath), readFile(outputPath)]);
  assert.ok(inputBuffer.length > 1024, `background build input is unexpectedly small: public/${name}`);
  assert.ok(outputBuffer.length > 1024, `background build output is unexpectedly small: dist/${name}`);
  const digest = buffer => createHash('sha256').update(buffer).digest('hex');
  assert.equal(digest(outputBuffer), digest(inputBuffer), `built background does not match its public input: ${name}`);
}

const deploymentBase = '/beta/v0.3/';
const distRoot = path.resolve(dist);
const responseContentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
};
const expectedMimePatterns = {
  '.html': /^text\/html\b/i,
  '.js': /^(?:text|application)\/javascript\b/i,
  '.css': /^text\/css\b/i,
  '.png': /^image\/png\b/i,
};
const looksLikeHtmlFallback = /^\s*(?:<!doctype\s+html|<html[\s>])/i;

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    assert.ok(pathname.startsWith(deploymentBase), 'request is outside the simulated GitHub Pages deployment base');
    const relativePath = pathname.slice(deploymentBase.length);
    const target = relativePath ? path.resolve(distRoot, relativePath) : path.join(distRoot, 'index.html');
    assert.ok(target === path.join(distRoot, 'index.html') || target.startsWith(`${distRoot}${path.sep}`), 'request escaped the dist directory');
    const info = await stat(target);
    assert.ok(info.isFile(), 'request target is not a file');
    const contentType = responseContentTypes[path.extname(target).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const { port } = server.address();
  const appIndexUrl = new URL(deploymentBase, `http://127.0.0.1:${port}`);
  const indexResponse = await fetch(appIndexUrl);
  assert.equal(indexResponse.status, 200, `${appIndexUrl.pathname} must return HTTP 200`);
  assert.match(indexResponse.headers.get('content-type') || '', expectedMimePatterns['.html'], 'deployed index must use an HTML MIME type');
  const servedIndex = await indexResponse.text();
  assert.ok(servedIndex.length > 0 && servedIndex.includes('<div id="root"></div>'), 'deployed index must contain the React root');

  const servedAssetReferences = [...servedIndex.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  assert.ok(servedAssetReferences.length >= 2, 'deployed index must reference its JavaScript and CSS assets');
  const resolvedAssetUrls = servedAssetReferences.map(reference => new URL(reference, appIndexUrl));
  assert.ok(resolvedAssetUrls.every(url => url.pathname.startsWith(deploymentBase)), 'an index asset escaped the GitHub Pages-like deployment subpath');

  const servedStylesheets = [];
  for (const assetUrl of resolvedAssetUrls) {
    const extension = path.extname(assetUrl.pathname).toLowerCase();
    const response = await fetch(assetUrl);
    assert.equal(response.status, 200, `${assetUrl.pathname} must return HTTP 200`);
    assert.match(response.headers.get('content-type') || '', expectedMimePatterns[extension], `${assetUrl.pathname} has an unsafe or missing MIME type`);
    const body = await response.text();
    assert.ok(body.length > 0, `${assetUrl.pathname} must return a non-empty response body`);
    if (extension === '.js' || extension === '.css') {
      assert.doesNotMatch(body, looksLikeHtmlFallback, `${assetUrl.pathname} returned an HTML fallback instead of ${extension.slice(1).toUpperCase()}`);
    }
    if (extension === '.css') servedStylesheets.push({ url: assetUrl, body });
  }

  const resolvedCssImageUrls = servedStylesheets.flatMap(({ url, body }) =>
    [...body.matchAll(/url\(([^)]+)\)/g)]
      .map(match => match[1].trim().replace(/^['"]|['"]$/g, ''))
      .filter(reference => reference && !reference.startsWith('data:') && !reference.startsWith('#'))
      .map(reference => new URL(reference, url))
      .filter(resolvedUrl => resolvedUrl.origin === appIndexUrl.origin),
  );
  const uniqueCssImageUrls = [...new Map(resolvedCssImageUrls.map(url => [url.href, url])).values()];
  for (const name of backgroundNames) {
    const expectedUrl = new URL(name, appIndexUrl);
    assert.ok(uniqueCssImageUrls.some(url => url.href === expectedUrl.href), `built CSS does not resolve ${name} inside the deployment subpath`);
  }
  for (const imageUrl of uniqueCssImageUrls) {
    const extension = path.extname(imageUrl.pathname).toLowerCase();
    const response = await fetch(imageUrl);
    assert.equal(response.status, 200, `${imageUrl.pathname} must return HTTP 200`);
    if (expectedMimePatterns[extension]) {
      assert.match(response.headers.get('content-type') || '', expectedMimePatterns[extension], `${imageUrl.pathname} has an unsafe or missing image MIME type`);
    }
    const body = await response.arrayBuffer();
    assert.ok(body.byteLength > 0, `${imageUrl.pathname} must return a non-empty response body`);
  }
} finally {
  await new Promise(resolve => server.close(resolve));
}

console.log(`Smoke test passed: ${referencedAssets.length} hashed assets, ${backgroundNames.length} backgrounds, ${temporaryAccounts.length} temporary accounts, anti-bypass guards, and GitHub Pages-like subpath delivery with MIME checks.`);
