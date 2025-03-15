import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8000/api';

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
    await axios.delete(`${API_URL}/products/${productId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.response?.data?.message || "Product could not be deleted");
  }
}