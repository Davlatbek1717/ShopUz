'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

export default function ProfilePage() {
  const router = useRouter();
  const { state, updateProfile, logout } = useAuth();
  const { user, loading, error } = state;
  
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      await updateProfile(form);
      setMessage({
        type: 'success',
        text: 'Profil muvaffaqiyatli yangilandi!'
      });
      setEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Profilni yangilashda xatolik yuz berdi'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
    setEditing(false);
    setMessage(null);
  };

  const handleLogout = () => {
    if (confirm('Hisobdan chiqishni xohlaysizmi?')) {
      logout();
      router.push('/');
    }
  };

  if (loading) {
    return <Loading size="lg" text="Profil yuklanmoqda..." fullScreen />;
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">🏠 Bosh sahifa</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Profil</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white font-bold">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-2">
                  <span className={`badge ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'ADMIN' ? '👑 Administrator' : '👤 Foydalanuvchi'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">📦</span>
                  <span className="font-medium">Buyurtmalarim</span>
                </Link>
                
                <Link
                  href="/cart"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">🛒</span>
                  <span className="font-medium">Savatcha</span>
                </Link>
                
                <Link
                  href="/favorites"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">❤️</span>
                  <span className="font-medium">Sevimlilar</span>
                </Link>
                
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl">⚙️</span>
                    <span className="font-medium">Admin Panel</span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 w-full text-left"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Chiqish</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Shaxsiy ma'lumotlar</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-secondary"
                  >
                    ✏️ Tahrirlash
                  </button>
                )}
              </div>

              {message && (
                <div className={`p-4 rounded-lg mb-6 ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{message.type === 'success' ? '✅' : '❌'}</span>
                    <span className="font-medium">{message.text}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">❌</span>
                    <span className="text-red-800 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ism
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Ismingiz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Familiya
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Familiyangiz"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email manzil
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      ❌ Bekor qilish
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Ism</div>
                      <div className="font-medium text-lg">{user.firstName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Familiya</div>
                      <div className="font-medium text-lg">{user.lastName}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email manzil</div>
                    <div className="font-medium text-lg">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Rol</div>
                    <div className="font-medium text-lg">
                      {user.role === 'ADMIN' ? 'Administrator' : 'Foydalanuvchi'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Settings */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Hisob sozlamalari</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Parolni o'zgartirish</div>
                    <div className="text-sm text-gray-600">Hisobingiz xavfsizligini ta'minlang</div>
                  </div>
                  <button className="btn-secondary">
                    🔑 O'zgartirish
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Email bildirishnomalar</div>
                    <div className="text-sm text-gray-600">Buyurtma va aksiya haqida xabarlar</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <div className="font-medium text-red-800">Hisobni o'chirish</div>
                    <div className="text-sm text-red-600">Bu amalni qaytarib bo'lmaydi</div>
                  </div>
                  <button className="btn-secondary text-red-600 border-red-300 hover:bg-red-50">
                    🗑️ O'chirish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}