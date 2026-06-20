'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, cartCount } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span>ZyqWax</span>
          <span className={styles.logoStore}>Store</span>
        </Link>

        {/* Desktop Nav */}
        <div className={styles.links}>
          <Link href="/" className={styles.link}>Ürünler</Link>
          {user && (
            <Link href="/orders" className={styles.link}>Siparişlerim</Link>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Sepet */}
          <Link href="/cart" className={styles.cartBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>

          {/* Auth */}
          {user ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <span className={styles.userAvatar}>{user.name.charAt(0).toUpperCase()}</span>
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  {user.role === 'admin' && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      🛠 Admin Paneli
                    </Link>
                  )}
                  <Link href="/orders" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    📦 Siparişlerim
                  </Link>
                  <hr className={styles.dropdownDivider}/>
                  <button className={styles.dropdownItem} onClick={() => { logout(); setMenuOpen(false); }}>
                    🚪 Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link href="/login" className="btn btn-secondary btn-sm">Giriş</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Kayıt Ol</Link>
            </div>
          )}

          {/* Mobile menu */}
          <button className={styles.mobileMenuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
