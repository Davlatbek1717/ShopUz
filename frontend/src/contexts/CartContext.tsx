'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  discount?: number;
  category: {
    id: string;
    name: string;
  };
}

interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
}

interface CartState {
  cart: CartSummary | null;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: CartSummary }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_ITEM_COUNT'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'UPDATE_ITEM_COUNT':
      if (!state.cart) return state;
      
      const updatedItems = state.cart.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      // Recalculate totals
      let subtotal = 0;
      let discount = 0;
      let totalItems = 0;

      updatedItems.forEach(item => {
        const itemPrice = item.product.price;
        const itemDiscount = item.product.discount || 0;
        const itemQuantity = item.quantity;

        totalItems += itemQuantity;
        
        const itemSubtotal = itemPrice * itemQuantity;
        const itemDiscountAmount = (itemSubtotal * itemDiscount) / 100;
        
        subtotal += itemSubtotal;
        discount += itemDiscountAmount;
      });

      const total = subtotal - discount;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          totalItems,
          subtotal: Math.round(subtotal * 100) / 100,
          discount: Math.round(discount * 100) / 100,
          total: Math.round(total * 100) / 100,
        },
      };
    
    case 'REMOVE_ITEM':
      if (!state.cart) return state;
      
      const filteredItems = state.cart.items.filter(item => item.id !== action.payload);
      
      // Recalculate totals
      let newSubtotal = 0;
      let newDiscount = 0;
      let newTotalItems = 0;

      filteredItems.forEach(item => {
        const itemPrice = item.product.price;
        const itemDiscount = item.product.discount || 0;
        const itemQuantity = item.quantity;

        newTotalItems += itemQuantity;
        
        const itemSubtotal = itemPrice * itemQuantity;
        const itemDiscountAmount = (itemSubtotal * itemDiscount) / 100;
        
        newSubtotal += itemSubtotal;
        newDiscount += itemDiscountAmount;
      });

      const newTotal = newSubtotal - newDiscount;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItems,
          totalItems: newTotalItems,
          subtotal: Math.round(newSubtotal * 100) / 100,
          discount: Math.round(newDiscount * 100) / 100,
          total: Math.round(newTotal * 100) / 100,
        },
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        cart: {
          items: [],
          totalItems: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
        },
      };
    
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('http://localhost:5000/api/cart');
      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_CART', payload: data.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to fetch cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('http://localhost:5000/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh cart after adding item
        await fetchCart();
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to add item to cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      // Optimistically update UI
      dispatch({ type: 'UPDATE_ITEM_COUNT', payload: { itemId, quantity } });
      
      const response = await fetch(`http://localhost:5000/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (!data.success) {
        // Revert optimistic update and show error
        await fetchCart();
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to update cart item' });
      }
    } catch (error) {
      // Revert optimistic update and show error
      await fetchCart();
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      // Optimistically update UI
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      
      const response = await fetch(`http://localhost:5000/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        // Revert optimistic update and show error
        await fetchCart();
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to remove item from cart' });
      }
    } catch (error) {
      // Revert optimistic update and show error
      await fetchCart();
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'CLEAR_CART' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to clear cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    }
  };

  const getCartCount = () => {
    return state.cart?.totalItems || 0;
  };

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const value: CartContextType = {
    state,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}