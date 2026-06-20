'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './AdminSidebar.module.css';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/products', label: 'Ürünler', icon: '🛍️' },
  { href: '/admin/orders', label: 'Siparişler', icon: '📦' },
  { href: '/admin/customers', label: 'Müşteriler', icon: '👥' },
  { href: '/admin/categories', label: 'Kategoriler', icon: '🏷️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <button 
          className={styles.mobileMenuBtn} 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menüyü Aç"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className={styles.mobileLogo}>
          <span className={styles.logoIcon}>⬡</span>
          <span>ZyqWax Admin</span>
        </div>
        <div style={{ width: 22 }} />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/admin" className={styles.logo} onClick={() => setMobileOpen(false)}>
            <span className={styles.logoIcon}>⬡</span>
            {(!collapsed || mobileOpen) && (
              <div className={styles.logoText}>
                <span>ZyqWax</span>
                <span className={styles.adminLabel}>Admin</span>
              </div>
            )}
          </Link>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href, item.exact) ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {(!collapsed || mobileOpen) && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className={styles.bottom}>
          <Link href="/" className={styles.storeLink} title={collapsed ? 'Mağazaya Git' : undefined} onClick={() => setMobileOpen(false)}>
            <span>🏪</span>
            {(!collapsed || mobileOpen) && <span>Mağazaya Git</span>}
          </Link>
          {user && (
            <div className={styles.userSection}>
              <div className={styles.userAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {(!collapsed || mobileOpen) && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userRole}>Admin</span>
                </div>
              )}
              {(!collapsed || mobileOpen) && (
                <button className={styles.logoutBtn} onClick={() => { logout(); setMobileOpen(false); }} title="Çıkış">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
