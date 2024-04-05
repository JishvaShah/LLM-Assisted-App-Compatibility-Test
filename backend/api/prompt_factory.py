def get_prompt():
    return """
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
        NOTE: If there is anything unsuccessful for the user on the screenshot, the flag must show True, because that would count as an issue.
        Unsuccessful examples include, account locked, account deactivated, further verification step upon logging-on an app (e.g. CAPTCHA), any errors or issues present, broken images...etc.
        """
