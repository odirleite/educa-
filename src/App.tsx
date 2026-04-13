import { useState, useEffect } from 'react';
import { useStudentData } from './hooks/useStudentData';
import { LayoutDashboard, BookOpen, CheckSquare, Menu, X, GraduationCap, Globe, LogOut, LogIn } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Subjects from './components/Subjects';
import Tasks from './components/Tasks';
import Colleges from './components/Colleges';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

type Tab = 'dashboard' | 'colleges' | 'subjects' | 'tasks';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeCollegeId, setActiveCollegeId] = useState<string | 'all'>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const studentData = useStudentData(user?.uid || null);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-50">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-500/10 p-4 rounded-full">
              <BookOpen className="w-12 h-12 text-indigo-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Estuda+</h1>
            <p className="text-slate-400">Seu organizador estudantil pessoal. Faça login para acessar suas matérias e tarefas de qualquer lugar.</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'colleges', label: 'Faculdades', icon: GraduationCap },
    { id: 'subjects', label: 'Matérias', icon: BookOpen },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-indigo-500 font-bold text-xl">
          <BookOpen className="w-6 h-6" />
          <span>Estuda+</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-10
        w-64 h-screen bg-slate-900 border-r border-slate-800
        flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-2 text-indigo-500 font-bold text-2xl tracking-tight">
          <BookOpen className="w-8 h-8" />
          <span>Estuda+</span>
        </div>

        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4">Visualização</p>
          <div className="space-y-1">
            <button 
              onClick={() => setActiveCollegeId('all')} 
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors text-sm ${activeCollegeId === 'all' ? 'bg-slate-800 text-slate-50 font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Globe className="w-4 h-4" /> Todas
            </button>
            {studentData.colleges.map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveCollegeId(c.id)} 
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors text-sm ${activeCollegeId === c.id ? 'bg-slate-800 text-slate-50 font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="my-2 border-t border-slate-800 mx-4"></div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center gap-2 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-xs font-medium">{user.email?.[0].toUpperCase()}</span>
                </div>
              )}
              <span className="text-sm text-slate-300 truncate">{user.displayName || user.email}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 text-white">
            <h3 className="font-semibold text-sm mb-1">Semestre Atual</h3>
            <p className="text-indigo-200 text-xs">Mantenha o foco nos seus objetivos!</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {activeTab === 'dashboard' && <Dashboard data={studentData} activeCollegeId={activeCollegeId} onNavigate={setActiveTab} />}
        {activeTab === 'colleges' && <Colleges data={studentData} />}
        {activeTab === 'subjects' && <Subjects data={studentData} activeCollegeId={activeCollegeId} />}
        {activeTab === 'tasks' && <Tasks data={studentData} activeCollegeId={activeCollegeId} />}
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
