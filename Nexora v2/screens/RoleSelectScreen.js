// RoleSelectScreen — migrated
import { Screen, H1, P, Card, Button, Row } from '@ui/index.js';
import { React } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';

export default function RoleSelectScreen({ navigation }) {
	const { pickRole } = useApp();
	const choose = (r) => { pickRole(r); navigation.replace(r === 'business' ? 'business_tabs' : 'client_tabs'); };
	return (
		<Screen gradient>
			<H1>{t('choose_role')}</H1>
			<Row gap={2}>
				<Card style={{ flex:1 }}>
					<P>{t('role_business_desc')}</P>
					<Button title={t('enter_business')} onPress={()=> choose('business')} />
				</Card>
				<Card style={{ flex:1 }}>
					<P>{t('role_client_desc')}</P>
					<Button title={t('enter_client')} onPress={()=> choose('client')} />
				</Card>
			</Row>
		</Screen>
	);
}
