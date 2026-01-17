
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lesson, Resource, Quiz, QuestionType } from '../../types';
import { CATEGORIES, Icons } from '../../constants';
import { generateQuizQuestions } from '../../services/geminiService';

interface LessonEditorProps {
  lessons?: Lesson[];
  onSave: (lesson: Lesson) => void;
}

const LessonEditor: React.FC<LessonEditorProps> = ({ lessons, onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // AI Quiz Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizPrompt, setQuizPrompt] = useState('');
  const [qCount, setQCount] = useState(5);
  const [qTypes, setQTypes] = useState<QuestionType[]>([QuestionType.SINGLE_CHOICE, QuestionType.TRUE_FALSE]);

  useEffect(() => {
    if (isEdit && lessons && !isInitialized) {
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
        setTitle(lesson.title);
        setDescription(lesson.description);
        setCategory(lesson.category);
        setResources([...lesson.resources]);
        setQuizzes([...lesson.quizzes]);
        setIsInitialized(true);
      }
    }
  }, [id, lessons, isEdit, isInitialized]);

  const handleAddLink = () => {
    const name = prompt('Τίτλος συνδέσμου (π.χ. Βίντεο στο YouTube):');
    const url = prompt('Εισάγετε το URL:');
    if (name && url) {
      setResources(prev => [...prev, { id: Date.now().toString(), type: 'link', name, url }]);
    }
  };

  const handleGenerateAIQuiz = async () => {
    // Αν δεν υπάρχει κείμενο στο ειδικό πεδίο, χρησιμοποιούμε το περιεχόμενο του μαθήματος
    const contentToUse = quizPrompt || description;
    
    if (!contentToUse) {
      alert('Παρακαλώ επικολλήστε κάποιο κείμενο για τη δημιουργία των ερωτήσεων.');
      return;
    }
    
    setIsGenerating(true);
    try {
      const questions = await generateQuizQuestions(contentToUse, qCount, qTypes);
      const newQuiz: Quiz = {
        id: Date.now().toString(),
        title: `Κουίζ: ${title || 'Χωρίς Τίτλο'} (${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
        questions,
        createdAt: Date.now()
      };
      setQuizzes(prev => [...prev, newQuiz]);
      setQuizPrompt('');
      alert(`Το κουίζ δημιουργήθηκε! Πατήστε "Αποθήκευση Μαθήματος" στο τέλος για να μη χαθεί.`);
    } catch (error) {
      console.error(error);
      alert('Αποτυχία δημιουργίας κουίζ. Ελέγξτε το περιεχόμενο.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Δώστε έναν τίτλο στο μάθημα.");
      return;
    }

    const lessonData: Lesson = {
      id: id || Date.now().toString(),
      title,
      description,
      category,
      resources,
      quizzes,
      createdAt: isEdit && lessons ? (lessons.find(l => l.id === id)?.createdAt || Date.now()) : Date.now(),
      teacherId: '1'
    };

    onSave(lessonData);
    navigate('/teacher/dashboard');
  };

  const toggleType = (type: QuestionType) => {
    setQTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button type="button" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-3xl font-bold">{isEdit ? 'Επεξεργασία' : 'Νέο Μάθημα'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info & Content */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Τίτλος Μαθήματος</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="π.χ. Ιστορία της Τέχνης"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Κατηγορία</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Περιεχόμενο Μαθήματος (Κείμενο)</label>
            <p className="text-xs text-slate-400 mb-2">Επικολλήστε εδώ το κείμενο που θα διαβάσουν οι μαθητές.</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-64 font-sans leading-relaxed"
              placeholder="Γράψτε ή επικολλήστε το περιεχόμενο του μαθήματος..."
            />
          </div>
        </div>

        {/* External Links */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Χρήσιμοι Σύνδεσμοι</h2>
            <button 
              type="button" 
              onClick={handleAddLink}
              className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all"
            >
              <Icons.Link /> + Προσθήκη Link
            </button>
          </div>
          
          {resources.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-4">Δεν υπάρχουν σύνδεσμοι.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {resources.map((res, idx) => (
                <div key={res.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-sm font-medium truncate max-w-[200px]">{res.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setResources(prev => prev.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Quiz Generator */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
            <Icons.Brain />
            <h2 className="text-lg font-bold text-blue-900">Δημιουργία Κουίζ με AI</h2>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-blue-800 mb-1">Κείμενο για Ερωτήσεις</label>
            <textarea
              value={quizPrompt}
              onChange={e => setQuizPrompt(e.target.value)}
              className="w-full px-4 py-2 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-32 bg-white"
              placeholder="Αφήστε το κενό για να χρησιμοποιηθεί το κείμενο του μαθήματος παραπάνω, ή επικολλήστε νέο κείμενο εδώ..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Πλήθος Ερωτήσεων ({qCount})</label>
              <input 
                type="range" min="1" max="15" step="1" 
                value={qCount} 
                onChange={e => setQCount(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Τύποι Ερωτήσεων</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(QuestionType).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                      qTypes.includes(type) 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {type === QuestionType.TRUE_FALSE ? 'Σ/Λ' : 
                     type === QuestionType.SINGLE_CHOICE ? 'Μον. Επιλ.' :
                     type === QuestionType.MULTIPLE_CHOICE ? 'Πολλ. Επιλ.' : 'Κενά'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAIQuiz}
            disabled={isGenerating}
            className={`w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
              isGenerating
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? 'Παραγωγή Ερωτήσεων...' : 'Δημιουργία Κουίζ με AI'}
          </button>

          {quizzes.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-bold text-blue-900">Έτοιμα Κουίζ στο Μάθημα:</h3>
              {quizzes.map((q) => (
                <div key={q.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100">
                  <span className="text-sm font-bold">{q.title}</span>
                  <button type="button" onClick={() => setQuizzes(prev => prev.filter(qz => qz.id !== q.id))} className="text-red-300 hover:text-red-500">
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-grow bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl text-lg"
          >
            Αποθήκευση Μαθήματος
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 bg-white text-slate-700 py-4 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Ακύρωση
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonEditor;
