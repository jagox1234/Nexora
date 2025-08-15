// ClientsScreen — moved from 5_clients_screen.js
import { React, useState, View } from '@app/2_dependencies.js';
import { Screen, Card, H1, H2, P, Row, Button, Input } from '@ui/index.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';

export default function ClientsScreen() {
	const { clients, addClient, removeClient, bookings } = useApp();
	const [q, setQ] = useState('');
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const filtered = clients.filter(c => { const s = q.toLowerCase(); return !s || c.name.toLowerCase().includes(s) || c.phone.includes(q); });
	const create = () => { if (!phone) { if (typeof globalThis!=='undefined' && globalThis.alert) globalThis.alert(t('phone_required')); return; } addClient({ name, phone }); setName(''); setPhone(''); };
	return (
		<Screen>
			<H1>{t('clients_title')}</H1>
			<Card>
				<H2>{t('search')}</H2>
				<Input placeholder={t('search_placeholder')} value={q} onChangeText={setQ} />
			</Card>
			<Card>
				<H2>{t('new_client')}</H2>
				<Row gap={2}>
					<View style={{ flex: 1 }}><Input placeholder={t('client')} value={name} onChangeText={setName} /></View>
					<View style={{ flex: 1 }}><Input placeholder='Phone' keyboardType='phone-pad' value={phone} onChangeText={setPhone} /></View>
				</Row>
				<Button title={t('save_client')} onPress={create} />
			</Card>
			{!filtered.length ? (
				<Card><P muted>{t('no_clients')}</P></Card>
			) : filtered.map(c => { const count = bookings.filter(b=> b.clientId===c.id && b.status!=='cancelled').length; return (
				<Card key={c.id}>
					<Row justify='space-between' align='center'>
						<View>
							<H2>{c.name}</H2>
							<P muted>{c.phone || '—'} · {t('bookings_count')}: {count}</P>
						</View>
						<View style={{ width: 120 }}>
							<Button title={t('delete')} variant='danger' onPress={()=>removeClient(c.id)} />
						</View>
					</Row>
				</Card>
			); })}
		</Screen>
	);
}
