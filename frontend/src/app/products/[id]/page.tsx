'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  discount?: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    description: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, state } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
        } else {
          router.push('/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

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

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      setMessage(null);
      await addToCart(product.id, quantity);
      
      // Show success message
      setMessage({
        type: 'success',
        text: `${quantity} ta ${product.name} savatga qo'shildi!`
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setMessage({
        type: 'error',
        text: 'Savatga qo\'shishda xatolik yuz berdi. Qaytadan urinib ko\'ring.'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-4">Mahsulot topilmadi</div>
          <Link href="/products" className="text-blue-600 hover:underline">
            Mahsulotlar sahifasiga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const priceInfo = formatPrice(product.price, product.discount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">🏠 Bosh sahifa</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-blue-600 transition-colors">Mahsulotlar</Link>
            <span>/</span>
            <Link href={`/products?categoryId=${product.categoryId}`} className="hover:text-blue-600 transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success/Error Message */}
          {message && (
            <div className={`mx-8 mt-8 p-4 rounded-lg ${
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Images */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="sticky top-8">
                <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage] || product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <div className="text-8xl mb-6">📷</div>
                        <div className="text-xl font-medium">Rasm yo'q</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                          selectedImage === index 
                            ? 'border-blue-500 shadow-lg scale-105' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-8 lg:p-12">
              <div className="space-y-8">
                {/* Header */}
                <div>
                  <div className="badge badge-primary mb-4 text-lg px-4 py-2">
                    {product.category.name}
                  </div>
                  <h1 className="heading-lg text-gray-900 mb-6 leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {priceInfo.hasDiscount ? (
                      <>
                        <span className="text-4xl font-bold text-green-600">
                          ${priceInfo.discounted}
                        </span>
                        <span className="text-2xl text-gray-500 line-through">
                          ${priceInfo.original}
                        </span>
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse">
                          -{product.discount}% CHEGIRMA
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-gray-900">
                        ${priceInfo.original}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 font-medium">Mavjudlik:</span>
                    {product.stock > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-bold text-lg">
                          {product.stock} ta mavjud
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-red-600 font-bold text-lg">
                          Tugagan
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity and Add to Cart */}
                {product.stock > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <label className="text-gray-700 font-semibold text-lg">Miqdor:</label>
                      <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-6 py-3 hover:bg-gray-200 transition-colors text-xl font-bold"
                        >
                          -
                        </button>
                        <span className="px-8 py-3 bg-white border-x border-gray-200 min-w-[80px] text-center text-xl font-bold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-6 py-3 hover:bg-gray-200 transition-colors text-xl font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || state.loading}
                        className="flex-1 btn-primary text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {addingToCart ? '⏳ Qo\'shilmoqda...' : '🛒 Savatga Qo\'shish'}
                      </button>
                      <Link
                        href="/checkout"
                        className="btn-secondary bg-gradient-to-r from-green-500 to-green-600 text-white border-0 text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center block"
                      >
                        💳 Hozir Sotib Olish
                      </Link>
                    </div>
                  </div>
                )}

                {/* Out of Stock */}
                {product.stock === 0 && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                    <div className="text-center">
                      <div className="text-6xl mb-4">😔</div>
                      <div className="text-red-800 font-bold text-xl mb-2">
                        Bu mahsulot hozirda mavjud emas
                      </div>
                      <div className="text-red-600 mb-4">
                        Mahsulot qayta kelganda xabar berish uchun email manzilni qoldiring
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Email manzilingiz"
                          className="flex-1 input-field"
                        />
                        <button className="btn-primary">
                          Xabar Berish
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: '🚚', text: 'Bepul yetkazish $50+' },
                    { icon: '↩️', text: '30 kun qaytarish' },
                    { icon: '🔒', text: 'Xavfsiz to\'lov' },
                    { icon: '🎧', text: '24/7 yordam' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="text-gray-700 font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Products */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 btn-outline text-lg px-8 py-4 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Mahsulotlar sahifasiga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}