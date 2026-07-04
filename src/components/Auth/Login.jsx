import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().required('Contraseña es requerida'),
});

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);
    
    if (result.success) {
      toast.success('¡Bienvenido de vuelta!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-blue-600 mb-2 tracking-tight">MathFlow</h1>
          <p className="text-gray-600 font-medium">Impulsa tu aprendizaje matemático</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bienvenido de nuevo</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">CORREO ELECTRÓNICO</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                  placeholder="estudiante@mathflow.edu"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="block text-sm font-semibold text-gray-700">CONTRASEÑA</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
                  Olvidé mi contraseña
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  {...register('password')}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-8 shadow-md"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-gray-500 uppercase">O CONTINÚA CON</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Google Login */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-600 transition-all">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Error al iniciar sesión con Google')}
              useOneTap
              theme="filled_blue"
              shape="pill"
              text="continue_with"
            />
          </div>

          {/* Register Link */}
          <p className="text-center mt-6 text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link 
              to="/register" 
              className="text-blue-600 font-bold hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-gray-500">
          Al continuar aceptas nuestros <a href="#" className="underline hover:text-blue-600">Términos de Servicio</a> y <a href="#" className="underline hover:text-blue-600">Política de Privacidad</a>
        </p>
      </div>
    </div>
  );
};

export default Login;