import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUpload, FaImage, FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { createEditProduct } from '../../../Services/apiProducts';
import uploadService from '../../../Services/uploadService';
import authService from '../../../Services/autheServices';

function AddProductForm({productToEdit={}, onFormSubmit}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      productName: productToEdit?.productName || '',
      category: productToEdit?.category || '',
      description: productToEdit?.description || '',
      price: productToEdit?.price || '',
      discount: productToEdit?.discount || '',
      stockQuantity: productToEdit?.stockQuantity || '',
      imageUrl: productToEdit?.imageUrl || '',
      imageUrl2: productToEdit?.imageUrl2 || '',
      imageUrl3: productToEdit?.imageUrl3 || ''
    }
  });
  
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([
    productToEdit?.imageUrl,
    productToEdit?.imageUrl2,
    productToEdit?.imageUrl3
  ].filter(Boolean));
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const isEditSession = !!productToEdit?.id;
  const editId = productToEdit?.id;
  
  // React Query Mutation for creating a new product
  const { mutate: createProduct, isLoading: isCreating } = useMutation({
    mutationFn: createEditProduct,
    onSuccess: () => {
      toast.success(isEditSession ? 'Product updated.' : 'New product created.');
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh products list
      reset(); // Reset form fields
      setSelectedFiles([]);
      setPreviewUrls([]);
      if (onFormSubmit) onFormSubmit(); // Call parent's onSubmit if provided
    },
    onError: (err) => {
      toast.error(err.message || 'There was an error');
    }
  });
  
  // React Query Mutation for editing an existing product
  const { mutate: editProduct, isLoading: isEditing } = useMutation({
    mutationFn: ({newCabinData, id}) => createEditProduct(newCabinData, id),
    onSuccess: () => {
      toast.success('Product successfully edited');
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh products list
      reset(); // Reset form fields
      setSelectedFiles([]);
      setPreviewUrls([]);
      if (onFormSubmit) onFormSubmit(); // Call parent's onSubmit if provided
    },
    onError: (err) => {
      toast.error(err.message || 'There was an error');
    }
  });
  
  const isWorking = isCreating || isEditing || isUploading;
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error('Please select only image files');
      return;
    }
    
    // Validate file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 5MB per image');
      return;
    }
    
    // Limit to 3 files
    if (files.length > 3) {
      toast.error('You can only upload up to 3 images');
      return;
    }
    
    setSelectedFiles(files);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    // Clean up old preview URLs to prevent memory leaks
    previewUrls.forEach(url => {
      if (!url.startsWith('http')) {
        URL.revokeObjectURL(url);
      }
    });
    
    setPreviewUrls(newPreviewUrls);
  };
  
  const onSubmit = async (data) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Create a copy of the product data
      const productData = { ...data };
      
      // If there are new files selected, upload them to Cloudinary via backend
      if (selectedFiles.length > 0) {
        // Show upload toast
        const uploadToastId = toast.loading('Preparing images for upload...');
        
        try {
          // Get the current user for creating the folder name
          const userData = authService.getUserData();
          const userId = userData?.id || 'unknown';
          const username = userData?.username || 'unknown';
          
          // Create a folder name based on user data and selected category
          const category = data.category || 'unknown';
          const folderName = `agroconnect/products/${category}`;
          const farmerName = username;
          
          toast.loading('Starting upload to server...', { id: uploadToastId });
          setUploadProgress(20);
          
          // Upload all selected images with progress tracking via backend proxy
          const imageUrls = await uploadService.uploadMultipleImages(selectedFiles, { 
            folderName, 
            farmerName,
            category: data.category, // Pass the category to the upload service
            onProgress: (progress) => {
              setUploadProgress(20 + (progress * 0.6)); // Scale progress to 20-80% range
              
              // Update the toast message with progress
              toast.loading(`Uploading images... ${Math.round(progress)}%`, {
                id: uploadToastId
              });
            }
          });
          
          setUploadProgress(80);
          
          // Update the product data with the image URLs
          if (imageUrls && imageUrls.length > 0) {
            productData.imageUrl = imageUrls[0] || productData.imageUrl;
            if (imageUrls.length > 1) productData.imageUrl2 = imageUrls[1];
            if (imageUrls.length > 2) productData.imageUrl3 = imageUrls[2];
            
            toast.success(`Successfully uploaded ${imageUrls.length} image(s)`, {
              id: uploadToastId
            });
          } else {
            // No images were successfully uploaded
            toast.error('Failed to upload images - server returned no URLs', {
              id: uploadToastId
            });
            setIsUploading(false);
            return;
          }
        } catch (error) {
          console.error('Error in image upload:', error);
          let errorMessage = 'Image upload failed';
          
          // Extract more specific error message if available
          if (error.message) {
            errorMessage += `: ${error.message}`;
          }
          
          toast.error(errorMessage, {
            id: uploadToastId
          });
          setIsUploading(false);
          return;
        }
      }
      
      setUploadProgress(90);
      
      // If we're editing, call editProduct, otherwise call createProduct
      if (isEditSession) {
        editProduct({ newCabinData: productData, id: editId });
      } else {
        createProduct(productData);
      }
      
      setUploadProgress(100);
    } catch (error) {
      toast.error(`Error saving product: ${error.message || 'Unknown error'}`);
      console.error('Product save error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleCancel = () => {
    // Clean up preview URLs
    previewUrls.forEach(url => {
      if (!url.startsWith('http')) {
        URL.revokeObjectURL(url);
      }
    });
    // Reset form and state
    reset();
    setSelectedFiles([]);
    setPreviewUrls([]);
    // Call the onFormSubmit callback to close the form
    if (onFormSubmit) onFormSubmit();
  };
  
  const removePreview = (index) => {
    const newPreviewUrls = [...previewUrls];
    const newSelectedFiles = [...selectedFiles];
    
    // Revoke object URL if it's a local file
    if (newPreviewUrls[index] && !newPreviewUrls[index].startsWith('http')) {
      URL.revokeObjectURL(newPreviewUrls[index]);
    }
    
    // Remove the preview and file
    newPreviewUrls.splice(index, 1);
    newSelectedFiles.splice(index, 1);
    
    setPreviewUrls(newPreviewUrls);
    setSelectedFiles(newSelectedFiles);
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                {isEditSession ? 'Edit Product' : 'Add New Product'}
              </span>
            </h2>
            <button 
              onClick={handleCancel}
              className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <IoClose className="text-gray-600 text-xl" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="form-control w-full md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                <input
                  type="text"
                  {...register("productName", { required: "Product name is required" })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  placeholder="Enter product name"
                />
                {errors.productName && (
                  <span className="text-red-500 text-sm mt-1">{errors.productName.message}</span>
                )}
              </div>
              
              {/* Category */}
              <div className="form-control w-full md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <div className="relative">
                  <select 
                    {...register("category", { required: "Category is required" })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none appearance-none"
                  >
                    <option value="">Select a category</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Crops">Crops</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.category && (
                  <span className="text-red-500 text-sm mt-1">{errors.category.message}</span>
                )}
              </div>
              
              {/* Description */}
              <div className="form-control w-full md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea 
                  {...register("description", { 
                    required: "Description is required",
                    minLength: {
                      value: 10,
                      message: "Description should be at least 10 characters"
                    }
                  })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                  placeholder="Describe your product..."
                  rows={4}
                ></textarea>
                {errors.description && (
                  <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>
                )}
              </div>
              
              {/* Price */}
              <div className="form-control w-full">
                <label className="text-sm font-medium text-gray-700 mb-1.5">Price (per kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    {...register("price", { 
                      required: "Price is required",
                      min: {
                        value: 0.01,
                        message: "Price must be greater than 0"
                      }
                    })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500">$</span>
                  </div>
                </div>
                {errors.price && (
                  <span className="text-red-500 text-sm mt-1">{errors.price.message}</span>
                )}
              </div>
              
              {/* Discount */}
              <div className="form-control w-full">
                <label className="text-sm font-medium text-gray-700 mb-1.5">Discount (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    {...register("discount", { 
                      min: {
                        value: 0,
                        message: "Discount cannot be negative"
                      },
                      max: {
                        value: 100,
                        message: "Discount cannot exceed 100%"
                      }
                    })}
                    className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
                {errors.discount && (
                  <span className="text-red-500 text-sm mt-1">{errors.discount.message}</span>
                )}
              </div>
              
              {/* Stock Quantity */}
              <div className="form-control w-full md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5">Stock Quantity (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("stockQuantity", { 
                    required: "Stock quantity is required",
                    min: {
                      value: 0,
                      message: "Stock cannot be negative"
                    }
                  })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  placeholder="0.00"
                />
                {errors.stockQuantity && (
                  <span className="text-red-500 text-sm mt-1">{errors.stockQuantity.message}</span>
                )}
              </div>
              
              {/* Image Upload */}
              <div className="form-control w-full md:col-span-2 mt-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5">Product Images (Up to 3)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-all bg-gray-50">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="product-images"
                    multiple
                  />
                  <label htmlFor="product-images" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FaUpload className="text-green-500 text-2xl" />
                      <span className="text-gray-700 font-medium">Click to upload images</span>
                      <span className="text-gray-500 text-sm">or drag and drop</span>
                      <span className="text-xs text-gray-400 mt-1">
                        Max 3 images (5MB each) - JPG, PNG, GIF
                      </span>
                    </div>
                  </label>
                </div>
                
                {/* Image Preview */}
                {previewUrls.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <motion.div 
                          key={index} 
                          className="relative group rounded-xl overflow-hidden shadow-sm border-2 border-green-100"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-28 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <motion.button
                              type="button"
                              onClick={() => removePreview(index)}
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaTimes className="text-red-500 text-xs" />
                            </motion.button>
                            <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {index + 1}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upload Progress */}
                {isUploading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      ></motion.div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">Uploading images...</p>
                      <p className="text-xs font-medium text-green-600">{uploadProgress}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
              <motion.button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isWorking}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isWorking}
              >
                {isWorking ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isUploading ? 'Uploading...' : (isEditSession ? 'Updating...' : 'Creating...')}
                  </>
                ) : (
                  <>
                    <FaCheck className="text-sm" />
                    {isEditSession ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AddProductForm;
