// ServicesScreen — moved from 5_services_screen.js
import { React, useState, View } from '@app/2_dependencies.js';
import { Screen, Card, H1, H2, P, Input, Button, Row, EmptyState } from '@ui/index.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';
import { UIHeader } from '@v2/ui/components.js';

export default function ServicesScreen() {
	const { services, addService, removeService } = useApp();
	const [query, setQuery] = useState('');
	const [name, setName] = useState(''), [price, setPrice] = useState(''), [duration, setDuration] = useState('');
	const filtered = services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
	const onSave = () => {
		if (!name || !price || !duration) { if (typeof globalThis!=='undefined' && globalThis.alert) globalThis.alert(t('please_fill_all')); return; }
		addService({ name, price:Number(price), durationMin:Number(duration), active:true });
		setName(''); setPrice(''); setDuration('');
	};
	return (
		<Screen>
			<UIHeader title={t('services_title')} subtitle={t('manage_offerings')} rightActions={[]} />
			<Input placeholder={t('search_service_placeholder')} value={query} onChangeText={setQuery} />
			<Card>
				<H2>{t('new_service')}</H2>
				<Row gap={2}>
					<View style={{ flex: 2 }}><Input placeholder={t('service')} value={name} onChangeText={setName} /></View>
					<View style={{ flex: 1 }}><Input placeholder='Price (€)' keyboardType='numeric' value={price} onChangeText={setPrice} /></View>
					<View style={{ flex: 1 }}><Input placeholder='Duration (min)' keyboardType='numeric' value={duration} onChangeText={setDuration} /></View>
				</Row>
				<Button title={t('save_service')} onPress={onSave} />
			</Card>
			{!filtered.length ? (
				<EmptyState title={t('no_services')} subtitle={t('no_services_hint')} />
			) : (
				filtered.map(s => (
					<Card key={s.id}>
						<Row justify='space-between' align='center'>
							<View>
								<H2>{s.name}</H2>
								<P muted>{s.durationMin} min · {s.price} €</P>
							</View>
							<Button title={t('delete')} variant='danger' onPress={()=>removeService(s.id)} />
						</Row>
					</Card>
				))
			)}
		</Screen>
	);
}
