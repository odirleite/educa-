import { useState, FormEvent } from 'react';
import { useStudentData } from '../hooks/useStudentData';
import { Plus, Edit2, Trash2, X, CheckCircle, Circle, Calendar, AlertCircle, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TasksProps = {
  data: ReturnType<typeof useStudentData>;
  activeCollegeId: string | 'all';
};

export default function Tasks({ data, activeCollegeId }: TasksProps) {
  const { subjects: allSubjects, tasks: allTasks, colleges, addTask, updateTask, deleteTask, toggleTaskCompletion } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  const subjects = activeCollegeId === 'all' 
    ? allSubjects 
    : allSubjects.filter(s => s.collegeId === activeCollegeId);

  const tasks = activeCollegeId === 'all'
    ? allTasks
    : allTasks.filter(t => {
        const subject = allSubjects.find(s => s.id === t.subjectId);
        return subject?.collegeId === activeCollegeId;
      });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    subjectId: '',
    completed: false
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTask(editingId, formData);
    } else {
      addTask(formData);
    }
    closeModal();
  };

  const openModal = (task?: typeof tasks[0]) => {
    if (task) {
      setEditingId(task.id);
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        subjectId: task.subjectId,
        completed: task.completed
      });
    } else {
      setEditingId(null);
      setFormData({ 
        title: '', 
        description: '', 
        dueDate: new Date().toISOString().split('T')[0], 
        subjectId: subjects.length > 0 ? subjects[0].id : '',
        completed: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredTasks = tasks
    .filter(t => {
      const isOverdue = !t.completed && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
      if (filter === 'pending') return !t.completed;
      if (filter === 'completed') return t.completed;
      if (filter === 'overdue') return isOverdue;
      return true;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Tarefas</h1>
          <p className="text-slate-400 mt-1">Acompanhe seus trabalhos e provas.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex overflow-x-auto max-w-full">
        {(['all', 'pending', 'completed', 'overdue'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f 
                ? 'bg-slate-800 text-slate-50' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : f === 'completed' ? 'Concluídas' : 'Atrasadas'}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-50 mb-1">Nenhuma tarefa cadastrada</h3>
          <p className="text-slate-400 max-w-sm">Adicione trabalhos, provas ou leituras para manter tudo organizado.</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Nenhuma tarefa encontrada para este filtro.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const subject = allSubjects.find(s => s.id === task.subjectId);
            const college = subject ? colleges.find(c => c.id === subject.collegeId) : null;
            const isOverdue = !task.completed && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
            
            return (
              <div 
                key={task.id} 
                className={`bg-slate-900 rounded-xl border p-4 flex items-start gap-4 transition-all group hover:shadow-md
                  ${task.completed ? 'border-slate-800 opacity-50' : isOverdue ? 'border-red-900/50 bg-red-500/10' : 'border-slate-800'}
                `}
              >
                <button 
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`mt-1 flex-shrink-0 transition-colors ${
                    task.completed ? 'text-emerald-500' : 'text-slate-600 hover:text-emerald-400'
                  }`}
                >
                  {task.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold text-lg truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-50'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1 transition-opacity ml-4">
                      <button onClick={() => openModal(task)} className="p-1.5 text-slate-500 hover:text-indigo-400 rounded-md hover:bg-indigo-500/10">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-md hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className={`text-sm mt-1 mb-3 line-clamp-2 ${task.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium">
                    {college && activeCollegeId === 'all' && (
                      <span 
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md"
                        style={{ 
                          backgroundColor: task.completed ? '#1e293b' : `${college.color}20`, 
                          color: task.completed ? '#64748b' : college.color 
                        }}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        {college.name}
                      </span>
                    )}

                    {subject && (
                      <span 
                        className="px-2.5 py-1 rounded-md"
                        style={{ 
                          backgroundColor: task.completed ? '#1e293b' : `${subject.color}20`, 
                          color: task.completed ? '#64748b' : subject.color 
                        }}
                      >
                        {subject.name}
                      </span>
                    )}
                    
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md ${
                      task.completed ? 'bg-slate-800 text-slate-500' :
                      isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isOverdue && !task.completed ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      {isOverdue && !task.completed && ' (Atrasada)'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-800"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                <h2 className="text-lg font-semibold text-slate-50">
                  {editingId ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Título *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: Lista de Exercícios 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Matéria</label>
                  {subjects.length === 0 ? (
                    <div className="text-sm text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                      Cadastre uma matéria primeiro para vincular a esta tarefa.
                    </div>
                  ) : (
                    <select
                      value={formData.subjectId}
                      onChange={e => setFormData({...formData, subjectId: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="" disabled>Selecione uma matéria</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Data de Entrega *</label>
                  <input 
                    required
                    type="date" 
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none h-24 placeholder-slate-600"
                    placeholder="Detalhes adicionais da tarefa..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={subjects.length > 0 && !formData.subjectId}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
