""" A simple client for interacting with the Ollama API """
import os
import json
import logging
import requests
import traceback

# Ollama API endpoint (configurable via environment variable)
OLLAMA_API_URL = os.getenv(
    "OLLAMA_API_URL", "http://localhost:11434/api/generate")


def send_to_ollama(prompt, model, stream=True):
    """
    Sends a prompt to the locally running Ollama model and returns the response.

    Args:
        prompt (str): The input prompt to send to the model.
        model (str): The name of the model to use (default: "deepseek-r1:1.5b").

    Returns:
        str or generator: The model's response text. If streaming, returns a generator yielding only the response text.
    """
    # Prepare the payload
    payload = {
        "model": model,
        "prompt": prompt
    }

    headers = {"Content-Type": "application/json"}

    logging.debug(
        f"Sending prompt to model '{model}' ({len(prompt)} characters)")

    try:
        # Send the request to the Ollama API
        response = requests.post(
            OLLAMA_API_URL, json=payload, stream=stream, timeout=300, headers=headers)

        # Check for errors
        if response.status_code != 200:
            raise Exception(
                f"Ollama API returned status code {response.status_code}: {response.text}")

        if stream:
            # Handle streaming responses
            def generate():
                for line in response.iter_lines():
                    if line:
                        # Decode the line and parse JSON
                        json_line = line.decode('utf-8')
                        data = json.loads(json_line)
                        # logging.debug("Received chunk: %s", data.get("response", ""))  # Optional, comment out by default
                        # Yield only the response text
                        yield data.get("response", "")
            return generate()
        else:
            # Handle full string (non-streaming) response
            output = ""
            for line in response.iter_lines():
                if line:
                    json_line = line.decode("utf-8")
                    data = json.loads(json_line)
                    output += data.get("response", "")
            return output

    except Exception as e:
        logging.error("Error communicating with Ollama: %s",
                      traceback.format_exc())
        return "Sorry, I encountered an error while processing your request."
