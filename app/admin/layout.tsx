import { AppProvider } from '@/context/AppContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import '../globals.css';
import styles from './admin.layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className={styles.layout}>
        <AdminSidebar />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </AppProvider>
  );
}
