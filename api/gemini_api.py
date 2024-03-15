import textwrap
from pathlib import Path
import google.generativeai as genai
from django.conf import settings

class GeminiAPI:
    def __init__(self,model='gemini-pro-vision'):
        self.model = model

    def process_image(self):
        genai.configure(api_key=settings.GOOGLE_API_KEY) 
        model = genai.GenerativeModel(self.model)
        screenshot_picture = {
            'mime_type': 'image/png',
            'data': Path("test.png").read_bytes()
        }
        prompt = f"""
        Imagine you are a phone app tester checking phone application by checking screenshots of these applications as they are being tested. 
        Please tell me the state of the application by determining the content of the screenshot image.
        For example, if the screenshot image is showing a Facebook application login with error, please output something like 
        "This app seems to show an error, the error message says "There seems to be an issue accessing details on this screen. Please try again.". 
        If the login has not been successful, please output that. If the login screenshot is showing a CAPTCHA image, it means the login is unsuccesful as well, please mention the reason of the issue if you see it.
        """
        #how to add model.count_tokens() with generate content
        
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
            print(response.text)
            return response.text
        except Exception as e:
            print(f'{type(e).__name__}: {e}')




