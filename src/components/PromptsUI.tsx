import { useState, useEffect } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface SystemPrompt {
  id: number;
  name: string;
  prompt_text: string;
}

export function PromptsUI() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [activePromptId, setActivePromptId] = useState<number | null>(null);

  useEffect(() => {
    fetchPrompts();
    fetchActivePrompt();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/prompts`);
      const data = await res.json();
      setPrompts(data);
    } catch (e) { console.error(e); }
  };

  const fetchActivePrompt = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/settings`);
      const data = await res.json();
      setActivePromptId(data.active_prompt_id);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    try {
      await fetch(`${backendUrl}/api/admin/prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, prompt_text: text }),
      });
      setName("");
      setText("");
      fetchPrompts();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${backendUrl}/api/admin/prompts/${id}`, { method: "DELETE" });
      fetchPrompts();
    } catch (e) { console.error(e); }
  };

  const handleSetActive = async (id: number) => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/settings`);
      const settings = await res.json();
      settings.active_prompt_id = id;
      await fetch(`${backendUrl}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setActivePromptId(id);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
      <h2 className="text-xl font-semibold mb-6">System Prompt Library</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg mb-4 text-blue-400">Create New Prompt</h3>
          <input 
            type="text" 
            placeholder="Prompt Name (e.g. Sales Engineer)" 
            className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 mb-4 text-white focus:border-blue-500 outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <textarea 
            placeholder="You are an AI assistant..."
            className="w-full h-32 bg-black/50 border border-white/10 rounded px-4 py-2 mb-4 text-white focus:border-blue-500 outline-none resize-none"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button onClick={handleCreate} disabled={!name || !text} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded font-semibold">
            Save Prompt
          </button>
        </div>

        <div>
          <h3 className="text-lg mb-4 text-blue-400">Saved Prompts</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {prompts.map(p => (
              <div key={p.id} className={`p-4 rounded border ${activePromptId === p.id ? 'border-blue-500 bg-blue-900/20' : 'border-white/10 bg-black/30'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold">{p.name}</h4>
                  <div className="flex gap-2">
                    {activePromptId !== p.id && (
                      <button onClick={() => handleSetActive(p.id)} className="text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 rounded">
                        Set Active
                      </button>
                    )}
                    {activePromptId === p.id && <span className="text-xs text-blue-400 px-2 py-1">Active</span>}
                    <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded">
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 line-clamp-3">{p.prompt_text}</p>
              </div>
            ))}
            {prompts.length === 0 && <p className="text-gray-500 italic">No prompts saved yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
