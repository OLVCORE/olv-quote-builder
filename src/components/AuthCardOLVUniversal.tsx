"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();
import { FaGoogle, FaFacebook, FaLinkedin, FaTimes, FaEye, FaEyeSlash, FaUser, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLock } from 'react-icons/fa';

interface Props {
  mode: 'login' | 'signup';
  onModeChange: (m: 'login' | 'signup') => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function AuthCardOLVUniversal({ mode, onModeChange, onClose, isOpen }: Props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    city: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value });
    setError(null); // Limpa erro ao digitar
  };

  async function handleSubmit() {
    setError(null);
    
    if (mode === 'signup') {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
      if (form.password !== form.confirm) {
        setError('As senhas devem coincidir');
        return;
      }
      if (form.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
      
      setLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              first_name: form.firstName,
              last_name: form.lastName,
              company: form.company,
              city: form.city,
              phone: form.phone,
            },
          },
        });
        
        if (error) {
          setError(error.message);
        } else {
          setError('Verifique seu email para confirmar a conta!');
          setTimeout(() => onClose(), 3000);
        }
      } catch (err) {
        setError('Erro ao criar conta. Tente novamente.');
      }
      setLoading(false);
    } else {
      // login
      if (!form.email || !form.password) {
        setError('Informe email e senha');
        return;
      }
      
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: form.email, 
          password: form.password 
        });
        
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } catch (err) {
        setError('Erro ao fazer login. Tente novamente.');
      }
      setLoading(false);
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'linkedin') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/admin/simulator`
        }
      });
      
      if (error) {
        setError(`Login com ${provider} indisponível no momento`);
      }
    } catch (err) {
      setError(`Erro no login com ${provider}`);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError('Informe seu email para recuperar a senha');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}/admin/simulator`
      });
      
      if (error) {
        setError(error.message);
      } else {
        setError('Email de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (err) {
      setError('Erro ao enviar email de recuperação');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Card */}
        <div 
          className="relative bg-white dark:bg-slate-800 border-2 border-ourovelho shadow-2xl rounded-2xl overflow-hidden w-full max-w-5xl max-h-[90vh] grid grid-cols-1 lg:grid-cols-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-ourovelho hover:bg-ourovelho-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          >
            <FaTimes size={16} />
          </button>

          {/* Formulário Institucional */}
          <div className="p-8 lg:p-10 flex flex-col justify-center space-y-6 text-slate-700 dark:text-slate-200">
            {/* Header */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-olvblue to-blue-800 rounded-lg">
                  <FaUser className="text-2xl text-ourovelho" />
                </div>
                <h1 className="text-3xl font-bold text-olvblue dark:text-ourovelho">
                  {mode === 'login' ? 'Bem-vindo!' : 'Criar Conta'}
                </h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {mode === 'login' ? 'Que bom ter você aqui' : 'Junte-se ao ecossistema OLV'}
              </p>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Formulário */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {mode === 'signup' && (
                <>
                  {/* Nome e Sobrenome */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="Nome"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                        value={form.firstName}
                        onChange={handleChange('firstName')}
                      />
                    </div>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="Sobrenome"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                        value={form.lastName}
                        onChange={handleChange('lastName')}
                      />
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Empresa"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                      value={form.company}
                      onChange={handleChange('company')}
                    />
                  </div>

                  {/* Cidade e Telefone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="Cidade"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                        value={form.city}
                        onChange={handleChange('city')}
                      />
                    </div>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="tel"
                        placeholder="Telefone"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                        value={form.phone}
                        onChange={handleChange('phone')}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="email"
                  placeholder="E-mail"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                  value={form.email}
                  onChange={handleChange('email')}
                />
              </div>

              {/* Senha */}
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                  value={form.password}
                  onChange={handleChange('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>

              {/* Confirmar Senha (Signup) */}
              {mode === 'signup' && (
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmar senha"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                    value={form.confirm}
                    onChange={handleChange('confirm')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              )}

              {/* Esqueceu a senha (Login) */}
              {mode === 'login' && (
                <div className="text-right">
                  <button 
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}

              {/* Botão Principal */}
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="w-full py-3 rounded-xl bg-gradient-to-r from-ourovelho to-ourovelho-dark text-white font-bold hover:from-ourovelho-dark hover:to-ourovelho shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Aguarde...
                  </div>
                ) : (
                  mode === 'login' ? 'Entrar' : 'Criar Conta'
                )}
              </button>
            </div>

            {/* Divisor Social */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Ou continuar com
                </span>
              </div>
            </div>

            {/* Botões Sociais */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105 disabled:opacity-60"
              >
                <FaGoogle className="text-red-500" size={18} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Google</span>
              </button>
              
              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105 disabled:opacity-60"
              >
                <FaFacebook className="text-blue-600" size={18} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Facebook</span>
              </button>
              
              <button
                onClick={() => handleSocialLogin('linkedin')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105 disabled:opacity-60"
              >
                <FaLinkedin className="text-blue-700" size={18} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">LinkedIn</span>
              </button>
            </div>

            {/* Alternar Modo */}
            <div className="text-center text-sm text-slate-600 dark:text-slate-300">
              {mode === 'login' ? (
                <>
                  Ainda não tem conta?{' '}
                  <button 
                    onClick={() => onModeChange('signup')} 
                    className="text-ourovelho hover:text-ourovelho-dark font-semibold hover:underline"
                  >
                    Criar conta
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <button 
                    onClick={() => onModeChange('login')} 
                    className="text-ourovelho hover:text-ourovelho-dark font-semibold hover:underline"
                  >
                    Entrar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Banner Institucional */}
          <div className="hidden lg:block relative bg-gradient-to-br from-olvblue via-blue-800 to-olvblue overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-ourovelho/20 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-center items-center text-white p-8 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-ourovelho/20 rounded-full flex items-center justify-center mb-4">
                  <FaUser className="text-4xl text-ourovelho" />
                </div>
                <h2 className="text-3xl font-bold mb-2">OLV Internacional</h2>
                <p className="text-ourovelho/90 text-lg">Ecosystem de Comércio Exterior</p>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-ourovelho rounded-full"></div>
                  <span>Simulador Inteligente</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-ourovelho rounded-full"></div>
                  <span>Consultoria Especializada</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-ourovelho rounded-full"></div>
                  <span>Logística Internacional</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-ourovelho rounded-full"></div>
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 