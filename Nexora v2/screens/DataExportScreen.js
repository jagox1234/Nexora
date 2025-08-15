// DataExportScreen — placeholder for CSV/Excel exports
import { Screen, Card, H1, P, Button, SectionTitle, Row } from '@ui/index.js';
import { React, useState } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';

export default function DataExportScreen(){
  const { bookings=[], services=[], clients=[] } = useApp();
  const [status,setStatus] = useState('idle');
  const exportCsv = (kind, rows) => {
    try {
      setStatus('exporting');
      const headers = Object.keys(rows[0]||{});
      const csv = [headers.join(',')].concat(rows.map(r=> headers.map(h=> JSON.stringify(r[h]??'')).join(','))).join('\n');
      // For now just log (native share integration later)
      console.log('CSV '+kind+'\n'+csv.slice(0,500));
      setStatus('done');
    } catch(e){ setStatus('error'); }
  };
  return (
    <Screen gradient scroll>
      <H1>{t('data_export')}</H1>
      <Card>
        <SectionTitle>Exports</SectionTitle>
        <Row gap={1} wrap>
          <Button title='Bookings CSV' onPress={()=> exportCsv('bookings', bookings)} />
          <Button title='Clients CSV' variant='outline' onPress={()=> exportCsv('clients', clients)} />
          <Button title='Services CSV' variant='outline' onPress={()=> exportCsv('services', services)} />
        </Row>
        <P muted style={{ marginTop:8 }}>Status: {status}</P>
        <P muted size='sm'>Later: date filters, Excel (xlsx), share intent, background generation.</P>
      </Card>
    </Screen>
  );
}
