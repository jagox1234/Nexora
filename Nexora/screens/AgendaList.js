// AgendaList — moved from 5_agenda_list.js
import { React, useState, View, Text } from '@app/2_dependencies.js';
import { Screen, Card, H1, H2, P, Row, Button, Input, Divider, Spacer } from '@ui/index.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';
import { fmtTime } from '@v2/core/index.js';
const fmtDate = (d) => new Date(d).toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' });

export default function AgendaList({ navigation }) {
	const { getBookingsByDate, services, getClient, getService, confirmBooking, cancelBooking } = useApp();
	const [base, setBase] = useState(new Date());
	const [serviceFilter, setServiceFilter] = useState('');
	const [clientQuery, setClientQuery] = useState('');
	const dayList = [...Array(7)].map((_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); d.setHours(0,0,0,0); return d; });
	const matchesClient = (b) => { if (!clientQuery) return true; const c = getClient(b.clientId); const q = clientQuery.toLowerCase(); return c?.name?.toLowerCase().includes(q) || c?.phone?.includes(q); };
	const matchesService = (b) => !serviceFilter || b.serviceId === serviceFilter;
	return (
		<Screen>
			<H1>{t('agenda')}</H1>
			<Card>
				<H2>{t('filters')}</H2>
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
					<H2>{fmtDate(d)}</H2>
					{!list.length ? (<P muted>{t('no_bookings')}</P>) : list.map(b => { const s=getService(b.serviceId); const c=getClient(b.clientId); return (
						<View key={b.id} style={{ marginBottom:8 }}>
							<Row justify='space-between' align='center'>
								<View style={{ flex:1 }}>
									<P><Text style={{ fontWeight:'700' }}>{s?.name || 'Service'}</Text> · {fmtTime(b.startsAt)}</P>
									<P muted>{c?.name || 'Client'} · {c?.phone || '—'}</P>
									<P muted>{t('status')}: {b.status}</P>
								</View>
								<View style={{ width:160 }}>
									<Button title={t('confirm_btn')} onPress={()=>confirmBooking(b.id)} />
									<Button title={t('cancel_btn')} variant='danger' onPress={()=>cancelBooking(b.id)} />
								</View>
							</Row>
							<Divider />
						</View>
					); })}
				</Card>
			); })}
			<Button title={t('new_booking')} onPress={()=> navigation.navigate('booking_create')} />
		</Screen>
	);
}
