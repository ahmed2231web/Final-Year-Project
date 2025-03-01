import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import React from 'react';
import { createEditProduct } from '../../../Services/apiProducts'; // Ensure this is your API function
import InputProduct from './InputProduct';

function AddProductForm({productToEdit={}}) {

  const {id:editId, ...editValues}=productToEdit;
  const isEditSession = Boolean(editId);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: isEditSession ? editValues:{}
  });
  const queryClient = useQueryClient();
  const { isLoading: isAdding, mutate:createProduct } = useMutation({
    mutationFn: createEditProduct,
    onSuccess: () => {
      toast.success('Product added successfully');
      queryClient.invalidateQueries(["products"])
      reset(); // Reset the form after successful submission
    },
    onError: (error) => {
      toast.error('Error during product addition: ' + error.message);
    },
  });

  const { isLoading: isEditing, mutate: editProduct } = useMutation({
    mutationFn: ({newCabinData,id})=>createEditProduct(newCabinData,id),
    onSuccess: () => {
      toast.success('Product successfully edited');
      queryClient.invalidateQueries(["products"])
      reset(); // Reset the form after successful submission
    },
    onError: (error) => {
      toast.error('Error during product addition: ' + error.message);
    },
  });

  const isWorking = isAdding || isEditing;
  const onSubmit = (data) => {
    if(isEditSession) editProduct({newCabinData:{...data},id:editId})
    else createProduct({ ...data, id: Date.now().toString() });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Product Name */}
      <InputProduct
        type="text"
        id="productName"
        placeholder="Product Name"
        label="Product Name"
        error={errors?.productName?.message}
        {...register('productName', { required: 'Product name is required',
          pattern: {
            value: /^[A-Za-z\s]+$/i,
            message: "Please enter valid name"
        }
        })}
      />

      {/* Category */}
      <InputProduct
        type="text"
        id="category"
        placeholder="Category"
        label="Category"
        error={errors?.category?.message}
        {...register('category', { required: 'Category is required',
          pattern: {
            value: /^[A-Za-z\s]+$/i,
            message: "Please enter valid name"
        }
         })}
      />

      {/* Description */}
      <div className="flex items-center space-x-4 w-full">
  <label htmlFor="description" className="font-semibold w-1/4">Description</label>
  <textarea
    id="description"
    placeholder="Description"
    className="w-1/2 px-4 py-2 border rounded-md"
    {...register('description', { required: 'Description is required' })}
  />
  {errors?.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
</div>


      {/* Price */}
      <InputProduct
        type="number"
        id="price"
        placeholder="Price"
        label="Price"
        error={errors?.price?.message}
        {...register('price', { required: 'Price is required',
          pattern: {
            value: /^[0-9]*\.?[0-9]+$/, 
            message: 'Enter a valid number',
          },
        })}
      />

      {/* Stock */}
      <InputProduct
        type="number"
        id="stockQuantity"
        placeholder="Stock Quantity"
        label="Stock Quantity"
        error={errors?.stockQuantity?.message}
        {...register('stockQuantity', { required: 'Stock quantity is required',
          pattern: {
            value: /^[0-9]*\.?[0-9]+$/, 
            message: 'Enter a valid number',
          },
         })}
      />
      {/* Image URL */}
      <InputProduct
        type="text"
        id="imageUrl"
        placeholder="Image URL"
        label="Image URL"
        error={errors?.imageUrl?.message}
        {...register('imageUrl', { required: 'Image URL is required',
          pattern: {
            value: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(:[0-9]{1,5})?(\/.*)?$/,
            message: 'Enter a valid URL',
          },
         })}
      />

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          disabled={isWorking}
        >
          {isEditSession?"Edit Product":"Add Product"}
        </button>
      </div>
    </form>
  );
}

export default AddProductForm;
