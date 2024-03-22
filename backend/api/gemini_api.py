import textwrap
from pathlib import Path
import google.generativeai as genai
from django.conf import settings
import re

class GeminiAPI:
    def __init__(self,model='gemini-pro-vision'):
        self.model = model

    def process_image(self,image_file):
        genai.configure(api_key=settings.GOOGLE_API_KEY) 
        model = genai.GenerativeModel(self.model)
        screenshot_picture = {
            'mime_type': 'image/png',
            'data': image_file.read()
        }
        prompt = """
        Imagine you are a phone app tester checking phone application by checking screenshots of these applications as they are being tested. 
        Please tell me the state of the application by determining the content of the screenshot image.
        For example, if the screenshot image is showing a Facebook application login with error, please output something like 
        "This app seems to show an error, the error message says 'There seems to be an issue accessing details on this screen. Please try again.'". 
        If the login has not been successful, please output that. If the login screenshot is showing a CAPTCHA image, it means the login is unsuccesful as well, please mention the reason of the issue if you see it.
        If you detect no issues of the phone application on the screenshot, please output "No issue detected."
        Please provide the output in Python dictionary, with two fields, the first being the output text, second field is a Boolean of whether to flag it or not.
        If there is no issue with the image, return False for the "flag"
        Example output:
        {
            "output_text":"The screenshot image shows an error message from the MX Player app. The error message says \"Component files are corrupted or Android internal modules are not compatible with current version of MX Player.\",
            "flag": True
        }
        """
         
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

        # try:
        #     print(response.text)
        #     return json.loads(response.text)
        # except Exception as e:
        #     print(f'{type(e).__name__}: {e}')
        
        try:
            print(response.text)
            # Extract the output_text and flag values using regular expressions
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
                return None

        except Exception as e:
            print(f'{type(e).__name__}: {e}')
            return None



