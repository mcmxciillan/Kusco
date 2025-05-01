""" A simple client for interacting with the Ollama API """
import json
import requests

# Ollama API endpoint (assuming it's running locally on the default port)
OLLAMA_API_URL = "http://localhost:11434/api/generate"


def send_to_ollama(prompt, model="gemma3:1b", stream=True):
    """
    Sends a prompt to the locally running Ollama model and returns the response.

    Args:
        prompt (str): The input prompt to send to the model.
        model (str): The name of the model to use (default: "deepseek-r1:1.5b").
        stream (bool): Whether to stream the response (default: False).

    Returns:
        str or generator: The model's response text. If streaming, returns a generator yielding only the response text.
    """
    # Prepare the payload
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": stream  # Set to True for streaming responses
    }

    try:
        # Send the request to the Ollama API
        response = requests.post(
            OLLAMA_API_URL, json=payload, stream=stream, timeout=30)

        # Check for errors
        if response.status_code != 200:
            raise Exception(
                f"Ollama API returned status code {response.status_code}: {response.text}")

        # Handle streaming responses
        if stream:
            def generate():
                for line in response.iter_lines():
                    if line:
                        # Decode the line and parse JSON
                        json_line = line.decode('utf-8')
                        data = json.loads(json_line)
                        # Yield only the response text
                        yield data.get("response", "")
            return generate()

        # Handle non-streaming responses
        return response.json().get("response", "")

    except Exception as e:
        print(f"Error communicating with Ollama: {e}")
        return "Sorry, I encountered an error while processing your request."
