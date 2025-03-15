import { useState } from 'react';
import uploadService from '../Services/uploadService';
import authService from '../Services/authService';

/**
 * Custom hook for handling Cloudinary image uploads
 * @param {Object} options - Configuration options
 * @param {string} options.folder - Base folder name (default: 'agroconnect/products')
 * @param {boolean} options.includeUsername - Whether to include username in folder path
 * @param {number} options.maxFiles - Maximum number of files to upload
 * @param {number} options.maxSizeMB - Maximum file size in MB
 * @returns {Object} - Upload state and functions
 */
export default function useCloudinaryUpload(options = {}) {
  const {
    folder = 'agroconnect/products',
    includeUsername = true,
    maxFiles = 3,
    maxSizeMB = 5
  } = options;
  
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  
  /**
   * Handle file selection
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Reset error state
    setError(null);
    
    // Validate file types
    const invalidFiles = selectedFiles.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Please select only image files');
      return;
    }
    
    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`Some files are too large. Maximum size is ${maxSizeMB}MB per image`);
      return;
    }
    
    // Validate file count
    if (selectedFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images`);
      return;
    }
    
    // Clean up old preview URLs
    previews.forEach(url => {
      if (!url.startsWith('http')) {
        URL.revokeObjectURL(url);
      }
    });
    
    // Create new preview URLs
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    
    setFiles(selectedFiles);
    setPreviews(newPreviews);
  };
  
  /**
   * Upload files to Cloudinary
   * @returns {Promise<string[]>} - Array of uploaded image URLs
   */
  const uploadFiles = async () => {
    if (files.length === 0) {
      return [];
    }
    
    try {
      setIsUploading(true);
      setProgress(10);
      setError(null);
      
      // Get user data for folder name
      let folderName = folder;
      let farmerName = '';
      
      if (includeUsername) {
        const userData = authService.getUserData();
        farmerName = userData?.username || 'unknown';
      }
      
      setProgress(30);
      
      // Upload the files
      const urls = await uploadService.uploadMultipleImages(files, {
        folderName,
        farmerName,
        onProgress: (percent) => {
          setProgress(30 + (percent * 0.7)); // Scale progress to 30-100% range
        }
      });
      
      setProgress(100);
      setUploadedUrls(urls);
      return urls;
    } catch (err) {
      setError(err.message || 'Failed to upload images');
      return [];
    } finally {
      setIsUploading(false);
    }
  };
  
  /**
   * Reset the upload state
   */
  const reset = () => {
    // Clean up preview URLs
    previews.forEach(url => {
      if (!url.startsWith('http')) {
        URL.revokeObjectURL(url);
      }
    });
    
    setFiles([]);
    setPreviews([]);
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUploadedUrls([]);
  };
  
  return {
    files,
    previews,
    isUploading,
    progress,
    error,
    uploadedUrls,
    handleFileChange,
    uploadFiles,
    reset
  };
}
