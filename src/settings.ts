import { App, PluginSettingTab, Setting } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import hljs from './highlighter.ts';
import type CodeBlockPlugin from './main';
import { toggleLanguage } from './codeblock';

export interface CodeBlockPluginSettings {
	languages: string[];
	settingsVersion: number;
}

export const DEFAULT_SETTINGS: CodeBlockPluginSettings = {
	languages: hljs.listLanguages(),
	settingsVersion: 1,
};

export class CodeBlockTab extends PluginSettingTab {
	plugin: CodeBlockPlugin;

	constructor(app: App, plugin: CodeBlockPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [{
			type: 'group',
			heading: 'Active programming languages',
			search: {
				placeholder: 'Filter languages…',
				match: (def, query) => def.name.toLowerCase().includes(query.toLowerCase()),
			},
			items: hljs.listLanguages().sort().map((language) => ({
				name: language,
				control: {
					type: 'toggle' as const,
					key: language,
				},
			})),
		}];
	}

	getControlValue(key: string): unknown {
		return this.plugin.settings.languages.includes(key);
	}

	setControlValue(key: string, value: unknown): void {
		this.plugin.settings.languages = toggleLanguage(
			this.plugin.settings.languages,
			key,
			value as boolean,
		);
		void this.plugin.saveSettings();
	}

	display(): void {
		// Legacy fallback for Obsidian < 1.13.0
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
