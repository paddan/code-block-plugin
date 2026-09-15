import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addCodeBlock, toggleLanguage } from '../src/codeblock.ts';

await test('addCodeBlock fences the text with the given language', () => {
	assert.equal(addCodeBlock('ts', 'const a = 1;'), '```ts\nconst a = 1;\n```\n');
	assert.equal(addCodeBlock('', 'plain'), '```\nplain\n```\n');
});

await test('addCodeBlock keeps embedded triple fences inside the outer block', () => {
	assert.equal(addCodeBlock('markdown', 'before\n```js\nx();\n```\nafter'),
		'````markdown\nbefore\n```js\nx();\n```\nafter\n````\n');
});

await test('addCodeBlock uses a fence longer than the longest backtick run', () => {
	assert.equal(addCodeBlock('', '```\n`````\nend'), '``````\n```\n`````\nend\n``````\n');
});

await test('addCodeBlock retains triple fences for isolated backticks and tildes', () => {
	assert.equal(addCodeBlock('', '`one` and ``two``\n~~~'), '```\n`one` and ``two``\n~~~\n```\n');
});

await test('toggleLanguage adds and removes without reordering or duplicating', () => {
	const languages = ['ts', 'js'];
	assert.deepEqual(toggleLanguage(languages, 'js', true), ['ts', 'js']);
	assert.deepEqual(toggleLanguage(languages, 'rust', true), ['ts', 'js', 'rust']);
	assert.deepEqual(toggleLanguage(languages, 'ts', false), ['js']);
	assert.deepEqual(toggleLanguage(languages, 'rust', false), ['ts', 'js']);
	assert.deepEqual(languages, ['ts', 'js'], 'input is not mutated');
});
