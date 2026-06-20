'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import styles from './page.module.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  description: string;
  category: { _id: string; name: string };
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function HomePage() {
  const { addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort,
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, sort]);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product: Product) => {
    addToCart({ id: product._id, name: product.name, price: product.price, stock: product.stock });
    setAddedItems((prev) => new Set(prev).add(product._id));
    setTimeout(() => {
      setAddedItems((prev) => { const s = new Set(prev); s.delete(product._id); return s; });
    }, 1500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className={styles.container}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>✦ Yeni Sezon Ürünleri</div>
          <h1>
            En Kaliteli Ürünler,{' '}
            <span className={styles.heroAccent}>Tek Adreste</span>
          </h1>
          <p>ZyqWax Store'da en seçkin ürünleri keşfedin. Hızlı teslimat, güvenilir alışveriş.</p>
          <div className={styles.heroActions}>
            <a href="#products" className="btn btn-primary btn-lg">
              Ürünleri Keşfet
            </a>
            <Link href="/cart" className="btn btn-secondary btn-lg">
              Sepetim
            </Link>
          </div>
        </div>
        <div className={styles.heroDecoration}>
          <div className={styles.orb}></div>
          <div className={styles.orb2}></div>
        </div>
      </section>

      {/* Products section */}
      <section id="products" className={styles.productsSection}>
        {/* Filters */}
        <div className={styles.filters}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Ara</button>
          </form>

          <div className={styles.filterRow}>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
            >
              <option value="createdAt">En Yeni</option>
              <option value="price">Fiyat: Düşükten Yükseğe</option>
              <option value="-price">Fiyat: Yüksekten Düşüğe</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.grid}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className="skeleton" style={{ height: '180px', borderRadius: '8px' }}></div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ height: '16px', width: '70%' }}></div>
                  <div className="skeleton" style={{ height: '14px', width: '40%' }}></div>
                  <div className="skeleton" style={{ height: '36px', marginTop: '8px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>Ürün bulunamadı</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Arama kriterlerinizi değiştirmeyi deneyin</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <div key={product._id} className={styles.productCard}>
                <div className={styles.productImagePlaceholder}>
                  <span className={styles.productIcon}>🛍️</span>
                  {product.stock === 0 && (
                    <span className={styles.outOfStock}>Tükendi</span>
                  )}
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className={styles.discountBadge}>
                      -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                    </span>
                  )}
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productCategory}>{product.category?.name}</div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDesc}>{product.description}</p>
                  <div className={styles.productFooter}>
                    <div className={styles.priceBlock}>
                      <span className={styles.price}>₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className={styles.comparePrice}>
                          ₺{product.comparePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    <button
                      className={`btn btn-primary btn-sm ${addedItems.has(product._id) ? styles.addedBtn : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {addedItems.has(product._id) ? '✓ Eklendi' : '+ Sepete Ekle'}
                    </button>
                  </div>
                  <div className={styles.stockInfo}>
                    {product.stock > 0 && product.stock <= 10 ? (
                      <span className={styles.lowStock}>⚡ Son {product.stock} adet!</span>
                    ) : product.stock > 10 ? (
                      <span className={styles.inStock}>✓ Stokta var</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Önceki
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sonraki →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
