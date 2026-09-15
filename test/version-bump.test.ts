import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const scriptPath = new URL('../version-bump.mjs', import.meta.url);

function createFixture() {
	const directory = mkdtempSync(join(tmpdir(), 'code-block-version-'));
	writeFileSync(
		join(directory, 'manifest.json'),
		JSON.stringify({ version: '1.0.6', minAppVersion: '0.12.16' }),
	);
	writeFileSync(
		join(directory, 'versions.json'),
		JSON.stringify({ '1.0.6': '0.12.16' }),
	);
	return directory;
}

await test('fails without a package version and leaves release files unchanged', () => {
	const directory = createFixture();
	const manifestBefore = readFileSync(join(directory, 'manifest.json'), 'utf8');
	const versionsBefore = readFileSync(join(directory, 'versions.json'), 'utf8');
	const env = { ...process.env };
	delete env.npm_package_version;

	const result = spawnSync(process.execPath, [scriptPath.pathname], {
		cwd: directory,
		env,
		encoding: 'utf8',
	});

	assert.notEqual(result.status, 0);
	assert.match(result.stderr, /npm_package_version/);
	assert.equal(readFileSync(join(directory, 'manifest.json'), 'utf8'), manifestBefore);
	assert.equal(readFileSync(join(directory, 'versions.json'), 'utf8'), versionsBefore);
});

await test('writes the package version to both Obsidian release files', () => {
	const directory = createFixture();

	execFileSync(process.execPath, [scriptPath.pathname], {
		cwd: directory,
		env: { ...process.env, npm_package_version: '1.1.0' },
	});

	const manifest = JSON.parse(
		readFileSync(join(directory, 'manifest.json'), 'utf8'),
	) as { version: string };
	const versions = JSON.parse(
		readFileSync(join(directory, 'versions.json'), 'utf8'),
	) as Record<string, string>;
	assert.equal(manifest.version, '1.1.0');
	assert.equal(versions['1.1.0'], '0.12.16');
});
