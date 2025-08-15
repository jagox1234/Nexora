// BookingCreate — migrated
import { Screen, Card, H1, H2, P, Row, Button, Input, Spacer, Select, SectionTitle } from '@ui/index.js';
import { useToast } from '@ui/toast.js';
import { React, useState, Alert } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useApp, useTheme } from '@v2/core/index.js';
import { fmtTime } from '@v2/core/index.js';
// Use unified gradient via Screen

export default function BookingCreate({ navigation }) {
	useTheme();
	const { services, staff, availability, createBooking, generateSlots, isOverlapping, generateStaffSlotsForService } = useApp();
	const toast = useToast();
	const [serviceId, setServiceId] = useState(services[0]?.id || '');
	const [clientName, setClientName] = useState('');
	const [clientPhone, setClientPhone] = useState('');
	const [dateBase, setDateBase] = useState(new Date());
	const [when, setWhen] = useState('');
	const [slots, setSlots] = useState([]);
	const [staffId, setStaffId] = useState(staff[0]?.id || '');
	const [useStaff, setUseStaff] = useState(false);
	const refresh = React.useCallback(() => {
		if (!serviceId) { setSlots([]); return; }
		if (useStaff && staffId) {
			setSlots(generateStaffSlotsForService({ dateBase, serviceId, staffId }));
		} else {
			setSlots(generateSlots(dateBase, serviceId));
		}
	}, [serviceId, dateBase, generateSlots, useStaff, staffId, generateStaffSlotsForService]);
	React.useEffect(() => { refresh(); }, [refresh]);
	const pickDay = (days) => { const d=new Date(); d.setDate(d.getDate()+days); d.setHours(0,0,0,0); setDateBase(d); };
	const onCreate = () => {
		if (!serviceId || !clientPhone || !when) return Alert.alert(t('missing_fields'), t('missing_booking_fields'));
		if (isOverlapping(when, serviceId)) return Alert.alert(t('overlap'), t('overlap_msg'));
		const res = createBooking({ serviceId, clientName, clientPhone, whenISO: when });
		if (!res.ok) {
			let msg = res.error;
			if (res.error === 'in_past') msg = t('error_in_past') || 'Time already passed';
			else if (res.error === 'invalid_date') msg = t('error_invalid_date') || 'Invalid date';
			return Alert.alert(t('error'), msg);
		}
		toast?.success?.(t('booking_created_msg'));
		navigation.goBack();
	};
	return (
		<Screen gradient scroll>
				<H1>{t('new_booking')}</H1>
				<Card>
					<SectionTitle>{t('service')}</SectionTitle>
					{services.map(s => (
						<Button key={s.id} title={`${s.name} · ${s.durationMin}m`} variant={serviceId===s.id?'primary':'outline'} onPress={()=>setServiceId(s.id)} />
					))}
				</Card>
				{staff.length ? (
					<Card>
						<SectionTitle>Staff & Slots</SectionTitle>
						<Row gap={2}>
							<Select value={staffId} onChange={setStaffId} options={staff.map(s=>({ label:s.name, value:s.id }))} />
							<Button title={useStaff? 'Using staff availability':'Generic slots'} variant='outline' onPress={()=> setUseStaff(u=> !u)} />
						</Row>
					</Card>
				): null}
				<Card>
					<SectionTitle>{t('day')}</SectionTitle>
					<Select
						value={'d0'}
						onChange={(v)=>{ const map={d0:0,d1:1,d7:7}; pickDay(map[v]||0); }}
						options={[{label:t('today'),value:'d0'},{label:t('tomorrow'),value:'d1'},{label:'+7',value:'d7'}]}
					/>
					<P muted style={{ marginTop: 8 }}>Selected: {dateBase.toDateString()}</P>
				</Card>
				<Card>
					<SectionTitle>{t('available_slots')}</SectionTitle>
					<Row gap={1} justify='flex-start' align='center' wrap>
						{slots.slice(0,60).map(iso => (
							<Button key={iso} size='sm' variant={when===iso?'primary':'outline'} title={fmtTime(iso)} onPress={()=>setWhen(iso)} />
						))}
					</Row>
					<P muted style={{ marginTop: 8 }}>{t('selected_time')}: {when? new Date(when).toLocaleString() : '—'}</P>
				</Card>
				<Card>
					<SectionTitle>{t('client')}</SectionTitle>
					<Input placeholder='Name (optional)' value={clientName} onChangeText={setClientName} />
					<Input placeholder='Phone' keyboardType='phone-pad' value={clientPhone} onChangeText={setClientPhone} />
				</Card>
				<Button title={t('create_booking')} onPress={onCreate} />
				<Spacer h={2} />
		</Screen>
	);
}
