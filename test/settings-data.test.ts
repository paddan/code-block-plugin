import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrateLanguageSettings } from '../src/settings-data.ts';

await test('migrates legacy settings by enabling Cypher once', () => {
	assert.deepEqual(migrateLanguageSettings(['python']), {
		languages: ['python', 'cypher'],
		settingsVersion: 1,
		migrated: true,
	});
	assert.deepEqual(migrateLanguageSettings(['python', 'cypher']), {
		languages: ['python', 'cypher'],
		settingsVersion: 1,
		migrated: true,
	});
});

await test('preserves a later manual Cypher disable', () => {
	assert.deepEqual(migrateLanguageSettings(['python'], 1), {
		languages: ['python'],
		settingsVersion: 1,
		migrated: false,
	});
});
