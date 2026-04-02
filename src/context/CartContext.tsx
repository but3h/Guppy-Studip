import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
  selectedGender: 'male' | 'female' | 'both';
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, gender: 'male' | 'female' | 'both') => void;
  removeFromCart: (productId: string, gender: string) => void;
  updateQuantity: (productId: string, gender: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number, gender: 'male' | 'female' | 'both') => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedGender === gender);
      const stock = gender === 'male' ? (product.maleStock || 0) : (product.femaleStock || 0);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedGender === gender)
            ? { ...item, quantity: Math.min(stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedGender: gender }];
    });
  };

  const removeFromCart = (productId: string, gender: string) => {
    setItems(prev => prev.filter(item => !(item.id === productId && item.selectedGender === gender)));
  };

  const updateQuantity = (productId: string, gender: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      (item.id === productId && item.selectedGender === gender) ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      totalItems,
      totalPrice
    }}>
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
