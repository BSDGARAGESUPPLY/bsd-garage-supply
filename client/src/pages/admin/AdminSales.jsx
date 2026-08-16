import { useState, useEffect } from 'react';
import api from '../../api';

const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (n) => Number(n || 0).toLocaleString();
const parseDate = (s) => new Date(`${s}T00:00:00`);

function periodLabel(row, group) {
  const d = parseDate(row.first_date);
  if (group === 'month') return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  if (group === 'week') {
    const end = parseDate(row.last_date);
    const o = { month: 'short', day: 'numeric' };
    return `Week of ${d.toLocaleDateString('en-US', o)} – ${end.toLocaleDateString('en-US', o)}`;
  }
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminSales() {
  const [group, setGroup] = useState('day');
  const [data, setData] = useState({ rows: [], totals: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/sales?group=${group}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [group]);

  const t = data.totals;
  const cards = t ? [
    { label: 'Today', ...t.today, gold: true },
    { label: 'Last 7 days', ...t.week },
    { label: 'Last 30 days', ...t.month },
    { label: 'All time', ...t.all },
  ] : [];

  const maxRev = Math.max(1, ...data.rows.map(r => r.revenue));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Sales</h1>
        {t && <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{money(t.all.revenue)} from {num(t.all.orders)} paid orders</span>}
      </div>

      {/* Period totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {cards.map(c => (
          <div key={c.label} className="card" style={{ padding: '18px 20px', borderTop: c.gold ? '3px solid var(--gold)' : undefined }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: c.gold ? 'var(--gold-dark)' : 'var(--text-primary)', margin: '6px 0 2px' }}>{money(c.revenue)}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{num(c.orders)} order{c.orders === 1 ? '' : 's'}</div>
          </div>
        ))}
      </div>

      {/* Grouped breakdown */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontWeight: 700 }}>Sales by {group}</h3>
          <div className="se-seg" style={{ display: 'inline-flex', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '3px', gap: '2px' }}>
            {['day', 'week', 'month'].map(g => (
              <button key={g} onClick={() => setGroup(g)}
                style={{ border: 'none', background: g === group ? 'var(--gold)' : 'transparent', color: g === group ? '#2a1f08' : 'var(--text-secondary)', padding: '7px 16px', borderRadius: '7px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize' }}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="loading-center"><div className="spinner" /></div>
            : data.rows.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: '48px 0' }}>No paid sales yet.</div>
            ) : (
              <table>
                <thead><tr><th>{group === 'day' ? 'Date' : group === 'week' ? 'Week' : 'Month'}</th><th>Orders</th><th>Revenue</th><th style={{ width: '30%' }}></th></tr></thead>
                <tbody>
                  {data.rows.map(r => (
                    <tr key={r.period}>
                      <td><strong style={{ fontSize: '13px' }}>{periodLabel(r, group)}</strong></td>
                      <td>{num(r.orders)}</td>
                      <td style={{ fontWeight: 700 }}>{money(r.revenue)}</td>
                      <td>
                        <div style={{ height: '10px', borderRadius: '5px', background: 'var(--gold)', opacity: 0.85, width: `${Math.max(4, (r.revenue / maxRev) * 100)}%` }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
}
