import os
import logging
import numpy as np
from tensorflow.keras.models import load_model

# Configure logger for this module
logger = logging.getLogger(__name__)

# Global variable to cache the model (singleton pattern)
# This prevents loading the model multiple times, improving performance
_model_instance = None

# Disease labels corresponding to model output classes
# Index position matches the model's output prediction array
DISEASE_LABELS = ['healthy', 'leaf rust', 'crown and root rot', 'loose smut']

# Base directory of the project for file path resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_disease_model():
    """Load and return the pre-trained wheat disease detection model.
    
    This function implements a singleton pattern to cache the model in memory,
    avoiding repeated disk I/O operations and improving performance for
    subsequent predictions.
    
    Returns:
        tensorflow.keras.Model: The loaded and compiled model ready for inference.
        
    Raises:
        FileNotFoundError: If the model file cannot be found in any of the expected locations.
        Exception: For any other errors during model loading or compilation.
    """
    # Access the global model cache variable
    global _model_instance
    
    # Return cached model if already loaded (singleton pattern implementation)
    if _model_instance is not None:
        logger.info("Returning cached model instance")
        return _model_instance
    
    try:
        # Define possible locations where the model file might be stored
        # This provides flexibility in project structure and deployment scenarios
        possible_paths = [
            os.path.join(BASE_DIR, 'disease_detection', 'models', 'wheatDiseaseModel.h5'),  # Standard app structure
            os.path.join(BASE_DIR, 'models', 'wheatDiseaseModel.h5'),                        # Alternative location
            os.path.join(os.path.dirname(__file__), 'models', 'wheatDiseaseModel.h5')       # Local to current module
        ]
        
        # Find the first valid path that exists
        model_path = None
        for path in possible_paths:
            if os.path.exists(path):
                model_path = path
                break
                
        # Raise error if model file not found in any location
        if model_path is None:
            raise FileNotFoundError(f"Model file not found. Tried paths: {possible_paths}")
            
        # Load the model from the found path
        logger.info(f"Loading model from: {model_path}")
        _model_instance = load_model(model_path)  # TensorFlow function to load saved model
        
        # Ensure model is compiled - necessary if the saved model didn't include optimizer state
        # This happens when model was saved with model.save() without include_optimizer=True
        if not _model_instance.optimizer:
            _model_instance.compile(
                optimizer='adam',                  # Adam optimizer is effective for most tasks
                loss='categorical_crossentropy',   # Standard loss function for multi-class classification
                metrics=['accuracy']               # Track accuracy during any potential fine-tuning
            )
            logger.info("Model compiled with default settings")
        
        # Warm up the model with a dummy prediction
        # This initializes TensorFlow's internal graph and memory allocations
        # Prevents the first real prediction from being slower than subsequent ones
        dummy_input = np.zeros((1, 64, 64, 3))  # Create empty image tensor with correct dimensions
        _model_instance.predict(dummy_input, verbose=0)  # Silent prediction
        logger.info("Model warmed up successfully")
        
        return _model_instance  # Return the loaded, compiled and warmed-up model
        
    except Exception as e:
        # Log the error for debugging but re-raise to notify calling code
        # This preserves the stack trace while ensuring the error is properly logged
        logger.error(f"Error loading model: {str(e)}")
        raise  # Re-raise the exception to be handled by the caller

def predict_disease(image_array):
    """Process an image and predict wheat disease using the trained model.
    
    This function handles preprocessing of the input image array and runs inference
    using the pre-trained model to classify wheat diseases.
    
    Args:
        image_array (numpy.ndarray): A batch of preprocessed images with shape (batch_size, 64, 64, 3).
            Values should ideally be normalized to range [0,1].
    
    Returns:
        numpy.ndarray: Raw prediction array with probabilities for each disease class.
        
    Raises:
        ValueError: If the input image shape is incorrect.
        Exception: For any other errors during prediction processing.
    """
    try:
        # Get the model instance (will be loaded if not already cached)
        model = get_disease_model()
        
        # Validate input dimensions - model expects 64x64 RGB images in a batch
        if len(image_array.shape) != 4 or image_array.shape[1:] != (64, 64, 3):
            raise ValueError(f"Expected input shape (batch, 64, 64, 3), got {image_array.shape}")
            
        # Check if normalization is needed (pixel values should be in range [0,1])
        if image_array.max() > 1.0 or image_array.min() < 0.0:
            logger.warning("Input values not in range [0,1], normalizing...")
            image_array = image_array / 255.0  # Standard normalization for image data
        
        # Run the model inference on the preprocessed image batch
        logger.info("Making prediction...")
        prediction = model.predict(image_array, verbose=0)  # Silent prediction
        
        # Get the predicted disease class (highest probability class)
        disease_index = np.argmax(prediction[0])  # Index of highest probability
        logger.info(f"Prediction complete: {DISEASE_LABELS[disease_index]}")
        
        return prediction  # Return raw prediction array for further processing if needed
        
    except Exception as e:
        # Log the error but re-raise to allow proper handling by the caller
        # This ensures errors are both logged and properly propagated
        logger.error(f"Error during prediction: {str(e)}")
        raise  # Re-raise the exception to be handled by the caller