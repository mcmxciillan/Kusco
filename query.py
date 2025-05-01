from intents import classify_intent
from prompts import PROMPTS
from ollama_client import send_to_ollama


def query_model(user_input, model="mistral:7b", stream=True):
    """
    Queries the Ollama model using the appropriate prompt based on the user's intent.

    Args:
        user_input (str): The input from the user.
        model (str): The name of the model to use (default: "mistral:7b").
        stream (bool): Whether to stream the response (default: False).

    Returns:
        str or generator: The model's response. If streaming, returns a generator.
    """
    intent = classify_intent()
    prompt = PROMPTS.get(intent["prompt_key"], "")
    full_query = f"{prompt}\n\nUser: {user_input}"
    return send_to_ollama(full_query, model=model, stream=stream)
