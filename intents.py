# List of intents and their descriptions
INTENTS = [
    {
        "name": "factual_inquiry",
        "description": "The user is asking for factual information or explanations.",
        "prompt_key": "factual_helpful"
    },
    {
        "name": "detailed_explanation",
        "description": "The user wants a detailed and structured explanation of a topic.",
        "prompt_key": "detailed_response"
    },
    {
        "name": "problem_solving",
        "description": "The user is presenting a problem and seeking a solution.",
        "prompt_key": "problem_solver"
    },
    {
        "name": "creative_request",
        "description": "The user is asking for creative content, such as stories or poems.",
        "prompt_key": "creative_writing"
    },
    {
        "name": "emotional_support",
        "description": "The user is seeking empathy, advice, or emotional support.",
        "prompt_key": "empathy_and_support"
    },
    {
        "name": "debate_or_discussion",
        "description": "The user wants to discuss or debate a topic from multiple perspectives.",
        "prompt_key": "debate_mode"
    },
    {
        "name": "learning_request",
        "description": "The user wants to learn or understand a concept in a simple way.",
        "prompt_key": "teacher_mode"
    },
    {
        "name": "coding_help",
        "description": "The user is asking for help with programming or code-related tasks.",
        "prompt_key": "code_assistant"
    },
    {
        "name": "historical_context",
        "description": "The user is asking for historical information or context.",
        "prompt_key": "historical_perspective"
    },
    {
        "name": "future_prediction",
        "description": "The user is asking for predictions or insights about the future.",
        "prompt_key": "futurist_mode"
    },
    {
        "name": "ethical_dilemma",
        "description": "The user is presenting an ethical question or dilemma.",
        "prompt_key": "ethical_advisor"
    },
    {
        "name": "humor_request",
        "description": "The user is looking for a humorous or lighthearted response.",
        "prompt_key": "humor_mode"
    },
    {
        "name": "minimalist_response",
        "description": "The user wants a concise and to-the-point answer.",
        "prompt_key": "minimalist_mode"
    },
    {
        "name": "roleplay_request",
        "description": "The user wants to engage in a roleplaying scenario.",
        "prompt_key": "roleplay_mode"
    },
    {
        "name": "socratic_questioning",
        "description": "The user wants to explore a topic through guided questioning.",
        "prompt_key": "socratic_questioning"
    }
]


def classify_intent():
    # Always return the mental health assistant intent
    return {
        "name": "mental_health_assistant",
        "description": "Support for mental health clinicians.",
        "prompt_key": "mental_health_assistant"
    }


# def classify_intent(user_input):
#     """
#     Classify the user's input to determine the most likely intent.
#     This is a simple keyword-based classifier. For more advanced use cases,
#     consider using a machine learning model or NLP library.
#     """
#     user_input = user_input.lower()

#     # Keyword mapping for intent classification
#     intent_keywords = {
#         "factual_inquiry": ["what is", "who is", "when was", "explain", "define", "how does"],
#         "detailed_explanation": ["detail", "explain in detail", "break down", "step-by-step"],
#         "problem_solving": ["solve", "fix", "problem", "issue", "how to", "solution"],
#         "creative_request": ["write a story", "write a poem", "creative", "imagine", "describe"],
#         "emotional_support": ["feel", "sad", "happy", "angry", "advice", "support", "help me"],
#         "debate_or_discussion": ["debate", "discuss", "pros and cons", "argument", "opinion"],
#         "learning_request": ["teach me", "how to", "learn", "explain like I'm 5", "beginner"],
#         "coding_help": ["code", "program", "debug", "algorithm", "python", "javascript"],
#         "historical_context": ["history", "historical", "past", "when did", "origin"],
#         "future_prediction": ["future", "predict", "trend", "what will", "next 10 years"],
#         "ethical_dilemma": ["ethical", "moral", "right or wrong", "should I", "dilemma"],
#         "humor_request": ["joke", "funny", "humor", "make me laugh", "lighthearted"],
#         "minimalist_response": ["short answer", "brief", "concise", "to the point"],
#         "roleplay_request": ["roleplay", "pretend", "act as", "character", "persona"],
#         "socratic_questioning": ["why", "how", "what if", "explore", "question"]
#     }

#     # Match user input to intent based on keywords
#     for intent in INTENTS:
#         for keyword in intent_keywords.get(intent["name"], []):
#             if keyword in user_input:
#                 return intent

#     # Default to factual inquiry if no intent is matched
#     return {
#         "name": "factual_inquiry",
#         "description": "The user is asking for factual information or explanations.",
#         "prompt_key": "factual_helpful"
#     }
