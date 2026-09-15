import { App, PluginSettingTab, Setting } from 'obsidian';
import hljs from 'highlight.js/lib/common';
import type CodeBlockPlugin from './main';
import { toggleLanguage } from './codeblock';

export interface CodeBlockPluginSettings {
	languages: string[];
}

export const DEFAULT_SETTINGS: CodeBlockPluginSettings = {
	languages: hljs.listLanguages(),
};

export class CodeBlockTab extends PluginSettingTab {
	plugin: CodeBlockPlugin;

	constructor(app: App, plugin: CodeBlockPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Active programming languages')
			.setHeading();

		hljs.listLanguages().sort().forEach((language) => {
			new Setting(containerEl)
				.setName(language)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.languages.includes(language))
					.onChange(enabled => {
						this.plugin.settings.languages = toggleLanguage(this.plugin.settings.languages, language, enabled);
						void this.plugin.saveSettings();
					}));
		});
	}
}
