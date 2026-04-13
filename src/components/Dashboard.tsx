import { useStudentData } from '../hooks/useStudentData';
import { BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

type DashboardProps = {
  data: ReturnType<typeof useStudentData>;
  activeCollegeId: string | 'all';
  onNavigate: (tab: 'dashboard' | 'colleges' | 'subjects' | 'tasks') => void;
};

export default function Dashboard({ data, activeCollegeId, onNavigate }: DashboardProps) {
  const { subjects: allSubjects, tasks: allTasks, toggleTaskCompletion } = data;

  const subjects = activeCollegeId === 'all' 
    ? allSubjects 
    : allSubjects.filter(s => s.collegeId === activeCollegeId);

  const tasks = activeCollegeId === 'all'
    ? allTasks
    : allTasks.filter(t => {
        const subject = allSubjects.find(s => s.id === t.subjectId);
        return subject?.collegeId === activeCollegeId;
      });

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  // Sort tasks by due date
  const upcomingTasks = [...pendingTasks].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  ).slice(0, 5);

  const stats = [
    { label: 'Matérias', value: subjects.length, icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Tarefas Pendentes', value: pendingTasks.length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Tarefas Concluídas', value: completedTasks.length, icon: CheckCircle, color: 'bg-emerald-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Olá, Estudante! 👋</h1>
        <p className="text-slate-400 mt-1">Aqui está o resumo das suas atividades.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className={`${stat.color} p-4 rounded-xl text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-50">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Tasks */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Próximas Tarefas
            </h2>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-sm text-indigo-400 font-medium hover:text-indigo-300 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex-1">
            {upcomingTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8">
                <CheckCircle className="w-12 h-12 mb-3 text-slate-700" />
                <p>Tudo em dia! Nenhuma tarefa pendente.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcomingTasks.map(task => {
                  const subject = allSubjects.find(s => s.id === task.subjectId);
                  return (
                    <li key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                      <button 
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="mt-0.5 flex-shrink-0 text-slate-600 hover:text-emerald-400 transition-colors"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-50 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          {subject && (
                            <span 
                              className="px-2 py-0.5 rounded-md font-medium"
                              style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                            >
                              {subject.name}
                            </span>
                          )}
                          <span className="text-slate-400">
                            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Subjects Overview */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Suas Matérias
            </h2>
            <button 
              onClick={() => onNavigate('subjects')}
              className="text-sm text-indigo-400 font-medium hover:text-indigo-300 flex items-center gap-1"
            >
              Gerenciar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex-1">
            {subjects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8">
                <BookOpen className="w-12 h-12 mb-3 text-slate-700" />
                <p>Nenhuma matéria cadastrada.</p>
                <button 
                  onClick={() => onNavigate('subjects')}
                  className="mt-4 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/20"
                >
                  Adicionar Matéria
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.slice(0, 6).map(subject => (
                  <div 
                    key={subject.id} 
                    className="p-3 rounded-xl border border-slate-800 flex items-center gap-3"
                  >
                    <div 
                      className="w-3 h-10 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-50 truncate">{subject.name}</p>
                      <p className="text-xs text-slate-400 truncate">{subject.schedule}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
