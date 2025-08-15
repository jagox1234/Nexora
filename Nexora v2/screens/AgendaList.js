// AgendaList — migrated
import { Screen, Card, H1, H2, P, Row, Button, Input, Spacer, ListItem, Badge, SectionTitle, EmptyState } from '@ui/index.js';
import { React, useState, View } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useApp, fmtTime } from '@v2/core/index.js';
import { useTheme } from '@v2/ui/theme.js';
const fmtDate = (d) => new Date(d).toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' });

export default function AgendaList({ navigation }) {
	useTheme();
	const { getBookingsByDate, services, getClient, getService, confirmBooking, cancelBooking } = useApp();
	const [base, setBase] = useState(new Date());
	const [serviceFilter, setServiceFilter] = useState('');
	const [clientQuery, setClientQuery] = useState('');
	const dayList = [...Array(7)].map((_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); d.setHours(0,0,0,0); return d; });
	const matchesClient = (b) => { if (!clientQuery) return true; const c = getClient(b.clientId); const q = clientQuery.toLowerCase(); return c?.name?.toLowerCase().includes(q) || c?.phone?.includes(q); };
	const matchesService = (b) => !serviceFilter || b.serviceId === serviceFilter;
	return (
		<Screen gradient scroll>
				<H1>{t('agenda')}</H1>
				<Card>
					<SectionTitle>{t('filters')}</SectionTitle>
					<Row gap={2}>
						<View style={{ flex: 1 }}><Input placeholder={t('search_client_placeholder')} value={clientQuery} onChangeText={setClientQuery} /></View>
					</Row>
					<Row gap={2}>
						{services.map(s => (
							<View key={s.id} style={{ flex:1 }}>
								<Button title={s.name} variant={serviceFilter===s.id?'primary':'outline'} size='sm' onPress={()=> setServiceFilter(p=> p===s.id? '' : s.id)} />
							</View>
						))}
					</Row>
				</Card>
				<Row gap={2}>
					<View style={{ flex:1 }}>
						<Button title={t('today')} onPress={()=>{ const d=new Date(); d.setHours(0,0,0,0); setBase(d); }} />
					</View>
					<View style={{ flex:1 }}>
						<Button title={t('plus_7d')} variant='outline' onPress={()=>{ const d=new Date(base); d.setDate(d.getDate()+7); setBase(d); }} />
					</View>
				</Row>
				<Spacer h={1} />
				{dayList.map(d => { const list = getBookingsByDate(d).filter(b => matchesService(b) && matchesClient(b)); return (
					<Card key={d.toISOString()}>
						<SectionTitle>{fmtDate(d)}</SectionTitle>
						{!list.length ? (<EmptyState title={t('no_bookings')} />) : list.map(b => { const s=getService(b.serviceId); const c=getClient(b.clientId); const badgeVariant = b.status==='confirmed'?'success': b.status==='cancelled'?'danger':'outline'; return (
							<ListItem key={b.id}
								title={`${s?.name || 'Service'} · ${fmtTime(b.startsAt)}`}
								subtitle={`${c?.name || 'Client'} · ${c?.phone || '—'}`}
								right={<View style={{ flexDirection:'row' }}>
									<Badge label={b.status} variant={badgeVariant} />
									<View style={{ width:8 }} />
									<Button title={t('confirm_btn')} size='sm' onPress={()=>confirmBooking(b.id)} />
									<Button title={t('cancel_btn')} size='sm' variant='danger' onPress={()=>cancelBooking(b.id)} />
								</View>}
							/>
						); })}
					</Card>
				); })}
				<Button title={t('new_booking')} onPress={()=> navigation.navigate('booking_create')} />
		</Screen>
	);
}
