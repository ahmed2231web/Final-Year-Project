import React, { useEffect, useState } from 'react';

function EnvTest() {
  const [envVars, setEnvVars] = useState({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'Not set',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Not set',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'Not set'
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Environment Variable Test</h2>
      
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Environment Variables:</h3>
        <div className="text-xs font-mono bg-gray-100 p-2 rounded overflow-auto">
          <p>VITE_CLOUDINARY_CLOUD_NAME: {envVars.cloudName}</p>
          <p>VITE_CLOUDINARY_UPLOAD_PRESET: {envVars.uploadPreset}</p>
          <p>VITE_CLOUDINARY_API_KEY: {envVars.apiKey}</p>
        </div>
      </div>
    </div>
  );
}

export default EnvTest;
