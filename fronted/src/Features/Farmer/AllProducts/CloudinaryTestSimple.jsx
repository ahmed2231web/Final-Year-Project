import React, { useState, useEffect } from 'react';
import uploadService from '../../../Services/uploadService';
import { logEnvironmentVariables, areEnvironmentVariablesLoaded } from '../../../Services/envDebug';

/**
 * Simplified test component for Cloudinary image upload functionality
 */
function CloudinaryTestSimple() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'Not set',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Not set',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'Not set'
  });
  
  // Log environment variables on component mount
  useEffect(() => {
    const envVars = logEnvironmentVariables();
    setCloudinaryConfig(envVars);
    
    // Check if variables are properly loaded
    if (!areEnvironmentVariablesLoaded()) {
      setError('Environment variables not properly loaded. Please check your .env file and restart the development server.');
    }
  }, []);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      setProgress(0);
      setError('');
      
      // Log file details for debugging
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        cloudinaryConfig
      });
      
      // Upload with progress tracking using our backend proxy service
      const url = await uploadService.uploadImage(file, {
        folderName: 'agroconnect/test',
        onProgress: (percent) => {
          setProgress(percent);
          console.log(`Upload progress: ${percent}%`);
        }
      });
      
      setImageUrl(url);
      console.log('Upload successful:', url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Simple Cloudinary Test</h2>
      <p className="mb-4 text-sm text-gray-600">
        This component tests direct uploads to Cloudinary using the upload preset.
      </p>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Select Image
        </label>
        <input 
          type="file" 
          onChange={handleFileChange}
          accept="image/*"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className={`w-full p-2 rounded ${
          uploading 
            ? 'bg-gray-400' 
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {uploading ? `Uploading... ${progress}%` : 'Upload Image'}
      </button>
      
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          {error.includes('Upload preset') && (
            <div className="mt-2 text-xs">
              <p className="font-semibold">Possible solutions:</p>
              <ol className="list-decimal pl-4">
                <li>Check if your upload preset is configured for unsigned uploads in Cloudinary dashboard</li>
                <li>Verify your .env file has the correct VITE_CLOUDINARY_UPLOAD_PRESET value</li>
                <li>Make sure the upload preset name is exactly "ml_default" (case sensitive)</li>
                <li>Restart your development server after making changes to .env</li>
              </ol>
            </div>
          )}
        </div>
      )}
      
      {/* Progress bar */}
      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Preview uploaded image */}
      {imageUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Uploaded Image:</h3>
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            className="w-full h-60 object-contain border rounded"
          />
          <p className="mt-2 text-sm text-gray-600 break-all">{imageUrl}</p>
        </div>
      )}
      
      {/* Debug section */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
        <div className="text-xs font-mono bg-gray-100 p-2 rounded overflow-auto max-h-40">
          <p>Cloudinary Cloud Name: {cloudinaryConfig.cloudName}</p>
          <p>Upload Preset: {cloudinaryConfig.uploadPreset}</p>
          <p>API Key: {cloudinaryConfig.apiKey ? cloudinaryConfig.apiKey.substring(0, 5) + '...' : 'Not set'}</p>
          <p>Environment Variables Loaded: {areEnvironmentVariablesLoaded() ? 'Yes' : 'No'}</p>
          {file && (
            <>
              <p>File: {file.name}</p>
              <p>Type: {file.type}</p>
              <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
            </>
          )}
        </div>
      </div>
      
      {/* Environment troubleshooting */}
      <div className="mt-4 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Troubleshooting:</h3>
        <div className="text-xs">
          <p className="font-semibold">If your environment variables aren't loading:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Make sure your .env file is in the correct location: <code>/home/ahmed/Desktop/Final Year Project/fronted/.env</code></li>
            <li>Verify it has the correct format (no spaces around equals sign):<br/>
              <code>VITE_CLOUDINARY_CLOUD_NAME=dsu2vr3ke</code><br/>
              <code>VITE_CLOUDINARY_UPLOAD_PRESET=ml_default</code>
            </li>
            <li>Restart the Vite development server completely</li>
            <li>Try using the hardcoded values in apiCloudinary.js instead of environment variables</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default CloudinaryTestSimple;
