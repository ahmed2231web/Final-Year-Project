import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { IoSearchSharp, IoAddCircleOutline } from "react-icons/io5";
import { FaSort, FaFilter } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

import ProductCard from './ProductCard';
import AddProductForm from './AddProductForm';
import ProductDetailsModal from './ProductDetailsModal';
import Spinner from '../../../ui/Spinner';

import { deleteProduct, getProduct } from '../../../Services/apiProducts';

function Products() {
  const queryClient = useQueryClient();
  const { isLoading, data: products, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProduct,
    // Don't treat 404 as an error since it just means no products yet
    retry: (failureCount, error) => {
      // Don't retry if we got a 404 (no products yet)
      if (error.response?.status === 404) return false;
      // Otherwise retry up to 3 times
      return failureCount < 3;
    },
    // Return empty array for 404 responses
    onError: (error) => {
      if (error.response?.status !== 404) {
        console.error('Error fetching products:', error);
      }
    }
  });

  const { mutate: removeProduct, isLoading: isDeleting } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries(["products"]); // Refetch products after deletion
    },
    onError: (error) => {
      toast.error("Error deleting product");
      console.error(error);
    },
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, price-low, price-high
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);

  const handleAddProduct = (newProduct) => {
    console.log('New product:', newProduct);
    setShowAddForm(false);
    setProductToEdit(null);
  };

  const handleEditProduct = (product) => {
    console.log('Edit product:', product);
    setProductToEdit(product);
    setShowAddForm(true);
  };

  const handleDeleteProduct = (productId) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this product?")) {
      removeProduct(productId);
    }
  };
  
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };
  
  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
  };

  // Use empty array if products is undefined (404 response)
  const productsList = Array.isArray(products) ? products : [];

  // Filter products by search term and category
  const filteredProducts = productsList.filter((product) => {
    const matchesSearch = searchTerm
      ? product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    } else if (sortBy === "price-high") {
      return b.price - a.price;
    } else if (sortBy === "newest") {
      // Assuming products have a createdAt field, or using ID as fallback
      return b.id - a.id;
    }
    return 0;
  });

  // Get unique categories
  const categories = ["All", ...new Set(productsList.map(product => product.category))];

  // Loading animation
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Spinner />
        <motion.p 
          className="mt-4 text-green-600"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading your products...
        </motion.p>
      </div>
    );
  }

  // Don't show error for 404 (no products yet)
  if (error && error.response?.status !== 404) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 bg-gray-50">
        <motion.div 
          className="bg-white p-8 rounded-xl shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-2">Error Loading Products</h2>
          <p>{error.message}</p>
          <button 
            onClick={() => queryClient.invalidateQueries(["products"])}
            className="mt-4 btn btn-sm bg-green-600 text-white"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with search and add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Your Products</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <motion.div 
              className="relative w-full sm:w-auto"
              initial={{ width: '100%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
              <IoSearchSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </motion.div>
            
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors duration-300 w-full sm:w-auto justify-center sm:justify-start"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <IoAddCircleOutline className="text-lg sm:text-xl" />
              <span>Add Product</span>
            </motion.button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <span className="font-medium text-sm sm:text-base">Filters</span>
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs sm:text-sm text-green-600 hover:text-green-800 transition-colors"
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 sm:mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categories */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category</label>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${selectedCategory === (category === 'All' ? '' : category) ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-200'} border`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Sort */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Sort By</label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FaSort className="text-gray-500 text-xs sm:text-sm" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-xs sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 py-1 sm:py-2"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <AnimatePresence>
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                  className="w-full"
                >
                  <ProductCard
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onView={handleViewProduct}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full"
              >
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8 text-center">
                  <motion.div 
                    className="inline-block p-3 sm:p-4 bg-green-100 rounded-full mb-3 sm:mb-4"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <IoAddCircleOutline className="text-2xl sm:text-3xl md:text-4xl text-green-600" />
                  </motion.div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No products found</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    {searchTerm || selectedCategory 
                      ? "Try adjusting your search or filters"
                      : "Add your first product to get started"}
                  </p>
                  {(searchTerm || selectedCategory) && (
                    <motion.button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("");
                      }}
                      className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md border-none mr-2"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Clear Filters
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 sm:px-5 md:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-sm sm:text-base font-medium shadow-md sm:shadow-lg hover:shadow-xl border-none flex items-center justify-center gap-2 transition-all duration-300 mx-auto"
                    whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ y: 5 }}
                    animate={{ y: 0 }}
                  >
                    <IoAddCircleOutline className="text-lg sm:text-xl" />
                    <span>Add New Product</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Product Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AddProductForm 
                productToEdit={productToEdit} 
                onFormSubmit={() => setShowAddForm(false)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Product Details Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <ProductDetailsModal 
              product={selectedProduct}
              onClose={handleCloseProductDetails}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Products;