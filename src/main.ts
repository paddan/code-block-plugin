import { Editor, Notice, Plugin } from 'obsidian';
import { detectLanguage } from './detection';
import { addCodeBlock } from './codeblock';
import { migrateLanguageSettings } from './settings-data';
import { CodeBlockPluginSettings, CodeBlockTab, DEFAULT_SETTINGS } from './settings';

export default class CodeBlockPlugin extends Plugin {
	settings: CodeBlockPluginSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'Add code block',
			name: 'Add code block',
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				if (selection.length === 0) {
					const pos = editor.getCursor();
					editor.replaceRange('```\n\n```\n', pos);
					editor.setCursor(pos.line + 1);
					return;
				}
				editor.replaceSelection(addCodeBlock(this.getLanguage(selection), selection));
			},
		});

		this.addCommand({
			id: 'Paste code block',
			name: 'Paste code block',
			editorCallback: (editor: Editor) => {
				navigator.clipboard.readText()
					.then((text) => editor.replaceSelection(addCodeBlock(this.getLanguage(text), text)))
					.catch(() => new Notice('Could not read the clipboard'));
			},
		});

		this.addSettingTab(new CodeBlockTab(this.app, this));
	}

	private getLanguage(text: string): string {
		return detectLanguage(text, this.settings.languages);
	}

	async loadSettings() {
		const saved = await this.loadData() as Partial<CodeBlockPluginSettings> | null;
		const settings = Object.assign({}, DEFAULT_SETTINGS, saved);
		const migration = migrateLanguageSettings(settings.languages, saved?.settingsVersion);
		this.settings = {
			languages: migration.languages,
			settingsVersion: migration.settingsVersion,
		};
		if (migration.migrated) await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
