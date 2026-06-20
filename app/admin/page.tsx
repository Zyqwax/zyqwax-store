'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styles from './dashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Bekliyor',       cls: 'badge-pending' },
  confirmed:  { label: 'Onaylandı',      cls: 'badge-confirmed' },
  processing: { label: 'Hazırlanıyor',   cls: 'badge-processing' },
  shipped:    { label: 'Kargoda',        cls: 'badge-shipped' },
  delivered:  { label: 'Teslim Edildi',  cls: 'badge-delivered' },
  cancelled:  { label: 'İptal',          cls: 'badge-cancelled' },
};

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

interface Stats {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setRecentOrders(d.recentOrders || []);
        setOrdersByStatus(d.ordersByStatus || []);
        setMonthlySales(d.monthlySales || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#16161f',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f0f0f8',
        bodyColor: '#8888aa',
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8888aa' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8888aa' },
      },
    },
  };

  const salesChartData = {
    labels: monthlySales.map((m) => `${MONTHS_TR[m._id.month - 1]} ${m._id.year}`),
    datasets: [
      {
        label: 'Satış (₺)',
        data: monthlySales.map((m) => m.total),
        fill: true,
        backgroundColor: 'rgba(124, 92, 252, 0.1)',
        borderColor: '#7c5cfc',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#7c5cfc',
        pointRadius: 4,
      },
    ],
  };

  const ordersChartData = {
    labels: monthlySales.map((m) => `${MONTHS_TR[m._id.month - 1]}`),
    datasets: [
      {
        label: 'Sipariş',
        data: monthlySales.map((m) => m.count),
        backgroundColor: 'rgba(124, 92, 252, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1>Dashboard</h1>
        </div>
        <div className={styles.statsGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${styles.statCard} skeleton`} style={{ height: '120px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p className={styles.pageSubtitle}>Mağaza performansınıza genel bakış</p>
        </div>
        <div className={styles.headerDate}>
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(124,92,252,0.15)' }}>💰</div>
          <div>
            <div className={styles.statValue}>
              ₺{(stats?.totalRevenue || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
            </div>
            <div className={styles.statLabel}>Toplam Gelir</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34,197,94,0.15)' }}>📦</div>
          <div>
            <div className={styles.statValue}>{stats?.totalOrders || 0}</div>
            <div className={styles.statLabel}>Toplam Sipariş</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59,130,246,0.15)' }}>👥</div>
          <div>
            <div className={styles.statValue}>{stats?.totalCustomers || 0}</div>
            <div className={styles.statLabel}>Müşteri</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.15)' }}>🛍️</div>
          <div>
            <div className={styles.statValue}>{stats?.totalProducts || 0}</div>
            <div className={styles.statLabel}>Aktif Ürün</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {monthlySales.length > 0 && (
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Aylık Satış Geliri</h3>
            <Line data={salesChartData} options={chartOptions as any} />
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Aylık Sipariş Sayısı</h3>
            <Bar data={ordersChartData} options={chartOptions as any} />
          </div>
        </div>
      )}

      {/* Status & Recent */}
      <div className={styles.bottomGrid}>
        {/* By Status */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Sipariş Durumları</h3>
          <div className={styles.statusList}>
            {ordersByStatus.map((s) => {
              const status = STATUS_LABELS[s._id] || { label: s._id, cls: '' };
              return (
                <div key={s._id} className={styles.statusRow}>
                  <span className={`badge ${status.cls}`}>{status.label}</span>
                  <div className={styles.statusBar}>
                    <div
                      className={styles.statusBarFill}
                      style={{
                        width: `${(s.count / (stats?.totalOrders || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className={styles.statusCount}>{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>Son Siparişler</h3>
            <a href="/admin/orders" className={styles.viewAll}>Tümünü Gör →</a>
          </div>
          <div className={styles.recentOrders}>
            {recentOrders.slice(0, 8).map((order: any) => {
              const status = STATUS_LABELS[order.status] || { label: order.status, cls: '' };
              return (
                <div key={order._id} className={styles.recentOrder}>
                  <div>
                    <div className={styles.orderNum}>#{order.orderNumber}</div>
                    <div className={styles.orderCustomer}>
                      {order.user?.name || 'Bilinmiyor'}
                    </div>
                  </div>
                  <div className={styles.recentOrderRight}>
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                    <span className={styles.orderAmount}>
                      ₺{order.totalAmount.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentOrders.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>
                Henüz sipariş yok
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
