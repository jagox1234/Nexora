// ExploreBusinessesScreen — upgraded with map & filters (client mode discovery)
import { Screen, H1, Input, Card, P, Button, ListItem, SectionTitle, EmptyState, Row, Select, Spacer, Badge, NumberInput } from '@ui/index.js';
import { View } from 'react-native';
import { React, useState, useMemo } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';
import { useLocation } from '@v2/providers/location.js';
import MapView from '../../src/components/MapView';

// Local haversine distance (km)
function distanceKm(a, b) {
	if (!a || !b) return null;
	const R = 6371;
	const dLat = (b.lat - a.lat) * Math.PI / 180;
	const dLon = (b.lng - a.lng) * Math.PI / 180;
	const lat1 = a.lat * Math.PI / 180;
	const lat2 = b.lat * Math.PI / 180;
	const h = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(lat1) * Math.cos(lat2);
	return 2 * R * Math.asin(Math.sqrt(h));
}

export default function ExploreBusinessesScreen({ navigation }) {
	const { businesses } = useApp();
	const loc = useLocation?.();
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('all');
	const [maxKm, setMaxKm] = useState(25); // default 25km radius filter
	const [mode, setMode] = useState('map'); // 'map' | 'list'

	const userPoint = loc?.position?.coords ? { lat: loc.position.coords.latitude, lng: loc.position.coords.longitude } : null;

	const categories = useMemo(() => ['all', ...Array.from(new Set(businesses.map(b=>b.category))).sort()], [businesses]);

	const enriched = useMemo(() => businesses.map(b => {
		const d = (userPoint && b.lat && b.lng) ? distanceKm(userPoint, { lat: b.lat, lng: b.lng }) : null;
		return { ...b, distanceKm: d };
	}), [businesses, userPoint]);

	const filtered = enriched.filter(b => {
		if (query && !b.name.toLowerCase().includes(query.toLowerCase())) return false;
		if (category !== 'all' && b.category !== category) return false;
		if (userPoint && b.distanceKm != null && maxKm && b.distanceKm > maxKm) return false;
		return true;
	}).sort((a,b)=> (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

	// Center map: user location or first business fallback
	const initialRegion = userPoint ? {
		latitude: userPoint.lat,
		longitude: userPoint.lng,
		latitudeDelta: 0.2,
		longitudeDelta: 0.2,
	} : (businesses[0] ? {
		latitude: businesses[0].lat || 40.4168,
		longitude: businesses[0].lng || -3.7038,
		latitudeDelta: 2,
		longitudeDelta: 2,
	} : { latitude: 40.4168, longitude: -3.7038, latitudeDelta: 2, longitudeDelta: 2 });

	return (
		<Screen gradient scroll={mode==='list'}>
			<H1>{t('explore')}</H1>
			<Card>
				<SectionTitle>{t('filters')}</SectionTitle>
				<Input placeholder={t('search_business_placeholder')} value={query} onChangeText={setQuery} />
				<Row gap={2} style={{ marginTop: 8 }}>
					<Select value={category} onChange={setCategory} options={categories.map(c=>({ label: c==='all'? t('filter_category_all'): c, value:c }))} />
					<View style={{ flex:1 }}>
						<P size='sm' muted>{t('radius_km')}</P>
						<Row gap={0.5} align='center'>
							<NumberInput value={maxKm} onChangeNumber={(n)=> { if(!isNaN(n) && n>0 && n<=500) setMaxKm(n); }} style={{ flex:1 }} />
							<Row gap={0.5}>
								<Button size='sm' variant='outline' title='-' onPress={()=> setMaxKm(m=> Math.max(1, m-1))} />
								<Button size='sm' variant='outline' title='+' onPress={()=> setMaxKm(m=> Math.min(500, m+1))} />
							</Row>
						</Row>
					</View>
					<Button size='sm' variant='outline' title={mode==='map'? t('list_view'): t('map_view')} onPress={()=> setMode(m=> m==='map'?'list':'map')} />
				</Row>
				{userPoint ? (
					<P muted style={{ marginTop: 6 }}>{t('your_location_acquired')}</P>
				) : (
					<P muted style={{ marginTop: 6 }}>{loc?.status==='denied' ? t('location_denied'): t('location_request')}</P>
				)}
			</Card>
			{mode==='map' ? (
				<Card>
					<SectionTitle>{t('map_title')}</SectionTitle>
					{!filtered.length ? <EmptyState title={t('no_businesses')} /> : null}
					<MapView style={{ height: 340, width: '100%', borderRadius: 12 }} initialRegion={initialRegion} showsUserLocation={!!userPoint}>
						{userPoint && maxKm ? (
							<Circle center={{ latitude: userPoint.lat, longitude: userPoint.lng }} radius={maxKm * 1000} strokeColor="rgba(56,189,248,0.8)" fillColor="rgba(56,189,248,0.15)" />
						) : null}
						{loc?.geofences?.map(g => (
							<Circle key={g.id} center={{ latitude: g.center.lat, longitude: g.center.lng }} radius={g.radius} strokeColor={loc?.activeGeofenceId===g.id? 'rgba(34,197,94,0.9)':'rgba(148,163,184,0.7)'} fillColor={loc?.activeGeofenceId===g.id? 'rgba(34,197,94,0.15)':'rgba(148,163,184,0.10)'} />
						))}
						{filtered.filter(b=> b.lat && b.lng).map(b => (
							<Marker key={b.id} coordinate={{ latitude: b.lat, longitude: b.lng }} title={b.name} description={b.category}>
								<Callout onPress={()=> navigation.navigate('services') }>
									<P style={{ fontWeight:'600' }}>{b.name}</P>
									<P>{b.category}</P>
									{b.distanceKm!=null && <P>{b.distanceKm.toFixed(1)} km</P>}
									<Button size='sm' title={t('view_btn')} />
								</Callout>
							</Marker>
						))}
					</MapView>
					<Spacer h={1} />
					<Row gap={1} wrap>
						{filtered.slice(0,6).map(b=> (
							<Badge key={b.id} text={`${b.name}${b.distanceKm!=null? ' · '+b.distanceKm.toFixed(1)+'km':''}`} />
						))}
					</Row>
				</Card>
			) : (
				<Card>
					<SectionTitle>{t('results')}</SectionTitle>
					{!filtered.length ? <EmptyState title={t('no_businesses')} /> : filtered.map(b => (
						<ListItem key={b.id}
							title={b.name}
							subtitle={`${b.category}${b.distanceKm!=null? ' · '+b.distanceKm.toFixed(1)+' km':''}`}
							right={<Button title={t('view_btn')} size='sm' onPress={()=> navigation.navigate('services')} />}
						/>
					))}
				</Card>
			)}
		</Screen>
	);
}
