
import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types.ts';
import { 
  LogOut, 
  MapPin, 
  Search, 
  ChevronDown, 
  Smartphone, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Zap, 
  Lock,
  Bell,
  Ticket as TicketIcon,
  Plus,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Clapperboard,
  PartyPopper,
  CreditCard,
  Menu,
  Settings as SettingsIcon,
  Heart,
  HelpCircle,
  UserPlus,
  Globe
} from 'lucide-react';

interface LayoutProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const Logo: React.FC<{ className?: string, light?: boolean }> = ({ className = "", light = false }) => {
  const baseColor = light ? 'text-white' : 'text-slate-950';
  const highlightColor = 'text-amber-500'; 
  
  const renderChars = (text: string, startIndex: number, colorClass: string) => {
    return text.split("").map((char, i) => (
      <span 
        key={i} 
        className={`char-entry ${colorClass}`} 
        style={{ 
          animationDelay: `${(startIndex + i) * 0.08}s`
        }}
      >
        {char}
      </span>
    ));
  };

  return (
    <div className={`logo-main-wrapper flex items-center font-marker select-none ${className} scale-90 origin-left`}>
      <div className="text-3xl lowercase tracking-tight flex mr-1 font-bold">
        {renderChars("book", 0, baseColor)}
      </div>
      <div className="my-text-wrapper text-3xl lowercase tracking-tight flex mx-1">
        {renderChars("my", 4, highlightColor)}
      </div>
      <div className="text-3xl lowercase tracking-tight flex ml-1 font-bold">
        {renderChars("ticket", 6, baseColor)}
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ user, setUser }) => {
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [locationName, setLocationName] = useState('Coimbatore');
  const navigate = useNavigate();
  const loc = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUser(null);
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="shrink-0">
              <Logo />
            </Link>

            <div className="hidden lg:flex items-center gap-1 border-l border-slate-100 pl-6 h-6">
              <button 
                onClick={() => setIsExploreOpen(!isExploreOpen)}
                className="flex items-center gap-1.5 text-[14px] font-bold text-slate-700 hover:text-amber-500 transition-colors"
              >
                Explore <ChevronDown size={14} className="mt-0.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search For Any Event" 
                className="w-full pl-6 pr-14 py-3 bg-[#f1f5f9] rounded-full text-[13px] outline-none border-none font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 ring-amber-500/10"
              />
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                <Search className="text-slate-400" size={16} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 text-slate-700 font-bold text-[13px]">
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-amber-500">
                <MapPin size={16} className="text-amber-500" />
                {locationName}
                <ChevronDown size={12} />
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-amber-500"
                >
                  <Globe size={16} className="text-slate-400" />
                  {language}
                  <ChevronDown size={12} />
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    {['English', 'Tamil', 'Hindi', 'Malayalam'].map(l => (
                      <button 
                        key={l}
                        onClick={() => { setLanguage(l); setIsLangOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 hover:text-amber-500 transition-colors"
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-700 hidden sm:block">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3">
              {!user ? (
                <Link to="/auth" className="hidden sm:block text-[14px] font-medium text-slate-600 border border-slate-200 px-6 py-2.5 rounded-full hover:bg-slate-50 transition-colors">Login</Link>
              ) : (
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 bg-[#ff5a00] text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </button>
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 py-6 px-4 z-[200] animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                        <div className="w-12 h-12 bg-[#ff5a00] text-white rounded-full flex items-center justify-center font-black text-xl">{user.name.charAt(0)}</div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold">User</p>
                        </div>
                      </div>
                      <div className="py-2 space-y-1">
                        <Link 
                          to="/my-tickets" 
                          onClick={() => setIsProfileOpen(false)}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-[14px] font-bold ${loc.pathname === '/my-tickets' ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <TicketIcon size={18} className="text-slate-400" /> My Bookings
                        </Link>
                        <Link 
                          to="#" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-[14px] font-bold"
                        >
                          <Heart size={18} className="text-slate-400" /> My Wishlist
                        </Link>
                        <Link 
                          to="/settings" 
                          onClick={() => setIsProfileOpen(false)}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-[14px] font-bold ${loc.pathname === '/settings' ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <SettingsIcon size={18} className="text-slate-400" /> Settings
                        </Link>

                        <div className="border-t border-slate-50 my-2"></div>

                        <Link 
                          to="#" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-[14px] font-bold"
                        >
                          <HelpCircle size={18} className="text-slate-400" /> Support FAQ
                        </Link>
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-[14px] font-bold"
                        >
                          <LogOut size={18} className="text-slate-400" /> Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 md:hidden">
                 <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#050505] text-[#888] pt-20 pb-10">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-white/5">
            <div className="md:col-span-1 space-y-6">
               <Logo light />
               <p className="text-sm leading-relaxed max-w-xs">
                 book my ticket empowers event discoverers with a seamless experience. Discover, book, and enjoy your favorite events — all in one place.
               </p>
               <div className="flex gap-4 items-center">
                  <div className="p-2 border border-white/10 rounded">
                     <span className="text-[10px] font-black">Users Love Us</span>
                  </div>
                  <div className="p-2 border border-white/10 rounded">
                     <span className="text-[10px] font-black">GDPR Approved</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <p className="text-[11px] font-black uppercase text-white tracking-widest">Get The App</p>
                  <div className="flex gap-4">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" className="h-10 cursor-pointer" alt="Play Store" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" className="h-10 cursor-pointer" alt="App Store" />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Company</h4>
               <ul className="space-y-3 text-xs font-bold">
                  {['About Us', 'Pricing', 'Contact Us', 'Blog', 'Event Magazine', 'Product Diary', 'Sitemap'].map(l => (
                    <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                  ))}
               </ul>
               <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] pt-4">Follow Us</h4>
               <div className="flex gap-4">
                  <Facebook size={16} /> <Twitter size={16} /> <Instagram size={16} /> <Linkedin size={16} />
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Legal</h4>
               <ul className="space-y-3 text-xs font-bold">
                  {['How it works', 'Terms & Conditions', 'Privacy', 'Refund Policy', 'Support / FAQs', 'Grievance Redressal', 'Brand Assets', 'News Room'].map(l => (
                    <li key={l}>
                      <Link 
                        to={l === 'Refund Policy' ? '/refund-policy' : l === 'Terms & Conditions' ? '/terms-and-conditions' : '#'} 
                        className="hover:text-white transition-colors"
                      >
                        {l}
                      </Link>
                    </li>
                  ))}
               </ul>
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold">
             <p>Copyright © 2026 book my ticket Tech Private Limited — All rights reserved</p>
             <div className="flex gap-6">
                {['Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad', 'Mumbai', 'Goa'].map(c => (
                  <span key={c} className="hover:text-white cursor-pointer">{c}</span>
                ))}
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
