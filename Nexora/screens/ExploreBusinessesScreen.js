// ExploreBusinessesScreen — migrated from 5_explore_businesses.js
import { React, useState, View } from '@app/2_dependencies.js';
import { Screen, H1, Input, Card, P, Button, Row } from '@ui/index.js';
import { t } from '@v2/core/i18n.js';

const mock = [ { id:'1', name:'Corte & Estilo', distance: 1.2 }, { id:'2', name:'Spa Relax', distance: 2.4 } ];

export default function ExploreBusinessesScreen({ navigation }) {
	const [query, setQuery] = useState('');
	const list = mock.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));
	return (
		<Screen>
			<H1>{t('explore')}</H1>
			<Input placeholder={t('search_business_placeholder')} value={query} onChangeText={setQuery} />
			{list.map(b => (
				<Card key={b.id}>
					<Row justify='space-between' align='center'>
						<View style={{ flex:1 }}>
							<P>{b.name}</P>
							<P muted>{b.distance} km</P>
						</View>
						<Button title={t('view_btn')} size='sm' onPress={()=> navigation.navigate('services')} />
					</Row>
				</Card>
			))}
		</Screen>
	);
}
