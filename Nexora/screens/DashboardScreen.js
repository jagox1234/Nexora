// DashboardScreen — implementation moved from 5_dashboard_screen.js (numeric file removed)
import { React, useState, View, Text, Alert } from '@app/2_dependencies.js';
import { Screen, Card, H1, H2, P, Row, Button, Spacer, Divider, useTheme, useToast, useModal } from '@ui/index.js';
import { t } from '@v2/core/i18n.js';
import { safeArray, fmtTime, findServiceName } from '@v2/core/index.js';
import { useApp } from '@v2/core/index.js';

export default function DashboardScreen({ navigation }) {
	const theme = useTheme();
	const toast = useToast?.();
	const modal = useModal?.();

	const {
		role,
		clinic,
		services = [],
		bookings = [],
		clientRequests = [],
		addService,
		createBooking,
		confirmBooking,
		cancelBooking,
	} = useApp();

	const now = new Date();
	const todayStr = new Date().toDateString();

	const todays = safeArray(bookings).filter((b) => {
		try { return new Date(b?.startsAt).toDateString() === todayStr; } catch { return false; }
	});

	const counts = {
		today: todays.length,
		confirmedToday: todays.filter((b) => b?.status === 'confirmed').length,
		pendingToday: todays.filter((b) => b?.status === 'pending').length,
		cancelledToday: todays.filter((b) => b?.status === 'cancelled').length,
		services: safeArray(services).filter((s) => s?.active !== false).length,
		requests: safeArray(clientRequests).length,
	};

	const nextUp = safeArray(bookings)
		.filter((b) => {
			try { return new Date(b?.startsAt).getTime() >= now.getTime(); } catch { return false; }
		})
		.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
		.slice(0, 5);

	const go = (name) => { try { navigation?.navigate?.(name); } catch {} };

	const quickAddService = async () => {
		const id = Date.now() % 1000;
		await addService?.({
			name: `Service #${id}`,
			price: 50 + (id % 50),
			durationMin: 30 + (id % 30),
			active: true,
		});
		toast?.success?.('Sample service added');
	};

	const quickCreateBooking = () => {
		if (!services?.length) { toast?.error?.('Add a service first'); return; }
		const serviceId = services[0]?.id || 'srv_demo';
		const d = new Date(Date.now() + 60 * 60 * 1000);
		const res = createBooking?.({ serviceId, clientName: 'Walk-in', clientPhone: '000', whenISO: d.toISOString() });
		if (res?.ok) toast?.success?.('Demo booking +60min created'); else toast?.error?.(res?.error || 'Could not create booking');
	};

	const confirmFirstPending = () => {
		const pending = safeArray(bookings).find((b) => b?.status === 'pending');
		if (!pending) { toast?.info?.('No pending bookings'); return; }
		confirmBooking?.(pending.id);
		toast?.success?.('First pending confirmed');
	};

	const cancelFirstToday = () => {
		const anyToday = todays[0];
		if (!anyToday) { toast?.info?.('No bookings today'); return; }
		if (modal?.confirm) {
			modal.confirm({
				title: 'Cancel booking',
				message: `${findServiceName(services, anyToday?.serviceId)} @ ${fmtTime(anyToday?.startsAt)}?`,
				confirmText: 'Cancel',
				onConfirm: () => { cancelBooking?.(anyToday.id); toast?.info?.('Booking cancelled'); },
			});
		} else {
			cancelBooking?.(anyToday.id); toast?.info?.('Booking cancelled');
		}
	};

	return (
		<Screen>
			<H1>{t('dashboard')}</H1>
			<Card>
				<H2>{role === 'business' ? t('dashboard_overview') : t('dashboard_welcome')}</H2>
				{role === 'business' ? (
					<>
						<P>
							{clinic?.name || 'Your business'} · <P muted style={{ fontWeight: '700' }}>{clinic?.timezone || 'Timezone not set'}</P>
						</P>
						<Spacer h={1} />
						<Row gap={2}>
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
						<Row gap={2}>
							<Button title={t('explore')} onPress={() => go('explore')} />
							<Button title={t('my_bookings')} variant="outline" onPress={() => go('my')} />
							<Button title={t('settings_title')} variant="outline" onPress={() => go('settings')} />
						</Row>
					</>
				)}
			</Card>
			<Card>
				<H2>{t('today_label')}</H2>
				<Row gap={2}>
					<StatBox label={t('kpi_bookings')} value={counts.today} />
					<StatBox label={t('kpi_confirmed')} value={counts.confirmedToday} />
					<StatBox label={t('kpi_pending')} value={counts.pendingToday} />
					<StatBox label={t('kpi_cancelled')} value={counts.cancelledToday} />
				</Row>
				<Spacer h={1} />
				<Row gap={2}>
					<StatBox label={t('kpi_active_services')} value={counts.services} />
					<StatBox label={t('kpi_requests')} value={counts.requests} />
				</Row>
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
				<H2>{t('upcoming')}</H2>
				{!nextUp.length ? <P muted>{t('upcoming_none')}</P> : nextUp.map(b => (
					<P key={b.id}>• {fmtTime(b?.startsAt)} — {findServiceName(services, b?.serviceId)} {b?.status ? `(${b.status})` : ''}</P>
				))}
			</Card>
			<Card>
				<H2>{t('tips')}</H2>
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
