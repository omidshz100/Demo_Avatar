import YouTube from 'react-youtube';
import { useState, useEffect } from 'react';

interface MediaGalleryProps {
  youtubeUrls?: string[];
  images?: string[];
  onClose?: () => void;
}

// Helper to extract YouTube ID
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function MediaGallery({ youtubeUrls = [], images = [], onClose }: MediaGalleryProps) {
  const allMedia = [
    ...youtubeUrls.map(url => ({ type: 'youtube' as const, url, id: getYouTubeId(url) })),
    ...images.map(url => ({ type: 'image' as const, url, id: url }))
  ].filter(m => m.id !== null); // Filter out invalid youtube URLs

  const [selectedMedia, setSelectedMedia] = useState(allMedia[0] || null);

  // If the media array changes (new message arrives), reset to the first item
  useEffect(() => {
    if (allMedia.length > 0) {
      setSelectedMedia(allMedia[0]);
    } else {
      setSelectedMedia(null);
    }
  }, [youtubeUrls.length, images.length]); // Intentionally cheap dependency array

  if (allMedia.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-full bg-black/80 backdrop-blur-sm border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
      
      {/* Header with Close Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-white text-xl font-bold">Project Media</h2>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Main Viewer Area */}
      {selectedMedia && (
        <div className="w-full rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0">
          {selectedMedia.type === 'youtube' ? (
            <YouTube 
              videoId={selectedMedia.id!} 
              opts={{
                width: '100%',
                height: '300',
                playerVars: {
                  autoplay: 0, // Disabled autoplay as requested
                  controls: 1,
                  modestbranding: 1
                }
              }} 
            />
          ) : (
            <img src={selectedMedia.url} alt="Project Media" className="w-full h-auto max-h-[300px] object-contain bg-black/50" />
          )}
        </div>
      )}

      {/* Thumbnails Gallery */}
      {allMedia.length > 1 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider">More Media</h3>
          <div className="grid grid-cols-2 gap-3">
            {allMedia.map((media, idx) => {
              const isSelected = selectedMedia?.id === media.id;
              return (
                <button 
                  key={idx} 
                  onClick={() => setSelectedMedia(media)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected ? 'border-pink-500 opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {media.type === 'youtube' ? (
                    <div className="relative aspect-video bg-black flex items-center justify-center">
                      <img 
                        src={`https://img.youtube.com/vi/${media.id}/mqdefault.jpg`} 
                        className="w-full h-full object-cover" 
                        alt="Video Thumbnail"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-black">
                      <img src={media.url} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
