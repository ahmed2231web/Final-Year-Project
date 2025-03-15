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

  const handleAddProduct = (newProduct) => {
    console.log('New product:', newProduct);
    setShowAddForm(false);
  };

  const handleEditProduct = (product) => {
    console.log('Edit product:', product);
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

            {/* Search Bar */}
            <motion.div 
              className="w-full md:w-96 max-w-xs md:max-w-md flex items-center border border-gray-200 rounded-full shadow-md bg-white overflow-hidden"
              initial={{ width: "80%", opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-6 pr-12 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-inset transition duration-300 ease-in-out text-sm placeholder-gray-500"
              />
              <div className="pr-4">
                <IoSearchSharp className="text-xl text-green-600" />
              </div>
            </motion.div>
          </div>

          {/* Filters and Sorting */}
          <motion.div 
            className="flex flex-wrap items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <motion.button 
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFilter className="text-green-600" /> 
                Filters
              </motion.button>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select select-sm select-bordered border-gray-300 pr-8 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <FaSort className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="btn btn-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <IoAddCircleOutline className="text-lg" />
              Add New Product
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
              <AddProductForm onFormSubmit={() => setShowAddForm(false)} />
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