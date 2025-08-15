// RoleSelectScreen — migrated from 5_role_select_screen.js
import { React } from '@app/2_dependencies.js';
import { Screen, H1, P, Button, Card, Row } from '@ui/index.js';
import { t } from '@v2/core/i18n.js';

export default function RoleSelectScreen({ navigation }) {
	return (
		<Screen>
			<H1>{t('choose_role')}</H1>
			<Row gap={2}>
				<Card style={{ flex:1 }}>
					<P>{t('role_business_desc')}</P>
					<Button title={t('enter_business')} onPress={()=> navigation.replace('business_tabs')} />
				</Card>
				<Card style={{ flex:1 }}>
					<P>{t('role_client_desc')}</P>
					<Button title={t('enter_client')} onPress={()=> navigation.replace('client_tabs')} />
				</Card>
			</Row>
		</Screen>
	);
}
