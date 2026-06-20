'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../admin.module.css';

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Bekliyor' },
  { value: 'confirmed',  label: 'Onaylandı' },
  { value: 'processing', label: 'Hazırlanıyor' },
  { value: 'shipped',    label: 'Kargoda' },
  { value: 'delivered',  label: 'Teslim Edildi' },
  { value: 'cancelled',  label: 'İptal Edildi' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  processing: 'badge-processing', shipped: 'badge-shipped',
  delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: 'Havale/EFT',
  cash_on_delivery: 'Kapıda Ödeme',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'badge-pending', paid: 'badge-delivered', refunded: 'badge-shipped',
};

interface Order {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string;
  adminNotes?: string;
  shippingAddress: any;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: '20', ...(statusFilter && { status: statusFilter }) });
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotalPages(data.pagination?.pages || 1);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditTracking(order.trackingNumber || '');
    setEditAdminNotes(order.adminNotes || '');
    setEditPaymentStatus(order.paymentStatus);
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    const res = await fetch(`/api/orders/${selectedOrder._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: editStatus,
        trackingNumber: editTracking,
        adminNotes: editAdminNotes,
        paymentStatus: editPaymentStatus,
      }),
    });
    const updated = await res.json();
    setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
    setSelectedOrder(updated);
    setUpdating(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Siparişler</h1>
          <p className={styles.pageSubtitle}>{total} sipariş toplam</p>
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Tüm Durumlar</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>Ürünler</th>
              <th>Tutar</th>
              <th>Ödeme</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Yükleniyor...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Sipariş bulunamadı</td></tr>
            ) : orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-accent)', fontSize: '0.82rem' }}>
                    #{order.orderNumber}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ').slice(0, 50)}
                  {order.items.join(', ').length > 50 ? '...' : ''}
                </td>
                <td style={{ fontWeight: 700 }}>₺{order.totalAmount.toLocaleString('tr-TR')}</td>
                <td style={{ fontSize: '0.8rem' }}>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</td>
                <td><span className={`badge ${STATUS_LABELS[order.status] || ''}`}>{STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}</span></td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => openOrder(order)}>Detay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>← Önceki</button>
          <span style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{page} / {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Sonraki →</button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="modal" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontFamily: 'monospace' }}>#{selectedOrder.orderNumber}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Customer */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Müşteri</div>
                <div style={{ fontWeight: 600 }}>{selectedOrder.user?.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedOrder.user?.email}</div>
              </div>

              {/* Address */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Teslimat Adresi</div>
                <div style={{ fontSize: '0.875rem' }}>
                  <div style={{ fontWeight: 600 }}>{selectedOrder.shippingAddress?.name} — {selectedOrder.shippingAddress?.phone}</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.city}
                    {selectedOrder.shippingAddress?.postalCode && ` ${selectedOrder.shippingAddress.postalCode}`}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ürünler</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.875rem' }}>{item.name} <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span></span>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>₺{(item.price * item.quantity).toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 800, fontSize: '1.1rem', marginTop: '4px' }}>
                    Toplam: ₺{selectedOrder.totalAmount.toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>

              {/* Edit controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Sipariş Durumu</label>
                  <select className="form-select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ödeme Durumu</label>
                  <select className="form-select" value={editPaymentStatus} onChange={e => setEditPaymentStatus(e.target.value)}>
                    <option value="pending">Bekliyor</option>
                    <option value="paid">Ödendi</option>
                    <option value="refunded">İade Edildi</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Kargo Takip Numarası</label>
                  <input className="form-input" value={editTracking} onChange={e => setEditTracking(e.target.value)} placeholder="TR123456789" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Admin Notu (müşteriye gösterilmez)</label>
                  <textarea className="form-textarea" rows={2} value={editAdminNotes} onChange={e => setEditAdminNotes(e.target.value)} placeholder="İç notlar..." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Kapat</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
                {updating ? 'Kaydediliyor...' : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
