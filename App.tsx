
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserRole, AppState, User, TicketStatus, Event } from './types.ts';
import { MOCK_EVENTS } from './constants.tsx';
import Layout from './components/Layout.tsx';
import { supabase } from './lib/supabase.ts';

// Pages
import HomePage from './pages/Public/HomePage.tsx';
import EventDetailsPage from './pages/Public/EventDetailsPage.tsx';
import BookingPage from './pages/Public/BookingPage.tsx';
import MyTicketsPage from './pages/Public/MyTicketsPage.tsx';
import RSVPPage from './pages/Public/RSVPPage.tsx';
import MoviesPage from './pages/Public/MoviesPage.tsx';
import RefundPolicyPage from './pages/Public/RefundPolicyPage.tsx';
import TermsPage from './pages/Public/TermsPage.tsx';
import OrganizerProfilePage from './pages/Public/OrganizerProfilePage.tsx';
import ProfileSettingsPage from './pages/Public/ProfileSettingsPage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import AdminDashboard from './pages/Admin/AdminDashboard.tsx';
import OrganiserDashboard from './pages/Organiser/OrganiserDashboard.tsx';
import CreateEventPage from './pages/Organiser/CreateEventPage.tsx';
import KYCPage from './pages/Organiser/KYCPage.tsx';
import BecomeOrganizerPage from './pages/Organiser/BecomeOrganizerPage.tsx';

const ProtectedRoute: React.FC<{ children: React.ReactNode; user: User | null; requireRole?: UserRole | UserRole[] }> = ({ children, user, requireRole }) => {
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (requireRole) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!roles.includes(user.role) && user.role !== UserRole.ADMIN) {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    user: null,
    events: MOCK_EVENTS,
    tickets: [],
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      let currentUser: User | null = null;
      
      try {
        if (supabase?.auth) {
          const { data: authData } = await supabase.auth.getSession();
          const session = authData?.session;
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            currentUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.full_name || session.user.user_metadata?.name || 'User',
              role: profile?.role || session.user.user_metadata?.role || UserRole.PUBLIC,
              walletBalance: 0,
              isMobileVerified: !!session.user.phone_confirmed_at || profile?.is_verified
            };
          }
        }
      } catch (authErr) {
        console.warn("Auth initialization issue:", authErr);
      }

      let eventsList: any[] = [...MOCK_EVENTS];
      try {
        if (supabase) {
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select(`*, tickets:ticket_types(*)`);
          
          if (eventsData && eventsData.length > 0 && !eventsError) {
            const dbEvents = eventsData.map((e: any) => ({
              ...e,
              banner: e.banner_url || e.banner,
              date: e.event_date || e.date,
              time: e.start_time || e.time,
              tickets: (e.tickets || []).map((t: any) => ({
                ...t,
                price: t.final_price || t.price,
                sold: t.sold_count || 0
              }))
            }));
            eventsList = [...dbEvents, ...MOCK_EVENTS.filter(me => !dbEvents.some(de => String(de.id) === String(me.id)))];
          }
        }
      } catch (dbErr) {
        console.warn("Using mock events fallback:", dbErr);
      }

      setAppState(prev => ({ ...prev, user: currentUser, events: eventsList }));
      setLoading(false);
    };

    initializeApp();

    let subscription: any = null;
    if (supabase?.auth) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.full_name || session.user.user_metadata?.name || 'User',
              role: profile?.role || session.user.user_metadata?.role || UserRole.PUBLIC,
              walletBalance: 0
            };
            setAppState(prev => ({ ...prev, user }));
          } catch (e) {
            console.warn("Session profile fetch issue", e);
          }
        } else {
          setAppState(prev => ({ ...prev, user: null }));
        }
      });
      subscription = data?.subscription;
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const setUser = (user: User | null) => {
    setAppState(prev => ({ ...prev, user }));
  };

  const bookTicket = (ticket: any) => {
    setAppState(prev => ({ ...prev, tickets: [ticket, ...prev.tickets] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">Launching Experience...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout user={appState.user} setUser={setUser} />}>
          <Route path="/" element={<HomePage events={appState.events} />} />
          <Route path="/rsvp" element={<RSVPPage events={appState.events} user={appState.user} />} />
          <Route path="/settings" element={<ProtectedRoute user={appState.user}><ProfileSettingsPage user={appState.user!} onUpdate={(updated) => setUser({...appState.user!, ...updated})} /></ProtectedRoute>} />
          <Route path="/event/:id" element={<EventDetailsPage events={appState.events} user={appState.user} />} />
          <Route path="/book/:eventId" element={<ProtectedRoute user={appState.user}><BookingPage events={appState.events} user={appState.user!} onBook={bookTicket} /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute user={appState.user}><MyTicketsPage tickets={appState.tickets} user={appState.user!} /></ProtectedRoute>} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/organizer/:id" element={<OrganizerProfilePage events={appState.events} />} />
          
          {/* Organiser Routes */}
          <Route path="/become-organizer" element={<BecomeOrganizerPage />} />
          <Route path="/organiser/kyc" element={<ProtectedRoute user={appState.user}><KYCPage user={appState.user!} /></ProtectedRoute>} />
          <Route path="/organiser/dashboard" element={<ProtectedRoute user={appState.user} requireRole={UserRole.ORGANISER}><OrganiserDashboard user={appState.user!} events={appState.events} /></ProtectedRoute>} />
          <Route path="/organiser/create" element={<ProtectedRoute user={appState.user} requireRole={UserRole.ORGANISER}><CreateEventPage user={appState.user!} onAdd={() => {}} onVerifyUser={() => {}} /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute user={appState.user} requireRole={UserRole.ADMIN}><AdminDashboard events={appState.events} /></ProtectedRoute>} />
        </Route>
        <Route path="/auth" element={<AuthPage onAuth={setUser} />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
