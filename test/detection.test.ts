import { test } from 'node:test';
import assert from 'node:assert/strict';
import hljs from '../src/highlighter.ts';
import { languageSamples } from './language-samples.ts';
import { detectLanguage } from '../src/detection.ts';

await test('samples cover every language offered by the plugin', () => {
	assert.deepEqual(Object.keys(languageSamples).sort(), hljs.listLanguages().sort());
});

for (const [language, code] of Object.entries(languageSamples)) {
	await test(`detects ${language} from a representative snippet`, () => {
		assert.equal(detectLanguage(code), language === 'plaintext' ? '' : language);
	});
}

for (const [label, code, expected] of [
	['short JavaScript', 'const x = 1;', 'javascript'],
	['short TypeScript', 'const name: string = "Patrik";', 'typescript'],
	['English prose', 'Please remember to bring the documents to the meeting tomorrow.', ''],
	['empty input', '', ''],
	['whitespace', '  \n\t', ''],
	['ambiguous expression', 'x + y', ''],
	['JSON object', '{"active":true}', 'json'],
	['JSON array', '[{"id":1}, {"id":2}]', 'json'],
	['JSON scalar is ambiguous', 'true', ''],
	['Java import', 'import java.time.Instant;\nclass Clock { Instant now() { return Instant.now(); } }', 'java'],
	['GraphQL mutation', 'mutation AddItem($name: String!) { addItem(name: $name) { id } }', 'graphql'],
	['short Cypher MATCH', 'MATCH (n) RETURN n', 'cypher'],
	['Cypher MERGE', 'MERGE (p:Person {name: $name})\nON CREATE SET p.createdAt = datetime()\nRETURN p', 'cypher'],
	['Cypher procedure call', 'CALL db.labels() YIELD label\nRETURN label ORDER BY label', 'cypher'],
	['R assignment', 'scores <- c(5, 10, 15)\nsummary(scores)', 'r'],
	['VB declaration', 'Public Function DoubleValue(x As Integer) As Integer\n  Return x * 2\nEnd Function', 'vbnet'],
	['SQL select', 'select name from accounts where enabled = true;', 'sql'],
	['C header', '#include <stdint.h>\nuint32_t square(uint32_t n) { return n * n; }', 'c'],
	['C++ using a C header', '#include <stdio.h>\n#include <vector>\nstd::vector<int> values;', 'cpp'],
	['JavaScript let', 'let enabled = false;', 'javascript'],
	['TypeScript let', 'let attempts: number = 0;', 'typescript'],
	['Python shebang', '#!/usr/bin/env python3\nprint("hello")', 'python'],
	['Ruby shebang', '#!/usr/bin/ruby\nputs "hello"', 'ruby'],
	['Perl shebang', '#!/usr/bin/perl -w\nprint "hello";', 'perl'],
	['Node shebang', '#!/usr/bin/env -S node --no-warnings\nconsole.log("hello");', 'javascript'],
	['shell shebang', '#!/bin/sh\nprintf "%s\\n" hello', 'bash'],
	['JavaScript string containing SQL', 'const query = "SELECT name FROM users";', 'javascript'],
	['C++ declaration is not JavaScript', 'const int count = 1;', ''],
	['TypeScript after a shared declaration', 'const name = "Ada";\ninterface User { name: string; age: number; }\nexport function greet(user: User): string { return user.name; }', 'typescript'],
	['Go channel send is not R assignment', 'package main\nimport "fmt"\nfunc main() {\n  ch := make(chan int, 1)\n  ch <- 42\n  fmt.Println(<-ch)\n}', 'go'],
	['shell commands without punctuation', 'echo hello\npwd\nls -la', 'bash'],
	['R inside a Python string', 'def example():\n    text = """\nvalues <- c(1, 2, 3)\n"""\n    return text\nprint(example())', 'python'],
] as const) {
	await test(label, () => assert.equal(detectLanguage(code), expected));
}

await test('respects an empty language selection', () => {
	assert.equal(detectLanguage(languageSamples.python!, []), '');
});

await test('does not override disabled languages with a syntax hint', () => {
	assert.equal(detectLanguage('{"name":"Ada"}', ['python']), '');
	assert.equal(detectLanguage('#!/bin/bash\necho hello', ['python']), '');
	assert.equal(detectLanguage('MATCH (n:Person) RETURN n', ['sql', 'vbnet']), '');
});

await test('shared syntax does not block the sole enabled language', () => {
	assert.equal(detectLanguage('const name = "Ada";\ninterface User { name: string; }', ['typescript']), 'typescript');
	assert.equal(detectLanguage('package main\nfunc send(ch chan int) {\n ch <- 42\n}', ['go']), 'go');
	assert.equal(detectLanguage('echo hello\npwd\nls -la', ['bash']), 'bash');
});

await test('normalizes aliases and ignores unavailable languages', () => {
	assert.equal(detectLanguage('let enabled = false;', ['js', 'missing']), 'javascript');
	assert.equal(detectLanguage(languageSamples.python!, ['missing']), '');
});

for (const [language, code] of Object.entries(languageSamples)) {
	await test(`detects ${language} when it is the only enabled language`, () => {
		assert.equal(detectLanguage(code, [language]), language === 'plaintext' ? '' : language);
	});
}
