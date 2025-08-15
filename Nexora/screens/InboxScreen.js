// InboxScreen — migrated from 5_inbox_screen.js
import { React } from '@app/2_dependencies.js';
import { Screen, H1, P, Card } from '@ui/index.js';
import { t } from '@v2/core/i18n.js';

export default function InboxScreen() {
	return (
		<Screen>
			<H1>{t('inbox')}</H1>
			<Card>
				<P muted>{t('inbox_empty')}</P>
			</Card>
		</Screen>
	);
}
