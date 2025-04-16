import io
import logging
import os
from django.shortcuts import render
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import numpy as np
from PIL import Image
from .serializers import ImageUploadSerializer
from .model_loader import predict_disease, DISEASE_LABELS
from .chatbot import get_gemini_response

# Configure module logger
logger = logging.getLogger(__name__)

class UploadImageView(APIView):
    """
    API view for uploading images and detecting wheat diseases.
    
    This endpoint accepts image uploads, processes them through the wheat disease
    detection model, and returns the prediction results along with AI-generated
    information about the detected disease from Google's Gemini API.
    """
    # Allow both form data and multipart form data for image uploads
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, format=None):
        """
        Process uploaded image and return disease detection results with Gemini response.
        
        Args:
            request: HTTP request containing an image file in the 'image' field
            format: Format of the request (automatically determined)
            
        Returns:
            Response: JSON response containing disease detection results and AI explanation
                - disease: Name of the detected disease
                - confidence: Confidence score (0-1) of the prediction
                - response: AI-generated information about the disease
                - is_healthy: Boolean indicating if the plant is healthy
                
        Raises:
            400 Bad Request: If image data is invalid
            500 Internal Server Error: If image processing fails
        """
        # Validate the uploaded image using the serializer
        serializer = ImageUploadSerializer(data=request.data)
        
        # Return validation errors if the image data is invalid
        if not serializer.is_valid():
            logger.warning(f"Invalid image upload attempt: {serializer.errors}")
            return Response(
                {"error": "Invalid image data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Extract the validated image file from the serializer
            image_file = serializer.validated_data['image']
            logger.info(f"Processing image: {image_file.name}")
            
            # Preprocess the image for the model:
            # 1. Open the image file using PIL
            img = Image.open(image_file)
            # 2. Resize to 64x64 pixels (required input size for the model)
            img = img.resize((64, 64))
            # 3. Convert to numpy array and normalize pixel values to range [0,1]
            img_array = np.array(img) / 255.0
            # 4. Add batch dimension for model input (shape becomes [1, 64, 64, 3])
            img_array = np.expand_dims(img_array, axis=0)
            
            # Run the disease detection model on the preprocessed image
            prediction = predict_disease(img_array)
            
            # Extract prediction results:
            # 1. Find the index of the class with highest probability
            disease_index = np.argmax(prediction[0])
            # 2. Get the disease name from our labels list
            disease_name = DISEASE_LABELS[disease_index]
            # 3. Get the confidence score (probability) for the predicted class
            confidence = float(prediction[0][disease_index])
            
            logger.info(f"Disease detected: {disease_name} with confidence {confidence:.2f}")
            
            # Generate AI explanation for the detected disease using Google's Gemini API
            gemini_response = get_gemini_response(disease_name)
            
            # Return the prediction results and AI explanation in a structured JSON response
            return Response({
                "disease": disease_name,                     # Name of the detected disease
                "confidence": confidence,                   # Confidence score (0-1)
                "response": gemini_response,                # AI-generated information about the disease
                "is_healthy": disease_name == "healthy"    # Boolean flag for healthy/diseased state
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging and return a user-friendly error message
            logger.error(f"Error processing image: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to process image", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChatWithGeminiView(APIView):
    """
    API view for chatting with Gemini about detected diseases.
    
    This endpoint allows users to ask follow-up questions about a detected disease,
    with responses generated by Google's Gemini API. It provides a conversational
    interface for users to learn more about wheat diseases and their management.
    """
    # Accept JSON data for the chat queries
    parser_classes = (JSONParser,)
    
    def post(self, request, format=None):
        """
        Process user query and return Gemini response.
        
        Args:
            request: HTTP request containing 'disease' and 'query' fields
            format: Format of the request (automatically determined)
            
        Returns:
            Response: JSON response containing the AI-generated answer
                - response: AI-generated answer to the user's query
                
        Raises:
            400 Bad Request: If disease name or user query is missing
            500 Internal Server Error: If getting AI response fails
        """
        # Extract the disease name and user query from the request
        disease = request.data.get('disease')
        user_query = request.data.get('query')
        
        # Validate that disease name is provided
        if not disease:
            logger.warning("Chat attempt without disease name")
            return Response(
                {"error": "Disease name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Validate that user query is provided
        if not user_query:
            logger.warning("Chat attempt without user query")
            return Response(
                {"error": "User query is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Generate AI response to the user's query about the specific disease
            # The second parameter (user_query) tells Gemini this is a follow-up question
            logger.info(f"Processing chat query about {disease}: {user_query}")
            gemini_response = get_gemini_response(disease, user_query)
            
            # Return the AI-generated response
            return Response({
                "response": gemini_response  # AI-generated answer to the user's query
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging and return a user-friendly error message
            logger.error(f"Error getting Gemini response: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to get response", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
