import { useState, FormEvent } from 'react';
import { useStudentData } from '../hooks/useStudentData';
import { Plus, Edit2, Trash2, X, GraduationCap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type CollegesProps = {
  data: ReturnType<typeof useStudentData>;
};

export default function Colleges({ data }: CollegesProps) {
  const { colleges, addCollege, updateCollege, deleteCollege } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    progress: 0,
    missingRequirements: ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCollege(editingId, formData);
    } else {
      addCollege(formData);
    }
    closeModal();
  };

  const openModal = (college?: typeof colleges[0]) => {
    if (college) {
      setEditingId(college.id);
      setFormData({
        name: college.name,
        color: college.color,
        progress: college.progress || 0,
        missingRequirements: college.missingRequirements || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', color: '#3b82f6', progress: 0, missingRequirements: '' });
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
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Faculdades</h1>
          <p className="text-slate-400 mt-1">Gerencie suas instituições de ensino e progresso.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Faculdade
        </button>
      </header>

      {colleges.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-50 mb-1">Nenhuma faculdade cadastrada</h3>
          <p className="text-slate-400 max-w-sm">Adicione suas faculdades para separar suas matérias e tarefas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colleges.map(college => (
            <div key={college.id} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden group flex flex-col">
              <div className="h-2 w-full" style={{ backgroundColor: college.color }} />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${college.color}20`, color: college.color }}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-50 truncate pr-4">{college.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 transition-opacity">
                    <button onClick={() => openModal(college)} className="p-1.5 text-slate-500 hover:text-indigo-400 rounded-md hover:bg-indigo-500/10">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm('Tem certeza? Isso apagará todas as matérias e tarefas desta faculdade.')) {
                          deleteCollege(college.id);
                        }
                      }} 
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-md hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto space-y-5">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-slate-500" /> Progresso do Curso
                      </span>
                      <span className="font-bold text-lg" style={{ color: college.color }}>
                        {college.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-2.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${college.progress || 0}%`, backgroundColor: college.color }} 
                      />
                    </div>
                  </div>

                  {/* Missing Requirements */}
                  {college.missingRequirements && (
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">O que falta para formar:</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {college.missingRequirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                  {editingId ? 'Editar Faculdade' : 'Nova Faculdade'}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Faculdade *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: Estácio, PUC..."
                  />
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

                <div className="border-t border-slate-800 pt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Progresso do Curso (%)</label>
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

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">O que falta para formar?</label>
                  <textarea 
                    value={formData.missingRequirements}
                    onChange={e => setFormData({...formData, missingRequirements: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none h-24 placeholder-slate-600"
                    placeholder="Ex: Faltam 2 semestres, TCC e 40h de atividades complementares..."
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors"
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
