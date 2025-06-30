from prompts import PROMPTS
from ollama_client import send_to_ollama


def query_model(user_input, model="gemma3:12b"):
    """
    Queries the Ollama model using the appropriate prompt for mental health assistance.

    Args:
        user_input (str): The input from the user.
        model (str): The name of the model to use (default: "gemma3:12b").

    Returns:
        str or generator: The model's response. If streaming, returns a generator.
    """
    default_prompt_key = "mental_health_assistant"
    prompt = PROMPTS.get(default_prompt_key)
    if not prompt:
        raise ValueError("Missing prompt for 'mental_health_assistant'")

    full_query = f"{prompt}\n\nUser: {user_input}"
    return send_to_ollama(full_query, model=model)
