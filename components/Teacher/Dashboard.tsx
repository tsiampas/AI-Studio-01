
import React from 'react';
import { Link } from 'react-router-dom';
import { Lesson } from '../../types';
import { Icons } from '../../constants';

interface DashboardProps {
  lessons: Lesson[];
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ lessons, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Καθηγητή</h1>
          <p className="text-slate-500">Διαχειριστείτε τα μαθήματα και το υλικό σας</p>
        </div>
        <Link 
          to="/teacher/lesson/new" 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Icons.Plus />
          Νέο Μάθημα
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.Book />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Δεν υπάρχουν μαθήματα ακόμα</h3>
          <p className="text-slate-500 mb-6">Ξεκινήστε προσθέτοντας το πρώτο σας εκπαιδευτικό υλικό.</p>
          <Link 
            to="/teacher/lesson/new" 
            className="text-blue-600 font-bold hover:underline"
          >
            Δημιουργία μαθήματος &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map(lesson => (
            <div key={lesson.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {lesson.category}
                  </span>
                  <div className="flex gap-2">
                    <Link 
                      to={`/teacher/lesson/edit/${lesson.id}`}
                      className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                      title="Επεξεργασία"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </Link>
                    <button 
                      onClick={() => { if(confirm('Είστε σίγουροι για τη διαγραφή;')) onDelete(lesson.id); }}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      title="Διαγραφή"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{lesson.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                  {lesson.description}
                </p>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Icons.File /> {lesson.resources.length} Υλικό
                  </span>
                  <span className="flex items-center gap-1">
                    <Icons.Brain /> {lesson.quizzes.length} Κουίζ
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t">
                <Link 
                  to={`/classroom/${lesson.id}`} 
                  className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                >
                  Προβολή Μαθητή <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
