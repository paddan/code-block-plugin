// Only use distinctive syntax. Generic keywords (class, return, print, etc.)
// are shared by too many languages to override highlight.js reliably.
export function languageHint(text: string): string | undefined {
	const shebang = /^#!\s*(?:\S*\/)?(bash|sh|zsh|python[\d.]*|ruby|perl|node)(?=\s|$)/.exec(text)
		?? /^#!\s*\/\S*env\s+(?:-S\s+)?(bash|sh|zsh|python[\d.]*|ruby|perl|node)(?=\s|$)/.exec(text);
	if (shebang?.[1]) {
		const interpreter = shebang[1];
		if (interpreter.startsWith('python')) return 'python';
		if (interpreter === 'node') return 'javascript';
		if (['sh', 'zsh', 'bash'].includes(interpreter)) return 'bash';
		return interpreter;
	}

	if (/^[[{]/.test(text)) {
		try {
			const value: unknown = JSON.parse(text);
			if (value !== null && typeof value === 'object') return 'json';
		} catch {
			// A bracket alone is not enough to identify JSON.
		}
	}

	if (/^(?:export\s+)?(?:const|let|var)\s+[$\w]+\s*:\s*(?:string|number|boolean|unknown|never|any)\b/.test(text)) return 'typescript';
	// A shared declaration at the start of a larger snippet must not hide
	// TypeScript (or another language) later in that snippet.
	if (/^(?:export\s+)?(?:const|let)\s+[$\w]+\s*=\s*(?:true|false|\d+|"[^"\n]*"|'[^'\n]*');?$/.test(text)) return 'javascript';
	if (/^\s*import\s+(?:static\s+)?(?:java|javax)\.[\w.*]+;/m.test(text)) return 'java';
	if (/^\s*(?:query|mutation|subscription)\s+[A-Za-z_]\w*\s*(?:\([^\n]*\))?\s*\{/.test(text)) return 'graphql';
	if (/^\s*(?:Public |Private |Protected )?(?:Sub|Function|Module)\s+\w+/mi.test(text)
		&& /^\s*End (?:Sub|Function|Module)\b/mi.test(text)) return 'vbnet';
	// Go uses <- too; require an R-shaped opening, not an arbitrary line
	// inside another language's function or multiline string.
	if (/^[\w.]+\s*<-\s*\S/.test(text)
		|| (/^(?:library|require)\s*\([\w"'.]+\)/.test(text)
			&& /^\s*[\w.]+\s*<-\s*\S/m.test(text))) return 'r';
	if (/^\s*SELECT\b[\s\S]+\bFROM\s+[\w"`[]/i.test(text)) return 'sql';

	// C's grammar disables autodetection. Prefer C only for a C header without
	// C++ headers or syntax; unmarked C/C++ fragments remain ambiguous.
	if (/^\s*#\s*include\s*<(?:stdio|stdlib|stdint|stdbool|string|stddef|math|time)\.h>/m.test(text)
		&& ![...text.matchAll(/^\s*#\s*include\s*<([^>]+)>/gm)].some(match => !match[1]?.endsWith('.h'))
		&& !/::|\b(?:class|namespace|template|constexpr|nullptr)\b/.test(text)) return 'c';
	return undefined;
}
