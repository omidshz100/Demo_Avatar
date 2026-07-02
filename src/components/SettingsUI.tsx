import { useState, useEffect } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface PlatformSettings {
  company_name: string;
  company_subtitle: string;
  background_css: string;
  active_llm_model: string;
  active_prompt_id: number | null;
  avatar_glb_url: string;
}

interface OllamaModel {
  name: string;
}

import { useAvatarConfig } from "../hooks/useAvatarConfig";

export function SettingsUI() {
  const [settings, setSettings] = useState<PlatformSettings>({ 
    company_name: "GreenTech", 
    company_subtitle: "AI Avatar 🤖 V 1.0.1", 
    background_css: "linear-gradient(19deg, #faaca8 0%, #ddd6f3 100%)",
    active_llm_model: "", 
    active_prompt_id: null,
    avatar_glb_url: "/models/64f1a714fe61576b46f27ca2.glb"
  });
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchModels();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/settings`);
      const data = await res.json();
      setSettings({
        ...data,
        company_name: data.company_name || "GreenTech",
        company_subtitle: data.company_subtitle || "AI Avatar 🤖 V 1.0.1",
        background_css: data.background_css || "linear-gradient(19deg, #faaca8 0%, #ddd6f3 100%)",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/models`);
      const data = await res.json();
      setModels(data.models || []);
    } catch (e) {
      console.error(e);
    }
  };

  const { setConfig } = useAvatarConfig();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${backendUrl}/api/admin/avatars/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.avatar_glb_url) {
        setSettings({ ...settings, avatar_glb_url: data.avatar_glb_url });
        setConfig({ glbUrl: data.avatar_glb_url });
        alert("Avatar uploaded and set successfully!");
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload avatar.");
    }
    
    // reset input
    if (e.target) e.target.value = "";
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`${backendUrl}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      alert("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
      <h2 className="text-xl font-semibold mb-6">Platform Settings</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Company Name</label>
        <input 
          type="text"
          className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 focus:border-purple-500 outline-none text-white"
          value={settings.company_name}
          onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Company Subtitle</label>
        <input 
          type="text"
          className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 focus:border-purple-500 outline-none text-white"
          value={settings.company_subtitle}
          onChange={(e) => setSettings({ ...settings, company_subtitle: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Header Box Background</label>
        
        <div className="flex flex-wrap gap-4 mb-3">
          {/* Default Frost */}
          <button
            onClick={() => setSettings({ ...settings, background_css: "rgba(255, 255, 255, 0.5)" })}
            className={`w-10 h-10 rounded border-2 transition-transform hover:scale-110 ${settings.background_css === "rgba(255, 255, 255, 0.5)" ? "border-white" : "border-transparent"}`}
            style={{ background: "rgba(255, 255, 255, 0.5)" }}
            title="Default Frosted Glass"
          />
          {/* Dark Glass */}
          <button
            onClick={() => setSettings({ ...settings, background_css: "rgba(0, 0, 0, 0.5)" })}
            className={`w-10 h-10 rounded border-2 transition-transform hover:scale-110 ${settings.background_css === "rgba(0, 0, 0, 0.5)" ? "border-white" : "border-transparent"}`}
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
            title="Dark Glass"
          />
          {/* Green Glass */}
          <button
            onClick={() => setSettings({ ...settings, background_css: "rgba(34, 197, 94, 0.5)" })}
            className={`w-10 h-10 rounded border-2 transition-transform hover:scale-110 ${settings.background_css === "rgba(34, 197, 94, 0.5)" ? "border-white" : "border-transparent"}`}
            style={{ background: "rgba(34, 197, 94, 0.5)" }}
            title="Green Glass"
          />
          {/* Custom Solid Color Picker */}
          <div className="flex items-center gap-2">
            <input 
              type="color"
              value={settings.background_css.startsWith("#") ? settings.background_css.substring(0, 7) : "#ffffff"}
              onChange={(e) => setSettings({ ...settings, background_css: e.target.value })}
              className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
              title="Custom Solid Color"
            />
            <span className="text-xs text-gray-400">Custom Color</span>
          </div>
        </div>

        <details className="mt-2">
          <summary className="text-xs text-purple-400 cursor-pointer hover:text-purple-300">Advanced: Edit CSS directly</summary>
          <input 
            type="text"
            className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 mt-2 focus:border-purple-500 outline-none text-white font-mono text-sm"
            value={settings.background_css}
            onChange={(e) => setSettings({ ...settings, background_css: e.target.value })}
            placeholder="e.g. #000000, rgba(...), or linear-gradient(...)"
          />
        </details>
      </div>

      <hr className="border-white/10 my-6" />

      <h3 className="text-lg font-semibold mb-4 text-purple-300">Teleprompter Settings</h3>
      
      <div className="mb-4">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={settings.captions_enabled ?? true}
              onChange={(e) => setSettings({ ...settings, captions_enabled: e.target.checked })}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${settings.captions_enabled !== false ? 'bg-purple-500' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.captions_enabled !== false ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <div className="ml-3 text-sm font-medium text-gray-300">
            Show Floating Teleprompter
          </div>
        </label>
        <p className="text-xs text-gray-500 mt-2">Displays what the avatar is saying with a karaoke-style scrolling effect.</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Teleprompter Position</label>
        <select 
          className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 focus:border-purple-500 outline-none text-white"
          value={settings.captions_position || "top-left"}
          onChange={(e) => setSettings({ ...settings, captions_position: e.target.value })}
        >
          <option value="top-left">Top Left</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-right">Top Right</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-center">Bottom Center</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">Automatically avoids collisions with the Media Gallery if both are on the left.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-300">Background</label>
          <div className="flex items-center gap-2">
            <input 
              type="color"
              value={settings.captions_bg_color ? (settings.captions_bg_color.startsWith("rgba") ? "#000000" : settings.captions_bg_color.substring(0, 7)) : "#000000"}
              onChange={(e) => setSettings({ ...settings, captions_bg_color: e.target.value })}
              className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Box Color</p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-300">Text Color</label>
          <div className="flex items-center gap-2">
            <input 
              type="color"
              value={settings.captions_text_color?.startsWith("#") ? settings.captions_text_color.substring(0, 7) : "#e5e7eb"}
              onChange={(e) => setSettings({ ...settings, captions_text_color: e.target.value })}
              className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Upcoming Words</p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-300">Active Color</label>
          <div className="flex items-center gap-2">
            <input 
              type="color"
              value={settings.captions_active_color?.startsWith("#") ? settings.captions_active_color.substring(0, 7) : "#4ade80"}
              onChange={(e) => setSettings({ ...settings, captions_active_color: e.target.value })}
              className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Spoken Word</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Active Avatar Character</label>
        <div className="flex gap-2">
          <select 
            className="flex-1 bg-black/50 border border-white/10 rounded px-4 py-2 focus:border-purple-500 outline-none text-white"
            value={settings.avatar_glb_url || "/models/64f1a714fe61576b46f27ca2.glb"}
            onChange={(e) => {
              setSettings({ ...settings, avatar_glb_url: e.target.value });
              setConfig({ glbUrl: e.target.value });
            }}
          >
            {/* Show custom URL if it's not one of the defaults */}
            {settings.avatar_glb_url && 
             settings.avatar_glb_url !== "/models/64f1a714fe61576b46f27ca2.glb" && 
             settings.avatar_glb_url !== "/models/cyberpunk.glb" && (
               <option value={settings.avatar_glb_url}>Custom Upload ({settings.avatar_glb_url.replace('/models/', '')})</option>
            )}
            <option value="/models/64f1a714fe61576b46f27ca2.glb">Default Professional Avatar</option>
            <option value="/models/cyberpunk.glb">Cyberpunk Avatar</option>
          </select>
          <label className="bg-white/10 hover:bg-white/20 border border-white/20 rounded px-4 py-2 cursor-pointer transition-colors text-sm flex items-center justify-center whitespace-nowrap">
            {loading ? "..." : "Upload .glb"}
            <input 
              type="file" 
              accept=".glb,.gltf" 
              onChange={handleAvatarUpload} 
              className="hidden" 
              disabled={loading}
            />
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">Select an existing avatar or upload a custom .glb file.</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Active LLM Model</label>
        <select 
          className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 focus:border-purple-500 outline-none text-white"
          value={settings.active_llm_model}
          onChange={(e) => setSettings({ ...settings, active_llm_model: e.target.value })}
        >
          <option value="">Select a model</option>
          {models.map(m => (
            <option key={m.name} value={m.name}>{m.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">Fetches available models directly from your local Ollama instance.</p>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded font-semibold transition-colors"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
