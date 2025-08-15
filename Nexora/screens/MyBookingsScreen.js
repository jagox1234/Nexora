// MyBookingsScreen — migrated from 5_my_bookings_screen.js
import { React } from '@app/2_dependencies.js';
import { Screen, H1, P, Card } from '@ui/index.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';
import { fmtTime } from '@v2/core/index.js';

export default function MyBookingsScreen() {
	const { bookings, services, getService } = useApp();
	// For now show all bookings; later filter by current user when auth added
	return (
		<Screen>
			<H1>{t('my_bookings')}</H1>
			{!bookings.length && <P muted>{t('no_bookings')}</P>}
			{bookings.map(b => { const s=getService(b.serviceId); return (
				<Card key={b.id}>
					<P>{s?.name || t('service')} · {fmtTime(b.startsAt)}</P>
					<P muted>{t('status')}: {b.status}</P>
				</Card>
			); })}
		</Screen>
	);
}
