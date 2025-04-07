import axios from 'axios';
import authService from './authService';

// Base URL for API requests
const API_URL = `${import.meta.env.VITE_BACKEND_DOMAIN}/api`;

export async function createEditProduct(product, id) {
  const token = authService.getToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    let response;
    
    // Create new product
    if (!id) {
      response = await axios.post(`${API_URL}/products/`, product, { headers });
    } 
    // Edit existing product
    else {
      response = await axios.put(`${API_URL}/products/${id}/`, product, { headers });
    }

    return response.data;
  } catch (error) {
    console.error("Error with product operation:", error);
    throw new Error(error.response?.data?.message || "Product operation failed");
  }
}

export async function getProduct() {
  try {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/products/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    // If it's a 404, just return an empty array (no products yet)
    if (error.response?.status === 404) {
      return [];
    }
    console.error('Error fetching products:', error);
    throw error; // Propagate the error for handling in the component
  }
}

export async function deleteProduct(productId) {
  try {
    const token = authService.getToken();
    
    // First, get the product details to access the image URLs
    const productResponse = await axios.get(`${API_URL}/products/${productId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const product = productResponse.data;
    console.log('Deleting product with images:', product);
    
    // Delete all Cloudinary images associated with the product
    const imageUrls = [
      product.imageUrl,
      product.imageUrl2,
      product.imageUrl3
    ].filter(url => url && url.includes('cloudinary.com'));
    
    console.log('Found Cloudinary images to delete:', imageUrls);
    
    if (imageUrls.length > 0) {
      // Import the deleteCloudinaryImage function
      const { deleteCloudinaryImage } = await import('./apiCloudinary');
      
      // Delete all images one by one for better error handling
      for (const url of imageUrls) {
        try {
          console.log('Attempting to delete image:', url);
          await deleteCloudinaryImage(url);
        } catch (imgError) {
          console.error(`Failed to delete image ${url}:`, imgError);
          // Continue with other images even if one fails
        }
      }
    }
    
    // Now delete the product from the database
    await axios.delete(`${API_URL}/products/${productId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Product successfully deleted from database');
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.response?.data?.message || "Product could not be deleted");
  }
}