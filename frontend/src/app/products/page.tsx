'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
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
    description: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
      });

      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`http://localhost:5000/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const formatPrice = (price: number, discount?: number) => {
    if (discount) {
      const discountedPrice = price * (1 - discount / 100);
      return {
        original: price.toFixed(2),
        discounted: discountedPrice.toFixed(2),
        hasDiscount: true,
      };
    }
    return {
      original: price.toFixed(2),
      hasDiscount: false,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">🏠 Bosh sahifa</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Mahsulotlar</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-lg text-gray-900 mb-4">Mahsulotlar Katalogi</h1>
          <p className="text-gray-600 text-lg">Eng yaxshi mahsulotlarni toping va xarid qiling</p>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Mahsulot nomi, brend yoki tavsif bo'yicha qidiring..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12 pr-4"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  🔍
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-2 px-4 text-sm"
                >
                  Qidirish
                </button>
              </div>
            </form>
            
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field lg:w-64"
            >
              <option value="">📂 Barcha kategoriyalar</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <Loading size="lg" text="Mahsulotlar yuklanmoqda..." />
        ) : (
          <>
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-600">
                <span className="font-semibold text-gray-900">{products.length}</span> ta mahsulot topildi
              </div>
              <div className="text-sm text-gray-500">
                Sahifa {currentPage} / {totalPages}
              </div>
            </div>

            <div className="product-grid mb-8">
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mb-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Oldingi
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keyingi →
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Mahsulot topilmadi</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Qidiruv so'zingizni o'zgartiring yoki boshqa kategoriyani tanlang
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className="btn-primary"
              >
                Barcha mahsulotlarni ko'rsatish
              </button>
              <Link href="/" className="btn-secondary">
                Bosh sahifaga qaytish
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}