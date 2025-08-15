// AnalyticsScreen — extended metrics & trends
import { Screen, Card, H1, P, Grid, Stat, SectionTitle, Row, Button } from '@ui/index.js';
import { React, useState, useMemo } from '@v2/app/baseDependencies.js';
import { useApp } from '@v2/core/index.js';
import { t } from '@v2/core/i18n.js';
import { computeAllKpis, computeStaffUtilization } from '@v2/core/kpis.js';

export default function AnalyticsScreen(){
  const { bookings=[], services=[], requestsAdvanced=[], availability=[], currentBusinessId, staff=[] , clinic } = useApp();
  const [days, setDays] = useState(7);
  const today = new Date();
  const daysArray = Array.from({ length: days }, (_,i)=>{ const d=new Date(); d.setDate(today.getDate()-i); return d; }).reverse();
  const series = useMemo(()=> daysArray.map(d => {
    const dayKey = d.toDateString();
    const dayBookings = bookings.filter(b=> new Date(b.startsAt).toDateString()===dayKey && (!currentBusinessId || b.businessId===currentBusinessId || b.businessId==null));
    const dayRequests = requestsAdvanced.filter(r=> new Date(r.createdAt).toDateString()===dayKey && (!currentBusinessId || r.businessId===currentBusinessId || r.businessId==null));
    const avForDay = availability.filter(a=> new Date(a.date).toDateString()===dayKey && (!currentBusinessId || a.businessId===currentBusinessId));
    const k = computeAllKpis({ date:d, bookings:dayBookings, services, requests:dayRequests, openingHours:clinic?.openingHours, availabilityForDay: avForDay });
    return { date: dayKey, ...k };
  }), [bookings, services, requestsAdvanced, availability, days, currentBusinessId, clinic]);
  const totals = series.reduce((acc, d)=> ({
    bookings: acc.bookings + d.today,
    confirmed: acc.confirmed + d.confirmedToday,
    pending: acc.pending + d.pendingToday,
    cancelled: acc.cancelled + d.cancelledToday,
    requests: acc.requests + d.requests,
    conversions: acc.conversions + d.conversions,
  }), { bookings:0, confirmed:0, pending:0, cancelled:0, requests:0, conversions:0 });
  const convRate = totals.requests? Math.round((totals.conversions / totals.requests)*100):0;
  const avgFill = series.length? Math.round(series.reduce((a,b)=> a+b.fillRate,0)/series.length):0;
  const staffInBiz = staff.filter(s=> !currentBusinessId || s.businessId===currentBusinessId);
  const avgStaffUtil = useMemo(()=>{
    if(!staffInBiz.length) return 0;
    const perDay = series.map(d => {
      const avDay = availability.filter(a=> new Date(a.date).toDateString()===d.date && (!currentBusinessId || a.businessId===currentBusinessId));
      const dayBookings = bookings.filter(b=> new Date(b.startsAt).toDateString()===d.date && (!currentBusinessId || b.businessId===currentBusinessId || b.businessId==null));
      const perStaff = staffInBiz.map(st => computeStaffUtilization({ bookings: dayBookings, availabilityForDay: avDay.filter(a=> a.staffId===st.id), services, staffId: st.id }));
      return perStaff.length? perStaff.reduce((a,b)=> a+b,0)/perStaff.length:0;
    });
    return Math.round(perDay.reduce((a,b)=> a+b,0)/perDay.length||0);
  }, [series, staffInBiz, availability, bookings, services, currentBusinessId]);
  return (
    <Screen gradient scroll>
      <H1>{t('analytics')||'Analytics'}</H1>
      <Card>
        <SectionTitle>{t('window')||'Window'}</SectionTitle>
        <Row gap={2} wrap>
          {[7,14,30].map(n => <Button key={n} title={n+'d'} variant={days===n?'primary':'outline'} onPress={()=> setDays(n)} />)}
        </Row>
      </Card>
      <Card>
        <SectionTitle>{t('aggregate')||'Aggregate'}</SectionTitle>
        <Grid gap={1} minColWidth={140}>
          <Stat label={t('kpi_bookings')} value={totals.bookings} />
          <Stat label={t('kpi_confirmed')} value={totals.confirmed} />
          <Stat label={t('kpi_pending')} value={totals.pending} />
            <Stat label={t('kpi_cancelled')} value={totals.cancelled} />
          <Stat label={t('kpi_requests')} value={totals.requests} />
          <Stat label={t('kpi_conversions')} value={totals.conversions} />
          <Stat label={t('kpi_conversion_rate')} value={convRate+'%'} />
          <Stat label={t('kpi_fill_rate')} value={avgFill+'%'} />
          <Stat label={t('kpi_staff_util')} value={avgStaffUtil+'%'} />
        </Grid>
      </Card>
      <Card>
        <SectionTitle>{t('daily_trend')||'Daily Trend'}</SectionTitle>
        {series.map(d => (
          <P key={d.date} muted>{d.date}: {d.today} / {d.confirmedToday} conf · {d.requests} req · {d.conversions} conv · {d.fillRate}% fill</P>
        ))}
      </Card>
    </Screen>
  );
}
