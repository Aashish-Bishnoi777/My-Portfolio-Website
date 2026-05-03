import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Loader2, User, Mail, Link as LinkIcon, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ResumeBuilder() {
  const profile = {
    name: "Aashish Bishnoi",
    title: "Digital Marketing Enthusiast",
    about: "Highly motivated digital marketer with a focus on data-driven results. Experienced in SEO strategies, social media optimization, and building cohesive brand narratives.",
    careerGoals: "Aiming to contribute to forward-thinking digital agencies and help brands scale their presence globally.",
    university: "Geeta University, Panipat",
    skills: [
      { name: "Traditional Arts" },
      { name: "Graphic Designing" },
      { name: "Logo Design" },
      { name: "Google Ads" },
      { name: "Video Editing" },
      { name: "Social Media Marketing" }
    ],
    socialLinks: {
      linkedin: "linkedin.com/in/aashish-bishnoi-30b337382",
      instagram: "@silent_tales_official"
    }
  };

  const projects = [
    {
      id: 'p1',
      title: "Skills for 2030 Infographic",
      description: "A comprehensive visual guide exploring the future-proof skills required in a rapidly changing digital landscape.",
      tools: ["Digital Strategy", "Visual Storytelling", "Content Marketing"],
    },
    {
      id: 'p2',
      title: "A Day in Life with AI",
      description: "An educational infographic showcasing the practical applications of AI in daily routines.",
      tools: ["AI Literacy", "Educational Content", "Information Design"],
    },
    {
      id: 'p3',
      title: "The Bound Heart",
      description: "A surreal representation of a heart bound by chains and blossoming with flowers.",
      tools: ["Surrealism", "Inking", "Symbolism"],
    }
  ];

  const [exporting, setExporting] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!resumeRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile?.name || 'Aashish'}_Resume.pdf`);
    } catch (err) {
      console.error(err);
    }
    setExporting(false);
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen bg-bg-base text-text-body">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-text-title mb-2">Resume Builder</h1>
          <p className="text-text-body/70">Generate a professional PDF resume from your portfolio data.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-3 px-8 py-4 bg-brand text-white dark:text-black font-bold rounded-full hover:opacity-80 transition-all shadow-lg overflow-hidden relative"
        >
          {exporting ? <Loader2 className="animate-spin" /> : <Download size={20} />}
          {exporting ? 'Generating...' : 'Export to PDF'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Preview Panel */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <div 
            ref={resumeRef}
            className="bg-white text-black p-12 shadow-2xl rounded-sm min-h-[1122px] w-full max-w-[800px] mx-auto border border-gray-200"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Header */}
            <div className="border-b-4 border-emerald-500 pb-8 mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-extrabold uppercase tracking-tighter mb-2">{profile?.name || "AASHISH BISHNOI"}</h1>
                <p className="text-emerald-600 font-bold text-xl uppercase tracking-widest">{profile?.title || "Digital Marketing Enthusiast"}</p>
              </div>
              <div className="text-right text-sm space-y-1">
                <div className="flex items-center justify-end gap-2 text-gray-600">Panipat, India <MapPin size={14} /></div>
                <div className="flex items-center justify-end gap-2 text-gray-600">ashishgill2929@gmail.com <Mail size={14} /></div>
                <div className="flex items-center justify-end gap-2 text-gray-600">LinkedIn: /in/aashish-bishnoi <LinkIcon size={14} /></div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-12">
              {/* Sidebar */}
              <div className="col-span-4 space-y-10">
                <section>
                  <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 tracking-wider">Education</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="font-bold text-sm">Bachelor's in Digital Marketing</div>
                      <div className="text-gray-600 text-xs italic">Geeta University, Panipat</div>
                      <div className="text-gray-400 text-[10px]">2022 - Present</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 tracking-wider">Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.map(s => (
                      <span key={s.name} className="px-2 py-1 bg-gray-100 text-[10px] font-bold rounded uppercase">
                        {s.name}
                      </span>
                    )) || ["SEO", "SMM", "CONTENT", "ADS", "ANALYTICS"].map(s => (
                      <span key={s} className="px-2 py-1 bg-gray-100 text-[10px] font-bold rounded uppercase">
                        {s}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 tracking-wider">Social</h2>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>LinkedIn: {profile?.socialLinks?.linkedin || "linkedin.com/in/aashish"}</div>
                    <div>Instagram: {profile?.socialLinks?.instagram || "@aashish_marketing"}</div>
                  </div>
                </section>
              </div>

              {/* Main Content */}
              <div className="col-span-8 space-y-10">
                <section>
                  <h2 className="text-lg font-bold uppercase border-b-2 border-emerald-500 inline-block mb-4 tracking-wider">Profile</h2>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {profile?.about || "Highly motivated digital marketer with a focus on data-driven results. Experienced in SEO strategies, social media optimization, and building cohesive brand narratives."}
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-bold uppercase border-b-2 border-emerald-500 inline-block mb-4 tracking-wider">Key Projects</h2>
                  <div className="space-y-6">
                    {projects.slice(0, 3).map(p => (
                      <div key={p.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-base">{p.title}</h3>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{p.tools.join(' | ')}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-3">
                          {p.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold uppercase border-b-2 border-emerald-500 inline-block mb-4 tracking-wider">Goals</h2>
                  <p className="text-sm leading-relaxed text-gray-700 italic">
                    {profile?.careerGoals || "Aiming to contribute to forward-thinking digital agencies and help brands scale their presence globally."}
                  </p>
                </section>
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-auto pt-12 text-center">
              <div className="text-[8px] text-gray-400 uppercase tracking-[0.4em]">Professional Marketing Portfolio &copy; 2026</div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
          <div className="p-8 bg-bg-surface border border-border-main rounded-3xl">
            <h2 className="text-xl font-bold text-text-title mb-4">Customize View</h2>
            <p className="text-sm text-text-body opacity-70 mb-6">Your resume is automatically generated using the latest data from your profile and projects.</p>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-bg-base/40 rounded-xl border border-border-main">
                 <span className="text-sm">Include Projects</span>
                 <input type="checkbox" checked readOnly className="accent-brand" />
               </div>
               <div className="flex items-center justify-between p-4 bg-bg-base/40 rounded-xl border border-border-main">
                 <span className="text-sm">Include Skills</span>
                 <input type="checkbox" checked readOnly className="accent-brand" />
               </div>
               <div className="p-4 bg-brand/10 border border-brand/20 rounded-xl text-xs text-brand leading-relaxed">
                 Tip: Use a modern browser for the best export quality.
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
