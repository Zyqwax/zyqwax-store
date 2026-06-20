'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import styles from './cart.module.css';

export default function CartPage() {
  const { cart, cartTotal, removeFromCart, updateCartQuantity, cartCount } = useApp();

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <div className="empty-state" style={{ marginTop: '80px' }}>
          <div className="empty-state-icon">🛒</div>
          <h3>Sepetiniz boş</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Ürünleri keşfetmeye başlayın
          </p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Sepetim</h1>
        <span className={styles.itemCount}>{cartCount} ürün</span>
      </div>

      <div className={styles.layout}>
        {/* Items */}
        <div className={styles.items}>
          {cart.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemIcon}>🛍️</div>
              <div className={styles.itemInfo}>
                <h4>{item.name}</h4>
                <div className={styles.itemPrice}>
                  ₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className={styles.itemActions}>
                <div className={styles.quantityControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  >−</button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >+</button>
                </div>
                <div className={styles.itemTotal}>
                  ₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromCart(item.id)}
                  title="Kaldır"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <h3>Sipariş Özeti</h3>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Ara Toplam</span>
                <span>₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Kargo</span>
                <span className={styles.freeShipping}>Ücretsiz</span>
              </div>
            </div>
            <hr className="divider"/>
            <div className={styles.totalRow}>
              <span>Toplam</span>
              <span className={styles.totalAmount}>
                ₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Link href="/checkout" className="btn btn-primary w-full" style={{ marginTop: '20px', justifyContent: 'center' }}>
              Siparişi Tamamla →
            </Link>
            <Link href="/" className="btn btn-secondary w-full" style={{ marginTop: '8px', justifyContent: 'center' }}>
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
