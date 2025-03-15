/**
 * Debug utility for environment variables
 * This file helps diagnose issues with Vite environment variables
 */

export const logEnvironmentVariables = () => {
  console.log('Environment Variables Debug:');
  console.log('NODE_ENV:', import.meta.env.NODE_ENV);
  console.log('VITE_CLOUDINARY_CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
  console.log('VITE_CLOUDINARY_UPLOAD_PRESET:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  console.log('VITE_CLOUDINARY_API_KEY:', import.meta.env.VITE_CLOUDINARY_API_KEY);
  
  // Check if variables are defined but empty
  console.log('CLOUD_NAME is empty:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME === '');
  console.log('UPLOAD_PRESET is empty:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET === '');
  
  // Return the values for use in components
  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY
  };
};

/**
 * Check if environment variables are properly loaded
 * @returns {boolean} - True if all required variables are present
 */
export const areEnvironmentVariablesLoaded = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  return Boolean(cloudName) && Boolean(uploadPreset);
};
