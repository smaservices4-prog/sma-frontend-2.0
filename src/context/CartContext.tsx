'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Report, CartItem } from '@/types';
import { supabase } from '@/lib/supabase';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (report: Report) => void;
    removeFromCart: (reportId: string) => void;
    clearCart: () => void;
    getCartItemsCount: () => number;
    isInCart: (reportId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const saveCart = (items: CartItem[]) => {
        setCartItems(items);
        localStorage.setItem('cart', JSON.stringify(items));
    };

    const clearCart = () => {
        saveCart([]);
    };

    useEffect(() => {
        // Load cart from local storage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from local storage', e);
            }
        }

        // Listen to auth state changes and clear cart on logout
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setCartItems([]);
                localStorage.removeItem('cart');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const addToCart = (report: Report) => {
        if (isInCart(report.id)) return;
        const newItems = [...cartItems, { report, quantity: 1 }];
        saveCart(newItems);
    };

    const removeFromCart = (reportId: string) => {
        const newItems = cartItems.filter(item => item.report.id !== reportId);
        saveCart(newItems);
    };

    const getCartItemsCount = () => {
        return cartItems.length;
    };

    const isInCart = (reportId: string) => {
        return cartItems.some(item => item.report.id === reportId);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartItemsCount, isInCart }}>
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
