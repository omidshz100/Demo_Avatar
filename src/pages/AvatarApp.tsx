import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "../components/Experience";
import { UI } from "../components/UI";
import { MediaGallery } from "../components/MediaGallery";
import { useChat } from "../hooks/useChat";
import { useState, useEffect } from "react";

export function AvatarApp() {
  const { message } = useChat();
  const [activeMedia, setActiveMedia] = useState<{youtubeUrls: string[], images: string[]} | null>(null);

  // Sync active media when a new message with media arrives
  useEffect(() => {
    if (message && ((message.youtube_urls && message.youtube_urls.length > 0) || (message.images && message.images.length > 0))) {
      setActiveMedia({
        youtubeUrls: message.youtube_urls || [],
        images: message.images || []
      });
    }
  }, [message]);

  const hasMedia = activeMedia !== null;

  return (
    <div className="w-full h-screen relative flex">
      {/* Dynamic Media Gallery Area (Left Side) */}
      {hasMedia && (
        <div className="w-1/3 h-full hidden md:block border-r border-white/10">
           <MediaGallery 
              youtubeUrls={activeMedia.youtubeUrls} 
              images={activeMedia.images} 
              onClose={() => setActiveMedia(null)}
           />
        </div>
      )}

      {/* 3D Avatar Area (Right Side if media is open) */}
      <div className={`h-full relative transition-all duration-500 ${hasMedia ? 'w-2/3' : 'w-full'}`}>
        <Loader />
        <Leva hidden />
        <UI />
        <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
          <Experience />
        </Canvas>
      </div>
    </div>
  );
}
