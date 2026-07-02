import { useState } from 'react';
import { useChat } from '../hooks/useChat';

export function SandboxChat() {
  const { chat, loading, message: avatarMessage } = useChat();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      chat(input);
      setInput('');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto mb-4 p-4 bg-black/30 rounded border border-white/5">
          {avatarMessage ? (
            <div className="mb-4">
              <span className="font-bold text-green-400">Avatar:</span>
              <p className="mt-1">{avatarMessage.text}</p>
              
              {/* Media Debug Info */}
              {(avatarMessage as any).youtube_urls?.length > 0 && (
                <div className="mt-2 text-sm text-blue-300">
                  Attached YouTube: {(avatarMessage as any).youtube_urls.join(', ')}
                </div>
              )}
              {(avatarMessage as any).images?.length > 0 && (
                <div className="mt-1 text-sm text-yellow-300">
                  Attached Images: {(avatarMessage as any).images.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 italic">No messages yet. Start testing the RAG pipeline.</div>
          )}
          {loading && <div className="text-gray-400">Thinking...</div>}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-black/50 border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-green-500"
            placeholder="Ask a question to test retrieval..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-2 rounded font-semibold transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
