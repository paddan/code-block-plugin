export const addCodeBlock = (language: string, text: string): string => {
	let fenceLength = 3;
	for (const match of text.matchAll(/`+/g)) {
		fenceLength = Math.max(fenceLength, match[0].length + 1);
	}
	const fence = '`'.repeat(fenceLength);
	return fence + language + '\n' + text + '\n' + fence + '\n';
};

export const toggleLanguage = (languages: string[], language: string, enabled: boolean): string[] =>
	enabled ? [...new Set([...languages, language])] : languages.filter(l => l !== language);
