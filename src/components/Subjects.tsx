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
    semester: ''
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
        semester: subject.semester || ''
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
        semester: ''
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Matérias</h1>
          <p className="text-gray-500 mt-1">Gerencie suas disciplinas atuais e histórico.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Matéria
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 inline-flex">
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'active' 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Em andamento
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'completed' 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Archive className="w-4 h-4" />
          Histórico
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-50 p-4 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Nenhuma matéria cadastrada</h3>
          <p className="text-gray-500 max-w-sm">Adicione suas matérias para começar a organizar suas tarefas e horários.</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhuma matéria encontrada nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map(subject => {
            const college = colleges.find(c => c.id === subject.collegeId);
            return (
              <div key={subject.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                <div className="h-2 w-full" style={{ backgroundColor: subject.color }} />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 truncate pr-4">{subject.name}</h3>
                    <div className="flex items-center gap-1 transition-opacity">
                      <button onClick={() => openModal(subject)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSubject(subject.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    {college && activeCollegeId === 'all' && (
                      <p className="flex items-center gap-2 text-xs font-medium" style={{ color: college.color }}>
                        <GraduationCap className="w-4 h-4" /> {college.name}
                      </p>
                    )}
                    {subject.semester && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Semestre:</span> {subject.semester}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">Prof:</span> {subject.professor || 'Não informado'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">Horário:</span> {subject.schedule || 'Não informado'}
                    </p>
                    {subject.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-900 mb-1">Anotações:</p>
                        <p className="text-xs text-gray-500 whitespace-pre-wrap line-clamp-3">{subject.notes}</p>
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Editar Matéria' : 'Nova Matéria'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Matéria *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: Cálculo I"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faculdade *</label>
                  {colleges.length === 0 ? (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      Cadastre uma faculdade primeiro.
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.collegeId}
                      onChange={e => setFormData({...formData, collegeId: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                    >
                      <option value="" disabled>Selecione uma faculdade</option>
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Identificação</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm text-gray-500 uppercase">{formData.color}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'completed'})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                    >
                      <option value="active">Em andamento</option>
                      <option value="completed">Concluída (Histórico)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semestre/Ano</label>
                    <input 
                      type="text" 
                      value={formData.semester}
                      onChange={e => setFormData({...formData, semester: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Ex: 2023.2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professor(a)</label>
                  <input 
                    type="text" 
                    value={formData.professor}
                    onChange={e => setFormData({...formData, professor: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Nome do professor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário/Dias</label>
                  <input 
                    type="text" 
                    value={formData.schedule}
                    onChange={e => setFormData({...formData, schedule: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: Seg e Qua, 19h-21h"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anotações</label>
                  <textarea 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none h-20"
                    placeholder="Link do meet, sala de aula, critérios de avaliação..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={colleges.length === 0}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
