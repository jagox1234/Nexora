// MyBookingsScreen — migrated
import { Screen, H1, P, Card, SectionTitle, EmptyState } from '@ui/index.js';
import { React } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';
import { fmtTime } from '@v2/core/index.js';

export default function MyBookingsScreen() {
	const { bookings, getService } = useApp();
	return (
		<Screen gradient scroll>
			<H1>{t('my_bookings')}</H1>
			{!bookings.length && <Card><EmptyState title={t('no_bookings')} /></Card>}
			{bookings.map(b => { const s=getService(b.serviceId); return (
				<Card key={b.id}>
					<SectionTitle>{s?.name || t('service')}</SectionTitle>
					<P>{fmtTime(b.startsAt)}</P>
					<P muted>{t('status')}: {b.status}</P>
				</Card>
			); })}
		</Screen>
	);
}
