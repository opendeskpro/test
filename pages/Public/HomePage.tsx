
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Music,
  Trophy,
  Theater,
  Mic2,
  Users,
  PartyPopper,
  Tv,
  Gamepad2,
  Star,
  Zap,
  Ticket,
  Heart
} from 'lucide-react';
import { Event } from '../../types.ts';

interface HomePageProps {
  events: Event[];
}

// Fixed: Added default export and component implementation for HomePage
const HomePage: React.FC<HomePageProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#fffcfd] min-h-screen">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-[120px] opacity-10 -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-6xl font-black mb-6 tracking-tighter italic uppercase">
            Experience <span className="text-amber-500">Live</span> Events
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mb-12">
            Discover the best concerts, workshops, and meetups in your city.
          </p>
          <div className="max-w-xl relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by event name or category..." 
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-16 pr-6 py-5 text-lg outline-none focus:ring-2 ring-amber-500 transition-all backdrop-blur-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black text-slate-900">Featured Events</h2>
          <div className="flex gap-4">
             {['All', 'Concert', 'Workshop', 'Comedy'].map(cat => (
               <button key={cat} className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-white border border-slate-100 hover:bg-slate-50 transition-all">
                 {cat}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredEvents.map(event => (
            <Link to={`/event/${event.id}`} key={event.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-amber-100/10 overflow-hidden hover:shadow-2xl transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img src={event.banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
                <div className="absolute top-4 right-4">
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {event.category}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-amber-500 transition-colors truncate">
                  {event.title}
                </h3>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                    <Calendar size={16} className="text-amber-500" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                    <MapPin size={16} className="text-amber-500" />
                    {event.location}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Starting from</p>
                    <p className="text-xl font-black text-slate-900">₹{event.tickets[0]?.price || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
