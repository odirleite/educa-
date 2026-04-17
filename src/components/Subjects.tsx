import { useState, FormEvent } from 'react';
import { useStudentData } from '../hooks/useStudentData';
import { Plus, Edit2, Trash2, X, BookOpen, GraduationCap, Archive, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SubjectsProps = {
  data: ReturnType<typeof useStudentData>;
  activeCollegeId: string | 'all';
};

export default function Subjects({ data, activeCollegeId }: SubjectsProps) {
  const { subjects: allSubjects, colleges, addSubject, updateSubject, deleteSubject } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed'>('active');

  const subjects = activeCollegeId === 'all' 
    ? allSubjects 
    : allSubjects.filter(s => s.collegeId === activeCollegeId);

  const filteredSubjects = subjects.filter(s => (s.status || 'active') === statusFilter);

  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    professor: '',
    schedule: '',
    collegeId: activeCollegeId === 'all' ? (colleges[0]?.id || '') : activeCollegeId,
    notes: '',
    status: 'active' as 'active' | 'completed',
    semester: '',
    progress: 0
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSubject(editingId, formData);
    } else {
      addSubject(formData);
    }
    closeModal();
  };

  const openModal = (subject?: typeof subjects[0]) => {
    if (subject) {
      setEditingId(subject.id);
      setFormData({
        name: subject.name,
        color: subject.color,
        professor: subject.professor,
        schedule: subject.schedule,
        collegeId: subject.collegeId,
        notes: subject.notes || '',
        status: subject.status || 'active',
        semester: subject.semester || '',
        progress: subject.progress || 0
      });
    } else {
      setEditingId(null);
      setFormData({ 
        name: '', 
        color: '#6366f1', 
        professor: '', 
        schedule: '',
        collegeId: activeCollegeId === 'all' ? (colleges[0]?.id || '') : activeCollegeId,
        notes: '',
        status: 'active',
        semester: '',
        progress: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Matérias</h1>
          <p className="text-slate-400 mt-1">Gerencie suas disciplinas atuais e histórico.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Matéria
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex">
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'active' 
              ? 'bg-slate-800 text-slate-50' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Em andamento
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'completed' 
              ? 'bg-slate-800 text-slate-50' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Archive className="w-4 h-4" />
          Histórico
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-50 mb-1">Nenhuma matéria cadastrada</h3>
          <p className="text-slate-400 max-w-sm">Adicione suas matérias para começar a organizar suas tarefas e horários.</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Nenhuma matéria encontrada nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map(subject => {
            const college = colleges.find(c => c.id === subject.collegeId);
            return (
              <div key={subject.id} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden group">
                <div className="h-2 w-full" style={{ backgroundColor: subject.color }} />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-slate-50 truncate pr-4">{subject.name}</h3>
                    <div className="flex items-center gap-1 transition-opacity">
                      <button onClick={() => openModal(subject)} className="p-1.5 text-slate-500 hover:text-indigo-400 rounded-md hover:bg-indigo-500/10">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSubject(subject.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-md hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-400">
                    {college && activeCollegeId === 'all' && (
                      <p className="flex items-center gap-2 text-xs font-medium" style={{ color: college.color }}>
                        <GraduationCap className="w-4 h-4" /> {college.name}
                      </p>
                    )}
                    {subject.semester && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-slate-300">Semestre:</span> {subject.semester}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-slate-300">Prof:</span> {subject.professor || 'Não informado'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-slate-300">Horário:</span> {subject.schedule || 'Não informado'}
                    </p>
                    
                    {/* Progress Bar inside Subject Card */}
                    <div className="pt-2 mt-2 border-t border-slate-800">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-400">Progresso</span>
                        <span className="text-xs font-bold" style={{ color: subject.color }}>{subject.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${subject.progress || 0}%`, backgroundColor: subject.color }} 
                        />
                      </div>
                    </div>

                    {subject.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <p className="text-xs font-medium text-slate-300 mb-1">Anotações:</p>
                        <p className="text-xs text-slate-500 whitespace-pre-wrap line-clamp-3">{subject.notes}</p>
                      </div>
                    )}
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
                  {editingId ? 'Editar Matéria' : 'Nova Matéria'}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Matéria *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: Cálculo I"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Faculdade *</label>
                  {colleges.length === 0 ? (
                    <div className="text-sm text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                      Cadastre uma faculdade primeiro.
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.collegeId}
                      onChange={e => setFormData({...formData, collegeId: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="" disabled>Selecione uma faculdade</option>
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Cor de Identificação</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <span className="text-sm text-slate-400 uppercase">{formData.color}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'completed'})}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="active">Em andamento</option>
                      <option value="completed">Concluída (Histórico)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Semestre/Ano</label>
                    <input 
                      type="text" 
                      value={formData.semester}
                      onChange={e => setFormData({...formData, semester: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                      placeholder="Ex: 2023.2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Professor(a)</label>
                  <input 
                    type="text" 
                    value={formData.professor}
                    onChange={e => setFormData({...formData, professor: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                    placeholder="Nome do professor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Horário/Dias</label>
                  <input 
                    type="text" 
                    value={formData.schedule}
                    onChange={e => setFormData({...formData, schedule: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: Seg e Qua, 19h-21h"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Anotações</label>
                  <textarea 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none h-20 placeholder-slate-600"
                    placeholder="Link do meet, sala de aula, critérios de avaliação..."
                  />
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Progresso da Matéria (%)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={formData.progress}
                      onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                      className="flex-1 accent-indigo-500"
                    />
                    <span className="text-lg font-bold text-slate-50 w-12 text-right">{formData.progress}%</span>
                  </div>
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
                    disabled={colleges.length === 0}
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
