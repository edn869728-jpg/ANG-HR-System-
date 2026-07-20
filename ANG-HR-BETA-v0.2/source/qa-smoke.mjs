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

assert.match(source, /const APP_VERSION = 'BETA-v0\.2'/, 'source must expose the frozen Beta version');

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
assert.ok(builtJavaScript.includes('BETA-v0.2'), 'built JavaScript does not contain the frozen Beta version');
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

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const target = pathname === '/' ? path.join(dist, 'index.html') : path.join(dist, pathname.slice(1));
    await access(target);
    response.writeHead(200);
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404);
    response.end('not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const { port } = server.address();
  for (const urlPath of ['/', ...referencedAssets.map(asset => `/${assetPath(asset)}`), ...backgroundNames.map(name => `/${name}`)]) {
    const response = await fetch(`http://127.0.0.1:${port}${urlPath}`);
    assert.equal(response.status, 200, `${urlPath} must return HTTP 200`);
    const body = await response.arrayBuffer();
    assert.ok(body.byteLength > 0, `${urlPath} must return a non-empty response body`);
  }
} finally {
  await new Promise(resolve => server.close(resolve));
}

console.log(`Smoke test passed: ${referencedAssets.length} hashed assets, ${backgroundNames.length} backgrounds, ${temporaryAccounts.length} temporary accounts, anti-bypass guards, and local HTTP delivery.`);
