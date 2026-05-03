import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useProjects, useAchievements, useProfile, useMessages } from '../lib/hooks/useFirestore';
import { Trash2, Plus, LogOut, Loader2, Save, User as UserIcon, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

export default function AdminPanel() {
  const { profile } = useProfile();
  const { projects } = useProjects();
  const { achievements } = useAchievements();
  const { messages } = useMessages();
  const [loading, setLoading] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const [newProject, setNewProject] = useState({ title: '', description: '', tools: '', imageUrl: '', link: '' });
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '', date: '', imageUrl: '' });
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        title: profile.title || '',
        tagline: profile.tagline || '',
        about: profile.about || '',
        university: profile.university || '',
        careerGoals: profile.careerGoals || '',
        profileImage: profile.profileImage || '',
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const path = profile?.id ? `profile/${profile.id}` : 'profile';
    try {
      if (profile?.id) {
        await updateDoc(doc(db, 'profile', profile.id), { ...profileData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'profile'), { ...profileData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      alert('Profile updated!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    setLoading(false);
  };


  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const path = 'projects';
    try {
      await addDoc(collection(db, path), {
        ...newProject,
        tools: newProject.tools.split(',').map(t => t.trim()),
        createdAt: serverTimestamp()
      });
      setNewProject({ title: '', description: '', tools: '', imageUrl: '', link: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
    setLoading(false);
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const path = 'achievements';
    try {
      await addDoc(collection(db, path), {
        ...newAchievement,
        createdAt: serverTimestamp()
      });
      setNewAchievement({ title: '', description: '', date: '', imageUrl: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
    setLoading(false);
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm('Are you sure?')) {
      const path = `${coll}/${id}`;
      try {
        await deleteDoc(doc(db, coll, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-5xl mx-auto min-h-screen bg-bg-base text-text-body">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-text-title">Admin Dashboard</h1>
        <button onClick={() => auth.signOut()} className="flex items-center gap-2 text-text-body hover:text-text-title transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Profile Settings */}
        <div className="md:col-span-2">
          <div className="p-8 bg-bg-surface border border-border-main rounded-3xl transition-all">
            <h2 className="text-xl font-bold text-brand mb-6 flex items-center gap-2">
              <UserIcon size={20} /> Portfolio Profile Settings
            </h2>
            {profileData && (
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-body/60 uppercase mb-2">Name</label>
                  <input 
                    type="text" className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                    value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-body/60 uppercase mb-2">Professional Title</label>
                  <input 
                    type="text" className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                    value={profileData.title} onChange={e => setProfileData({...profileData, title: e.target.value})}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-text-body/60 uppercase mb-2">Hero Tagline</label>
                  <input 
                    type="text" className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                    value={profileData.tagline} onChange={e => setProfileData({...profileData, tagline: e.target.value})}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-text-body/60 uppercase mb-2">About Section</label>
                  <textarea 
                    rows={4} className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                    value={profileData.about} onChange={e => setProfileData({...profileData, about: e.target.value})}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-body/60 uppercase mb-2">University</label>
                  <input 
                    type="text" className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                    value={profileData.university} onChange={e => setProfileData({...profileData, university: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-body/60 uppercase mb-2">Profile Image URL</label>
                  <input 
                    type="text" className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                    value={profileData.profileImage} onChange={e => setProfileData({...profileData, profileImage: e.target.value})}
                  />
                </div>
                <div className="sm:col-span-2">
                   <button disabled={loading} className="px-8 py-3 bg-brand text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-80 transition-all">
                    <Save size={20} /> Update Portfolio Profile
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Project Form */}
        <div className="space-y-8">
          <div className="p-8 bg-bg-surface border border-border-main rounded-3xl transition-all">
            <h2 className="text-xl font-bold text-brand mb-6 flex items-center gap-2">
              <Plus size={20} /> Add New Project
            </h2>
            <form onSubmit={handleAddProject} className="space-y-4">
              <input 
                type="text" placeholder="Title" required 
                className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})}
              />
              <textarea 
                placeholder="Description" required rows={3}
                className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
              ></textarea>
              <input 
                type="text" placeholder="Tools (comma separated)" 
                className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                value={newProject.tools} onChange={e => setNewProject({...newProject, tools: e.target.value})}
              />
              <input 
                type="text" placeholder="Image URL" required 
                className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                value={newProject.imageUrl} onChange={e => setNewProject({...newProject, imageUrl: e.target.value})}
              />
              <input 
                type="text" placeholder="Link (optional)" 
                className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                value={newProject.link} onChange={e => setNewProject({...newProject, link: e.target.value})}
              />
              <button disabled={loading} className="w-full py-3 bg-brand text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-80 transition-all">
                {loading && <Loader2 className="animate-spin" />} Save Project
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-text-title px-2 uppercase tracking-widest text-xs opacity-60">Manage Projects</h3>
            {projects.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-bg-surface border border-border-main rounded-xl hover:border-brand/40 transition-all">
                <span className="text-text-title font-medium">{p.title}</span>
                <button onClick={() => handleDelete('projects', p.id!)} className="text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Form */}
        <div className="space-y-8">
          <div className="p-8 bg-bg-surface border border-border-main rounded-3xl transition-all">
            <h2 className="text-xl font-bold text-brand mb-6 flex items-center gap-2">
              <Plus size={20} /> Add Achievement
            </h2>
            <form onSubmit={handleAddAchievement} className="space-y-4">
              <input 
                type="text" placeholder="Title" required 
                className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                value={newAchievement.title} onChange={e => setNewAchievement({...newAchievement, title: e.target.value})}
              />
              <textarea 
                placeholder="Description" required rows={3}
                className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                value={newAchievement.description} onChange={e => setNewAchievement({...newAchievement, description: e.target.value})}
              ></textarea>
              <input 
                type="text" placeholder="Date (e.g. May 2026)" required 
                className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                value={newAchievement.date} onChange={e => setNewAchievement({...newAchievement, date: e.target.value})}
              />
              <input 
                type="text" placeholder="Certificate Image URL (optional)" 
                className="w-full bg-bg-base border border-border-main rounded-xl p-3 text-text-title focus:border-brand outline-none transition-all"
                value={newAchievement.imageUrl} onChange={e => setNewAchievement({...newAchievement, imageUrl: e.target.value})}
              />
              <button disabled={loading} className="w-full py-3 bg-brand text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-80 transition-all">
                {loading && <Loader2 className="animate-spin" />} Save Achievement
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-text-title px-2 uppercase tracking-widest text-xs opacity-60">Manage Achievements</h3>
            {achievements.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-bg-surface border border-border-main rounded-xl hover:border-brand/40 transition-all">
                <span className="text-text-title font-medium">{a.title}</span>
                <button onClick={() => handleDelete('achievements', a.id!)} className="text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="md:col-span-2">
          <div className="p-8 bg-bg-surface border border-border-main rounded-3xl transition-all">
            <h2 className="text-xl font-bold text-brand mb-6 flex items-center gap-2">
              <MessageSquare size={20} /> User Messages ({messages.length})
            </h2>
            <div className="space-y-4">
              {messages.length > 0 ? messages.map(msg => (
                <div key={msg.id} className="bg-bg-base/40 border border-border-main/50 rounded-2xl overflow-hidden transition-all hover:border-brand/40">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-text-title">{msg.name}</span>
                        <span className="text-xs text-text-body/60">{msg.email}</span>
                      </div>
                      <div className="text-sm text-brand/70 mt-1">{msg.subject || "No Subject"}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-text-body/40 uppercase font-mono">
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </span>
                      <div className="flex items-center gap-2">
                        {expandedMessage === msg.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete('messages', msg.id); }}
                          className="text-red-500/50 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {expandedMessage === msg.id && (
                    <div className="px-5 pb-5 pt-2 border-t border-border-main/50 text-text-body whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-12 text-text-body/50 italic">No messages yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
