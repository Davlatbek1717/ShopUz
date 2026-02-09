'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { state } = useAuth();
  const { user } = state;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // For demo, use mock data
      setStats({
        totalOrders: 156,
        totalRevenue: 45678.90,
        totalProducts: 234,
        totalUsers: 1250,
        recentOrders: []
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="lg" text="Dashboard yuklanmoqda..." fullScreen />;
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-lg text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Xush kelibsiz, {user?.firstName}! Bu yerda platformangizni boshqaring.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📦</div>
                <div className="text-blue-100 text-sm">Jami</div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats?.totalOrders}</div>
              <div className="text-blue-100">Buyurtmalar</div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💰</div>
                <div className="text-green-100 text-sm">Jami</div>
              </div>
              <div className="text-3xl font-bold mb-1">${stats?.totalRevenue.toFixed(2)}</div>
              <div className="text-green-100">Daromad</div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🛍️</div>
                <div className="text-purple-100 text-sm">Jami</div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats?.totalProducts}</div>
              <div className="text-purple-100">Mahsulotlar</div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">👥</div>
                <div className="text-orange-100 text-sm">Jami</div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats?.totalUsers}</div>
              <div className="text-orange-100">Foydalanuvchilar</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              href="/admin/products"
              className="card p-6 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🛍️
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Mahsulotlar</h3>
                  <p className="text-gray-600 text-sm">Mahsulotlarni boshqarish</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="card p-6 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📦
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Buyurtmalar</h3>
                  <p className="text-gray-600 text-sm">Buyurtmalarni boshqarish</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="card p-6 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  👥
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Foydalanuvchilar</h3>
                  <p className="text-gray-600 text-sm">Foydalanuvchilarni boshqarish</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="card p-6 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📂
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Kategoriyalar</h3>
                  <p className="text-gray-600 text-sm">Kategoriyalarni boshqarish</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="card p-6 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📊
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Analitika</h3>
                  <p className="text-gray-600 text-sm">Statistika va hisobotlar</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="card p-6 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Sozlamalar</h3>
                  <p className="text-gray-600 text-sm">Tizim sozlamalari</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">So'nggi buyurtmalar</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        📦
                      </div>
                      <div>
                        <div className="font-medium">Buyurtma #order{i}</div>
                        <div className="text-sm text-gray-600">2 daqiqa oldin</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">$99.99</div>
                      <div className="text-xs text-gray-500">PENDING</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/orders"
                className="btn-secondary w-full mt-4"
              >
                Barchasini ko'rish
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tezkor havolalar</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/products/new"
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl">➕</span>
                  <span className="font-medium">Yangi mahsulot qo'shish</span>
                </Link>
                <Link
                  href="/admin/orders?status=PENDING"
                  className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <span className="text-2xl">⏳</span>
                  <span className="font-medium">Kutilayotgan buyurtmalar</span>
                </Link>
                <Link
                  href="/admin/products?stock=low"
                  className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <span className="text-2xl">⚠️</span>
                  <span className="font-medium">Kam qolgan mahsulotlar</span>
                </Link>
                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-2xl">📈</span>
                  <span className="font-medium">Sotuv hisoboti</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}