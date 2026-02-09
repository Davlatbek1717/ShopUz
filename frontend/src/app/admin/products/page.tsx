'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  discount?: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products?limit=100');
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu mahsulotni o\'chirmoqchimisiz?')) {
      return;
    }

    try {
      // For demo, just remove from state
      setProducts(products.filter(p => p.id !== productId));
      alert('Mahsulot muvaffaqiyatli o\'chirildi');
    } catch (error) {
      alert('Mahsulotni o\'chirishda xatolik yuz berdi');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <Loading size="lg" text="Mahsulotlar yuklanmoqda..." fullScreen />;
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="heading-lg text-gray-900 mb-2">Mahsulotlar boshqaruvi</h1>
              <p className="text-gray-600">Jami {products.length} ta mahsulot</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Link href="/admin" className="btn-secondary">
                ← Dashboard
              </Link>
              <Link href="/admin/products/new" className="btn-primary">
                ➕ Yangi mahsulot
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qidirish
                </label>
                <input
                  type="text"
                  placeholder="Mahsulot nomi yoki tavsifi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoriya
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">Barcha kategoriyalar</option>
                  <option value="1">Electronics</option>
                  <option value="2">Fashion</option>
                  <option value="3">Home & Garden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mahsulot</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kategoriya</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Narx</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ombor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Holat</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                📦
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-600 line-clamp-1">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-primary">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">${product.price.toFixed(2)}</div>
                        {product.discount && (
                          <div className="text-sm text-red-600">-{product.discount}%</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${
                          product.stock === 0 ? 'text-red-600' :
                          product.stock < 10 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {product.stock} ta
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          product.stock === 0 ? 'badge-danger' :
                          product.stock < 10 ? 'badge-warning' :
                          'badge-success'
                        }`}>
                          {product.stock === 0 ? 'Tugagan' :
                           product.stock < 10 ? 'Kam qolgan' :
                           'Mavjud'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="btn-secondary text-sm py-1 px-3"
                            target="_blank"
                          >
                            👁️
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="btn-secondary text-sm py-1 px-3"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn-secondary text-red-600 border-red-300 hover:bg-red-50 text-sm py-1 px-3"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mahsulot topilmadi</h3>
                <p className="text-gray-600">Qidiruv mezonlaringizni o'zgartiring</p>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredProducts.length} ta mahsulot ko'rsatilmoqda
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary">
                📥 Import
              </button>
              <button className="btn-secondary">
                📤 Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}