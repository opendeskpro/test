
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types.ts';
import { 
  ChevronLeft, 
  ArrowRight,
  Loader2,
  Sparkles,
  MapPin,
  ImageIcon,
  X,
  Globe,
  Settings,
  Moon,
  ChevronRight,
  Zap,
  ChevronDown,
  Image as LucideImage,
  Eye,
  FileSearch,
  Save,
  LayoutDashboard,
  CloudUpload,
  Home
} from 'lucide-react';
import { generateEventDescription } from '../../services/geminiService.ts';

interface CreateEventPageProps {
  user: User;
  onAdd: (event: any) => void;
  onVerifyUser: () => void;
}

type CreateStep = 'TYPE' | 'DETAILS';

const CreateEventPage: React.FC<CreateEventPageProps> = ({ user, onAdd }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CreateStep>('TYPE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    isVirtual: false,
    title: '',
    category: 'Select Category',
    description: '',
    location: '',
    date: '',
    time: '',
    status: 'Select a Status',
    isFeature: 'Select',
    refundPolicy: ''
  });

  const handleAIDescription = async () => {
    if (!formData.title) {
      alert("Please enter an event title first.");
      return;
    }
    setLoadingAI(true);
    try {
      const desc = await generateEventDescription(formData.title, formData.category);
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Event saved successfully!");
      navigate('/organiser/dashboard');
    }, 1500);
  };

  // Precisely matching the screenshot for selection
  const renderStepType = () => (
    <div className="flex flex-col min-h-screen bg-[#151521]">
      <header className="h-20 bg-[#1e1e2d] border-b border-slate-800 px-12 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-10">
          <h1 className="text-xl font-bold text-slate-200">Choose Event Type</h1>
          <nav className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
            <Home size={14} className="hover:text-[#f59e0b] cursor-pointer" onClick={() => navigate('/organiser/dashboard')} />
            <ChevronRight size={12} className="text-slate-700" />
            <span className="hover:text-slate-300 cursor-pointer">Event Management</span>
            <ChevronRight size={12} className="text-slate-700" />
            <span className="text-slate-300">Choose Event Type</span>
          </nav>
        </div>
        <div className="flex items-center gap-5">
           <button className="text-slate-500 hover:text-slate-200 transition-colors"><Settings size={20} /></button>
           <button className="text-slate-500 hover:text-slate-200 transition-colors"><Moon size={20} /></button>
           <div className="w-10 h-10 rounded-full border-2 border-slate-700 overflow-hidden shadow-lg ml-2">
              <img src={`https://i.pravatar.cc/100?u=${user.id}`} alt="profile" />
           </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
          {/* Online Event Card */}
          <button 
            onClick={() => { setFormData({...formData, isVirtual: true}); setCurrentStep('DETAILS'); }}
            className="bg-[#1e1e2d] group rounded-xl p-24 text-center border border-transparent hover:border-[#22c55e]/30 transition-all hover:bg-[#1a1a29] shadow-2xl flex flex-col items-center justify-center gap-8"
          >
            <div className="w-20 h-20 bg-[#22c55e] rounded-xl flex items-center justify-center shadow-2xl shadow-green-500/20 group-hover:scale-110 transition-transform">
              <CloudUpload size={42} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-200 uppercase tracking-widest">Online Event</h3>
          </button>

          {/* Venue Event Card */}
          <button 
            onClick={() => { setFormData({...formData, isVirtual: false}); setCurrentStep('DETAILS'); }}
            className="bg-[#1e1e2d] group rounded-xl p-24 text-center border border-transparent hover:border-[#f59e0b]/30 transition-all hover:bg-[#1a1a29] shadow-2xl flex flex-col items-center justify-center gap-8"
          >
            <div className="w-20 h-20 bg-[#f59e0b] rounded-xl flex items-center justify-center shadow-2xl shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <MapPin size={42} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-200 uppercase tracking-widest">Venue Event</h3>
          </button>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-800/30 text-center bg-[#1e1e2d]/30">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">Copyright ©2026. All Rights Reserved.</p>
      </footer>
    </div>
  );

  const renderStepDetails = () => (
    <div className="min-h-screen bg-[#151521] font-inter text-slate-400">
      <header className="h-24 bg-[#1e1e2d] border-b border-slate-800 px-12 flex items-center justify-between sticky top-0 z-[100] shadow-xl">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black text-slate-200 tracking-tight uppercase italic">Add Event</h1>
          <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            <LayoutDashboard size={14} className="text-slate-700" />
            <ChevronRight size={10} />
            <span>Event Management</span>
            <ChevronRight size={10} />
            <span>Choose Event Type</span>
            <ChevronRight size={10} />
            <span className="text-[#f59e0b]">Add Event</span>
          </nav>
        </div>
        <button 
          onClick={() => setCurrentStep('TYPE')} 
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all uppercase tracking-widest shadow-lg"
        >
          <ChevronLeft size={16} /> Back
        </button>
      </header>

      <main className="p-12 max-w-[1400px] mx-auto space-y-12 pb-32">
        <div className="bg-[#1e1e2d] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-200 uppercase tracking-widest">Basic Information</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b] px-3 py-1 bg-[#f59e0b]/10 rounded-full border border-[#f59e0b]/20">
               {formData.isVirtual ? 'Digital Modality' : 'Physical Modality'}
            </span>
          </div>

          <div className="p-12 space-y-16">
            <div className="space-y-6">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Gallery Images **</label>
              <div className="border-2 border-dashed border-slate-800 rounded-3xl p-24 bg-[#151521] flex flex-col items-center justify-center group hover:border-[#f59e0b] transition-all cursor-pointer">
                <LucideImage size={48} className="text-slate-800 group-hover:text-[#f59e0b] mb-4 transition-colors" />
                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Drop files here to upload</p>
                <p className="text-[#f59e0b] text-[10px] font-black uppercase mt-6 tracking-widest italic">Image Size 1170x570</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Event Title*</label>
                  <input 
                    type="text" 
                    placeholder="Enter Event Name" 
                    className="w-full bg-[#151521] border border-slate-800 rounded-xl px-6 py-4 outline-none text-slate-300 font-bold focus:border-[#f59e0b]"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Category*</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-[#151521] border border-slate-800 rounded-xl px-6 py-4 outline-none text-slate-500 font-bold focus:border-[#f59e0b] appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Select Category</option>
                      <option>Concert</option>
                      <option>Workshop</option>
                      <option>Conference</option>
                      <option>Theater</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Description*</label>
                  <button onClick={handleAIDescription} className="text-[10px] font-black text-[#f59e0b] flex items-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-4 py-2 rounded-full hover:bg-[#f59e0b]/20 transition-all">
                    {loadingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI WRITE
                  </button>
                </div>
                <div className="bg-[#151521] border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                  <div className="bg-[#1e1e2d] p-3 border-b border-slate-800 flex items-center gap-4 text-slate-500">
                    <FileSearch size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Advanced Composer Portal Enabled</span>
                  </div>
                  <textarea 
                    rows={10}
                    placeholder="Enter Event Description"
                    className="w-full bg-transparent p-8 outline-none text-slate-300 font-medium resize-none leading-relaxed"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
          </div>

          <div className="p-12 bg-[#151521] border-t border-slate-800 flex justify-center">
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-16 py-4 rounded-xl font-black uppercase text-sm tracking-[0.3em] shadow-2xl shadow-green-500/20 flex items-center gap-4 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>Save <Save size={20} /></>}
            </button>
          </div>
        </div>

        <footer className="py-12 border-t border-slate-800/50 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] text-center">
          <p>Copyright ©2026. All Rights Reserved.</p>
        </footer>
      </main>
    </div>
  );

  return (
    <>
      {currentStep === 'TYPE' ? renderStepType() : renderStepDetails()}
    </>
  );
};

export default CreateEventPage;
