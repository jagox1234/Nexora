// SettingsScreen — migrated
import { Screen, H1, P, Card, Row, Button, Select, Spinner, AlertBanner, LocationStatus, NumberInput, Input } from '@ui/index.js';
import { ListItem, Badge } from '@ui/index.js';
import { useTheme } from '@ui/theme.js';
import { useToast } from '@ui/toast.js';
import { React, useState, useEffect } from '@v2/app/baseDependencies.js';
import { t, availableLocales, getLocale, setLocale } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';
import { useLocation } from '@v2/providers/index.js';

export default function SettingsScreen() {
	const { mode, toggleMode } = useTheme();
	const toast = useToast();
	const { role, pickRole, clearRole } = useApp();
	const loc = useLocation();
	const locale = getLocale();
	const changeLocale = async (l) => { await setLocale(l); toast?.info?.(t('language_changed')); };
	const toggleTheme = () => { toggleMode(); toast?.info?.(t('theme_changed')); };
	// geofence temp radius input state
	const [radiusTemp, setRadiusTemp] = useState(300);
	useEffect(()=> { if(loc?.geofenceRadiusMeters) setRadiusTemp(loc.geofenceRadiusMeters); }, [loc?.geofenceRadiusMeters]);
	const handleSetHere = async () => {
		if (!loc?.position?.coords) { toast?.error?.(t('location_missing')); return; }
		const r = radiusTemp && radiusTemp > 10 ? radiusTemp : 100; // mínimo sensible
		const { latitude, longitude } = loc.position.coords;
		const res = await loc.setGeofence?.({ lat:latitude, lng:longitude, radius:r });
		if (res?.ok) toast?.success?.(t('geofence_saved')); else toast?.error?.(t('geofence_error'));
	};
	const handleClear = async () => { const res = await loc.clearGeofence?.(); if(res?.ok) toast?.info?.(t('geofence_removed')); };
	return (
		<Screen scroll>
			<H1>{t('settings')}</H1>
			<Card>
				<P>{t('role_title')}: {role || '—'}</P>
				<Row>
					<Button title={t(role==='business' ? 'business_active':'switch_business')} onPress={()=> { if(role!=='business'){ pickRole('business'); toast?.info?.(t('role_changed')); } }} />
				</Row>
				<Row>
					<Button title={t(role==='client' ? 'client_active':'switch_client')} onPress={()=> { if(role!=='client'){ pickRole('client'); toast?.info?.(t('role_changed')); } }} />
				</Row>
				<Row>
					<Button title={t('reset_role')} onPress={()=> { clearRole(); toast?.info?.(t('role_changed')); }} />
				</Row>
			</Card>
			<Card>
				<P>{t('theme_mode')}: {mode}</P>
				<Button title={t('toggle_theme')} onPress={toggleTheme} />
			</Card>
			<Card>
				<P>{t('language')}</P>
				<Row>
					<Select value={locale} onChange={changeLocale} options={availableLocales().map(l => ({ label:l.toUpperCase(), value:l }))} />
				</Row>
			</Card>
			<Card>
				<P>{t('location')}</P>
				{loc?.status==='denied' && <AlertBanner type='warning' title={t('location_denied')} />}
				{loc?.status==='error' && <AlertBanner type='danger' title={t('location_error')} message={loc?.error} />}
				<LocationStatus loc={loc} t={t} />
				<Row gap={1} style={{ marginTop:8 }}>
					<Button title={t('location_request')} variant='outline' onPress={() => loc?.getCurrent()} />
					<Button title={t('location_refresh')} onPress={() => loc?.getCurrent()} disabled={loc?.status==='requesting'} />
					<Button title={loc?.isWatching? t('gps_stop') : t('gps_watch')} variant={loc?.isWatching? 'danger':'outline'} onPress={() => { loc?.isWatching ? loc?.stopWatch?.() : loc?.watch?.(); }} />
				</Row>
				{loc?.lastUpdated && !loc?.isStale && <P muted size='sm' style={{ marginTop:4 }}>{t('gps_last_update')}: {new Date(loc.lastUpdated).toLocaleTimeString()}</P>}
				{loc?.isStale && <P size='sm' style={{ marginTop:4, color:'#d97706' }}>{t('gps_stale')} · {t('gps_last_update')}: {new Date(loc.lastUpdated).toLocaleTimeString()}</P>}
				{loc?.status==='requesting' && <Row style={{ marginTop:12 }}><Spinner /></Row>}
			</Card>
			{role==='business' && (
				<>
				<Card>
					<P style={{ marginBottom:8 }}>{t('geofence_title')}</P>
					{loc?.geofenceCenter ? (
						<P muted>{t('geofence_radius')}: {loc.geofenceRadiusMeters}m · {t('distance')}: {loc.distanceMeters != null ? Math.round(loc.distanceMeters) : '—'}m · {loc.isInsideGeofence ? t('geofence_in') : t('geofence_out')}</P>
					) : <P muted>{t('geofence_none')}</P>}
					<Row gap={1} style={{ marginTop:8, flexWrap:'wrap' }}>
						<NumberInput placeholder={t('geofence_radius')} value={loc?.geofenceRadiusMeters || radiusTemp} onChangeNumber={(v)=> setRadiusTemp(v)} style={{ flex:1, minWidth:140 }} />
						<Button size='sm' variant='outline' title={t('geofence_set_here')} onPress={() => handleSetHere()} />
						{loc?.geofenceCenter && <Button size='sm' variant='danger' title={t('geofence_clear')} onPress={()=> handleClear()} />}
					</Row>
				</Card>
				<Card>
					<P style={{ marginBottom:8 }}>{t('geofences')}</P>
					{!loc?.geofences?.length ? <P muted>{t('no_geofences')}</P> : loc.geofences.slice(0,10).map(g => (
						<ListItem key={g.id}
							title={g.label || g.id}
							subtitle={`${Math.round(g.radius)}m`}
							right={
								<Row gap={0.5}>
									{loc.activeGeofenceId===g.id && <Badge label={t('active')} variant='success' />}
									<Button size='xs' variant='outline' title={t('activate')} onPress={()=> loc.activateGeofence?.(g.id)} />
									<Button size='xs' variant='outline' title='✎' onPress={()=> {
										const name = prompt?.('New name', g.label || '');
										if(name) loc.updateGeofence?.(g.id,{ label:name });
									}} />
									<Button size='xs' variant='danger' title={t('remove')} onPress={()=> loc.removeGeofence?.(g.id)} />
								</Row>
							}
						/>
					))}
					<Row gap={1} style={{ marginTop:8 }}>
						<Button size='sm' title={t('add_geofence')} variant='outline' onPress={()=> {
							if(!loc?.position?.coords){ toast?.error?.(t('location_missing')); return; }
							const { latitude, longitude } = loc.position.coords;
							loc.addGeofence?.({ lat:latitude, lng:longitude, radius: radiusTemp||100, label: 'GF '+new Date().toLocaleTimeString() });
						}} />
						<Button size='sm' variant='danger' title='Clear all' onPress={()=> loc.clearGeofences?.()} />
					</Row>
				</Card>
				</>
			)}
			<Card>
				<P muted>{t('settings_placeholder')}</P>
			</Card>
		</Screen>
	);
}
