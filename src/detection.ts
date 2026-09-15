import hljs from 'highlight.js/lib/common';
import { languageHint } from './language-hints.ts';

const registeredLanguages = hljs.listLanguages();

function canonicalLanguage(name: string): string | undefined {
	const definition = hljs.getLanguage(name);
	return definition && registeredLanguages.find(language => hljs.getLanguage(language) === definition);
}

export function detectLanguage(text: string, languages: readonly string[] = hljs.listLanguages()): string {
	const code = text.trim();
	const enabled = [...new Set(languages.map(canonicalLanguage).filter((language): language is string => !!language))];
	if (!code || enabled.length === 0) return '';

	const hint = languageHint(code);
	if (hint) return enabled.includes(hint) ? hint : '';

	const result = hljs.highlightAuto(code, enabled);
	if (!result.language || result.relevance < 2) return '';
	// Shell commands can consist entirely of words and whitespace. Preserve
	// that grammar's evidence, while rejecting prose mistaken for CSS, etc.
	if (/^[\p{L}\p{N}\s.,!?\u2019'-]+$/u.test(code) && result.language !== 'bash') return '';
	if (result.secondBest?.relevance === result.relevance) {
		// The template grammar embeds these languages and often gets the same
		// score. Preserve highlight.js's ordering for this known overlap.
		const templateOverlap = result.secondBest.language === 'php-template'
			&& (result.language === 'xml' || result.language === 'php');
		if (!templateOverlap) return '';
	}
	return result.language;
}
