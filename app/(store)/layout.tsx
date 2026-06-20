import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/store/Navbar';
import '../globals.css';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: {
    default: 'ZyqWax Store',
    template: '%s | ZyqWax Store',
  },
  description: 'Kaliteli ürünler, güvenilir alışveriş.',
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className={styles.layout}>
        <Navbar />
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p>© 2024 ZyqWax Store. Tüm hakları saklıdır.</p>
            <p className={styles.footerSub}>Güvenli alışveriş, hızlı teslimat.</p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
