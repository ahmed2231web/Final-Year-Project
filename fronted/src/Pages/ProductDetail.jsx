import React from 'react';
import ProductDetail from '../Components/Products/ProductDetail';
import { useOutletContext } from 'react-router-dom';

const ProductDetailPage = () => {
  // Get addToCart function from outlet context if available
  const context = useOutletContext();
  const addToCart = context?.addToCart || (() => {
    console.warn('addToCart function not available in context');
  });

  return <ProductDetail addToCart={addToCart} />;
};

export default ProductDetailPage;
