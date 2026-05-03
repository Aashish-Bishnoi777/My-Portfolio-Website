import { useState, useEffect } from 'react';
import { 
  useProjects, useAchievements, useProfile, useMessages 
} from '../lib/hooks/useFirestore';
import { db, auth } from '../lib/firebase';
import { 
  collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, setDoc 
} from 'firebase/firestore';
import { 
  Trash2, Plus, LogOut, LayoutDashboard, User as UserIcon, 
  Briefcase, Award, MessageSquare, Loader2, Save, X, ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Profile } from '../types';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'achievements' | 'messages'>('profile');
  const { profile } = useProfile();
  const { projects } = useProjects();
  const { achievements } = useAchievements();
  const { messages } = useMessages();
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                activeTab === tab.id 
                  ? "bg-brand text-black" 
                  : "bg-bg-surface text-text-body hover:bg-brand/10 hover:text-brand"
              )}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-medium mt-8"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-bg-surface border border-border-main rounded-3xl p-8">
          {activeTab === 'profile' && <ProfileManager initialProfile={profile} />}
          {activeTab === 'projects' && <ProjectsManager projects={projects} />}
          {activeTab === 'achievements' && <AchievementsManager achievements={achievements} />}
          {activeTab === 'messages' && <MessagesManager messages={messages} />}
        </div>
      </div>
    </div>
  );
}

function ProfileManager({ initialProfile }: { initialProfile: Profile | null }) {
  const [formData, setFormData] = useState<Partial<Profile>>(initialProfile || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    }
  }, [initialProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'profile'), {
        ...formData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <h2 className="text-2xl font-bold text-text-title mb-8">Edit Profile</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <label className="space-y-2">
          <span className="text-sm font-medium text-text-body">Name</span>
          <input 
            className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand"
            value={formData.name || ''} 
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-text-body">Tagline</span>
          <input 
            className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand"
            value={formData.tagline || ''} 
            onChange={e => setFormData({...formData, tagline: e.target.value})}
          />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-text-body">About Me</span>
        <textarea 
          rows={5}
          className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand"
          value={formData.about || ''} 
          onChange={e => setFormData({...formData, about: e.target.value})}
        />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <label className="space-y-2">
          <span className="text-sm font-medium text-text-body">University</span>
          <input 
            className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand"
            value={formData.university || ''} 
            onChange={e => setFormData({...formData, university: e.target.value})}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-text-body">Profile Image URL</span>
          <input 
            className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand"
            value={formData.profileImage || ''} 
            onChange={e => setFormData({...formData, profileImage: e.target.value})}
            placeholder="/images/your-image.jpg"
          />
        </label>
      </div>
      <button 
        type="submit" 
        disabled={saving}
        className="px-8 py-3 bg-brand text-black font-bold rounded-xl flex items-center gap-2 hover:opacity-80 transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        Save Changes
      </button>
    </form>
  );
}

function ProjectsManager({ projects }: { projects: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', imageUrl: '', tools: '', link: '' });
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        tools: newProject.tools.split(',').map(s => s.trim()),
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewProject({ title: '', description: '', imageUrl: '', tools: '', link: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to add project.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete project.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-title">Manage Projects</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand border border-brand/20 rounded-xl hover:bg-brand hover:text-black transition-all"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? "Cancel" : "Add Project"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-6 bg-bg-base border border-border-main rounded-2xl space-y-4">
          <input 
            placeholder="Project Title" required
            className="w-full bg-bg-surface border border-border-main rounded-xl p-3 text-text-title"
            value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})}
          />
          <textarea 
            placeholder="Description" required rows={3}
            className="w-full bg-bg-surface border border-border-main rounded-xl p-3 text-text-title"
            value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              placeholder="Image URL" required
              className="w-full bg-bg-surface border border-border-main rounded-xl p-3 text-text-title"
              value={newProject.imageUrl} onChange={e => setNewProject({...newProject, imageUrl: e.target.value})}
            />
            <input 
              placeholder="Tools (comma separated)" required
              className="w-full bg-bg-surface border border-border-main rounded-xl p-3 text-text-title"
              value={newProject.tools} onChange={e => setNewProject({...newProject, tools: e.target.value})}
            />
          </div>
          <input 
            placeholder="Project Link (optional)"
            className="w-full bg-bg-surface border border-border-main rounded-xl p-3 text-text-title"
            value={newProject.link} onChange={e => setNewProject({...newProject, link: e.target.value})}
          />
          <button 
            type="submit" disabled={loading}
            className="px-6 py-2 bg-brand text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Confirm Add Project
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {projects.map(project => (
          <div key={project.id} className="flex items-center gap-4 p-4 bg-bg-base rounded-2xl border border-border-main">
            <img src={project.imageUrl} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1">
              <h4 className="font-bold text-text-title">{project.title}</h4>
              <p className="text-xs text-text-body line-clamp-1">{project.description}</p>
            </div>
            <button onClick={() => handleDelete(project.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AchievementsManager({ achievements }: { achievements: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '', date: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'achievements'), {
        ...newAchievement,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewAchievement({ title: '', description: '', date: '', imageUrl: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to add achievement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'achievements', id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete achievement.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-title">Manage Achievements</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand border border-brand/20 rounded-xl hover:bg-brand hover:text-black transition-all"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? "Cancel" : "Add Achievement"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-6 bg-bg-base border border-border-main rounded-2xl space-y-4">
          <input 
            placeholder="Achievement Title" required
            className="w-full bg-bg-surface border border-border-main rounded-xl p-3 text-text-title"
            value={newAchievement.title} onChange={e => setNewAchievement({...newAchievement, title: e.target.value})}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              placeholder="Date (e.g. 2024)" required
              className="w-full bg-bg-surface border border-border-main rounded-xl p-3 text-text-title"
              value={newAchievement.date} onChange={e => setNewAchievement({...newAchievement, date: e.target.value})}
            />
            <input 
              placeholder="Image URL (optional)"
              className="w-full bg-bg-surface border border-border-main rounded-xl p-3 text-text-title"
              value={newAchievement.imageUrl} onChange={e => setNewAchievement({...newAchievement, imageUrl: e.target.value})}
            />
          </div>
          <textarea 
            placeholder="Description" rows={3}
            className="w-full bg-bg-surface border border-border-main rounded-xl p-3 text-text-title"
            value={newAchievement.description} onChange={e => setNewAchievement({...newAchievement, description: e.target.value})}
          />
          <button 
            type="submit" disabled={loading}
            className="px-6 py-2 bg-brand text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Confirm Add Achievement
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {achievements.map(achievement => (
          <div key={achievement.id} className="flex items-center gap-4 p-4 bg-bg-base rounded-2xl border border-border-main">
            <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center text-brand">
              <Award size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-text-title">{achievement.title}</h4>
              <p className="text-xs text-text-body">{achievement.date}</p>
            </div>
            <button onClick={() => handleDelete(achievement.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesManager({ messages }: { messages: any[] }) {
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-text-title">Messages From Contact Form</h2>
      <div className="grid grid-cols-1 gap-4">
        {messages.length === 0 && <p className="text-text-body italic">No messages yet.</p>}
        {messages.map(message => (
          <div key={message.id} className="p-6 bg-bg-base border border-border-main rounded-2xl space-y-3 relative group">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-text-title">{message.subject || "No Subject"}</h4>
                <p className="text-sm text-brand font-medium">{message.name} ({message.email})</p>
              </div>
              <button 
                onClick={() => handleDelete(message.id)}
                className="p-2 text-red-500 bg-red-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="text-sm text-text-body whitespace-pre-wrap bg-bg-surface p-4 rounded-xl border border-border-main/30">
              {message.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
