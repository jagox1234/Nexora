// SettingsScreen — migrated from 5_settings_screen.js
import { React, View } from '@app/2_dependencies.js';
import { Screen, H1, P, Card, Row, Button, Select } from '@ui/index.js';
import { useTheme } from '@ui/theme.js';
import { t, availableLocales, useI18n } from '@v2/core/i18n.js';

export default function SettingsScreen() {
	const { mode, toggle } = useTheme();
	const { locale, setLocale } = useI18n();
	return (
		<Screen>
			<H1>{t('settings')}</H1>
			<Card>
				<P>{t('theme_mode')}: {mode}</P>
				<Button title={t('toggle_theme')} onPress={toggle} />
			</Card>
			<Card>
				<P>{t('language')}</P>
				<Row>
					<Select value={locale} onChange={setLocale} options={availableLocales().map(l => ({ label:l, value:l }))} />
				</Row>
			</Card>
			<Card>
				<P muted>{t('settings_placeholder')}</P>
			</Card>
		</Screen>
	);
}
