import { useState, useEffect } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface ProjectProfile {
  id: number;
  project_name: string;
  youtube_urls: string;
  images: string;
}

export function ProjectsUI() {
  const [projects, setProjects] = useState<ProjectProfile[]>([]);
  const [name, setName] = useState("");
  const [youtubeUrls, setYoutubeUrls] = useState("");
  const [images, setImages] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/projects`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleUpload = async () => {
    if (!name || !file) return alert("Name and file are required!");
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_name", name);
    
    // Split comma separated strings into JSON arrays
    const ytArray = youtubeUrls.split(',').map(s => s.trim()).filter(s => s);
    const imgArray = images.split(',').map(s => s.trim()).filter(s => s);
    
    formData.append("youtube_urls", JSON.stringify(ytArray));
    formData.append("images", JSON.stringify(imgArray));

    try {
      const res = await fetch(`${backendUrl}/api/admin/projects/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Project uploaded and ingested into ChromaDB successfully!");
        setName("");
        setYoutubeUrls("");
        setImages("");
        setFile(null);
        fetchProjects();
      } else {
        const errorData = await res.json();
        alert(`Failed: ${errorData.detail}`);
      }
    } catch (e) {
      console.error(e);
      alert("Upload failed.");
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${backendUrl}/api/admin/projects/${id}`, { method: "DELETE" });
      fetchProjects();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
      <h2 className="text-xl font-semibold mb-6">Knowledge Management (Projects)</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg mb-4 text-green-400">Ingest New Knowledge</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Project Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white outline-none focus:border-green-500" placeholder="e.g. Solar Drone Inspection 2024" />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Knowledge Document (PDF, TXT, CSV)</label>
              <input type="file" accept=".pdf,.txt,.csv" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white outline-none focus:border-green-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-green-600 file:text-white" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Associated YouTube URLs (comma separated)</label>
              <input type="text" value={youtubeUrls} onChange={e => setYoutubeUrls(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white outline-none focus:border-green-500" placeholder="https://youtu.be/..., https://youtu.be/..." />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Associated Images (comma separated URLs)</label>
              <input type="text" value={images} onChange={e => setImages(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white outline-none focus:border-green-500" placeholder="https://example.com/img1.png, ..." />
            </div>

            <button onClick={handleUpload} disabled={uploading || !name || !file} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded font-bold mt-4">
              {uploading ? "Ingesting to Vector DB..." : "Upload & Ingest"}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg mb-4 text-green-400">Ingested Projects</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {projects.map((p: any) => {
              const ytArray = JSON.parse(p.youtube_links_json || "[]");
              const imgArray = JSON.parse(p.images_json || "[]");
              
              return (
                <div key={p.id} className="p-4 rounded border border-white/10 bg-black/30">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{p.name}</h4>
                    <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded">Delete</button>
                  </div>
                  <div className="text-sm text-gray-400">
                    <div>YouTube Links: <span className="text-blue-300">{ytArray.length}</span></div>
                    <div>Images: <span className="text-yellow-300">{imgArray.length}</span></div>
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && <p className="text-gray-500 italic">No projects ingested yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
