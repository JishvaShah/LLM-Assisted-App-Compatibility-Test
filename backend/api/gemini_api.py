import google.generativeai as genai
from django.conf import settings
import re
import json

class GeminiAPIError(Exception):
    pass

class GeminiAPI:
    def __init__(self,model='gemini-pro-vision'):
        self.model = model

    def process_image(self,image_file,prompt):
        genai.configure(api_key=settings.GOOGLE_API_KEY) 
        model = genai.GenerativeModel(self.model)
        screenshot_picture = {
            'mime_type': 'image/png',
            'data': image_file.read()
        }
           
        generation_config = genai.types.GenerationConfig(
            temperature=0.5,
            top_p=0.5,
            top_k=3,
            candidate_count=1,
            max_output_tokens=100,
        )
        response = model.generate_content(
           [prompt,screenshot_picture],
           generation_config=generation_config,
           stream=False
        )

        try:
            # regular expressions to extract Gemini API output text
            output_text_match = re.search(r'"output_text"\s*:\s*"(.+?)"', response.text)
            flag_match = re.search(r'"flag"\s*:\s*(\w+)', response.text)

            if output_text_match and flag_match:
                output_text = output_text_match.group(1)
                flag = flag_match.group(1).lower() == 'true'
                return {
                    "output_text": output_text,
                    "flag": flag
                }
            else:
                print("Error: Unable to extract output_text and flag from the response.")
                raise GeminiAPIError("Invalid response from Gemini API")

        except Exception as e:
            print(f'{type(e).__name__}: {e}')
            raise GeminiAPIError("Error processing image with Gemini API") from e





