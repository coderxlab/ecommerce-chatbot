import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProductById } from '../services/api';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('');
  // Load cart from localStorage on initial load
  useEffect(() => {
    const cartFromStorage = localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [];
    
    const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {};
    
    const paymentMethodFromStorage = localStorage.getItem('paymentMethod') || '';
    
    setCartItems(cartFromStorage);
    setShippingAddress(shippingAddressFromStorage);
    setPaymentMethod(paymentMethodFromStorage);
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Save shipping address to localStorage
  useEffect(() => {
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
  }, [shippingAddress]);
  
  // Save payment method to localStorage
  useEffect(() => {
    if (paymentMethod) {
      localStorage.setItem('paymentMethod', paymentMethod);
    }
  }, [paymentMethod]);
  
  const addToCart = async (id, qty) => {
    try {
      const data = await getProductById(id);
    
      const item = {
        product: data._id,
        name: data.name,
        image: data.image,
        price: data.price,
        countInStock: data.countInStock,
        qty,
      };
      
      // Check if item is already in cart
      const existItem = cartItems.find((x) => x.product === item.product);
      
      if (existItem) {
        setCartItems(
          cartItems.map((x) => (x.product === existItem.product ? item : x))
        );
      } else {
        setCartItems([...cartItems, item]);
      }
      toast.success('Item added to cart', {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Error adding item to cart', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

  };
  
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x.product !== id));
  };
  
  const saveShippingAddress = (data) => {
    setShippingAddress(data);
  };
  
  const savePaymentMethod = (data) => {
    setPaymentMethod(data);
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Calculate prices
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);
  
  // Compute isDraft based on shipping and payment info
  const isDraft = !shippingAddress.address || !paymentMethod;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        saveShippingAddress,
        savePaymentMethod,
        clearCart,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isDraft,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
