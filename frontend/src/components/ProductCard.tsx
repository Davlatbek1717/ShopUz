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

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart, state } = useCart();
  const { loading } = state;
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

  const priceInfo = formatPrice(product.price, product.discount);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      // Show success message (you can add a toast notification here)
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show error message
    }
  };

  return (
    <div 
      className={`card overflow-hidden group animate-fadeInUp`} 
      style={{animationDelay: `${index * 0.05}s`}}
    >
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-lg font-medium">Rasm yo'q</div>
            </div>
          </div>
        )}
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
            -{product.discount}%
          </div>
        )}
        
        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              Tugagan
            </div>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <Link
            href={`/products/${product.id}`}
            className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Batafsil ko'rish
          </Link>
        </div>
      </div>
      
      <div className="p-6">
        {/* Category Badge */}
        <div className="badge badge-primary mb-3">
          {product.category.name}
        </div>
        
        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {priceInfo.hasDiscount ? (
              <>
                <span className="text-xl font-bold text-green-600">
                  ${priceInfo.discounted}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${priceInfo.original}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900">
                ${priceInfo.original}
              </span>
            )}
          </div>
          <div className={`badge ${
            product.stock > 10 
              ? 'badge-success' 
              : product.stock > 0 
                ? 'badge-warning' 
                : 'badge-danger'
          }`}>
            {product.stock > 0 ? `${product.stock} ta` : 'Tugagan'}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 btn-primary text-center text-sm py-2"
          >
            Ko'rish
          </Link>
          <button
            className="btn-secondary py-2 px-3 text-sm hover:bg-green-600 hover:text-white hover:border-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.stock === 0 || loading}
            title="Savatga qo'shish"
            onClick={handleAddToCart}
          >
            {loading ? '⏳' : '🛒'}
          </button>
        </div>
      </div>
    </div>
  );
}