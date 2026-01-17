
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Icons } from '../constants';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Icons.Brain />
          <span>QuizMaster AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium">
            Αρχική (Μαθητές)
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4 border-l pl-4">
              <Link to="/teacher/dashboard" className="text-slate-600 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <button 
                onClick={() => { onLogout(); navigate('/'); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Αποσύνδεση
              </button>
            </div>
          ) : (
            <Link 
              to="/teacher/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Είσοδος Καθηγητή
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
