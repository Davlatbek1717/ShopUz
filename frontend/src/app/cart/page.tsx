'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import Loading from '@/components/Loading';

export default function CartPage() {
  const { state, updateCartItem, removeFromCart, clearCart } = useCart();
  const { cart, loading, error } = state;

  const formatPrice = (price: number, discount?: number) => {
    if (discount) {
      const discountedPrice = price * (1 - discount / 100);
      return {
        original: price.toFixed(2),
        discounted: discountedPrice.toFixed(2),
        hasDiscount: true,
      };
    }
    return {
      original: price.toFixed(2),
      hasDiscount: false,
    };
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateCartItem(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    if (confirm('Savatni tozalashni xohlaysizmi?')) {
      clearCart();
    }
  };

  if (loading && !cart) {
    return <Loading size="lg" text="Savatcha yuklanmoqda..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">🏠 Bosh sahifa</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Savatcha</span>
          </div>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-lg text-gray-900 mb-2">Savatcha</h1>
            <p className="text-gray-600">
              {cart?.totalItems || 0} ta mahsulot savatda
            </p>
          </div>
          
          {cart && cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
            >
              🗑️ Savatni tozalash
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800 font-medium">Xatolik yuz berdi</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {cart && cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Savatcha bo'sh</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Hozircha savatda hech qanday mahsulot yo'q. Xarid qilishni boshlang!
            </p>
            <Link
              href="/products"
              className="btn-primary text-lg px-8 py-4"
            >
              🛍️ Xarid qilishni boshlash
            </Link>
          </div>
        ) : cart && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const priceInfo = formatPrice(item.product.price, item.product.discount ?? undefined);
                const itemTotal = priceInfo.hasDiscount && priceInfo.discounted
                  ? parseFloat(priceInfo.discounted) * item.quantity
                  : parseFloat(priceInfo.original) * item.quantity;

                return (
                  <div key={item.id} className="card p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl">📦</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="badge badge-primary mb-2">
                              {item.product.category.name}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">
                              {item.product.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {item.product.description}
                            </p>
                            
                            {/* Price */}
                            <div className="flex items-center gap-2 mb-4">
                              {priceInfo.hasDiscount ? (
                                <>
                                  <span className="text-xl font-bold text-green-600">
                                    ${priceInfo.discounted}
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    ${priceInfo.original}
                                  </span>
                                  <span className="badge badge-danger">
                                    -{item.product.discount}%
                                  </span>
                                </>
                              ) : (
                                <span className="text-xl font-bold text-gray-900">
                                  ${priceInfo.original}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-end gap-4">
                            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="px-4 py-2 hover:bg-gray-200 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-4 py-2 bg-white border-x border-gray-200 min-w-[60px] text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="px-4 py-2 hover:bg-gray-200 transition-colors"
                                disabled={item.quantity >= item.product.stock}
                              >
                                +
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ${itemTotal.toFixed(2)}
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                              >
                                🗑️ O'chirish
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Buyurtma xulosasi</h3>
                
                <div className="space-y-4 mb-6">
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
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Jami:</span>
                      <span className="text-blue-600">${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="btn-primary w-full text-lg py-4 text-center block"
                  >
                    💳 Buyurtma berish
                  </Link>
                  <Link
                    href="/products"
                    className="btn-secondary w-full text-center block"
                  >
                    ← Xaridni davom ettirish
                  </Link>
                </div>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
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
        )}
      </div>
    </div>
  );
}