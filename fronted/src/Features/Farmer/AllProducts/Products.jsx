import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { IoSearchSharp } from "react-icons/io5";

import ProductCard from './ProductCard';
import AddProductForm from './AddProductForm';
import Spinner from '../../../ui/Spinner';

import { deleteProduct, getProduct } from '../../../Services/apiProducts';

function Products() {
  const queryClient = useQueryClient();
  const { isLoading, data: products, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProduct,
  });

  const { mutate: removeProduct } = useMutation({
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

  const handleAddProduct = (newProduct) => {
    console.log('New product:', newProduct);
    setShowAddForm(false);
  };

  const handleEditProduct = (product) => {
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = (productId) => {
    removeProduct(productId);
  };

  // Check if products are loaded
  console.log('Products:', products);
  console.log('Search Term:', searchTerm);

  const filteredProducts = products?.length > 0
    ? searchTerm
      ? products.filter((product) => {
          const searchText = searchTerm.toLowerCase().trim();
          const productName = product.productName?.toLowerCase().trim() || ''; // Use your actual property name here
          return productName.includes(searchText);
        })
      : products
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error: {error.message}
      </div>
    );
  }

  console.log('Filtered Products:', filteredProducts); // Check filtered products

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">My Products</h1>

          {/* Search Bar */}
          <div className="w-full md:w-96 max-w-xs md:max-w-md flex items-center border border-gray-300 rounded-full shadow-lg bg-white">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-6 pr-12 py-3 text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition duration-300 ease-in-out text-sm placeholder-gray-500"
            />
            <button className="text-gray-800 p-3 rounded-full transition duration-300 ease-in-out">
              <IoSearchSharp className="text-xl" />
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))
          ) : (
            <p>No products found matching your search.</p>
          )}
        </div>

        <div className="flex max-w-full mb-4">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 w-full text-center"
          >
            {showAddForm ? 'Remove Product Form' : 'Add Product Form'}
          </button>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-white p-6 shadow-lg rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <AddProductForm onSubmit={handleAddProduct} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;