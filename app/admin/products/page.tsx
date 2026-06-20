'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../admin.module.css';

interface Category { _id: string; name: string; slug: string; }
interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  stock: number;
  category: Category;
  isActive: boolean;
  sku?: string;
}

const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '', comparePrice: '',
  stock: '', category: '', sku: '', isActive: true, tags: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ admin: 'true', page: page.toString(), limit: '15', ...(search && { search }) });
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotalPages(data.pagination?.pages || 1);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories);
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p._id);
    setForm({
      name: p.name, slug: p.slug, description: (p as any).description || '',
      price: String(p.price), comparePrice: p.comparePrice ? String(p.comparePrice) : '',
      stock: String(p.stock), category: p.category?._id || '',
      sku: p.sku || '', isActive: p.isActive, tags: ((p as any).tags || []).join(', '),
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const body = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: form.description,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stock: parseInt(form.stock),
        category: form.category,
        sku: form.sku,
        isActive: form.isActive,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      };
      const url = editId ? `/api/products/${editId}` : '/api/products';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowForm(false);
      fetchProducts();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const toggleActive = async (p: Product) => {
    await fetch(`/api/products/${p._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    fetchProducts();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Ürünler</h1>
          <p className={styles.pageSubtitle}>{total} ürün toplam</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Yeni Ürün</button>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Ürün adı, SKU ara..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="form-input"
          style={{ maxWidth: '360px' }}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Ürün Adı</th>
              <th>Kategori</th>
              <th>Fiyat</th>
              <th>Stok</th>
              <th>SKU</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Yükleniyor...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Ürün bulunamadı</td></tr>
            ) : products.map((p) => (
              <tr key={p._id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.slug}</div>
                </td>
                <td><span className="badge badge-confirmed">{p.category?.name || '—'}</span></td>
                <td>
                  <div style={{ fontWeight: 700 }}>₺{p.price.toLocaleString('tr-TR')}</div>
                  {p.comparePrice && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₺{p.comparePrice.toLocaleString('tr-TR')}</div>}
                </td>
                <td>
                  <span className={p.stock === 0 ? 'badge badge-cancelled' : p.stock <= 10 ? 'badge badge-pending' : 'badge badge-delivered'}>
                    {p.stock}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.sku || '—'}</td>
                <td>
                  <button onClick={() => toggleActive(p)} className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`} style={{ cursor: 'pointer', border: 'none' }}>
                    {p.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(p)} title="Düzenle">✏️</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p._id, p.name)} title="Sil">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>← Önceki</button>
          <span style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{page} / {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Sonraki →</button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3>{editId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Ürün Adı *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ürün adı" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input className="form-input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="otomatik-olusturulur" />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="URN-001" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Açıklama</label>
                  <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ürün açıklaması..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Satış Fiyatı (₺) *</label>
                  <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Eski Fiyat (₺)</label>
                  <input className="form-input" type="number" step="0.01" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} placeholder="İndirimden önce" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stok Adedi *</label>
                  <input className="form-input" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Seçin...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Etiketler (virgülle ayırın)</label>
                  <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="elektronik, telefon, aksesuar" />
                </div>
                <div className="form-group">
                  <label className="form-label">Durum</label>
                  <select className="form-select" value={form.isActive ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Ürün Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
