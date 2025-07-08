import React from 'react';
import { useAuth } from '../AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

export const AuthButton: React.FC = () => {
  const { user, loading, openAuthModal, signOut } = useAuth();

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-ourovelho to-ourovelho-dark text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 opacity-60">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-gradient-to-r from-ourovelho to-ourovelho-dark text-white font-semibold px-4 py-2 rounded-lg">
          <FaUser size={14} />
          <span className="text-sm">
            {user.user_metadata?.first_name || user.email?.split('@')[0] || 'Usuário'}
          </span>
        </div>
        <button
          onClick={signOut}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105"
          title="Sair"
        >
          <FaSignOutAlt size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => openAuthModal('login')}
      className="bg-gradient-to-r from-ourovelho to-ourovelho-dark hover:from-ourovelho-dark hover:to-ourovelho text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
    >
      Entrar
    </button>
  );
};

export default AuthButton; 