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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products
    fetch('http://localhost:5000/api/products/featured')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFeaturedProducts(data.data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch featured products:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 bg-opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInLeft">
              <h1 className="heading-xl mb-6 leading-tight">
                O'zbekistondagi
                <span className="block text-yellow-300">Eng Yaxshi</span>
                <span className="block gradient-text bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Online Do'kon
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-lg">
                Sifatli mahsulotlar, qulay narxlar va tez yetkazib berish. 
                Minglab mijozlar bizga ishonch bildirgan!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/products"
                  className="btn-primary bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-lg px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  🛍️ Xarid Qilishni Boshlash
                </Link>
                <Link
                  href="/categories"
                  className="btn-secondary bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30 font-semibold text-lg px-8 py-4 rounded-xl"
                >
                  📂 Kategoriyalar
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">1000+</div>
                  <div className="text-blue-200 text-sm">Mahsulotlar</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">5000+</div>
                  <div className="text-blue-200 text-sm">Mijozlar</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">24/7</div>
                  <div className="text-blue-200 text-sm">Yordam</div>
                </div>
              </div>
            </div>

            <div className="animate-fadeInRight">
              <div className="relative">
                <div className="w-full h-96 bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                  <div className="text-center">
                    <div className="text-8xl mb-4 animate-bounce">🛒</div>
                    <h3 className="text-2xl font-bold mb-4">Bugun xarid qiling!</h3>
                    <p className="text-blue-100 mb-6">
                      Barcha mahsulotlarga 20% gacha chegirma
                    </p>
                    <div className="bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-full inline-block">
                      Chegirma kodi: WELCOME20
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-900 mb-4">Nima uchun bizni tanlashadi?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Biz mijozlarimizga eng yaxshi xizmat va sifatli mahsulotlarni taqdim etamiz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              {
                icon: '🚚',
                title: 'Tez Yetkazish',
                description: 'Toshkent bo\'ylab 24 soat ichida, boshqa viloyatlarga 2-3 kun ichida',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: '🔒',
                title: 'Xavfsiz To\'lov',
                description: 'SSL sertifikati va bank darajasidagi xavfsizlik',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: '↩️',
                title: 'Oson Qaytarish',
                description: '30 kun ichida sababsiz qaytarish va pul qaytarish',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: '🎧',
                title: '24/7 Yordam',
                description: 'Har doim sizning xizmatingizdamiz, savollaringizga javob beramiz',
                color: 'from-orange-500 to-orange-600'
              }
            ].map((feature, index) => (
              <div key={index} className="card p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-900 mb-4">Tavsiya Etiladigan Mahsulotlar</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Eng mashhur va sifatli mahsulotlarimiz bilan tanishing
            </p>
          </div>

          {loading ? (
            <Loading size="lg" text="Mahsulotlar yuklanmoqda..." />
          ) : (
            <>
              <div className="product-grid mb-12">
                {featuredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                  />
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/products"
                  className="btn-outline text-lg px-8 py-4 inline-flex items-center gap-2 group"
                >
                  Barcha mahsulotlarni ko'rish
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="heading-lg mb-6">Bugun xarid qilishni boshlang!</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Minglab sifatli mahsulot, qulay narxlar va tez yetkazib berish sizni kutmoqda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="btn-primary bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-lg px-8 py-4"
            >
              🛍️ Mahsulotlarni Ko'rish
            </Link>
            <Link
              href="/orders"
              className="btn-secondary bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30 font-semibold text-lg px-8 py-4"
            >
              📦 Buyurtmalarim
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}