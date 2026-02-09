'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders?limit=100');
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // For demo, just update state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      alert('Buyurtma holati yangilandi');
    } catch (error) {
      alert('Buyurtma holatini yangilashda xatolik yuz berdi');
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
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <Loading size="lg" text="Buyurtmalar yuklanmoqda..." fullScreen />;
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="heading-lg text-gray-900 mb-2">Buyurtmalar boshqaruvi</h1>
              <p className="text-gray-600">Jami {orders.length} ta buyurtma</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Link href="/admin" className="btn-secondary">
                ← Dashboard
              </Link>
              <button className="btn-primary">
                📤 Export
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4">
              <div className="text-sm text-gray-600 mb-1">Kutilmoqda</div>
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'PENDING').length}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-600 mb-1">Tayyorlanmoqda</div>
              <div className="text-2xl font-bold text-purple-600">
                {orders.filter(o => o.status === 'PROCESSING').length}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-600 mb-1">Yuborilgan</div>
              <div className="text-2xl font-bold text-indigo-600">
                {orders.filter(o => o.status === 'SHIPPED').length}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-600 mb-1">Yetkazilgan</div>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qidirish
                </label>
                <input
                  type="text"
                  placeholder="Buyurtma raqami..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Holat
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="">Barcha holatlar</option>
                  <option value="PENDING">Kutilmoqda</option>
                  <option value="CONFIRMED">Tasdiqlangan</option>
                  <option value="PROCESSING">Tayyorlanmoqda</option>
                  <option value="SHIPPED">Yuborilgan</option>
                  <option value="DELIVERED">Yetkazilgan</option>
                  <option value="CANCELLED">Bekor qilingan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Buyurtma</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sana</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Summa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">To'lov</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Holat</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">#{order.id}</div>
                        <div className="text-sm text-gray-600">{order.items.length} ta mahsulot</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">{order.paymentMethod === 'card' ? 'Karta' : 'Naqd'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          order.paymentStatus === 'PAID' ? 'badge-success' :
                          order.paymentStatus === 'PENDING' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {order.paymentStatus === 'PAID' ? 'To\'langan' :
                           order.paymentStatus === 'PENDING' ? 'Kutilmoqda' :
                           'Xatolik'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`badge ${getStatusColor(order.status)} border-0 cursor-pointer`}
                        >
                          <option value="PENDING">Kutilmoqda</option>
                          <option value="CONFIRMED">Tasdiqlangan</option>
                          <option value="PROCESSING">Tayyorlanmoqda</option>
                          <option value="SHIPPED">Yuborilgan</option>
                          <option value="DELIVERED">Yetkazilgan</option>
                          <option value="CANCELLED">Bekor qilingan</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="btn-secondary text-sm py-1 px-3"
                            target="_blank"
                          >
                            👁️
                          </Link>
                          <button className="btn-secondary text-sm py-1 px-3">
                            📄
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Buyurtma topilmadi</h3>
                <p className="text-gray-600">Qidiruv mezonlaringizni o'zgartiring</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredOrders.length} ta buyurtma ko'rsatilmoqda
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary">← Oldingi</button>
              <button className="btn-secondary">Keyingi →</button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}