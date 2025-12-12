'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Report, CartItem } from '@/types';
import { useAuth } from './AuthContext';

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
    const { user } = useAuth();

    // Skip operations during static generation
    const isStaticGeneration = typeof window === 'undefined';

    const saveCart = (items: CartItem[]) => {
        setCartItems(items);
        localStorage.setItem('cart', JSON.stringify(items));
    };

    const clearCart = () => {
        saveCart([]);
    };

    useEffect(() => {
        // Skip during static generation
        if (isStaticGeneration) return;

        // Load cart from local storage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from local storage', e);
            }
        }
    }, [isStaticGeneration]);

    // Clear cart when user logs out (listen to user state from AuthContext)
    useEffect(() => {
        // Skip during static generation
        if (isStaticGeneration) return;

        if (!user) {
            setCartItems([]);
            localStorage.removeItem('cart');
        }
    }, [user, isStaticGeneration]);

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
