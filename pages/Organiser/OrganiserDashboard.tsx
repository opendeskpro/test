
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Event } from '../../types.ts';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Wallet, 
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Calendar,
  MapPin,
  Zap,
  DollarSign,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface OrganiserDashboardProps {
  user: User;
  events: Event[];
}

const OrganiserDashboard: React.FC<OrganiserDashboardProps> = ({ user, events }) => {
  const navigate = useNavigate();
  const organiserEvents = events.filter(e => e.organiserId === user.id || e.organiserId === 'org1');

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-inter">
      <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-medium">Welcome back, {user.name} 👋</p>
          </div>
          <button 
            onClick={() => navigate('/organiser/create')}
            className="bg-[#ff5a5f] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-pink-100 flex items-center gap-3 hover:scale-105 transition-all"
          >
            <Plus size={20} /> Create New Event
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Total Sales', val: '₹1,24,500', icon: <DollarSign className="text-emerald-500" />, trend: '+12%' },
            { label: 'Total Tickets', val: '458', icon: <Zap className="text-amber-500" />, trend: '+5%' },
            { label: 'Active Events', val: organiserEvents.length.toString(), icon: <Calendar className="text-blue-500" />, trend: 'Healthy' },
            { label: 'Page Views', val: '12.4K', icon: <Users className="text-purple-500" />, trend: '+18%' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  {stat.icon}
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">{stat.trend}</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.val}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black mb-10">Sales Analytics</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff5a5f" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ff5a5f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="sales" stroke="#ff5a5f" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1e1e2d] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full blur-[80px] opacity-10"></div>
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <TrendingUp className="text-amber-500" /> Recent Bookings
            </h3>
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xs font-black">JD</div>
                    <div>
                      <p className="text-sm font-bold">John Doe</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">General Pass</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-500">₹500</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-black">My Events</h3>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {organiserEvents.map(event => (
              <div key={event.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-8">
                  <img src={event.banner} className="w-20 h-20 rounded-2xl object-cover shadow-md" alt={event.title} />
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-1">{event.title}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {event.date}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> {event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">124 / {event.capacity || 500}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tickets Sold</p>
                  </div>
                  <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganiserDashboard;
