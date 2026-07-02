import { useRef, useState } from "react";
import { AVATAR_CONFIG_DEFAULTS, useAvatarConfig } from "../hooks/useAvatarConfig";

const BG_PRESETS = [
  { name: "Sunset", value: "linear-gradient(19deg, #faaca8 0%, #ddd6f3 100%)" },
  { name: "Night",  value: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" },
  { name: "Ocean",  value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)" },
  { name: "Rose",   value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "White",  value: "#f9fafb" },
];

const IDLE_ANIMATIONS = ["Idle", "Laughing", "Rumba", "Crying", "Angry", "Terrified"];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {title}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
};

export const CustomizationPanel = () => {
  const [open, setOpen] = useState(false);
  const { config, setConfig } = useAvatarConfig();
  const [urlDraft, setUrlDraft] = useState(config.glbUrl);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setFileName(file.name);
    setUrlDraft(url);
    setConfig({ glbUrl: url });
  };

  return (
    <>
      {/* Gear toggle — hidden while panel is open */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Customize avatar"
          className="fixed top-4 right-4 z-30 bg-white/80 backdrop-blur-md hover:bg-white text-gray-700 p-2.5 rounded-xl shadow-lg pointer-events-auto transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-30 bg-white/95 backdrop-blur-md shadow-2xl flex flex-col transition-transform duration-300 ease-in-out pointer-events-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="font-bold text-gray-800">Avatar Settings</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Model ── */}
          <Section title="Model">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* File picker button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-pink-400 rounded-lg px-3 py-3 mb-3 text-sm text-gray-500 hover:text-pink-500 transition-colors"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="truncate">
                {fileName ? fileName : "Choose GLB file…"}
              </span>
            </button>

            {/* Manual URL input */}
            <p className="text-xs text-gray-400 mb-1.5">Or enter a URL / path:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") setConfig({ glbUrl: urlDraft }); }}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 min-w-0"
                placeholder="/models/avatar.glb"
              />
              <button
                onClick={() => { setFileName(null); setConfig({ glbUrl: urlDraft }); }}
                className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors flex-shrink-0"
              >
                Load
              </button>
            </div>
          </Section>

          {/* ── Position ── */}
          <Section title="Position">
            {(["X", "Y", "Z"] as const).map((axis, i) => (
              <div key={axis} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-xs font-bold text-gray-400 w-4">{axis}</span>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.01}
                  value={config.position[i]}
                  onChange={(e) => {
                    const pos: [number, number, number] = [...config.position];
                    pos[i] = parseFloat(e.target.value);
                    setConfig({ position: pos });
                  }}
                  className="flex-1 accent-pink-500 h-1.5 cursor-pointer"
                />
                <span className="text-xs text-gray-600 w-12 text-right tabular-nums font-mono">
                  {config.position[i].toFixed(2)}
                </span>
              </div>
            ))}
          </Section>

          {/* ── Scale ── */}
          <Section title="Scale">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.1}
                max={2.5}
                step={0.01}
                value={config.scale}
                onChange={(e) => setConfig({ scale: parseFloat(e.target.value) })}
                className="flex-1 accent-pink-500 h-1.5 cursor-pointer"
              />
              <span className="text-xs text-gray-600 w-12 text-right tabular-nums font-mono">
                {config.scale.toFixed(2)}
              </span>
            </div>
          </Section>

          {/* ── Background ── */}
          <Section title="Background">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setConfig({ background: preset.value })}
                  title={preset.name}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all hover:scale-105 ${
                    config.background === preset.value
                      ? "border-pink-500 shadow-md"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full shadow-inner border border-black/5"
                    style={{ background: preset.value }}
                  />
                  <span className="text-xs text-gray-500 leading-none">{preset.name}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <span className="text-xs text-gray-400">Custom solid:</span>
              <input
                type="color"
                defaultValue="#faaca8"
                onChange={(e) => setConfig({ background: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
            </div>
          </Section>

          {/* ── Idle Animation ── */}
          <Section title="Idle Animation">
            <div className="flex flex-wrap gap-2">
              {IDLE_ANIMATIONS.map((anim) => (
                <button
                  key={anim}
                  onClick={() => setConfig({ idleAnimation: anim })}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    config.idleAnimation === anim
                      ? "bg-pink-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {anim}
                </button>
              ))}
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={() => {
              setConfig({
                position: [0, 0, 0],
                scale: 1,
                background: AVATAR_CONFIG_DEFAULTS.background,
                idleAnimation: "Idle",
              });
            }}
            className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </>
  );
};
