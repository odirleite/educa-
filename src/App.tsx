import { useState } from 'react';
import { useStudentData } from './hooks/useStudentData';
import { LayoutDashboard, BookOpen, CheckSquare, Menu, X, GraduationCap, Globe } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Subjects from './components/Subjects';
import Tasks from './components/Tasks';
import Colleges from './components/Colleges';

type Tab = 'dashboard' | 'colleges' | 'subjects' | 'tasks';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeCollegeId, setActiveCollegeId] = useState<string | 'all'>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const studentData = useStudentData();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'colleges', label: 'Faculdades', icon: GraduationCap },
    { id: 'subjects', label: 'Matérias', icon: BookOpen },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <BookOpen className="w-6 h-6" />
          <span>Estuda+</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-10
        w-64 h-screen bg-white border-r border-gray-200
        flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-2 text-indigo-600 font-bold text-2xl tracking-tight">
          <BookOpen className="w-8 h-8" />
          <span>Estuda+</span>
        </div>

        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">Visualização</p>
          <div className="space-y-1">
            <button 
              onClick={() => setActiveCollegeId('all')} 
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors text-sm ${activeCollegeId === 'all' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Globe className="w-4 h-4" /> Todas
            </button>
            {studentData.colleges.map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveCollegeId(c.id)} 
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors text-sm ${activeCollegeId === c.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="my-2 border-t border-gray-100 mx-4"></div>

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
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
            <h3 className="font-semibold text-sm mb-1">Semestre Atual</h3>
            <p className="text-indigo-100 text-xs">Mantenha o foco nos seus objetivos!</p>
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
          className="fixed inset-0 bg-black/20 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
