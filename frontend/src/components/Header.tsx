'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const { state, logout } = useAuth();
  const cartCount = getCartCount();
  const { user } = state;

  const navigation = [
    { name: 'Bosh sahifa', href: '/', icon: '🏠' },
    { name: 'Mahsulotlar', href: '/products', icon: '🛍️' },
    { name: 'Buyurtmalar', href: '/orders', icon: '📦' },
    { name: 'Aloqa', href: '/contact', icon: '📞' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="hidden md:flex justify-between items-center py-2 text-sm text-gray-600 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              📞 +998 90 123 45 67
            </span>
            <span className="flex items-center gap-1">
              ✉️ info@ecommerce.uz
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>🚚 Bepul yetkazish $50+</span>
            <span>🔒 Xavfsiz to'lov</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold group-hover:scale-105 transition-transform">
              🛒
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold gradient-text">ShopUz</h1>
              <p className="text-xs text-gray-500">Online Do'kon</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Mahsulot, brend yoki kategoriya qidiring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
              >
                Qidirish
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-3 hover:bg-gray-100 rounded-full transition-colors group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{user.firstName}</span>
                    <span className="text-xs">▼</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span>👤</span>
                        Profil
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span>📦</span>
                        Buyurtmalar
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span>⚙️</span>
                          Admin Panel
                        </Link>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <span>🚪</span>
                        Chiqish
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-xl">👤</span>
                    <span className="text-sm font-medium">Kirish</span>
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block border-t border-gray-100">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Online</span>
              </div>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">24/7 Yordam</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white border-t border-gray-200 transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 py-4 space-y-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </form>

          {/* Mobile Navigation */}
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          ))}

          {/* Mobile User Actions */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <span className="text-xl">👤</span>
                  Profil
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    <span className="text-xl">⚙️</span>
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Chiqish</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-xl">👤</span>
                  <span className="font-medium">Kirish</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-xl">✅</span>
                  <span className="font-medium">Ro'yxatdan o'tish</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}