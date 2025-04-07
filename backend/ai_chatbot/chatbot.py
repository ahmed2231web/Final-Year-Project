import os
import logging
from google import genai
from google.genai import types
from decouple import config

# Configure logging
logger = logging.getLogger(__name__)

def get_gemini_response(disease, user_query=None):
    """Generate a response using the Gemini API in Simple and understandable English or Urdu if user specificly asks for it."""
    logger.info(f"Generating Simple and understandable English or Urdu if user specificly asks for it response for disease: {disease}, query: {user_query}")
    
    # Initialize the Gemini client
    client = genai.Client(
        api_key=config('GEMINI_API_KEY'),
    )
    
    # Specify the model
    model = "gemini-2.0-flash"
    
    # Create the prompt based on whether there's a user query or not
    if user_query:
        prompt = f"""Please respond in Simple and understandable English language or Urdu if user specificly asks for it.
        The wheat plant has been detected with {disease}. User asks: {user_query}. 
        Provide a detailed but concise response about this specific query related to the detected disease. Also add precautions to clean the thing take care of it and things like that."""
    else:
        prompt = f"""Please respond in Simple and understandable English language or Urdu if user specificly asks for it.
        A wheat plant has been detected with {disease}. 
        Provide a brief overview of this disease, its impact on wheat crops, and basic management recommendations. 
        Keep the response concise but informative."""
    
    # Create content for the API request
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]
    
    # Configure generation parameters
    generate_content_config = types.GenerateContentConfig(
        temperature=0,
        top_p=0.95,
        top_k=64,
        max_output_tokens=8192,
        response_mime_type="text/plain",
    )
    
    try:
        # Generate content using the new API
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )
        
        logger.info("Simple and understandable English or Urdu if user specificly asks for it response received from Gemini API")
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error generating Simple and understandable English or Urdu if user specificly asks for it response: {str(e)}")
        raise Exception(f"Failed to generate response: {str(e)}")