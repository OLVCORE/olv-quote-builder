import React from 'react';
import { FaGoogle, FaFacebook, FaLinkedin } from 'react-icons/fa';

interface Props {
  provider: 'google' | 'facebook' | 'linkedin';
  onClick: () => void;
  disabled?: boolean;
}

export default function SocialButton({ provider, onClick, disabled = false }: Props) {
  const getIcon = () => {
    switch (provider) {
      case 'google':
        return <FaGoogle className="text-red-500" size={18} />;
      case 'facebook':
        return <FaFacebook className="text-blue-600" size={18} />;
      case 'linkedin':
        return <FaLinkedin className="text-blue-700" size={18} />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'facebook':
        return 'Facebook';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return provider;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {getIcon()}
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {getLabel()}
      </span>
    </button>
  );
} 