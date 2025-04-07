import authService from './autheServices';
import { uploadImage as cloudinaryUpload, uploadMultipleImages as cloudinaryUploadMultiple } from './apiCloudinary';

/**
 * Service for handling image uploads
 */
const uploadService = {
  /**
   * Upload a single image directly to Cloudinary
   * @param {File} file - The image file to upload
   * @param {Object} options - Upload options
   * @returns {Promise<string>} - The Cloudinary URL of the uploaded image
   */
  uploadImage: async (file, options = {}) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }
      
      console.log('Uploading file:', file.name);
      
      // Get user data for folder naming
      const userData = authService.getUserData();
      // Use full_name or email instead of username since CustomUser doesn't have username field
      const userIdentifier = userData?.full_name || userData?.email || '';
      
      // Upload directly to Cloudinary
      return await cloudinaryUpload(file, {
        folderName: options.folderName || 'agroconnect/products',
        farmerName: options.farmerName || userIdentifier,
        onProgress: options.onProgress,
        category: options.category || 'unknown'
      });
    } catch (error) {
      console.error('Error in uploadService.uploadImage:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  },
  
  /**
   * Upload multiple images directly to Cloudinary
   * @param {File[]} files - Array of image files to upload
   * @param {Object} options - Upload options
   * @returns {Promise<string[]>} - Array of Cloudinary URLs
   */
  uploadMultipleImages: async (files, options = {}) => {
    try {
      if (!files || files.length === 0) {
        return [];
      }
      
      // Get user data for folder naming
      const userData = authService.getUserData();
      // Use full_name or email instead of username since CustomUser doesn't have username field
      const userIdentifier = userData?.full_name || userData?.email || '';
      
      // Upload directly to Cloudinary
      return await cloudinaryUploadMultiple(files, {
        folderName: options.folderName || 'agroconnect/products',
        farmerName: options.farmerName || userIdentifier,
        onProgress: options.onProgress,
        category: options.category || 'unknown'
      });
    } catch (error) {
      console.error('Error in uploadService.uploadMultipleImages:', error);
      throw new Error('Failed to upload images. Please try again.');
    }
  }
};

export default uploadService;
