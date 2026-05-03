import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Github, Linkedin, Instagram, Twitter, 
  ExternalLink, Mail, Code, BarChart, Search, 
  Send, Plus, Trash2, Edit2, Download, LogIn, LogOut,
  Award, Briefcase, User, Lightbulb, Loader2, Palette, Zap, Brush, Video,
  Sun, Moon, Sparkles
} from 'lucide-react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { auth, signInWithGoogle, logout, db } from './lib/firebase';
import { useProfile, useProjects, useAchievements, useIsAdmin } from './lib/hooks/useFirestore';
import { cn } from './lib/utils';
import { Profile } from './types';
import { collection, doc, setDoc, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/errorHandlers';
import AdminPanel from './components/AdminPanel';
import ResumeBuilder from './components/ResumeBuilder';
import { 
  profileImage, p1, p2, p3, p4, p5, p6, p7, p8 
} from './assets/images';

// --- Components ---

function Navbar({ user, isAdmin, onLogin, onLogout, theme, setTheme }: any) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', isInternal: true },
    { name: 'About', href: '/#about', isInternal: false },
    { name: 'Skills', href: '/#skills', isInternal: false },
    { name: 'Projects', href: '/#projects', isInternal: false },
    { name: 'Resume Builder', href: '/resume', isInternal: true },
    { name: 'Contact', href: '/#contact', isInternal: false },
  ];

  const ThemeToggle = () => (
    <div className="flex bg-bg-surface p-1 rounded-full border border-border-main">
      <button 
        onClick={() => setTheme('dark')}
        className={cn(
          "p-2 rounded-full transition-all",
          theme === 'dark' ? "bg-brand text-black" : "text-text-body hover:text-text-title"
        )}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
      <button 
        onClick={() => setTheme('light')}
        className={cn(
          "p-2 rounded-full transition-all",
          theme === 'light' ? "bg-brand text-white" : "text-text-body hover:text-text-title"
        )}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
    </div>
  );

  const NavItem = ({ link }: any) => {
    if (link.isInternal) {
      return (
        <Link 
          to={link.href}
          onClick={() => setMobileMenuOpen(false)}
          className={cn(
            "text-sm font-medium transition-colors",
            pathname === link.href ? "text-brand" : "text-text-body hover:text-text-title"
          )}
        >
          {link.name}
        </Link>
      );
    }
    return (
      <a 
        href={link.href} 
        onClick={() => setMobileMenuOpen(false)}
        className="text-sm font-medium text-text-body hover:text-text-title transition-colors"
      >
        {link.name}
      </a>
    );
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-300",
      (isScrolled || pathname !== '/') ? "bg-bg-base/80 backdrop-blur-md border-b border-border-main py-3" : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-text-title">
          AB<span className="text-brand">.</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavItem key={link.name} link={link} />
          ))}
          
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link to="/admin" className={cn(
                  "text-xs px-2 py-1 rounded border transition-all",
                  pathname === '/admin' ? "bg-brand text-black border-brand" : "bg-brand/10 text-brand border-brand/20"
                )}>
                  Admin
                </Link>
              )}
              <button onClick={onLogout} className="text-text-body hover:text-text-title">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin} 
              className="flex items-center gap-2 px-5 py-2 bg-brand text-white dark:text-black rounded-full font-bold text-sm hover:opacity-80 transition-all transform hover:scale-105"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button className="text-text-title" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-bg-base border-b border-border-main p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <NavItem key={link.name} link={link} />
            ))}
            {user ? (
              <div className="flex flex-col gap-4 pt-4 border-t border-border-main">
                {isAdmin && <Link to="/admin" className="text-brand font-medium" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-text-body">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={onLogin} 
                className="flex items-center justify-center gap-2 w-full py-4 bg-brand text-white dark:text-black font-bold rounded-xl mt-4"
              >
                <LogIn size={18} /> Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function HomePage({ profile, projects, achievements, isAdmin }: any) {
  const providedProjects = [
    {
      id: 'p1',
      title: "Skills for 2030 Infographic",
      description: "A comprehensive visual guide exploring the future-proof skills required in a rapidly changing digital landscape, focusing on AI literacy and adaptability.",
      imageUrl: p1,
      tools: ["Digital Strategy", "Visual Storytelling", "Content Marketing"],
    },
    {
      id: 'p2',
      title: "A Day in Life with AI",
      description: "An educational infographic showcasing the practical applications of AI in daily routines, from morning productivity to nightly entertainment.",
      imageUrl: p2,
      tools: ["AI Literacy", "Educational Content", "Information Design"],
    },
    {
      id: 'p3',
      title: "The Bound Heart",
      description: "A surreal representation of a heart bound by chains and blossoming with flowers, symbolizing the complex relationship between strength and vulnerability.",
      imageUrl: p3,
      tools: ["Surrealism", "Inking", "Symbolism"],
    },
    {
      id: 'p4',
      title: "Faithful Companion",
      description: "A detailed pencil sketch of a Golden Retriever, capturing the warmth and loyalty of man's best friend through intricate shading.",
      imageUrl: p4,
      tools: ["Traditional Art", "Pencil Sketching", "Realism"],
    },
    {
      id: 'p5',
      title: "Vintage Chardonnay",
      description: "A still-life study of a wine bottle and glass, exploring light reflection, transparency, and the delicate balance of composition.",
      imageUrl: p5,
      tools: ["Still Life", "Shading", "Composition"],
    },
    {
      id: 'p6',
      title: "Infernal Skull",
      description: "A bold, high-contrast dark art sketch featuring a stylized skull with flame-like elements.",
      imageUrl: p6,
      tools: ["Dark Art", "Detailing", "Concept"],
    },
    {
      id: 'p7',
      title: "Precision & Power",
      description: "A technical pencil drawing of a semi-automatic handgun, focusing on mechanical accuracy and industrial textures.",
      imageUrl: p7,
      tools: ["Technical Drawing", "Contrast", "Industrial Art"],
    },
    {
      id: 'p8',
      title: "Crystal Wolf",
      description: "A stunning concept piece blending raw nature with geometric crystal structures and dual-colored eyes.",
      imageUrl: p8,
      tools: ["Concept Art", "Hybrid Work", "Creativity"],
    }
  ];

  const allProjects = [...providedProjects, ...projects];

  const skills = [
    { name: "Traditional Arts", icon: Brush, level: 85 },
    { name: "Graphic Designing", icon: Palette, level: 70 },
    { name: "Logo Design", icon: Edit2, level: 80 },
    { name: "Google Ads", icon: BarChart, level: 75 },
    { name: "Video Editing", icon: Video, level: 90 },
    { name: "Social Media Marketing", icon: Instagram, level: 85 },
  ];

  return (
    <>
      <Hero profile={profile} />

      <Section id="about" title="About Me" className="scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-6">
            <p className="text-xl leading-relaxed text-text-body underline decoration-brand/30 decoration-4 underline-offset-4">
              {profile?.about || `I am Aashish Bishnoi, a dedicated Digital Marketing student at Geeta University with a passion for understanding the interplay between technology and consumer behavior.`}
            </p>
            <p className="text-lg text-text-title/80">
              {profile?.careerGoals || "My goal is to leverage data insights and creative storytelling to help brands build meaningful connections with their audiences in the digital space."}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
              <div className="p-6 bg-bg-surface rounded-2xl border border-border-main">
                <div className="text-brand font-bold text-lg mb-1">Education</div>
                <div className="text-text-title font-medium">{profile?.university || "Geeta University, Panipat"}</div>
                <div className="text-sm text-text-body">Bachelor's in Digital Marketing</div>
              </div>
              <div className="p-6 bg-bg-surface rounded-2xl border border-border-main">
                <div className="text-brand font-bold text-lg mb-1">Location</div>
                <div className="text-text-title font-medium">Panipat, Haryana, India</div>
                <div className="text-sm text-text-body">Open to opportunities</div>
              </div>
            </div>
          </div>
          <div className="space-y-6 bg-brand/5 p-8 rounded-3xl border border-brand/10">
             <div className="flex items-center gap-3 text-text-title font-bold text-xl">
               <Lightbulb className="text-brand" /> My Philosophy
             </div>
             <p className="italic text-text-body">
               "Marketing is no longer about the stuff that you make, but about the stories you tell."
             </p>
             <div className="pt-4 flex gap-4">
               <a href="https://www.behance.net/aashishgill3" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center hover:bg-brand hover:text-black transition-all" title="Behance">
                 <Palette size={20} />
               </a>
               <a href="https://www.upwork.com/freelancers/~0181d9b0d2cf251e59" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center hover:bg-brand hover:text-black transition-all" title="Upwork">
                 <Zap size={20} />
               </a>
               <a href="https://www.linkedin.com/in/aashish-bishnoi-30b337382?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center hover:bg-brand hover:text-black transition-all" title="LinkedIn">
                 <Linkedin size={20} />
               </a>
               <a href="https://www.instagram.com/silent_tales_official?igsh=MXNlb2oyYnppMnZ5ZA==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center hover:bg-brand hover:text-black transition-all" title="Instagram">
                 <Instagram size={20} />
               </a>
             </div>
          </div>
        </div>
      </Section>

      <Section id="skills" title="Skills" className="scroll-mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map(skill => (
            <SkillCard key={skill.name} {...skill} />
          ))}
        </div>
      </Section>

      <Section id="projects" title="Selected Projects" className="scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {allProjects.length > 0 ? allProjects.map((project: any, i: number) => (
            <motion.div
              key={project.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-bg-surface rounded-3xl overflow-hidden border border-border-main hover:border-brand/50 transition-all shadow-sm hover:shadow-xl hover:shadow-brand/5"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tools.map((tool: string) => (
                    <span key={tool} className="text-[10px] uppercase tracking-widest bg-brand/10 text-brand px-2 py-1 rounded-md font-bold">
                      {tool}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-text-title mb-4 group-hover:text-brand transition-colors">
                  {project.title}
                </h3>
                <p className="text-text-body mb-6 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-text-title font-bold hover:text-brand transition-colors group/link">
                    Explore Details <ExternalLink size={16} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                  </a>
                )}
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 border-2 border-dashed border-border-main rounded-3xl flex flex-col items-center justify-center text-text-body">
               <Briefcase size={48} className="mb-4 opacity-20" />
               <p>Work in progress. Check back soon!</p>
            </div>
          )}
        </div>
        {isAdmin && (
           <div className="mt-12 flex justify-center">
             <Link to="/admin" className="flex items-center gap-2 px-6 py-3 bg-brand text-black rounded-full hover:opacity-80 transition-all font-semibold">
               <Plus size={20} /> Manage Content
             </Link>
           </div>
        )}
      </Section>

      <Section id="achievements" title="Achievements" className="scroll-mt-20">
        <div className="space-y-8 max-w-4xl">
          {achievements.length > 0 ? achievements.map((achievement: any) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-6 group"
            >
              <div className="hidden sm:flex flex-col items-center">
                <div className="w-12 h-12 bg-bg-surface rounded-full flex items-center justify-center border border-border-main text-brand group-hover:bg-brand group-hover:text-black transition-all">
                  <Award size={24} />
                </div>
                <div className="w-px flex-1 bg-border-main my-4" />
              </div>
              <div className="flex-1 bg-bg-surface p-8 rounded-3xl border border-border-main group-hover:border-brand/30 transition-all flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <span className="text-brand text-sm font-medium">{achievement.date}</span>
                  <h3 className="text-2xl font-bold text-text-title mt-1 mb-3">{achievement.title}</h3>
                  <p className="text-text-body">{achievement.description}</p>
                </div>
                {achievement.imageUrl && (
                  <div className="w-full sm:w-48 aspect-video rounded-xl overflow-hidden self-center sm:self-start border border-border-main">
                    <img src={achievement.imageUrl} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </motion.div>
          )) : (
            <p className="text-text-body italic">No achievements listed yet. Stay tuned!</p>
          )}
        </div>
      </Section>

      <Section id="contact" title="Get In Touch" className="scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
             <h3 className="text-2xl font-bold text-text-title mb-6">Let's build something epic.</h3>
             <p className="text-lg text-text-body mb-10">
               Currently looking for internships and entry-level positions in Digital Marketing. Whether you have a question or just want to say hi, my inbox is always open!
             </p>
             <div className="space-y-6">
               <div className="flex items-center gap-4 text-text-title">
                 <div className="w-12 h-12 bg-bg-surface rounded-full flex items-center justify-center border border-border-main text-brand">
                    <Mail size={20} />
                 </div>
                 <div>
                   <div className="text-xs text-text-body uppercase tracking-widest">Email</div>
                   <div className="font-semibold underline decoration-brand/30 underline-offset-4">ashishgill2929@gmail.com</div>
                 </div>
               </div>
               <div className="flex items-center gap-4 text-text-title">
                 <div className="w-12 h-12 bg-bg-surface rounded-full flex items-center justify-center border border-border-main text-brand">
                   <Briefcase size={20} />
                 </div>
                 <div>
                   <div className="text-xs text-text-body uppercase tracking-widest">Education</div>
                   <div className="font-semibold">Geeta University, Panipat</div>
                 </div>
               </div>
               <div className="flex gap-4 pt-4 border-t border-border-main">
                 <a href="https://www.upwork.com/freelancers/~0181d9b0d2cf251e59" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#14a800] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#108a00] transition-colors">
                    Upwork <Zap size={14} />
                 </a>
                 <a href="https://www.behance.net/aashishgill3" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#0057ff] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#0047cc] transition-colors">
                   Behance <Palette size={14} />
                 </a>
               </div>
             </div>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    const path = 'messages';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-brand/10 border border-brand/20 text-brand rounded-xl flex items-center gap-2 mb-4"
          >
            <Sparkles size={20} />
            <span className="font-medium text-sm">Message sent successfully! I'll be in touch soon.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            type="text" placeholder="Name" required
            className="w-full bg-bg-surface border border-border-main rounded-xl p-4 text-text-title focus:outline-none focus:border-brand transition-all" 
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" placeholder="Email" required
            className="w-full bg-bg-surface border border-border-main rounded-xl p-4 text-text-title focus:outline-none focus:border-brand transition-all" 
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <input 
          type="text" placeholder="Subject" 
          className="w-full bg-bg-surface border border-border-main rounded-xl p-4 text-text-title focus:outline-none focus:border-brand transition-all" 
          value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
        />
        <textarea 
          placeholder="Message" rows={6} required
          className="w-full bg-bg-surface border border-border-main rounded-xl p-4 text-text-title focus:outline-none focus:border-brand transition-all" 
          value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
        ></textarea>
        <button 
          type="submit" disabled={isSubmitting}
          className="w-full py-4 bg-brand text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-brand/20"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Send Message"} <Send size={18} />
        </button>
      </form>
    </div>
  );
}

// --- App Root ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return (saved && saved !== 'soft') ? saved : 'dark';
  });
  const { profile } = useProfile();
  const { projects } = useProjects();
  const { achievements } = useAchievements();
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    return auth.onAuthStateChanged(u => {
      setUser(u);
      setAuthChecked(true);
      
      // Bootstrap first admin if none exists
      if (u) {
        bootstrapAdmin(u.uid, u.email!);
      }
    });
  }, []);

  const bootstrapAdmin = async (uid: string, email: string) => {
    // Only attempt to bootstrap if the specific admin email matches our master email
    if (email === 'ashishgill2929@gmail.com') {
      try {
        await setDoc(doc(db, 'admins', uid), { email }, { merge: true });
      } catch (e) {
        // This will fail if the rule above is not met (email mismatch or not verified)
        // or if it was already created.
      }
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup closed by user.");
        return;
      }
      console.error("Login failed", error);
      alert("Sign-in failed: " + (error?.message || "Unknown error"));
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="text-brand animate-spin" size={48} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-base text-text-body font-sans selection:bg-brand selection:text-black overflow-x-hidden">
        <Navbar user={user} isAdmin={isAdmin} onLogin={handleLogin} onLogout={logout} theme={theme} setTheme={setTheme} />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage profile={profile} projects={projects} achievements={achievements} isAdmin={isAdmin} />} />
            <Route path="/resume" element={<ResumeBuilder />} />
            <Route path="/admin" element={isAdmin ? <AdminPanel /> : <div className="pt-32 text-center h-screen flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold text-text-title mb-4">Unauthorized</h1>
              <p className="text-text-body mb-8">You need admin privileges to access this page.</p>
              <Link to="/" className="text-brand font-bold underline">Go Back Home</Link>
            </div>} />
          </Routes>
        </main>

        <footer className="py-12 border-t border-border-main mt-12 bg-bg-base">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-text-body italic opacity-60">
              &copy; {new Date().getFullYear()} Aashish Bishnoi. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="https://www.upwork.com/freelancers/~0181d9b0d2cf251e59" target="_blank" rel="noopener noreferrer" className="text-text-body hover:text-brand transition-all hover:scale-110" title="Upwork"><Zap size={20} /></a>
              <a href="https://www.behance.net/aashishgill3" target="_blank" rel="noopener noreferrer" className="text-text-body hover:text-brand transition-all hover:scale-110" title="Behance"><Palette size={20} /></a>
              <a href="https://www.linkedin.com/in/aashish-bishnoi-30b337382?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="text-text-body hover:text-brand transition-all hover:scale-110" title="LinkedIn"><Linkedin size={20} /></a>
              <a href="https://www.instagram.com/silent_tales_official?igsh=MXNlb2oyYnppMnZ5ZA==" target="_blank" rel="noopener noreferrer" className="text-text-body hover:text-brand transition-all hover:scale-110" title="Instagram"><Instagram size={20} /></a>
            </div>
            <div className="text-xs text-brand/50 uppercase tracking-[0.2em]">
               Digital Marketing Portfolio
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

// Components extracted from main file for structure
function Hero({ profile }: { profile: Profile | null }) {
  return (
    <section className="min-h-screen flex items-center pt-20 relative overflow-hidden">
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-30" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            Digital Marketing Enthusiast
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-title mb-6 leading-[1.1]">
            Hi, I'm <span className="text-brand">{profile?.name || "Aashish Bishnoi"}</span>
          </h1>
          <p className="text-lg md:text-xl text-text-body mb-8 max-w-lg leading-relaxed">
            {profile?.tagline || "Crafting digital experiences through SEO, content strategy, and data-driven marketing. Student at Geeta University, Panipat."}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#projects" className="px-8 py-4 bg-brand text-white dark:text-black font-semibold rounded-full hover:opacity-80 transition-all transform hover:scale-105">
              View Work
            </a>
            <a 
              href="https://www.upwork.com/freelancers/~0181d9b0d2cf251e59" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-4 bg-[#14a800] text-white font-semibold rounded-full hover:bg-[#108a00] transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Upwork <Zap size={18} />
            </a>
            <a 
              href="https://www.behance.net/aashishgill3" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-4 bg-[#0057ff] text-white font-semibold rounded-full hover:bg-[#0047cc] transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Behance <Palette size={18} />
            </a>
            <a 
              href="https://www.linkedin.com/in/aashish-bishnoi-30b337382?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-4 bg-[#0077b5] text-white font-semibold rounded-full hover:bg-[#006399] transition-all transform hover:scale-105 flex items-center gap-2"
            >
              LinkedIn <Linkedin size={18} />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -15, 0] 
          }}
          transition={{ 
            opacity: { duration: 1 },
            scale: { duration: 1 },
            y: { 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            } 
          }}
          className="relative lg:block"
        >
          <div className="aspect-square rounded-3xl overflow-hidden border border-border-main bg-bg-surface relative group max-w-md mx-auto md:max-w-none">
            {profile?.profileImage || profileImage ? (
              <img 
                src={profile?.profileImage || profileImage} 
                alt={profile?.name || "Aashish Bishnoi"} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('placeholder')) {
                    target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800';
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-body bg-bg-surface">
                <User size={120} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-bg-surface/80 backdrop-blur-xl border border-brand/30 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] hidden sm:block">
            <div className="text-brand font-bold text-2xl tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">Geeta University</div>
            <div className="text-text-body text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Education Partner</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Section({ id, title, children, className }: any) {
  return (
    <section id={id} className={cn("py-24 px-6 max-w-7xl mx-auto", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-16"
      >
        <h2 className="text-4xl font-bold text-text-title tracking-tight">{title}</h2>
        <div className="h-1 flex-1 bg-gradient-to-r from-brand/50 to-transparent rounded-full" />
      </motion.div>
      {children}
    </section>
  );
}

function SkillCard({ name, icon: Icon, level }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 bg-bg-surface border border-border-main rounded-2xl group hover:border-brand/50 transition-all"
    >
      <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand mb-6 group-hover:bg-brand group-hover:text-black transition-all">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-text-title mb-2">{name}</h3>
      <div className="w-full bg-border-main/20 h-1.5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="bg-brand h-full rounded-full"
        />
      </div>
    </motion.div>
  );
}
