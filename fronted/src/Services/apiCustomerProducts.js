import axios from 'axios';
import authService from './authService';

// Base URL for API requests
const API_URL = `${import.meta.env.VITE_BACKEND_DOMAIN}/api`;

/**
 * Fetches all available products for customers
 * Unlike the farmer's getProduct function, this doesn't filter by farmer
 * @returns {Promise<Array>} Array of product objects
 */
export async function getAllProducts() {
    try {
        // Get authentication token if available (for authenticated users)
        const token = authService.getToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Fetch all products from the API
        const response = await axios.get(`${API_URL}/products/all/`, { headers });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching all products:', error);
        
        // If it's a 404, just return an empty array (no products yet)
        if (error.response?.status === 404) {
            return [];
        }
        
        throw error; // Propagate the error for handling in the component
    }
}

/**
 * Fetches unique categories from the products
 * @returns {Promise<Array>} Array of category strings
 */
export async function getProductCategories() {
    try {
        const products = await getAllProducts();
        // Extract unique categories
        const categories = [...new Set(products.map(product => product.category))];
        return categories;
    } catch (error) {
        console.error('Error fetching product categories:', error);
        return []; // Return empty array on error
    }
}

/**
 * Fetches products by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} Array of product objects filtered by category
 */
export async function getProductsByCategory(category) {
    try {
        const products = await getAllProducts();
        // Filter products by category if a category is specified
        return category === 'all' 
            ? products 
            : products.filter(product => product.category === category);
    } catch (error) {
        console.error(`Error fetching products by category ${category}:`, error);
        return []; // Return empty array on error
    }
}
