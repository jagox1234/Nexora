// ServicesScreen — migrated implementation
import { Screen, Card, H2, Input, Button, Row, P, ListItem, SectionTitle, EmptyState } from '@ui/index.js';
import { useToast } from '@ui/toast.js';
import { React, useState, View } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useApp, useTheme } from '@v2/core/index.js';
import { UIHeader } from '@v2/ui/components.js';

export default function ServicesScreen() {
	useTheme();
	const { services, addService, removeService } = useApp();
	const toast = useToast();
	const [query, setQuery] = useState('');
	const [name, setName] = useState(''), [price, setPrice] = useState(''), [duration, setDuration] = useState('');
	const filtered = services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
	const onSave = () => {
		if (!name || !price || !duration) { if (typeof globalThis!=='undefined' && globalThis.alert) globalThis.alert(t('please_fill_all')); return; }
		addService({ name, price:Number(price), durationMin:Number(duration), active:true });
		toast?.success?.(t('saved'));
		setName(''); setPrice(''); setDuration('');
	};
	return (
		<Screen gradient scroll>
				<UIHeader title={t('services_title')} subtitle={t('manage_offerings')} rightActions={[]} />
				<Input placeholder={t('search_service_placeholder')} value={query} onChangeText={setQuery} />
				<Card>
					<SectionTitle>{t('new_service')}</SectionTitle>
					<Row gap={2}>
						<View style={{ flex: 2 }}><Input placeholder={t('service')} value={name} onChangeText={setName} /></View>
						<View style={{ flex: 1 }}><Input placeholder='Price (€)' keyboardType='numeric' value={price} onChangeText={setPrice} /></View>
						<View style={{ flex: 1 }}><Input placeholder='Duration (min)' keyboardType='numeric' value={duration} onChangeText={setDuration} /></View>
					</Row>
					<Button title={t('save_service')} onPress={onSave} />
				</Card>
				{!filtered.length ? (
					<Card><EmptyState title={t('no_services_hint')} /></Card>
				) : (
					<Card>
						{filtered.map(s => (
							<ListItem key={s.id}
								title={s.name}
								subtitle={`${s.durationMin} min · ${s.price} €`}
								right={<Button title={t('delete')} size='sm' variant='danger' onPress={()=>{ removeService(s.id); toast?.info?.(t('deleted')); }} />}
							/>
						))}
					</Card>
				)}
			</Screen>
	);
}
