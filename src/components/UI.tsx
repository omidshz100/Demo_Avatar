import { useRef, useState, useEffect, useCallback } from "react";
import { useChat } from "../hooks/useChat";
import { CustomizationPanel } from "./CustomizationPanel";
import { Captions } from "./Captions";
import { useAvatarConfig } from "../hooks/useAvatarConfig";

interface UIProps {
  hidden?: boolean;
}

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const UI = ({ hidden }: UIProps) => {
  const input = useRef<HTMLInputElement>(null);
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const { setConfig } = useAvatarConfig();
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceModeRef = useRef(false); // track voiceMode inside callbacks

  // Fetch dynamic company info
  const [companyName, setCompanyName] = useState("GreenTech");
  const [companySubtitle, setCompanySubtitle] = useState("AI Avatar 🤖 V 1.0.1");
  const [headerBackground, setHeaderBackground] = useState("rgba(255, 255, 255, 0.5)");
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [captionsPosition, setCaptionsPosition] = useState("top-left");
  const [captionsTextColor, setCaptionsTextColor] = useState("#e5e7eb");
  const [captionsActiveColor, setCaptionsActiveColor] = useState("#4ade80");
  const [captionsBgColor, setCaptionsBgColor] = useState("rgba(0,0,0,0.6)");

  useEffect(() => {
    fetch(`${backendUrl}/api/admin/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.company_name) setCompanyName(data.company_name);
        if (data.company_subtitle) setCompanySubtitle(data.company_subtitle);
        if (data.background_css) {
          setHeaderBackground(data.background_css);
          // Remove any globally applied background from the previous mistake
          document.body.style.background = "";
        }
        if (data.captions_enabled !== undefined) setCaptionsEnabled(data.captions_enabled);
        if (data.captions_position) setCaptionsPosition(data.captions_position);
        if (data.captions_text_color) setCaptionsTextColor(data.captions_text_color);
        if (data.captions_active_color) setCaptionsActiveColor(data.captions_active_color);
        if (data.captions_bg_color) setCaptionsBgColor(data.captions_bg_color);
        if (data.avatar_glb_url) setConfig({ glbUrl: data.avatar_glb_url });
      })
      .catch(err => console.error("Failed to load settings", err));
  }, [setConfig]);

  const hasMedia = message?.youtube_urls?.length || message?.images?.length ? true : false;

  const startListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || !voiceModeRef.current) return;
    try {
      rec.start();
      setListening(true);
    } catch (_) {}
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) chat(transcript);
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
  }, [chat]);

  // Auto-restart listening after avatar finishes speaking
  useEffect(() => {
    if (!voiceMode) return;
    if (!loading && !message) {
      const timer = setTimeout(() => startListening(), 500);
      return () => clearTimeout(timer);
    }
  }, [voiceMode, loading, message, startListening]);

  const toggleVoiceMode = () => {
    const next = !voiceMode;
    voiceModeRef.current = next;
    setVoiceMode(next);
    if (!next) {
      recognitionRef.current?.stop();
      setListening(false);
    }
  };

  const sendMessage = () => {
    const text = input.current?.value?.trim();
    if (!text || loading || message) return;
    chat(text);
    input.current!.value = "";
  };

  if (hidden) return null;

  return (
    <>
    <CustomizationPanel />
    <Captions 
      enabled={captionsEnabled} 
      position={captionsPosition} 
      hasMedia={hasMedia} 
      textColor={captionsTextColor}
      activeColor={captionsActiveColor}
      bgColor={captionsBgColor}
    />
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
      {/* Header */}
      <div 
        className="self-start backdrop-blur-md p-4 rounded-lg pointer-events-auto"
        style={{ background: headerBackground }}
      >
        <h1 className="font-black text-xl">{companyName}</h1>
        <p>{companySubtitle}</p>
      </div>

      {/* Right buttons */}
      <div className="w-full flex flex-col items-end justify-center gap-4">
        {/* Zoom */}
        <button
          onClick={() => setCameraZoomed(!cameraZoomed)}
          className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
        >
          {cameraZoomed ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
          )}
        </button>

        {/* Green screen */}
        <button
          onClick={() => document.body.classList.toggle("greenScreen")}
          className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </button>

        {/* Voice mode toggle */}
        <button
          onClick={toggleVoiceMode}
          title={voiceMode ? "Switch to text" : "Switch to voice"}
          className={`pointer-events-auto p-4 rounded-md text-white transition-colors ${
            voiceMode ? "bg-green-500 hover:bg-green-600" : "bg-pink-500 hover:bg-pink-600"
          }`}
        >
          {voiceMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01M5.25 6h13.5A2.25 2.25 0 0121 8.25v7.5A2.25 2.25 0 0118.75 18H5.25A2.25 2.25 0 013 15.75v-7.5A2.25 2.25 0 015.25 6z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      {/* Bottom area */}
      <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
        {voiceMode ? (
          <div className="w-full flex items-center justify-center gap-3 backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-md">
            {/* Pulse indicator */}
            <div className={`w-4 h-4 rounded-full ${
              loading || message
                ? "bg-yellow-400 animate-pulse"
                : listening
                ? "bg-red-500 animate-ping"
                : "bg-green-400 animate-pulse"
            }`} />
            <span className="font-semibold text-gray-700">
              {loading || message
                ? "Avatar is responding..."
                : listening
                ? "Listening... speak now"
                : "Getting ready..."}
            </span>
          </div>
        ) : (
          <>
            <input
              className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
              placeholder="Type a message..."
              ref={input}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            />
            <button
              disabled={loading || !!message}
              onClick={sendMessage}
              className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
                loading || message ? "cursor-not-allowed opacity-30" : ""
              }`}
            >
              Send
            </button>
          </>
        )}
      </div>
    </div>
    </>
  );
};
