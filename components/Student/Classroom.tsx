
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lesson } from '../../types';
import { CATEGORIES, Icons } from '../../constants';

interface ClassroomProps {
  lessons: Lesson[];
}

const Classroom: React.FC<ClassroomProps> = ({ lessons }) => {
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Όλα');

  const filteredLessons = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || 
                          l.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Όλα' || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedLesson = id ? lessons.find(l => l.id === id) : null;

  return (
    <div className="space-y-8">
      {!selectedLesson ? (
        <>
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Καλώς ήρθατε στο <span className="text-blue-600">Classroom</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Εξερευνήστε το εκπαιδευτικό υλικό και δοκιμάστε τις γνώσεις σας.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border mb-8">
            <div className="relative w-full md:w-96">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Icons.Search />
              </span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Αναζήτηση μαθήματος..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent border focus:border-blue-500 rounded-xl outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {['Όλα', ...CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredLessons.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400 font-medium">Δεν βρέθηκαν μαθήματα.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLessons.map(lesson => (
                <Link 
                  key={lesson.id} 
                  to={`/classroom/${lesson.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white relative">
                    <Icons.Book />
                    <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                      {lesson.category}
                    </span>
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                      {lesson.description}
                    </p>
                    <div className="pt-4 border-t flex items-center justify-between text-xs font-bold text-blue-600">
                      <span>{lesson.quizzes.length} Κουίζ</span>
                      <span>Προβολή &rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 transition-colors">
            &larr; Πίσω στη Λίστα
          </Link>
          
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-8">
            <div className="p-8 md:p-12 bg-slate-900 text-white">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase mb-4 inline-block tracking-widest">
                {selectedLesson.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">{selectedLesson.title}</h1>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-slate-400 text-sm">
                   <Icons.Brain /> {selectedLesson.quizzes.length} Κουίζ
                 </div>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="prose prose-slate max-w-none mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b">Περιεχόμενο Μαθήματος</h2>
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg font-normal">
                  {selectedLesson.description}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t">
                {/* Quizzes */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Icons.Brain /> Δοκιμασία Γνώσεων
                  </h2>
                  {selectedLesson.quizzes.length === 0 ? (
                    <p className="text-slate-400 italic">Δεν υπάρχουν κουίζ.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedLesson.quizzes.map(quiz => (
                        <Link
                          key={quiz.id}
                          to={`/quiz/${selectedLesson.id}/${quiz.id}`}
                          className="flex items-center justify-between p-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 group"
                        >
                          <div>
                            <p className="font-black text-lg">{quiz.title}</p>
                            <p className="text-xs text-blue-100">{quiz.questions.length} Ερωτήσεις</p>
                          </div>
                          <span className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-black group-hover:scale-110 transition-transform">ΕΝΑΡΞΗ</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Icons.Link /> Χρήσιμοι Σύνδεσμοι
                  </h2>
                  {selectedLesson.resources.length === 0 ? (
                    <p className="text-slate-400 italic">Δεν υπάρχουν σύνδεσμοι.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedLesson.resources.map(res => (
                        <a
                          key={res.id}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 border border-slate-100 transition-all group"
                        >
                          <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                            <Icons.Link />
                          </div>
                          <p className="font-bold text-slate-800">{res.name}</p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classroom;
