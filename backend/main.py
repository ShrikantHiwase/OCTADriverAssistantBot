from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import faiss
import os
import time
import json
import pyaudio
import base64
import tempfile
from vosk import Model, KaldiRecognizer
from query_data import query_rag  # Your local RAG query function
from queryLLM import query_LLM  # LLM query function
import pyttsx3

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust according to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


 # Adjust directories as needed INDEX_PATH- Faiss Index location , MODEL_PATH- STT model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH = os.path.join(BASE_DIR, "faiss_index", "faiss.index")
MODEL_PATH = os.path.join(BASE_DIR, "vosk-model-en-us-0.22") 

# Store session ID for contextual continous conversation
session_data = {"session_id": None}  # Global dictionary to hold session ID

# Load FAISS index at startup
try:
    faiss_index = faiss.read_index(INDEX_PATH)
    print("✅ FAISS index loaded at startup!")
except Exception as e:
    print(f"❌ Failed to load FAISS index at startup: {e}")
    faiss_index = None  # Avoid crashing the server

# Load the VOSK model
try:
    vosk_model = Model(MODEL_PATH)
    print("✅ VOSK model loaded!")
except Exception as e:
    print(f"❌ Failed to load VOSK model: {e}")
    vosk_model = None

# Request Models
class NumberPayload(BaseModel):
    number: int

class QueryRequest(BaseModel):
    query_text: str

def _sse_format(event_type: str, data: str) -> str:
    """
    Helper to format an SSE event.
    """
    return f"event: {event_type}\ndata: {data}\n\n"


# Start an SSE session for Audio and Text interactions for VoiceAssist

@app.get("/stt_query_sse")
def stt_query_sse() -> StreamingResponse:
    """
    Handles Speech-to-Text (STT) processing using VOSK and queries LLM with session memory.
    """

    def event_generator():
        if vosk_model is None:
            yield _sse_format("error", "VOSK model not loaded")
            return

        if not session_data["session_id"]:
            yield _sse_format("error", "Session ID not set. Please start a session first.")
            return

        try:
            # Initialize microphone
            p = pyaudio.PyAudio()
            stream = p.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=16000,
                input=True,
                frames_per_buffer=4000
            )
            stream.start_stream()

            recognizer = KaldiRecognizer(vosk_model, 16000)
            start_time = time.time()

            # Capture audio for 5 seconds
            while time.time() - start_time < 5:
                data = stream.read(4000, exception_on_overflow=False)
                if len(data) == 0:
                    break
                recognizer.AcceptWaveform(data)

            # Close microphone
            stream.stop_stream()
            stream.close()
            p.terminate()

            # Get recognized text from VOSK
            result_json = json.loads(recognizer.FinalResult())
            recognized_text = result_json.get("text", "").strip()
            print(f"Recognized text: {recognized_text}")

            # Send recognized text to frontend
            yield _sse_format("recognized_text", recognized_text)

            if not recognized_text:
                yield _sse_format("llm_response", json.dumps({"text": "", "audio": ""}))
                return

            # ✅ Query LLM with session ID
            llm_response = query_LLM(recognized_text, session_data["session_id"])

            # Convert response to speech
            engine = pyttsx3.init()
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tf:
                temp_filename = tf.name

            engine.save_to_file(llm_response, temp_filename)
            engine.runAndWait()

            with open(temp_filename, "rb") as f:
                audio_bytes = f.read()
            os.remove(temp_filename)
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

            # Send LLM response as SSE
            payload = {
                "text": llm_response,
                "audio": audio_base64
            }
            yield _sse_format("llm_response", json.dumps(payload))

        except Exception as e:
            yield _sse_format("error", str(e))
            return

    return StreamingResponse(event_generator(), media_type="text/event-stream")


#get Random Session ID

@app.post("/send_random_number")
async def receive_number(payload: NumberPayload):
    """
    Receives a session ID from the frontend and stores it.
    """
    print(f"Received session ID: {payload.number}")
    session_data["session_id"] = str(payload.number)  # Store session ID as a string
    return {"message": "Session ID stored successfully", "session_id": session_data["session_id"]}


#Get Query for the RAG based Prognostics script
@app.post("/query/")
def handle_query(request: QueryRequest):
    global faiss_index
    if faiss_index is None:
        return JSONResponse(content={"error": "FAISS index is not loaded!"}, status_code=500)
    try:
        response = query_rag(request.query_text)
        return {"response": response}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)



@app.get("/")
def home():
    return {"message": "Prognostics AI API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


