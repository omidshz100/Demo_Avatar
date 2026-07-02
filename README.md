# Otofarma AI Avatar & Knowledge Management System

![Otofarma Architecture](Demo_Avatar/public/vite.svg) 
*(Note: Replace with your actual project screenshot)*

An end-to-end, privacy-first AI platform that bridges the gap between Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and highly interactive 3D web interfaces. 

Designed specifically for Otofarma, this system allows users to interact with proprietary knowledge (PDFs, internal documents) via a real-time, lip-synced 3D Avatar—all running 100% locally on your own hardware to guarantee absolute data privacy.

---

## 🚀 Key Features

* **Interactive 3D Avatar (UX):** Real-time, lip-synced 3D avatar built with React Three Fiber.
* **Voice-to-Voice Interactions:** Uses local Whisper/Edge-TTS or native speech APIs to communicate naturally.
* **Retrieval-Augmented Generation (RAG):** Powered by **ChromaDB** to index and retrieve your proprietary knowledge, ensuring the AI responses are grounded strictly in your ingested documents (no hallucinations).
* **Absolute Data Privacy:** The LLM inference is handled completely locally by **Ollama**. No sensitive corporate data is ever sent to cloud APIs like OpenAI.
* **Admin Dashboard:** A built-in configuration UI to ingest new PDFs, swap the active LLM, upload new `.glb` 3D characters, and customize the system prompt on the fly.
* **Karaoke-Style Teleprompter:** Dynamic, on-screen captions that sync perfectly with the spoken audio.

---

## 🏗️ Architecture

The project is split into two primary components:

1. **Frontend (`Demo_Avatar/`)**: 
   * **React & Vite** for the UI structure.
   * **React Three Fiber / Drei** for rendering the `.glb` 3D model and morph targets (facial expressions).
   * **Tailwind CSS** for the futuristic, glassmorphism UI.
2. **Backend (`Demo_Avatar_backend_fastapi/`)**:
   * **FastAPI** for high-performance Python routing.
   * **Ollama** (via Langchain) for local LLM inference (e.g. `llama3` or `phi3`).
   * **ChromaDB** for local vector storage of ingested PDF data.

---

## 🛠️ Prerequisites

* **Node.js** (v18+)
* **Python** (v3.10+)
* **Ollama** installed on your machine (download from [ollama.com](https://ollama.com/)).
* You must pull at least one model in Ollama. For example:
  ```bash
  ollama run phi3:3.8b
  ```

---

## 💻 Installation & Setup

### 1. Backend Setup (FastAPI + ChromaDB)

Open a terminal and navigate to the backend directory:
```bash
cd Demo_Avatar_backend_fastapi
```

Create a virtual environment and activate it:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the required Python packages:
```bash
pip install -r requirements.txt
```
*(If `requirements.txt` does not exist, manually install: `pip install fastapi uvicorn edge-tts pydub langchain langchain-community chromadb pypdf python-multipart`)*

Start the backend server:
```bash
# Important: Ensure the virtual environment is activated before running this!
uvicorn main:app --reload --port 8000
```
*The backend is now running at `http://localhost:8000`.*

### 2. Frontend Setup (React + Vite)

Open a **new** terminal (leave the backend running) and navigate to the frontend directory:
```bash
cd Demo_Avatar
```

Install the NPM dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```
*The frontend is now running at `http://localhost:5174` (or `3000` depending on Vite's assignment).*

---

## 🎮 Usage Guide

1. **Main Avatar Interface**: Navigate to `http://localhost:5174`. Press the **Microphone** button to start speaking to the avatar.
2. **Admin Dashboard**: Navigate to `http://localhost:5174/admin`.
   * **Settings**: Change the active Ollama model, upload new custom 3D `.glb` avatars, and customize UI colors.
   * **Projects (RAG)**: Create a new project and upload PDF documents. The backend will automatically chunk and embed the text into ChromaDB.
   * **Prompts**: Create custom System Prompts to alter the personality of the AI avatar (e.g., "Act as a helpful Otofarma assistant...").

---

## 🔧 Troubleshooting

* **Blank Admin Screen**: If the `/admin` screen is blank, it means the FastAPI backend is not running, or you are running an outdated version. Ensure `uvicorn` is running on port 8000.
* **Avatar Not Updating After Upload**: The system uses unique timestamped filenames for uploaded avatars to bypass browser caching. If the avatar still doesn't update, clear your browser cache or try an incognito window.
* **Ollama Connection Refused**: Ensure the Ollama app is running in the background on your machine.

---

## 👨‍💻 Author

**Omid Shojaeian Zanjani**
*T-Shaped Engineer | Data Scientist | Full-Stack Architect*
