
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lesson, Quiz, QuestionType } from '../../types';

interface QuizTakingProps {
  lessons: Lesson[];
}

const QuizTaking: React.FC<QuizTakingProps> = ({ lessons }) => {
  const { lessonId, quizId } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const l = lessons.find(l => l.id === lessonId);
    if (l) {
      setLesson(l);
      const q = l.quizzes.find(q => q.id === quizId);
      if (q) setQuiz(q);
    }
  }, [lessonId, quizId, lessons]);

  if (!quiz || !lesson) return (
    <div className="text-center py-20">
      <p>Το κουίζ δεν βρέθηκε.</p>
      <Link to="/" className="text-blue-600 underline">Επιστροφή στην αρχική</Link>
    </div>
  );

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    const currentAnswers = answers[currentQuestion.id];

    if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE) {
      // Logic for multi-select
      const selectedList = Array.isArray(currentAnswers) ? [...currentAnswers] : [];
      if (selectedList.includes(answer)) {
        setAnswers({ ...answers, [currentQuestion.id]: selectedList.filter(a => a !== answer) });
      } else {
        setAnswers({ ...answers, [currentQuestion.id]: [...selectedList, answer] });
      }
    } else {
      // Logic for single-select
      setAnswers({ ...answers, [currentQuestion.id]: answer });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore();
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    quiz.questions.forEach(q => {
      let userAnswer = answers[q.id];
      let correctAnswer = q.correctAnswer;

      if (q.type === QuestionType.MULTIPLE_CHOICE) {
        // Compare arrays for multiple choice
        const userArr = Array.isArray(userAnswer) ? [...userAnswer].sort() : [userAnswer].sort();
        const correctArr = Array.isArray(correctAnswer) ? [...correctAnswer].sort() : [correctAnswer].sort();
        if (JSON.stringify(userArr) === JSON.stringify(correctArr)) {
          correctCount++;
        }
      } else if (q.type === QuestionType.TRUE_FALSE) {
        const normalize = (val: any) => {
          if (typeof val !== 'string') return val;
          const s = val.toLowerCase().trim();
          if (s === 'true' || s === 'yes' || s === 'correct') return 'Σωστό';
          if (s === 'false' || s === 'no' || s === 'incorrect') return 'Λάθος';
          return val;
        };
        if (normalize(userAnswer) === normalize(correctAnswer)) {
          correctCount++;
        }
      } else {
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      }
    });
    setScore(Math.round((correctCount / quiz.questions.length) * 100));
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center bg-white p-12 rounded-3xl border shadow-xl">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 border-8 ${score >= 50 ? 'border-green-100 text-green-600' : 'border-red-100 text-red-600'}`}>
          <span className="text-4xl font-black">{score}%</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Το κουίζ ολοκληρώθηκε!</h2>
        <p className="text-slate-500 mb-8">
          Συγχαρητήρια για την προσπάθειά σου. Μπορείς να επιστρέψεις στο μάθημα για περισσότερη μελέτη.
        </p>
        <div className="space-y-4">
          <Link 
            to={`/classroom/${lessonId}`} 
            className="block w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Επιστροφή στο Μάθημα
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="block w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            Επανάληψη Κουίζ
          </button>
        </div>
      </div>
    );
  }

  const userSelection = answers[currentQuestion.id];
  const isAnswered = currentQuestion.type === QuestionType.MULTIPLE_CHOICE 
    ? (Array.isArray(userSelection) && userSelection.length > 0)
    : userSelection !== undefined;

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-500">
            Ερώτηση {currentQuestionIndex + 1} από {quiz.questions.length}
          </span>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">
            {currentQuestion.type === QuestionType.TRUE_FALSE ? 'Σωστό / Λάθος' : 
             currentQuestion.type === QuestionType.SINGLE_CHOICE ? 'Μοναδική Επιλογή' :
             currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? 'Πολλαπλή Επιλογή' : 'Συμπλήρωση Κενών'}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-3xl border shadow-sm space-y-8">
        <h2 className="text-2xl font-bold text-slate-800 leading-tight">
          {currentQuestion.text}
        </h2>

        <div className="space-y-3">
          {/* Options for Non-True/False questions */}
          {currentQuestion.type !== QuestionType.TRUE_FALSE && currentQuestion.options?.map((option, idx) => {
            const isSelected = currentQuestion.type === QuestionType.MULTIPLE_CHOICE
              ? (Array.isArray(userSelection) && userSelection.includes(option))
              : userSelection === option;

            return (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-4 ring-blue-50' 
                    : 'border-slate-100 bg-slate-50 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                } ${currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? 'rounded' : 'rounded-full'}`}>
                  {isSelected && (
                    <div className={currentQuestion.type === QuestionType.MULTIPLE_CHOICE 
                      ? "w-3 h-3 text-white flex items-center justify-center" 
                      : "w-2 h-2 bg-white rounded-full"
                    }>
                      {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && "✓"}
                    </div>
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </button>
            );
          })}

          {/* Special UI for TRUE_FALSE */}
          {currentQuestion.type === QuestionType.TRUE_FALSE && (
            <div className="grid grid-cols-2 gap-4">
              {['Σωστό', 'Λάθος'].map((val) => {
                const isSelected = userSelection === val;
                return (
                  <button
                    key={val}
                    onClick={() => handleAnswerSelect(val)}
                    className={`p-6 rounded-2xl border-2 font-bold transition-all text-center ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-4 ring-blue-50' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center ${
            isAnswered 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {currentQuestionIndex === quiz.questions.length - 1 ? 'Ολοκλήρωση' : 'Επόμενη Ερώτηση'}
        </button>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => { if(confirm('Θέλετε να εγκαταλείψετε το κουίζ;')) navigate(`/classroom/${lessonId}`); }}
          className="text-slate-400 hover:text-slate-600 text-sm font-medium"
        >
          Εγκατάλειψη κουίζ
        </button>
      </div>
    </div>
  );
};

export default QuizTaking;
