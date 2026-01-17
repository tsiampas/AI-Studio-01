
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Lesson, User } from './types';
import Navbar from './components/Navbar';
import Classroom from './components/Student/Classroom';
import Dashboard from './components/Teacher/Dashboard';
import LessonEditor from './components/Teacher/LessonEditor';
import QuizTaking from './components/Student/QuizTaking';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    // Έλεγχος αν υπάρχει το API Key
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }

    const savedLessons = localStorage.getItem('qm_lessons');
    const savedUser = localStorage.getItem('qm_user');
    
    if (savedLessons) {
      try {
        setLessons(JSON.parse(savedLessons));
      } catch (e) {
        console.error("Error loading lessons", e);
      }
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error loading user", e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('qm_lessons', JSON.stringify(lessons));
    }
  }, [lessons, loading]);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      window.location.reload(); // Ανανέωση για να πάρει το νέο κλειδί
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('qm_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qm_user');
  };

  const addLesson = (lesson: Lesson) => {
    setLessons(prev => [...prev, lesson]);
  };

  const updateLesson = (updatedLesson: Lesson) => {
    setLessons(prev => prev.map(l => l.id === updatedLesson.id ? updatedLesson : l));
  };

  const deleteLesson = (id: string) => {
    if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το μάθημα;')) {
      setLessons(prev => prev.filter(l => l.id !== id));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col relative">
        {apiKeyMissing && (
          <div className="bg-amber-600 text-white p-2 text-center text-xs font-bold z-[100] flex justify-center items-center gap-4">
            <span>Απαιτείται API Key για τη λειτουργία του AI.</span>
            <button 
              onClick={handleOpenKeyDialog}
              className="bg-white text-amber-600 px-3 py-1 rounded-full hover:bg-amber-50 transition-colors"
            >
              Επιλογή Κλειδιού
            </button>
          </div>
        )}
        
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Classroom lessons={lessons} />} />
            <Route path="/classroom/:id" element={<Classroom lessons={lessons} />} />
            <Route path="/quiz/:lessonId/:quizId" element={<QuizTaking lessons={lessons} />} />

            <Route 
              path="/teacher/login" 
              element={user ? <Navigate to="/teacher/dashboard" /> : <Auth onLogin={handleLogin} />} 
            />
            <Route 
              path="/teacher/dashboard" 
              element={user ? <Dashboard lessons={lessons} onDelete={deleteLesson} /> : <Navigate to="/teacher/login" />} 
            />
            <Route 
              path="/teacher/lesson/new" 
              element={user ? <LessonEditor onSave={addLesson} /> : <Navigate to="/teacher/login" />} 
            />
            <Route 
              path="/teacher/lesson/edit/:id" 
              element={user ? <LessonEditor lessons={lessons} onSave={updateLesson} /> : <Navigate to="/teacher/login" />} 
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} QuizMaster AI - Εκπαιδευτική Πλατφόρμα</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
