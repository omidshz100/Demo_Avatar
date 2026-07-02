import { useState } from 'react';
import { SettingsUI } from '../components/SettingsUI';
import { PromptsUI } from '../components/PromptsUI';
import { ProjectsUI } from '../components/ProjectsUI';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'prompts' | 'settings'>('projects');

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Otofarma Knowledge Management</h1>
        
        <div className="flex border-b border-white/10 mb-8">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'projects' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
          >
            Project Profiles
          </button>
          <button 
            onClick={() => setActiveTab('prompts')}
            className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'prompts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            System Prompts
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'settings' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          >
            Platform Settings
          </button>
        </div>

        <div className="mt-8">
          {activeTab === 'projects' && <ProjectsUI />}
          {activeTab === 'prompts' && <PromptsUI />}
          {activeTab === 'settings' && <SettingsUI />}
        </div>
      </div>
    </div>
  );
}
