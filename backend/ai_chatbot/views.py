from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import ImageUploadSerializer
import numpy as np
from PIL import Image
import io
import logging
import os
from django.conf import settings
from .model_loader import predict_disease, DISEASE_LABELS
from .chatbot import get_gemini_response

# Set up logging
logger = logging.getLogger(__name__)

class UploadImageView(APIView):
    """
    API view for uploading images and detecting wheat diseases.
    """
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, format=None):
        """
        Process uploaded image and return disease detection results with Gemini response.
        """
        serializer = ImageUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid image data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Get the image file
            image_file = serializer.validated_data['image']
            logger.info(f"Processing image: {image_file.name}")
            
            # Open and preprocess the image
            img = Image.open(image_file)
            img = img.resize((64, 64))  # Resize to model input size
            img_array = np.array(img) / 255.0  # Normalize to [0,1]
            img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
            
            # Make prediction
            prediction = predict_disease(img_array)
            disease_index = np.argmax(prediction[0])
            disease_name = DISEASE_LABELS[disease_index]
            confidence = float(prediction[0][disease_index])
            
            logger.info(f"Disease detected: {disease_name} with confidence {confidence:.2f}")
            
            # Get Gemini response for the detected disease
            gemini_response = get_gemini_response(disease_name)
            
            return Response({
                "disease": disease_name,
                "confidence": confidence,
                "response": gemini_response,
                "is_healthy": disease_name == "healthy"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            return Response(
                {"error": "Failed to process image", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChatWithGeminiView(APIView):
    """
    API view for chatting with Gemini about detected diseases.
    """
    parser_classes = (JSONParser,)
    
    def post(self, request, format=None):
        """
        Process user query and return Gemini response.
        """
        disease = request.data.get('disease')
        user_query = request.data.get('query')
        
        if not disease:
            return Response(
                {"error": "Disease name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not user_query:
            return Response(
                {"error": "User query is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Get Gemini response for the user query about the disease
            gemini_response = get_gemini_response(disease, user_query)
            
            return Response({
                "response": gemini_response
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting Gemini response: {str(e)}")
            return Response(
                {"error": "Failed to get response", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
