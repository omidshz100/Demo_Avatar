import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

interface CaptionsProps {
  enabled: boolean;
  position: string;
  hasMedia: boolean;
  textColor?: string;
  activeColor?: string;
  bgColor?: string;
}

export const Captions = ({ enabled, position, hasMedia, textColor = "#e5e7eb", activeColor = "#4ade80", bgColor = "rgba(0,0,0,0.6)" }: CaptionsProps) => {
  const { message, audioProgress } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  const [words, setWords] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (message?.text) {
      // Split by whitespace but keep the whitespace as tokens so we can render spaces
      setWords(message.text.split(/(\s+)/)); 
    } else {
      setWords([]);
      setActiveIndex(0);
    }
  }, [message]);

  useEffect(() => {
    if (words.length > 0) {
      // Calculate active word index based on audio progress
      // Exclude whitespace tokens from the calculation but include them in rendering
      const actualWordsCount = words.filter(w => w.trim().length > 0).length;
      const targetWordIndex = Math.floor(audioProgress * actualWordsCount);
      
      let wordCounter = 0;
      let newActiveIndex = 0;
      
      for (let i = 0; i < words.length; i++) {
        if (words[i].trim().length > 0) {
          if (wordCounter === targetWordIndex) {
            newActiveIndex = i;
            break;
          }
          wordCounter++;
        }
      }
      
      // Keep active index at the end if audio is finished
      if (audioProgress >= 0.99) {
        newActiveIndex = words.length - 1;
      }
      
      setActiveIndex(newActiveIndex);
    }
  }, [audioProgress, words]);

  useEffect(() => {
    // Scroll the active word into view so it stays centered
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeWord = activeWordRef.current;
      
      // Calculate how much to scroll to center the word vertically
      const scrollOffset = activeWord.offsetTop - (container.clientHeight / 2) + (activeWord.clientHeight / 2);
      
      container.scrollTo({
        top: scrollOffset,
        behavior: "smooth"
      });
    }
  }, [activeIndex]);

  if (!enabled || !message || words.length === 0) return null;

  // Determine positioning classes
  let positionClasses = "";
  
  // Handle collision avoidance if media is on the left
  const avoidLeftMedia = hasMedia && position.includes("left");
  
  switch (position) {
    case "top-left":
      positionClasses = avoidLeftMedia ? "top-4 left-[380px]" : "top-20 left-4";
      break;
    case "bottom-left":
      positionClasses = avoidLeftMedia ? "bottom-4 left-[380px]" : "bottom-20 left-4";
      break;
    case "top-right":
      positionClasses = "top-20 right-4";
      break;
    case "bottom-right":
      positionClasses = "bottom-20 right-4";
      break;
    case "bottom-center":
      positionClasses = "bottom-20 left-1/2 -translate-x-1/2";
      break;
    default:
      positionClasses = "top-20 left-4";
  }

  return (
    <div 
      className={`absolute z-10 w-80 pointer-events-none transition-all duration-500 ease-in-out ${positionClasses}`}
    >
      <div 
        ref={containerRef}
        className="h-48 overflow-hidden rounded-xl backdrop-blur-md p-6 border border-white/10 shadow-2xl"
        style={{
          backgroundColor: bgColor,
          maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)"
        }}
      >
        <div className="font-medium text-lg leading-relaxed flex flex-wrap py-12">
          {words.map((word, index) => {
            const isWhitespace = word.trim().length === 0;
            const isActive = index === activeIndex && !isWhitespace;
            const isPast = index < activeIndex;
            
            return (
              <span
                key={index}
                ref={isActive ? activeWordRef : null}
                className={`transition-all duration-300 ${isWhitespace ? "whitespace-pre" : ""}`}
                style={{
                  color: isWhitespace ? "transparent" : isActive ? activeColor : textColor,
                  fontWeight: isActive ? "bold" : "normal",
                  textShadow: isActive ? "0 4px 6px rgba(0,0,0,0.5)" : "none",
                  opacity: isWhitespace ? 1 : isPast ? 0.9 : 0.4,
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  display: "inline-block"
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
