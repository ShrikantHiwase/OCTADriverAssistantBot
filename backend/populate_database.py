import argparse
import os
import shutil
import numpy as np
import faiss
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain_ollama import OllamaEmbeddings 

# Paths for FAISS index this will store chunks and embeddings.
FAISS_PATH = r"D:\Shrikant\PrognosticsBot\backend\faiss_index"
DATA_PATH = r"D:\Shrikant\PrognosticsBot\backend\data"

def get_embedding_function():
    """Returns an instance of OllamaEmbeddings for generating document embeddings."""
    return OllamaEmbeddings(model="nomic-embed-text")

def main():
    """Main function to handle document processing and FAISS indexing."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Reset the FAISS database.")
    args = parser.parse_args()

    if args.reset:
        print("✨ Clearing FAISS database...")
        clear_database()

    print("📥 Loading documents...")
    documents = load_documents()

    print("📄 Splitting documents into chunks...")
    chunks = split_documents(documents)

    print("🔍 Generating embeddings and updating FAISS index...")
    add_to_faiss(chunks)

def load_documents():
    """Loads PDF documents from the specified directory."""
    document_loader = PyPDFDirectoryLoader(DATA_PATH)
    return document_loader.load()

def split_documents(documents: list[Document]):
    """Splits documents into smaller chunks for embedding."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=80,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)

def add_to_faiss(chunks: list[Document]):
    """Embeds document chunks and adds them to a FAISS index."""
    embedding_function = get_embedding_function()

    # Convert text chunks into embeddings
    embeddings = embedding_function.embed_documents([chunk.page_content for chunk in chunks])
    embeddings = np.array(embeddings).astype(np.float32)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    chunk_ids = calculate_chunk_ids(chunks)
    chunk_texts = [chunk.page_content for chunk in chunks]

    os.makedirs(FAISS_PATH, exist_ok=True)

    faiss.write_index(index, os.path.join(FAISS_PATH, "faiss.index"))

    with open(os.path.join(FAISS_PATH, "chunk_texts.txt"), "w", encoding="utf-8") as f:
        for text in chunk_texts:
            f.write(f"{text}\n")

    with open(os.path.join(FAISS_PATH, "chunk_ids.txt"), "w", encoding="utf-8") as f:
        for chunk_id in chunk_ids:
            f.write(f"{chunk_id}\n")

    print(f"✅ Added {len(chunks)} document chunks to FAISS.")
    print(f"📂 Chunk texts and IDs saved in {FAISS_PATH}.")

def calculate_chunk_ids(chunks):
    """Generates unique chunk IDs using document source and page number."""
    last_page_id = None
    current_chunk_index = 0
    chunk_ids = []

    for chunk in chunks:
        source = chunk.metadata.get("source", "unknown_source")
        page = chunk.metadata.get("page", "unknown_page")
        current_page_id = f"{source}:{page}"

        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0

        chunk_id = f"{current_page_id}:{current_chunk_index}"
        last_page_id = current_page_id
        chunk.metadata["id"] = chunk_id
        chunk_ids.append(chunk_id)

    return chunk_ids

def clear_database():
    """Deletes the FAISS index directory to reset the database."""
    if os.path.exists(FAISS_PATH):
        shutil.rmtree(FAISS_PATH)
        print("🗑️ FAISS database cleared.")

if __name__ == "__main__":
    main()
