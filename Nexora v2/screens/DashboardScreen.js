// DashboardScreen — migrated
import { Screen, Card, H1, H2, P, Row, Button, Spacer, useTheme, useToast, useModal, Badge, ListItem, Grid, Stat, SectionTitle, EmptyState, LocationStatus } from '@ui/index.js';
import { React } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { safeArray, fmtTime, findServiceName } from '@v2/core/index.js';
import { computeAllKpis, computeStaffUtilization } from '@v2/core/kpis.js';
import { useApp } from '@v2/core/index.js';
import { useLocation } from '@v2/providers/index.js';
// Gradient now handled by Screen (gradient prop)

export default function DashboardScreen({ navigation }) {
	useTheme(); // ensure theme hook (mode no longer needed directly)
	const toast = useToast?.();
	const modal = useModal?.();
	const { role, clinic, services = [], bookings = [], clientRequests = [], requestsAdvanced = [], addService, createBooking, confirmBooking, cancelBooking, businessesAdvanced = [], currentBusinessId, setCurrentBusinessId, availability = [], staff = [] } = useApp();
	const scopedRequests = requestsAdvanced.filter(r => !currentBusinessId || r.businessId===currentBusinessId || r.businessId==null);
	const scopedLegacy = clientRequests.filter(r => !currentBusinessId || r.businessId===currentBusinessId || r.businessId==null);
	const loc = useLocation?.();
	const now = new Date();
	const todayStr = new Date().toDateString();
	const todays = safeArray(bookings).filter((b) => { try { return new Date(b?.startsAt).toDateString() === todayStr; } catch { return false; } });
	const availabilityForDay = availability.filter(a => new Date(a.date).toDateString() === todayStr && (!currentBusinessId || a.businessId===currentBusinessId));
	const totalRequestsCombined = scopedLegacy.length + scopedRequests.length;
	const counts = computeAllKpis({
		date: new Date(),
		bookings: todays,
		services,
		requests: [...scopedLegacy, ...scopedRequests],
		openingHours: clinic?.openingHours,
		availabilityForDay,
	});
	// Staff utilization (average across staff in business)
	const staffInBiz = staff.filter(s=> !currentBusinessId || s.businessId===currentBusinessId);
	let utilization = 0;
	if (staffInBiz.length) {
		const per = staffInBiz.map(st => computeStaffUtilization({ bookings: todays, availabilityForDay: availabilityForDay.filter(a=> a.staffId===st.id), services, staffId: st.id }));
		utilization = Math.round(per.reduce((a,b)=> a+b,0)/per.length);
	}
	const nextUp = safeArray(bookings).filter((b) => { try { return new Date(b?.startsAt).getTime() >= now.getTime(); } catch { return false; } }).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)).slice(0, 5);
	const go = (name) => { try { navigation?.navigate?.(name); } catch {} };
	const quickAddService = async () => { const id = Date.now() % 1000; await addService?.({ name: `Service #${id}`, price: 50 + (id % 50), durationMin: 30 + (id % 30), active: true, }); toast?.success?.('Sample service added'); };
	const quickCreateBooking = () => { if (!services?.length) { toast?.error?.('Add a service first'); return; } const serviceId = services[0]?.id || 'srv_demo'; const d = new Date(Date.now() + 60 * 60 * 1000); const res = createBooking?.({ serviceId, clientName: 'Walk-in', clientPhone: '000', whenISO: d.toISOString() }); if (res?.ok) toast?.success?.('Demo booking +60min created'); else toast?.error?.(res?.error || 'Could not create booking'); };
	const confirmFirstPending = () => { const pending = safeArray(bookings).find((b) => b?.status === 'pending'); if (!pending) { toast?.info?.('No pending bookings'); return; } confirmBooking?.(pending.id); toast?.success?.('First pending confirmed'); };
	const cancelFirstToday = () => { const anyToday = todays[0]; if (!anyToday) { toast?.info?.('No bookings today'); return; } if (modal?.confirm) { modal.confirm({ title: 'Cancel booking', message: `${findServiceName(services, anyToday?.serviceId)} @ ${fmtTime(anyToday?.startsAt)}?`, confirmText: 'Cancel', onConfirm: () => { cancelBooking?.(anyToday.id); toast?.info?.('Booking cancelled'); }, }); } else { cancelBooking?.(anyToday.id); toast?.info?.('Booking cancelled'); } };
	return (
		<Screen gradient scroll>
			<H1 style={{ marginBottom:4 }}>{t('dashboard')}</H1>
			<P muted style={{ marginBottom:16 }}>{role==='business'? t('dashboard_overview'): t('dashboard_welcome')}</P>
				<Card>
					<SectionTitle>{t('quick_nav')}</SectionTitle>
					{role === 'business' ? (
						<>
							<P>{clinic?.name || 'Your business'} · <P muted style={{ fontWeight: '700' }}>{clinic?.timezone || 'Timezone not set'}</P></P>
							{businessesAdvanced.length > 0 && (
								<Row gap={1} wrap style={{ marginTop:6 }}>
									{businessesAdvanced.slice(0,4).map(b => (
										<Button key={b.id} size='xs' variant={currentBusinessId===b.id?'primary':'outline'} title={b.name.length>10? b.name.slice(0,10)+'…': b.name} onPress={()=> setCurrentBusinessId(b.id)} />
									))}
									{businessesAdvanced.length>4 && <Badge label={`+${businessesAdvanced.length-4}`} variant='outline' />}
								</Row>
							)}
							{role==='business' && (
								<Row gap={1} style={{ marginTop:8, flexWrap:'wrap', alignItems:'center' }}>
									<LocationStatus loc={loc} t={t} />
									<Button size='sm' variant={loc?.isWatching? 'danger':'outline'} title={loc?.isWatching? t('gps_stop'):t('gps_watch')} onPress={()=> loc?.isWatching ? loc?.stopWatch?.() : loc?.watch?.()} />
								</Row>
							)}
							{role==='business' && loc?.transitionLog?.length ? (
								<Row style={{ marginTop:8 }}>
									<P muted style={{ fontSize:12 }}>{t('geofence_events')}: {loc.transitionLog.slice(0,3).map(e => `${new Date(e.ts).toLocaleTimeString()} ${e.type==='enter'? t('enter_event'): t('exit_event')}`).join(' · ')}</P>
								</Row>
							) : null}
							<Spacer h={1} />
							<Row gap={2} wrap>
								<Button title={t('agenda')} variant="outline" onPress={() => go('agenda')} />
								<Button title={t('services_title')} variant="outline" onPress={() => go('services')} />
								<Button title={t('clients_title')} variant="outline" onPress={() => go('clients')} />
								<Button title={t('inbox')} variant="outline" onPress={() => go('inbox')} />
							</Row>
						</>
					) : (
						<>
							<P muted>{t('tips_client')}</P>
							<Spacer h={1} />
							<Row gap={2} wrap>
								<Button title={t('explore')} onPress={() => go('explore')} />
								<Button title={t('my_bookings')} variant="outline" onPress={() => go('my')} />
								<Button title={t('settings_title')} variant="outline" onPress={() => go('settings')} />
							</Row>
						</>
					)}
				</Card>
				<Card>
					<SectionTitle>{t('today_label')}</SectionTitle>
					<Grid gap={1} minColWidth={140} maxCols={4}>
						<Stat label={t('kpi_bookings')} value={counts.today} />
						<Stat label={t('kpi_confirmed')} value={counts.confirmedToday} />
						<Stat label={t('kpi_pending')} value={counts.pendingToday} />
						<Stat label={t('kpi_cancelled')} value={counts.cancelledToday} />
						<Stat label={t('kpi_active_services')} value={counts.services} />
						<Stat label={t('kpi_requests')} value={counts.requests} />
						<Stat label={t('kpi_conversions')} value={counts.conversions} />
						<Stat label={t('kpi_conversion_rate')} value={counts.conversionRate + '%'} />
						<Stat label={t('kpi_fill_rate')} value={counts.fillRate + '%'} />
						{role==='business' && <Stat label={t('kpi_staff_util')} value={utilization + '%'} />}
					</Grid>
				</Card>
				{role === 'business' ? (
					<Card>
						<H2>{t('quick_actions')}</H2>
						<Row gap={2}>
							<Button title={t('add_sample_service')} variant="outline" onPress={quickAddService} />
							<Button title={t('create_booking_plus_60')} onPress={quickCreateBooking} />
						</Row>
						<Spacer h={1} />
						<Row gap={2}>
							<Button title={t('confirm_first_pending')} variant="outline" onPress={confirmFirstPending} />
							<Button title={t('cancel_first_today')} variant="danger" onPress={cancelFirstToday} />
						</Row>
					</Card>
				) : null}
				<Card>
					<SectionTitle>{t('upcoming')}</SectionTitle>
					{!nextUp.length ? <EmptyState title={t('upcoming_none')} subtitle={t('tips_business')} /> : nextUp.map(b => (
						<ListItem key={b.id}
							title={`${fmtTime(b?.startsAt)} · ${findServiceName(services, b?.serviceId)}`}
							right={<Badge label={b.status||'—'} variant={b.status==='confirmed'?'success': b.status==='cancelled'?'danger':'outline'} />}
						/>
					))}
				</Card>
				{role==='business' && (
					<Card>
						<SectionTitle>Requests (advanced)</SectionTitle>
						{!scopedRequests.length ? <P muted>No requests</P> : scopedRequests.slice(0,4).map(r => (
							<ListItem key={r.id}
								title={`${r.clientName||'Client'} · ${r.serviceName||'Service'}`}
								subtitle={`${r.status} · ${r.whenISO? fmtTime(r.whenISO):'—'}`}
							/>
						))}
						{requestsAdvanced.length>4 && <P muted size='sm'>{requestsAdvanced.length-4} more…</P>}
						<Button title='Open requests' variant='outline' onPress={()=> navigation?.navigate?.('manage',{ screen:'requests_manage' })} />
					</Card>
				)}
				<Card>
					<SectionTitle>{t('tips')}</SectionTitle>
					<P muted>{role === 'business' ? t('tips_business') : t('tips_client')}</P>
				</Card>
		</Screen>
	);
}

function StatBox({ label, value }) {
	return (
		<Card style={{ flex: 1, paddingTop: 14, paddingBottom: 14, alignItems: 'center', justifyContent: 'center' }}>
			<H2 style={{ marginBottom: 4 }}>{String(value ?? '—')}</H2>
			<P muted>{label}</P>
		</Card>
	);
}
