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
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with Glassmorphism */}
        <motion.div 
          className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center">
              <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                My Products
              </span>
              <motion.span 
                className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {productsList.length} items
              </motion.span>
            </h1>

            {/* Improved Search Bar */}
            <motion.div 
              className="w-full md:w-96 max-w-xs md:max-w-md relative"
              initial={{ width: "80%", opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-300 ease-in-out text-sm placeholder-gray-500"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <IoSearchSharp className="text-xl text-green-600" />
                </div>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Improved Filters and Sorting */}
          <motion.div 
            className="flex flex-wrap items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center space-x-3">
              <motion.button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 rounded-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2 shadow-sm transition-all duration-200"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaFilter className="text-green-600" /> 
                <span className="font-medium">Filters</span>
              </motion.button>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 rounded-full bg-white border-2 border-gray-200 text-gray-700 font-medium hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent shadow-sm transition-all duration-200"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                  <FaSort className="text-gray-500" />
                </div>
              </div>
            </div>
            
            {/* Improved Add New Product Button */}
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.97 }}
            >
              <IoAddCircleOutline className="text-xl" />
              <span>Add New Product</span>
            </motion.button>
          </motion.div>
          
          {/* Category Filter - Show only when filters are expanded */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <motion.button
                        key={category}
                        onClick={() => setSelectedCategory(category === "All" ? "" : category)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                          (category === "All" && selectedCategory === "") || category === selectedCategory
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Product List with Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <motion.div 
                    className="inline-block p-4 bg-green-100 rounded-full mb-4"
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
                    <IoAddCircleOutline className="text-4xl text-green-600" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">No products found</h2>
                  <p className="text-gray-600 mb-6">
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
                      className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 border-none mr-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear Filters
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add New Product
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