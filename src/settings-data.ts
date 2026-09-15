export const LANGUAGE_SETTINGS_VERSION = 1;

export const migrateLanguageSettings = (languages: readonly string[], settingsVersion = 0): {
	languages: string[];
	settingsVersion: number;
	migrated: boolean;
} => {
	if (settingsVersion >= LANGUAGE_SETTINGS_VERSION) {
		return { languages: [...languages], settingsVersion, migrated: false };
	}
	return {
		languages: [...new Set([...languages, 'cypher'])],
		settingsVersion: LANGUAGE_SETTINGS_VERSION,
		migrated: true,
	};
};
