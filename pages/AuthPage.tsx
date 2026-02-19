
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserRole, User } from '../types';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Smartphone, 
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Key,
  Mail,
  User as UserIcon,
  ShieldAlert,
  ArrowRight,
  Github,
  Chrome,
  Facebook,
  Apple
} from 'lucide-react';
import { supabase, signInWithSocial } from '../lib/supabase';
import { Logo } from '../components/Layout';

type AuthStep = 'FORM' | 'OTP_VERIFY';
type LoginMethod = 'EMAIL' | 'OTP';

const AuthPage: React.FC<{ onAuth: (user: User | null) => void }> = ({ onAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('EMAIL');
  const [authStep, setAuthStep] = useState<AuthStep>('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleDemoLogin = (role: UserRole) => {
    setLoading(true);
    setError(null);
    
    let demoEmail = '';
    let demoName = '';
    let path = '/';

    if (role === UserRole.ADMIN) {
      demoEmail = 'admin@bookmyticket.com';
      demoName = 'Super Admin';
      path = '/admin/dashboard';
    } else if (role === UserRole.ORGANISER) {
      demoEmail = 'demo@organizer.com';
      demoName = 'Professional Organizer';
      path = '/organiser/dashboard';
    } else {
      demoEmail = 'demo@user.com';
      demoName = 'Demo User';
      path = '/';
    }

    setTimeout(() => {
      const user: User = {
        id: `demo-${role.toLowerCase()}-${Date.now()}`,
        email: demoEmail,
        name: demoName,
        role: role,
        walletBalance: 1000
      };
      onAuth(user);
      navigate(path);
      setLoading(false);
    }, 1000);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    setError(null);
    try {
      await signInWithSocial(provider);
    } catch (err: any) {
      setError(`Failed to sign in with ${provider}: ${err.message}`);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!isRegistering) {
        // Mock credentials check
        if (email === 'admin@bookmyticket.com' && password === 'admin123') {
          handleDemoLogin(UserRole.ADMIN);
          return;
        }
        if (email === 'demo@organizer.com' && password === 'password123') {
          handleDemoLogin(UserRole.ORGANISER);
          return;
        }
        if (email === 'demo@user.com' && password === 'password123') {
          handleDemoLogin(UserRole.PUBLIC);
          return;
        }
      }

      if (loginMethod === 'OTP') {
        const phone = mobile.startsWith('+') ? mobile : `+91${mobile}`;
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: phone,
          options: { 
            data: { name: name.trim() || 'User', role: UserRole.PUBLIC } 
          }
        });
        if (otpError) {
          setIsSimulationMode(true);
          setAuthStep('OTP_VERIFY');
          setResendTimer(30);
          return;
        }
        setAuthStep('OTP_VERIFY');
      } else {
        if (isRegistering) {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name: name.trim(), role: UserRole.PUBLIC }
            }
          });
          if (signUpError) throw signUpError;
          setError("Check your email for confirmation!");
        } else {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          
          if (data.user) {
            const meta = data.user.user_metadata || {};
            const fullName = meta.name || meta.full_name || 'User';
            const role = meta.role || UserRole.PUBLIC;
            
            onAuth({ 
              id: data.user.id, 
              name: fullName, 
              email: data.user.email || '', 
              role: role, 
              walletBalance: 0 
            });
            
            if (role === UserRole.ADMIN) navigate('/admin/dashboard');
            else if (role === UserRole.ORGANISER) navigate('/organiser/dashboard');
            else navigate(from || '/');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid authentication attempt");
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOtp = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      if (isSimulationMode || token === '123456') {
        const finalName = name.trim() || 'Guest User';
        onAuth({ 
          id: 'demo-' + Date.now(), 
          name: finalName, 
          email: email || `${mobile}@mobile.com`, 
          role: UserRole.PUBLIC, 
          walletBalance: 0 
        });
        navigate(from || '/');
      } else {
        const phone = mobile.startsWith('+') ? mobile : `+91${mobile}`;
        const { data, error: verifyError } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
        if (verifyError) throw verifyError;
        if (data.user) {
          const meta = data.user.user_metadata || {};
          onAuth({ 
            id: data.user.id, 
            name: meta.name || meta.full_name || name.trim() || 'User', 
            email: data.user.email || email || `${mobile}@mobile.com`, 
            role: meta.role || UserRole.PUBLIC, 
            walletBalance: 0 
          });
          navigate(from || '/');
        }
      }
    } catch (err: any) {
      setError("Invalid code. Use '123456' for testing.");
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-inter overflow-hidden">
      {/* LEFT SIDE: Visual Banner */}
      <div className="hidden lg:flex w-[35%] bg-slate-950 relative flex-col px-12 pt-20 pb-10 overflow-hidden shrink-0 border-r border-white/5">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800" className="w-full h-full object-cover" alt="bg" />
        </div>
        <div className="relative z-10">
          <Logo light />
          <h2 className="text-5xl font-black text-white mt-12 mb-6 leading-tight tracking-tighter italic">Where <span className="text-amber-500">Live</span> Happens.</h2>
          <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">Join the ecosystem of over 200,000+ event lovers across the nation.</p>
        </div>

        <div className="mt-auto relative z-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
             <h3 className="text-amber-500 font-black uppercase tracking-widest text-xs flex items-center gap-2">
               <ShieldCheck size={16} /> Instant Portal Access
             </h3>
             <div className="grid grid-cols-1 gap-3">
                <button onClick={() => handleDemoLogin(UserRole.PUBLIC)} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center"><UserIcon size={18} /></div>
                      <div className="text-left"><p className="text-white font-bold text-sm">Public User</p><p className="text-[10px] text-slate-500 font-medium">Browse & Book</p></div>
                   </div>
                   <ArrowRight className="text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" size={14} />
                </button>
                <button onClick={() => handleDemoLogin(UserRole.ORGANISER)} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center"><Smartphone size={18} /></div>
                      <div className="text-left"><p className="text-white font-bold text-sm">Event Organizer</p><p className="text-[10px] text-slate-500 font-medium">Manage & Publish</p></div>
                   </div>
                   <ArrowRight className="text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" size={14} />
                </button>
                <button onClick={() => handleDemoLogin(UserRole.ADMIN)} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center"><ShieldAlert size={18} /></div>
                      <div className="text-left"><p className="text-white font-bold text-sm">Platform Admin</p><p className="text-[10px] text-slate-500 font-medium">Command Center</p></div>
                   </div>
                   <ArrowRight className="text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" size={14} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 lg:px-20 relative overflow-y-auto bg-[#fafafa]">
        <div className="w-full max-w-md">
          {authStep === 'FORM' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">
                  {isRegistering ? 'Join the Ecosystem' : 'Log in to Portal'}
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  {isRegistering ? (
                    <>Already a member? <button onClick={() => setIsRegistering(false)} className="text-amber-500 font-black hover:underline">Sign in</button></>
                  ) : (
                    <>New explorer? <button onClick={() => setIsRegistering(true)} className="text-amber-500 font-black hover:underline">Create free account</button></>
                  )}
                </p>
              </div>

              {/* Social Logins */}
              <div className="space-y-3 mb-8">
                <button 
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Chrome size={18} className="text-[#4285F4]" />
                  Continue with Google
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 py-4 bg-[#1877F2] text-white rounded-2xl font-bold hover:bg-[#166fe5] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Facebook size={18} />
                    Facebook
                  </button>
                  <button 
                    onClick={() => handleSocialLogin('apple')}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 py-4 bg-black text-white rounded-2xl font-bold hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Apple size={18} />
                    Apple
                  </button>
                </div>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]"><span className="bg-white px-4 text-slate-300">or use secure credentials</span></div>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[13px] font-bold flex items-center gap-3 animate-in shake-in">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Method Switcher */}
              <div className="flex p-1.5 bg-slate-50 rounded-2xl mb-8">
                <button 
                  onClick={() => setLoginMethod('EMAIL')}
                  className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'EMAIL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  Email
                </button>
                <button 
                  onClick={() => setLoginMethod('OTP')}
                  className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'OTP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  Mobile OTP
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                {isRegistering && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                       <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-14 pr-4 py-4.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-slate-900" placeholder="John Doe" />
                    </div>
                  </div>
                )}

                {loginMethod === 'EMAIL' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                         <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-14 pr-4 py-4.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-slate-900" placeholder="user@example.com" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Password</label>
                      <div className="relative">
                         <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-14 pr-12 py-4.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-slate-900" placeholder="••••••••" />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                         </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mobile Number</label>
                    <div className="relative flex">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">+91</span>
                       <input 
                        type="tel" required maxLength={10} value={mobile} onChange={e => setMobile(e.target.value)} 
                        className="w-full pl-16 pr-4 py-4.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-slate-900" placeholder="9876543210" 
                       />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-5 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase text-xs tracking-[0.25em] shadow-xl shadow-amber-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? 'Start My Journey' : 'Authenticate Access')}
                </button>
              </form>

              <div className="mt-8 text-center">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                   Protected by enterprise-grade SSL Encryption. <br/> By continuing, you agree to our Terms.
                 </p>
              </div>
            </div>
          ) : (
            <div className="animate-in zoom-in-95 duration-500 bg-white p-12 rounded-[3.5rem] shadow-2xl text-center border border-slate-100">
               <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-amber-500">
                  <ShieldCheck size={40} />
               </div>
               <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-widest">Verify Identity</h1>
               <p className="text-slate-500 text-sm mb-10 font-medium">We sent a code to <span className="text-slate-900 font-bold">{mobile}</span>. <br/> Use <span className="font-black text-amber-500">123456</span> for demo.</p>
               
               <div className="flex justify-between gap-3 mb-10">
                  {otp.map((digit, i) => (
                    <input
                      key={i} id={`otp-${i}`} type="text" maxLength={1}
                      className="w-12 h-16 bg-slate-50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white rounded-2xl text-center text-2xl font-black text-slate-900 outline-none transition-all"
                      value={digit}
                      onChange={(e) => {
                         const val = e.target.value;
                         if (val && !/^\d+$/.test(val)) return;
                         const newOtp = [...otp];
                         newOtp[i] = val.substring(val.length - 1);
                         setOtp(newOtp);
                         if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                         if (newOtp.every(d => d)) verifyMobileOtp(newOtp.join(''));
                      }}
                    />
                  ))}
               </div>

               <button onClick={() => verifyMobileOtp(otp.join(''))} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Complete Check</button>
               
               <button onClick={() => setAuthStep('FORM')} className="mt-8 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                  Try another method
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
