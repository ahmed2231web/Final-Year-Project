import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import React, { useState } from 'react';
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-green-700 border-b pb-3">
          {isEditSession ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Product Name */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Product Name</span>
            </label>
            <input
              type="text"
              {...register("productName", { required: "Product name is required" })}
              className="input input-bordered w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="Enter product name"
            />
            {errors.productName && (
              <span className="text-red-500 text-sm mt-1">{errors.productName.message}</span>
            )}
          </div>
          
          {/* Category */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Category</span>
            </label>
            <select 
              {...register("category", { required: "Category is required" })}
              className="select select-bordered w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            >
              <option value="">Select a category</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Crops">Crops</option>
            </select>
            {errors.category && (
              <span className="text-red-500 text-sm mt-1">{errors.category.message}</span>
            )}
          </div>
          
          {/* Description */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Description</span>
            </label>
            <textarea 
              {...register("description", { 
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description should be at least 10 characters"
                }
              })}
              className="textarea textarea-bordered h-24 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="Describe your product..."
            ></textarea>
            {errors.description && (
              <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>
            )}
          </div>
          
          {/* Price */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Price (per kg)</span>
            </label>
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
              className="input input-bordered w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="0.00"
            />
            {errors.price && (
              <span className="text-red-500 text-sm mt-1">{errors.price.message}</span>
            )}
          </div>
          
          {/* Discount */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Discount (%)</span>
            </label>
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
              className="input input-bordered w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="0"
            />
            {errors.discount && (
              <span className="text-red-500 text-sm mt-1">{errors.discount.message}</span>
            )}
          </div>
          
          {/* Stock Quantity */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Stock Quantity (kg)</span>
            </label>
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
              className="input input-bordered w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="0.00"
            />
            {errors.stockQuantity && (
              <span className="text-red-500 text-sm mt-1">{errors.stockQuantity.message}</span>
            )}
          </div>
          
          {/* Image Upload */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Product Images (Up to 3)</span>
            </label>
            <div className="flex items-center">
              <input 
                type="file" 
                onChange={handleFileChange}
                accept="image/*"
                className="file-input file-input-bordered w-full file-input-success"
                multiple
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Select up to 3 images (max 5MB each). Supported formats: JPG, PNG, GIF.
            </p>
            {errors.imageUrl && (
              <span className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</span>
            )}
            
            {/* Image Preview */}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-28 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <span className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 border-t pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-outline border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600"
              disabled={isWorking}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-green-600 hover:bg-green-700 text-white border-none"
              disabled={isWorking}
            >
              {isWorking ? (
                <>
                  <span className="loading loading-spinner"></span>
                  {isUploading ? 'Uploading...' : (isEditSession ? 'Updating...' : 'Creating...')}
                </>
              ) : (
                isEditSession ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductForm;
