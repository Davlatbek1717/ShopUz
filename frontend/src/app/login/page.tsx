'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, login } = useAuth();
  const { loading, error } = state;
  
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (state.user) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [state.user, router, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      return;
    }

    try {
      await login(form.email, form.password);
      
      // Redirect after successful login
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold group-hover:scale-105 transition-transform">
              🛒
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">ShopUz</h1>
              <p className="text-xs text-gray-500">Online Do'kon</p>
            </div>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hisobingizga kiring</h2>
          <p className="text-gray-600">
            Hisobingiz yo'qmi?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email manzil
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleInputChange}
                  className="input-field pr-12"
                  placeholder="Parolingizni kiriting"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Meni eslab qol
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700">
                  Parolni unutdingizmi?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Kirilmoqda...' : '🔑 Kirish'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600 mb-4">
              Demo hisoblar:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setForm({ email: 'user@test.com', password: 'user123' })}
                className="btn-secondary text-sm py-2"
              >
                👤 Oddiy foydalanuvchi
              </button>
              <button
                onClick={() => setForm({ email: 'admin@ecommerce.com', password: 'admin123' })}
                className="btn-secondary text-sm py-2"
              >
                👑 Administrator
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="text-center">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🔒</span>
              <span>Xavfsiz</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">⚡</span>
              <span>Tez</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🎯</span>
              <span>Oson</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}