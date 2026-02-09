'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { state, logout } = useAuth();
  const { user } = state;

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Mahsulotlar', href: '/admin/products', icon: '🛍️' },
    { name: 'Buyurtmalar', href: '/admin/orders', icon: '📦' },
    { name: 'Foydalanuvchilar', href: '/admin/users', icon: '👥' },
    { name: 'Kategoriyalar', href: '/admin/categories', icon: '📂' },
    { name: 'Analitika', href: '/admin/analytics', icon: '📈' },
    { name: 'Sozlamalar', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">
                  ⚙️
                </div>
                <div>
                  <h1 className="text-xl font-bold">Admin Panel</h1>
                  <p className="text-xs text-blue-100">ShopUz boshqaruv paneli</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <span>🏠</span>
                <span className="hidden sm:inline">Saytga qaytish</span>
              </Link>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg">
                <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center text-sm font-bold">
                  {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                </div>
                <span className="hidden sm:inline">{user?.firstName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <main>{children}</main>
    </div>
  );
}