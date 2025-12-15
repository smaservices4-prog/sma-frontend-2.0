'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    const [cartInitialized, setCartInitialized] = useState(false);
    const { user, loading: authLoading } = useAuth();

    // Skip operations during static generation
    const isStaticGeneration = typeof window === 'undefined';

    const saveCart = useCallback((items: CartItem[]) => {
        setCartItems(items);
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, []);

    const clearCart = useCallback(() => {
        saveCart([]);
    }, [saveCart]);

    // Load cart from localStorage on client mount
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
        setCartInitialized(true);
    }, [isStaticGeneration]);

    // Clear cart only when user actually logs out (not during initial loading)
    useEffect(() => {
        // Skip during static generation or while still initializing
        if (isStaticGeneration || !cartInitialized || authLoading) return;

        // Only clear if we had a user before and now they're logged out
        if (!user) {
            setCartItems([]);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('cart');
            }
        }
    }, [user, authLoading, cartInitialized, isStaticGeneration]);

    const addToCart = useCallback((report: Report) => {
        if (isInCart(report.id)) return;
        const newItems = [...cartItems, { report, quantity: 1 }];
        saveCart(newItems);
    }, [cartItems, saveCart]);

    const removeFromCart = useCallback((reportId: string) => {
        const newItems = cartItems.filter(item => item.report.id !== reportId);
        saveCart(newItems);
    }, [cartItems, saveCart]);

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
