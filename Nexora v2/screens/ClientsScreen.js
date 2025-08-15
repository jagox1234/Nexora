// ClientsScreen — migrated
import { Screen, Card, H1, H2, P, Row, Button, Input, ListItem, SectionTitle, EmptyState } from '@ui/index.js';
import { useToast } from '@ui/toast.js';
import { React, useState, View } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useApp, useTheme } from '@v2/core/index.js';
// Unified gradient via Screen

export default function ClientsScreen() {
	useTheme();
	const { clients, addClient, removeClient, bookings } = useApp();
	const toast = useToast();
	const [q, setQ] = useState('');
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const filtered = clients.filter(c => { const s = q.toLowerCase(); return !s || c.name.toLowerCase().includes(s) || c.phone.includes(q); });
	const create = () => { if (!phone) { if (typeof globalThis!=='undefined' && globalThis.alert) globalThis.alert(t('phone_required')); return; } addClient({ name, phone }); toast?.success?.(t('saved')); setName(''); setPhone(''); };
	return (
		<Screen gradient scroll>
				<H1>{t('clients_title')}</H1>
				<Card>
					<SectionTitle>{t('search')}</SectionTitle>
					<Input placeholder={t('search_placeholder')} value={q} onChangeText={setQ} />
				</Card>
				<Card>
					<SectionTitle>{t('new_client')}</SectionTitle>
					<Row gap={2}>
						<View style={{ flex: 1 }}><Input placeholder={t('client')} value={name} onChangeText={setName} /></View>
						<View style={{ flex: 1 }}><Input placeholder='Phone' keyboardType='phone-pad' value={phone} onChangeText={setPhone} /></View>
					</Row>
					<Button title={t('save_client')} onPress={create} />
				</Card>
				{!filtered.length ? (
					<Card><EmptyState title={t('no_clients')} /> </Card>
				) : (
					<Card>
						{filtered.map(c => { const count = bookings.filter(b=> b.clientId===c.id && b.status!=='cancelled').length; return (
							<ListItem key={c.id}
								title={c.name}
								subtitle={`${c.phone || '—'} · ${t('bookings_count')}: ${count}`}
								right={<Button title={t('delete')} size='sm' variant='danger' onPress={()=>{ removeClient(c.id); toast?.info?.(t('deleted')); }} />}
							/>
						); })}
					</Card>
				)}
			</Screen>
	);
}
