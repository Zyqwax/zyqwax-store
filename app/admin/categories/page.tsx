'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditId(null);
    setName(''); setSlug(''); setDescription(''); setError('');
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditId(c._id);
    setName(c.name); setSlug(c.slug); setDescription(c.description || ''); setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const body = { name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'), description };
      const url = editId ? `/api/categories/${editId}` : '/api/categories';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowForm(false);
      fetchCategories();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`"${catName}" kategorisini silmek istediğinize emin misiniz?`)) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Kategoriler</h1>
          <p className={styles.pageSubtitle}>{categories.length} kategori</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Yeni Kategori</button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Kategori Adı</th>
              <th>Slug</th>
              <th>Açıklama</th>
              <th>Oluşturulma</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Yükleniyor...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Kategori bulunamadı</td></tr>
            ) : categories.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td><code style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>{c.slug}</code></td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{c.description || '—'}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString('tr-TR')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c._id, c.name)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>{editId ? 'Kategori Düzenle' : 'Yeni Kategori'}</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Kategori Adı *</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Elektronik" autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input className="form-input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="elektronik (otomatik oluşturulur)" />
              </div>
              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea className="form-textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Kategori açıklaması..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
