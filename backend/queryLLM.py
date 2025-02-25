import re
import numpy as np
import faiss
from langchain_ollama import OllamaLLM
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
import uuid

app = FastAPI()

# Short-term memory for session
conversation_memory: Dict[str, List[Dict[str, str]]] = {}

EVAL_PROMPT = """
Expected Response: {expected_response}
Actual Response: {actual_response}
---
(Answer with 'true' or 'false') Does the actual response match the expected response? 
"""

class ChatRequest(BaseModel):
    session_id: str
    message: str

def query_LLM(VAquery_text: str, session_id: str):
    """
    Query the LLM with short-term memory.
    """

    # Retrieve or initialize conversation memory for session
    if session_id not in conversation_memory:
        conversation_memory[session_id] = []

    history = conversation_memory[session_id]

    # Format past conversation for context
    context = "\n".join([f"User: {msg['user']}\nOCTA: {msg['bot']}" for msg in history])

    prompt = f"""
    Act as a Friendly Vehicle Assistance deployed in a Small Commercial Electric Vehicle.
    Refer to yourself as 'OCTA - Onboard Car Troubleshooting Assistant' and NOT as an AI model.

    ---  
    **Conversation Context:**  
    {context}

    **Query:** {VAquery_text}  
    """

    # Query the language model
    model = OllamaLLM(model="mistral")
    response_text = model.invoke(prompt)

    # Store new message in short-term memory
    history.append({"user": VAquery_text, "bot": response_text})

    # Limit conversation memory to the last 10 exchanges (short-term memory)
    if len(history) > 10:
        history.pop(0)

    return response_text

@app.post("/query/")
async def chat_with_bot(chat_request: ChatRequest):
    """
    Handle chatbot queries with short-term memory.
    """
    response_text = query_LLM(chat_request.message, chat_request.session_id)
    return {"session_id": chat_request.session_id, "bot_response": response_text}
