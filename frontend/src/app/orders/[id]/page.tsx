'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/orders/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm('Buyurtmani bekor qilishni xohlaysizmi?')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await fetch(`http://localhost:5000/api/orders/${order.id}/cancel`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
        alert('Buyurtma muvaffaqiyatli bekor qilindi');
      } else {
        alert(data.message || 'Buyurtmani bekor qilishda xatolik yuz berdi');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'RETURNED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Kutilmoqda';
      case 'CONFIRMED': return 'Tasdiqlangan';
      case 'PROCESSING': return 'Tayyorlanmoqda';
      case 'SHIPPED': return 'Yuborilgan';
      case 'DELIVERED': return 'Yetkazilgan';
      case 'CANCELLED': return 'Bekor qilingan';
      case 'RETURNED': return 'Qaytarilgan';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'To\'lov kutilmoqda';
      case 'PAID': return 'To\'langan';
      case 'FAILED': return 'To\'lov xatoligi';
      case 'REFUNDED': return 'Qaytarilgan';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseShippingAddress = (addressString: string): ShippingAddress => {
    try {
      return JSON.parse(addressString);
    } catch {
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: addressString,
        city: '',
        postalCode: ''
      };
    }
  };

  if (loading) {
    return <Loading size="lg" text="Buyurtma yuklanmoqda..." fullScreen />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Buyurtma topilmadi</h2>
          <p className="text-gray-600 mb-8">{error || 'Buyurtma mavjud emas yoki o\'chirilgan'}</p>
          <Link href="/orders" className="btn-primary">
            Buyurtmalarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const shippingAddress = parseShippingAddress(order.shippingAddress);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">🏠 Bosh sahifa</Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-blue-600 transition-colors">Buyurtmalar</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">#{order.id}</span>
          </div>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-lg text-gray-900 mb-2">Buyurtma #{order.id}</h1>
            <p className="text-gray-600">{formatDate(order.createdAt)} da berilgan</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <span className={`badge border-2 ${getStatusColor(order.status)} px-4 py-2 text-lg font-medium`}>
              {getStatusText(order.status)}
            </span>
            <span className={`badge border-2 ${getPaymentStatusColor(order.paymentStatus)} px-4 py-2 text-lg font-medium`}>
              {getPaymentStatusText(order.paymentStatus)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Buyurtma tarkibi</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images ? (
                        <img
                          src={item.product.images}
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
                      <h4 className="font-bold text-lg text-gray-900 mb-1">{item.product.name}</h4>
                      <div className="flex items-center gap-4 text-gray-600">
                        <span>Miqdor: {item.quantity}</span>
                        <span>Narx: ${item.price.toFixed(2)}</span>
                        <span className="font-bold text-gray-900">
                          Jami: ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="btn-secondary text-sm"
                    >
                      Ko'rish
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Yetkazish manzili</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">To'liq ism</div>
                    <div className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Telefon</div>
                    <div className="font-medium">{shippingAddress.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{shippingAddress.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Shahar</div>
                    <div className="font-medium">{shippingAddress.city}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Manzil</div>
                    <div className="font-medium">{shippingAddress.address}</div>
                  </div>
                  {shippingAddress.postalCode && (
                    <div>
                      <div className="text-sm text-gray-500">Pochta indeksi</div>
                      <div className="font-medium">{shippingAddress.postalCode}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Buyurtma holati</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Buyurtma qabul qilindi</div>
                    <div className="text-sm text-gray-600">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
                
                {order.status !== 'PENDING' && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Buyurtma tasdiqlandi</div>
                      <div className="text-sm text-gray-600">Tez orada tayyorlanadi</div>
                    </div>
                  </div>
                )}
                
                {['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Buyurtma tayyorlanmoqda</div>
                      <div className="text-sm text-gray-600">Mahsulotlar yig'ilmoqda</div>
                    </div>
                  </div>
                )}
                
                {['SHIPPED', 'DELIVERED'].includes(order.status) && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Buyurtma yuborildi</div>
                      <div className="text-sm text-gray-600">Yetkazib berish xizmatiga topshirildi</div>
                    </div>
                  </div>
                )}
                
                {order.status === 'DELIVERED' && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Buyurtma yetkazildi</div>
                      <div className="text-sm text-gray-600">Muvaffaqiyatli yetkazib berildi</div>
                    </div>
                  </div>
                )}
                
                {order.status === 'CANCELLED' && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-red-600">Buyurtma bekor qilindi</div>
                      <div className="text-sm text-gray-600">Buyurtma bekor qilindi</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Buyurtma xulosasi</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mahsulotlar ({order.items.length} ta):</span>
                  <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Yetkazib berish:</span>
                  <span className="font-medium text-green-600">Bepul</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Jami:</span>
                    <span className="text-blue-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-500 mb-1">To'lov usuli</div>
                <div className="font-medium flex items-center gap-2">
                  <span>{order.paymentMethod === 'card' ? '💳' : '💵'}</span>
                  {order.paymentMethod === 'card' ? 'Plastik karta' : 'Naqd pul'}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {['PENDING', 'CONFIRMED'].includes(order.status) && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="btn-secondary w-full text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? '⏳ Bekor qilinmoqda...' : '❌ Buyurtmani bekor qilish'}
                  </button>
                )}
                
                <Link
                  href="/orders"
                  className="btn-secondary w-full text-center block"
                >
                  ← Buyurtmalarga qaytish
                </Link>
                
                <button className="btn-primary w-full">
                  🔄 Qayta buyurtma berish
                </button>
                
                {order.status === 'DELIVERED' && (
                  <button className="btn-secondary w-full">
                    ⭐ Mahsulotni baholash
                  </button>
                )}
              </div>

              {/* Support */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Yordam kerakmi?</div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    📞 Qo'llab-quvvatlash xizmati
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}