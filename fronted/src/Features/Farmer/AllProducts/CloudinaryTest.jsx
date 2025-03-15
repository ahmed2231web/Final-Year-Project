import React, { useState } from 'react';
import uploadService from '../../../Services/uploadService';
import useCloudinaryUpload from '../../../hooks/useCloudinaryUpload';

/**
 * Test component for Cloudinary image upload functionality
 * This component can be used to verify that the Cloudinary integration is working correctly
 */
function CloudinaryTest() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use our custom hook
  const {
    files,
    previews,
    isUploading,
    progress,
    error,
    handleFileChange,
    uploadFiles,
    reset
  } = useCloudinaryUpload({
    folder: 'agroconnect/test',
    maxFiles: 3
  });
  
  const runSingleUploadTest = async () => {
    if (files.length === 0) {
      setTestResult('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setTestResult('Testing single image upload...');
    
    try {
      // Test single image upload with progress tracking
      const url = await uploadService.uploadImage(files[0], { 
        folderName: 'agroconnect/test',
        onProgress: (progress) => {
          setTestResult(`Testing single image upload... ${progress}% complete`);
        }
      });
      setTestResult(`✅ Single upload successful: ${url}`);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`❌ Single upload test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const runMultipleUploadTest = async () => {
    if (files.length === 0) {
      setTestResult('Please select files first');
      return;
    }
    
    setIsLoading(true);
    setTestResult('Testing multiple image upload...');
    
    try {
      // Test multiple image upload with progress tracking
      const urls = await uploadService.uploadMultipleImages(files, { 
        folderName: 'agroconnect/test',
        farmerName: 'tester',
        onProgress: (progress) => {
          setTestResult(`Testing multiple image upload... ${progress}% complete`);
        }
      });
      
      setTestResult(`✅ Multiple upload successful: ${urls.length} images uploaded\n${urls.join('\n')}`);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`❌ Multiple upload test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const runHookTest = async () => {
    setTestResult('Testing hook-based upload...');
    
    try {
      // Test our custom hook
      const urls = await uploadFiles();
      
      if (urls.length > 0) {
        setTestResult(`✅ Hook upload successful: ${urls.length} images uploaded\n${urls.join('\n')}`);
      } else {
        setTestResult('❌ Hook upload test failed: No URLs returned');
      }
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`❌ Hook upload test failed: ${error.message}`);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Cloudinary Upload Test</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Select Images (up to 3)
        </label>
        <input 
          type="file" 
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="file-input file-input-bordered w-full file-input-success"
        />
        
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
        
        {/* Image Preview */}
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {previews.map((url, index) => (
              <div key={index} className="relative">
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-28 object-cover rounded-lg border-2 border-green-200"
                />
                <span className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload Progress */}
        {isUploading && progress > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">{progress}% uploaded</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={runSingleUploadTest}
          disabled={isLoading || isUploading}
          className="btn bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              Testing...
            </>
          ) : (
            'Test Single Upload'
          )}
        </button>
        
        <button
          onClick={runMultipleUploadTest}
          disabled={isLoading || isUploading}
          className="btn bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              Testing...
            </>
          ) : (
            'Test Multiple Upload'
          )}
        </button>
        
        <button
          onClick={runHookTest}
          disabled={isLoading || isUploading}
          className="btn bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isUploading ? (
            <>
              <span className="loading loading-spinner"></span>
              Uploading...
            </>
          ) : (
            'Test Hook Upload'
          )}
        </button>
        
        <button
          onClick={reset}
          className="btn btn-outline border-gray-500 text-gray-600"
        >
          Reset
        </button>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
        <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm overflow-auto max-h-60">
          {testResult || 'No tests run yet'}
        </pre>
      </div>
    </div>
  );
}

export default CloudinaryTest;
