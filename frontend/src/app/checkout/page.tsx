'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'card' | 'cash';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state } = useCart();
  const { state: authState } = useAuth();
  const { cart, loading } = state;
  const { user } = authState;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card',
  });

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    // Redirect if cart is empty
    if (!loading && cart && cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        // Show success and redirect to order detail
        alert('Buyurtma muvaffaqiyatli qabul qilindi! Tez orada siz bilan bog\'lanamiz.');
        router.push(`/orders/${data.data.id}`);
      } else {
        alert(data.message || 'Buyurtma berishda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      }
    } catch (error) {
      alert('Network error. Qaytadan urinib ko\'ring.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading size="lg" text="Yuklanmoqda..." fullScreen />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Savatcha bo'sh</h2>
          <p className="text-gray-600 mb-8">Buyurtma berish uchun avval mahsulot qo'shing</p>
          <Link href="/products" className="btn-primary">
            Mahsulotlarni ko'rish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">🏠 Bosh sahifa</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-blue-600 transition-colors">Savatcha</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Buyurtma berish</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-lg text-gray-900 mb-2">Buyurtma berish</h1>
          <p className="text-gray-600">Ma'lumotlaringizni to'ldiring va buyurtmani tasdiqlang</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Shaxsiy ma'lumotlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ism *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Ismingizni kiriting"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Familiya *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Familiyangizni kiriting"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Yetkazish manzili</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To'liq manzil *
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="input-field"
                      placeholder="Ko'cha, uy raqami, kvartira..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shahar *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Toshkent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pochta indeksi
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">To'lov usuli</h3>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={form.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <div className="font-medium">Plastik karta</div>
                        <div className="text-sm text-gray-600">Visa, MasterCard, UzCard</div>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={form.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <div className="font-medium">Naqd pul</div>
                        <div className="text-sm text-gray-600">Yetkazib berishda to'lash</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Link
                  href="/cart"
                  className="btn-secondary flex-1 text-center"
                >
                  ← Savatga qaytish
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '⏳ Buyurtma berilmoqda...' : '✅ Buyurtmani tasdiqlash'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Buyurtma xulosasi</h3>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm line-clamp-1">{item.product.name}</div>
                      <div className="text-sm text-gray-600">{item.quantity} x ${item.product.price}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mahsulotlar ({cart.totalItems} ta):</span>
                  <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                </div>
                
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Chegirma:</span>
                    <span className="font-medium">-${cart.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Yetkazib berish:</span>
                  <span className="font-medium text-green-600">Bepul</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Jami:</span>
                    <span className="text-blue-600">${cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🚚</span>
                  <span>Bepul yetkazish</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>↩️</span>
                  <span>30 kun qaytarish</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🔒</span>
                  <span>Xavfsiz to'lov</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}