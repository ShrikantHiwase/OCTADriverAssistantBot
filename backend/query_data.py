import re
import numpy as np
import faiss
from langchain_ollama import OllamaLLM, OllamaEmbeddings  # Import both LLM and Embeddings

# Define paths
FAISS_INDEX_PATH = "Put FAISS index path"
CHUNK_TEXTS_PATH = "Chunk text path"
CHUNK_IDS_PATH = "Chunk Ids path"

EVAL_PROMPT = """
Expected Response: {expected_response}
Actual Response: {actual_response}
---
(Answer with 'true' or 'false') Does the actual response match the expected response? 
"""

def query_rag(query_text: str):
    
    # Load the FAISS indexl
    index = faiss.read_index(FAISS_INDEX_PATH)
    
    # Load chunk IDs
    with open(CHUNK_IDS_PATH, "r") as f:
        chunk_ids = f.read().splitlines()

    # Load chunk content
    with open(CHUNK_TEXTS_PATH, "r", encoding="utf-8") as f:
        chunk_texts = f.read().splitlines()

    embedding_function = OllamaEmbeddings(model="nomic-embed-text")
    query_embedding = np.array(embedding_function.embed_query(query_text), dtype=np.float32).reshape(1, -1)

    # Perform FAISS semantic search (retrieve top 5 nearest neighbors) you can change based on your expectations
    k = 5  
    distances, indices = index.search(query_embedding, k)

    #Here i have used sementic search in combination with Keywork search you can use other method suitable for you data type
    semantic_results = [(chunk_texts[i], distances[0][j]) for j, i in enumerate(indices[0]) if i < len(chunk_texts)]

    keyword_results = perform_keyword_search(query_text, chunk_texts)

    combined_results = merge_results(semantic_results, keyword_results, chunk_ids)

    context_text = "\n\n---\n\n".join([result[0] for result in combined_results])


    prompt = f"""
    
    ---  
    **Query:** {query_text}  
    **Relevant Context:**  
    {context_text}
    """

    model = OllamaLLM(model="mistral")
    response_text = model.invoke(prompt)

    print(response_text)
    return response_text


def perform_keyword_search(query_text, chunk_texts):
    """Finds relevant text chunks based on keyword matches."""
    
    keywords = re.findall(r'\b\w+\b', query_text.lower())
    keyword_results = []

    for text in chunk_texts:
        if any(keyword in text.lower() for keyword in keywords):
            keyword_results.append((text, 0))  

    return keyword_results


def merge_results(semantic_results, keyword_results, chunk_ids):
    """Combines FAISS and keyword search results, sorts by relevance, and limits results."""
    
    all_results = semantic_results + keyword_results
    all_results.sort(key=lambda x: x[1])  
    
    return all_results[:5]  

