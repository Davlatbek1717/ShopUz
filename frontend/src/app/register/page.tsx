'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { state, register } = useAuth();
  const { loading, error } = state;
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (state.user) {
      router.push('/');
    }
  }, [state.user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear password error when user types
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    if (form.password !== form.confirmPassword) {
      setPasswordError('Parollar mos kelmaydi');
      return false;
    }
    
    if (form.password.length < 6) {
      setPasswordError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      
      // Redirect after successful registration
      router.push('/');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const isFormValid = () => {
    return form.firstName && 
           form.lastName && 
           form.email && 
           form.password && 
           form.confirmPassword &&
           form.password === form.confirmPassword &&
           form.password.length >= 6;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hisobingizni yarating</h2>
          <p className="text-gray-600">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Kirish
            </Link>
          </p>
        </div>

        {/* Register Form */}
        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <span className="text-red-800 font-medium">{passwordError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Ism
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={form.firstName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ismingiz"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Familiya
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={form.lastName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Familiyangiz"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleInputChange}
                  className="input-field pr-12"
                  placeholder="Kamida 6 ta belgi"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field pr-12"
                  placeholder="Parolni qayta kiriting"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Men{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                  foydalanish shartlari
                </Link>
                {' '}va{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                  maxfiylik siyosati
                </Link>
                ga roziman
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Ro\'yxatdan o\'tilmoqda...' : '✅ Ro\'yxatdan o\'tish'}
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="text-center">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🎁</span>
              <span>Bepul</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">⚡</span>
              <span>Tez</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🔒</span>
              <span>Xavfsiz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}