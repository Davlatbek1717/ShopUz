'use client';

import { useEffect, useState } from 'react';
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
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<OrdersResponse['pagination'] | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/orders?page=${page}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'RETURNED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Kutilmoqda';
      case 'PAID': return 'To\'langan';
      case 'FAILED': return 'Xatolik';
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

  if (loading && orders.length === 0) {
    return <Loading size="lg" text="Buyurtmalar yuklanmoqda..." fullScreen />;
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
            <span className="text-gray-900 font-medium">Buyurtmalarim</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-lg text-gray-900 mb-2">Buyurtmalarim</h1>
          <p className="text-gray-600">Barcha buyurtmalaringiz va ularning holati</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800 font-medium">Xatolik yuz berdi</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {orders.length === 0 ? (
          /* No Orders */
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Buyurtmalar yo'q</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Hozircha hech qanday buyurtma bermagan ekansiz. Xarid qilishni boshlang!
            </p>
            <Link
              href="/products"
              className="btn-primary text-lg px-8 py-4"
            >
              🛍️ Xarid qilishni boshlash
            </Link>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="card p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Buyurtma raqami</div>
                        <div className="font-bold text-lg">#{order.id}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Sana</div>
                        <div className="font-medium">{formatDate(order.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Jami summa</div>
                        <div className="font-bold text-lg text-blue-600">${order.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <span className={`badge ${getStatusColor(order.status)} px-3 py-1 text-sm font-medium`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className={`badge ${getPaymentStatusColor(order.paymentStatus)} px-3 py-1 text-sm font-medium`}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm line-clamp-1">{item.product.name}</div>
                            <div className="text-sm text-gray-600">
                              {item.quantity} x ${item.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center text-gray-500 text-sm">
                          +{order.items.length - 3} ta ko'proq
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <Link
                      href={`/orders/${order.id}`}
                      className="btn-primary text-center"
                    >
                      📋 Batafsil ko'rish
                    </Link>
                    
                    {['PENDING', 'CONFIRMED'].includes(order.status) && (
                      <button className="btn-secondary text-red-600 border-red-300 hover:bg-red-50">
                        ❌ Bekor qilish
                      </button>
                    )}
                    
                    {order.status === 'DELIVERED' && (
                      <button className="btn-secondary">
                        ⭐ Baholash
                      </button>
                    )}
                    
                    <button className="btn-secondary">
                      🔄 Qayta buyurtma berish
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Oldingi
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === pageNum
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
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keyingi →
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}