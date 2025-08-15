// InboxScreen — migrated
import { Screen, H1, P, Card, SectionTitle, EmptyState, ListItem, Badge, Button, Row } from '@ui/index.js';
import { React } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useTheme } from '@v2/ui/theme.js';
import { useApp } from '@v2/core/index.js';

export default function InboxScreen() {
	useTheme();
	const { role, requestsAdvanced = [], updateRequestStatus, removeAdvancedRequest, currentBusinessId } = useApp();
	const unified = [...requestsAdvanced.map(r => ({ ...r, _kind:'adv' }))]
		.filter(r => !currentBusinessId || r.businessId===currentBusinessId || r.businessId==null)
		.sort((a,b)=> (a.createdAt||'').localeCompare(b.createdAt||''));
	return (
		<Screen gradient scroll>
			<H1>{t('inbox')}</H1>
			<Card>
				<SectionTitle>Requests</SectionTitle>
				{!unified.length && <EmptyState title='No requests' />}
				{unified.map(r => (
					<ListItem key={r.id}
						title={`${r.clientName||'Client'} · ${r.serviceName||r.serviceId||'Service'}`}
						subtitle={`${r.status} · ${r.whenISO? r.whenISO.split('T')[0]:'—'}${r._kind==='legacy'?' · legacy':''}`}
						right={<Row gap={6}>
							{r.status!=='confirmed' && <Button size='xs' title='Confirm' variant='outline' onPress={()=> updateRequestStatus(r.id,'confirmed')} />}
							<Button size='xs' title='Del' variant='ghost' onPress={()=> removeAdvancedRequest(r.id)} />
						</Row>}
					/>
				))}
			</Card>
		</Screen>
	);
}
