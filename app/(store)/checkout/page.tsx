'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useApp } from '@/context/AppContext';
import styles from './checkout.module.css';

interface CheckoutForm {
  name: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  postalCode: string;
  paymentMethod: 'bank_transfer' | 'cash_on_delivery';
  notes: string;
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, user } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: {
      name: user?.name || '',
      paymentMethod: 'bank_transfer',
    },
  });

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && cart.length === 0) {
      router.push('/cart');
    }
  }, [isReady, cart, router]);

  if (!isReady || cart.length === 0) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
          shippingAddress: {
            name: data.name,
            phone: data.phone,
            street: data.street,
            district: data.district,
            city: data.city,
            postalCode: data.postalCode,
          },
          paymentMethod: data.paymentMethod,
          notes: data.notes,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      clearCart();
      router.push(`/orders?success=${result.orderNumber}`);
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sipariş Tamamla</h1>

      <div className={styles.layout}>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNum}>1</span>
              Teslimat Adresi
            </h2>

            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Ad Soyad *</label>
                <input
                  {...register('name', { required: 'Ad soyad gerekli' })}
                  className="form-input"
                  placeholder="Adınız ve soyadınız"
                />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Telefon *</label>
                <input
                  {...register('phone', { required: 'Telefon gerekli' })}
                  className="form-input"
                  placeholder="05xx xxx xx xx"
                />
                {errors.phone && <span className="form-error">{errors.phone.message}</span>}
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Adres *</label>
                <input
                  {...register('street', { required: 'Adres gerekli' })}
                  className="form-input"
                  placeholder="Sokak, mahalle, bina no, daire"
                />
                {errors.street && <span className="form-error">{errors.street.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">İlçe *</label>
                <input
                  {...register('district', { required: 'İlçe gerekli' })}
                  className="form-input"
                  placeholder="İlçe"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Şehir *</label>
                <input
                  {...register('city', { required: 'Şehir gerekli' })}
                  className="form-input"
                  placeholder="İstanbul"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Posta Kodu</label>
                <input
                  {...register('postalCode')}
                  className="form-input"
                  placeholder="34000"
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNum}>2</span>
              Ödeme Yöntemi
            </h2>

            <div className={styles.paymentOptions}>
              <label className={styles.paymentOption}>
                <input type="radio" {...register('paymentMethod')} value="bank_transfer" />
                <div className={styles.paymentCard}>
                  <div className={styles.paymentIcon}>🏦</div>
                  <div>
                    <div className={styles.paymentName}>Havale / EFT</div>
                    <div className={styles.paymentDesc}>IBAN bilgileri sipariş sonrası gönderilir</div>
                  </div>
                </div>
              </label>
              <label className={styles.paymentOption}>
                <input type="radio" {...register('paymentMethod')} value="cash_on_delivery" />
                <div className={styles.paymentCard}>
                  <div className={styles.paymentIcon}>💵</div>
                  <div>
                    <div className={styles.paymentName}>Kapıda Ödeme</div>
                    <div className={styles.paymentDesc}>Teslimat sırasında nakit ödeme</div>
                  </div>
                </div>
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNum}>3</span>
              Sipariş Notu (İsteğe Bağlı)
            </h2>
            <textarea
              {...register('notes')}
              className="form-textarea"
              placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
              rows={3}
            />
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                İşleniyor...
              </>
            ) : (
              `Siparişi Onayla — ₺${cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className={styles.orderSummary}>
          <div className={styles.summaryCard}>
            <h3>Sipariş Özeti</h3>
            <div className={styles.orderItems}>
              {cart.map((item) => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.orderItemName}>
                    {item.name}
                    <span className={styles.orderItemQty}>x{item.quantity}</span>
                  </div>
                  <span className={styles.orderItemPrice}>
                    ₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div className={styles.totalRow}>
              <span>Toplam</span>
              <span className={styles.total}>
                ₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
