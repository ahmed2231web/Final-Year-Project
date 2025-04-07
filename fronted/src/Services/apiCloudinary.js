import axios from 'axios';
import authService from './authService';

// Get Cloudinary configuration from environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_URL = `${import.meta.env.VITE_BACKEND_DOMAIN}/api`;

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @param {string} options.folderName - Folder name in Cloudinary
 * @param {string} options.farmerName - Farmer name for subfolder
 * @param {string} options.category - Category name for subfolder
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<string>} - The uploaded image URL
 */
export const uploadImage = async (file, options = {}) => {
  try {
    const { folderName = 'agroconnect/products', farmerName = '', category = '', onProgress = () => {} } = options;
    
    // Create a FormData instance
    const formData = new FormData();
    
    // Add the file to the form data
    formData.append('file', file);
    
    // Add the upload preset - this must be whitelisted for unsigned uploads in Cloudinary dashboard
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Use the folder name directly without adding farmer name subfolder
    const folder = folderName;
    formData.append('folder', folder);
    
    // Add timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);
    formData.append('timestamp', timestamp);
    
    // Log upload attempt
    console.log('Uploading to Cloudinary:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folder,
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET // Log the actual preset being used
    });
    
    // Create axios instance with progress tracking
    const uploadInstance = axios.create();
    
    // Upload to Cloudinary
    const response = await uploadInstance.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      }
    );
    
    // Return the secure URL of the uploaded image
    return response.data.secure_url;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    
    // Extract and log the specific error message
    const errorMessage = error.response?.data?.error?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Unknown error';
    
    console.error('Upload error details:', errorMessage);
    
    throw new Error(`Failed to upload image: ${errorMessage}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string[]>} - Array of uploaded image URLs
 */
export const uploadMultipleImages = async (files, options = {}) => {
  try {
    const urls = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Calculate progress for this file in the overall process
      const onProgress = options.onProgress ? (percent) => {
        const overallPercent = Math.round((i * 100 + percent) / files.length);
        options.onProgress(overallPercent);
      } : undefined;
      
      // Upload the file
      const url = await uploadImage(file, {
        ...options,
        onProgress
      });
      
      urls.push(url);
    }
    
    return urls;
  } catch (error) {
    console.error('Error in uploadMultipleImages:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary using its URL
 * @param {string} imageUrl - The Cloudinary URL of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      console.error('Not a valid Cloudinary URL:', imageUrl);
      return false;
    }
    
    console.log('Attempting to delete Cloudinary image:', imageUrl);
    
    // Extract the folder and filename from the Cloudinary URL
    // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/agroconnect/products/image.jpg
    
    // Extract the public_id - everything after /upload/ excluding the version
    let publicId = '';
    
    // First try with regex to extract the path after /upload/vXXXXXX/
    const regex = /\/upload\/(?:v\d+\/)?(.+)$/;
    const match = imageUrl.match(regex);
    
    if (match && match[1]) {
      publicId = match[1];
      
      // Remove file extension if present
      if (publicId.includes('.')) {
        publicId = publicId.substring(0, publicId.lastIndexOf('.'));
      }
      
      console.log('Extracted public_id:', publicId);
    } else {
      console.error('Failed to extract public_id from URL:', imageUrl);
      return false;
    }
    
    // Use the Cloudinary API to delete the image via our backend endpoint
    const token = authService.getToken();
    const response = await axios.post(`${API_URL}/products/cloudinary/delete/`, 
      { public_id: publicId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Cloudinary deletion response:', response.data);
    return response.data.success === true;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error.response?.data || error.message || error);
    // Don't throw here - we want to continue with product deletion even if image deletion fails
    return false;
  }
};
