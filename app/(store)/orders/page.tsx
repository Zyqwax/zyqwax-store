'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './orders.module.css';

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Bekliyor',  cls: 'badge-pending' },
  confirmed:  { label: 'Onaylandı', cls: 'badge-confirmed' },
  processing: { label: 'Hazırlanıyor', cls: 'badge-processing' },
  shipped:    { label: 'Kargoda',   cls: 'badge-shipped' },
  delivered:  { label: 'Teslim Edildi', cls: 'badge-delivered' },
  cancelled:  { label: 'İptal',     cls: 'badge-cancelled' },
};

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const successOrder = searchParams.get('success');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <h1>Siparişlerim</h1>

      {successOrder && (
        <div className="alert alert-success" style={{ marginTop: '16px' }}>
          🎉 Sipariş #{successOrder} başarıyla oluşturuldu! En kısa sürede sizinle iletişime geçeceğiz.
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '40px' }}>
          <div className="empty-state-icon">📦</div>
          <h3>Henüz siparişiniz yok</h3>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] || { label: order.status, cls: '' };
            return (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <div className={styles.orderNumber}>#{order.orderNumber}</div>
                    <div className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </div>
                  </div>
                  <span className={`badge ${status.cls}`}>{status.label}</span>
                </div>

                <div className={styles.orderItems}>
                  {order.items.map((item, i) => (
                    <div key={i} className={styles.orderItem}>
                      <span>{item.name}</span>
                      <span className={styles.orderItemMeta}>
                        {item.quantity} adet × ₺{item.price.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderInfo}>
                    <span className={styles.payBadge}>
                      {order.paymentMethod === 'bank_transfer' ? '🏦 Havale' : '💵 Kapıda Ödeme'}
                    </span>
                    {order.trackingNumber && (
                      <span className={styles.tracking}>
                        📦 Takip: {order.trackingNumber}
                      </span>
                    )}
                  </div>
                  <span className={styles.orderTotal}>
                    ₺{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <h1>Siparişlerim</h1>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
