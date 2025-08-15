// BookingCreate — moved from 5_booking_create.js
import { React, useState, View, Alert } from '@app/2_dependencies.js';
import { Screen, Card, H1, H2, P, Row, Button, Input, Spacer } from '@ui/index.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';
import { fmtTime } from '@v2/core/index.js';

export default function BookingCreate({ navigation }) {
	const { services, createBooking, generateSlots, isOverlapping } = useApp();
	const [serviceId, setServiceId] = useState(services[0]?.id || '');
	const [clientName, setClientName] = useState('');
	const [clientPhone, setClientPhone] = useState('');
	const [dateBase, setDateBase] = useState(new Date());
	const [when, setWhen] = useState('');
	const [slots, setSlots] = useState([]);
	const refresh = React.useCallback(() => { setSlots(serviceId ? generateSlots(dateBase, serviceId) : []); }, [serviceId, dateBase, generateSlots]);
	React.useEffect(() => { refresh(); }, [refresh]);
	const pickDay = (days) => { const d=new Date(); d.setDate(d.getDate()+days); d.setHours(0,0,0,0); setDateBase(d); };
	const onCreate = () => {
		if (!serviceId || !clientPhone || !when) return Alert.alert(t('missing_fields'), t('missing_booking_fields'));
		if (isOverlapping(when, serviceId)) return Alert.alert(t('overlap'), t('overlap_msg'));
		const res = createBooking({ serviceId, clientName, clientPhone, whenISO: when });
		if (!res.ok) return Alert.alert('Error', res.error || 'Could not create booking');
		Alert.alert(t('booking_created'), t('booking_created_msg'));
		navigation.goBack();
	};
	return (
		<Screen>
			<H1>{t('new_booking')}</H1>
			<Card>
				<H2>{t('service')}</H2>
				{services.map(s => (
					<Button key={s.id} title={`${s.name} · ${s.durationMin}m`} variant={serviceId===s.id?'primary':'outline'} onPress={()=>setServiceId(s.id)} />
				))}
			</Card>
			<Card>
				<H2>{t('day')}</H2>
				<Row gap={2}>
					<View style={{ flex:1 }}><Button title={t('today')} onPress={()=>pickDay(0)} /></View>
					<View style={{ flex:1 }}><Button title={t('tomorrow')} variant='outline' onPress={()=>pickDay(1)} /></View>
					<View style={{ flex:1 }}><Button title={t('plus_7d')} variant='outline' onPress={()=>pickDay(7)} /></View>
				</Row>
				<P muted style={{ marginTop: 8 }}>Selected: {dateBase.toDateString()}</P>
			</Card>
			<Card>
				<H2>{t('available_slots')}</H2>
				<Row gap={1} justify='flex-start' align='center'>
					{slots.slice(0,60).map(iso => (
						<Button key={iso} size='sm' variant={when===iso?'primary':'outline'} title={fmtTime(iso)} onPress={()=>setWhen(iso)} />
					))}
				</Row>
				<P muted style={{ marginTop: 8 }}>{t('selected_time')}: {when? new Date(when).toLocaleString() : '—'}</P>
			</Card>
			<Card>
				<H2>{t('client')}</H2>
				<Input placeholder='Name (optional)' value={clientName} onChangeText={setClientName} />
				<Input placeholder='Phone' keyboardType='phone-pad' value={clientPhone} onChangeText={setClientPhone} />
			</Card>
			<Button title={t('create_booking')} onPress={onCreate} />
			<Spacer h={2} />
		</Screen>
	);
}
