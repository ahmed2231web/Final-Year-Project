import axios from 'axios';

// Get Cloudinary configuration from environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @param {string} options.folderName - Folder name in Cloudinary
 * @param {string} options.farmerName - Farmer name for subfolder
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
