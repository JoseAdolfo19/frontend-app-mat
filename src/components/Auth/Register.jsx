import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaEye, FaEyeSlash } from 'react-icons/fa';

const schema = yup.object().shape({
  full_name: yup.string().required('Nombre completo es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().min(8, 'Mínimo 8 caracteres').required('Contraseña es requerida'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirmar contraseña es requerida'),
  role: yup.string().default('student'),
  academic_level: yup.string().when('role', {
    is: 'student',
    then: () => yup.string().required('Nivel académico es requerido')
  }),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'student' }
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await registerUser(data);
    setLoading(false);
    
    if (result.success) {
      toast.success('¡Registro exitoso! Bienvenido a MathFlow');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Registration Container - 2 Column Layout */}
        <div className="grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          
          {/* Left Side - Branding (Hidden on mobile) */}
          <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                  </svg>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">MathFlow</span>
              </div>
              
              <h1 className="text-white font-bold text-4xl mb-6 leading-tight">Tu camino al dominio matemático comienza aquí.</h1>
              <p className="text-white/90 font-medium max-w-md leading-relaxed">
                Únete a miles de estudiantes que transforman su relación con los números a través de aprendizaje interactivo y datos en tiempo real.
              </p>
            </div>

            {/* Testimonial Card */}
            <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-300 to-indigo-300"></div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Sofía Martínez</p>
                  <p className="text-blue-100 text-xs uppercase tracking-widest font-bold">Mentora Senior</p>
                </div>
              </div>
              <p className="text-white/80 italic font-medium text-sm leading-relaxed">
                "MathFlow no solo enseña fórmulas, enseña a pensar. La plataforma ideal para el siglo XXI."
              </p>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear cuenta</h2>
              <p className="text-gray-600 text-sm">Comienza a dominar las matemáticas hoy</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-blue-600" />
                  NOMBRE COMPLETO
                </label>
                <input
                  type="text"
                  {...register('full_name')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                  placeholder="Ej. Juan Pérez"
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.full_name.message}</p>
                )}
              </motion.div>

              {/* Email */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-blue-600" />
                  CORREO ELECTRÓNICO
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                  placeholder="nombre@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.email.message}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="inline mr-2 text-blue-600" />
                  CONTRASEÑA
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.password.message}</p>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="inline mr-2 text-blue-600" />
                  CONFIRMAR CONTRASEÑA
                </label>
                <input
                  type="password"
                  {...register('password_confirmation')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                  placeholder="Repite la contraseña"
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.password_confirmation.message}</p>
                )}
              </motion.div>

              {/* Role Selection */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaGraduationCap className="inline mr-2 text-blue-600" />
                  ¿QUÉ ERES?
                </label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all"
                >
                  <option value="student">Estudiante</option>
                  <option value="teacher">Docente</option>
                </select>
              </motion.div>

              {/* Academic Level (for students) */}
              {role === 'student' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="inline mr-2 w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.669 0-3.218.51-4.5 1.385A7.968 7.968 0 009 4.804z"/></svg>
                    NIVEL ACADÉMICO
                  </label>
                  <select
                    {...register('academic_level')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all"
                  >
                    <option value="">Selecciona tu nivel</option>
                    <option value="basic">Básico</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                  {errors.academic_level && (
                    <p className="text-sm text-red-500 mt-1 font-medium">{errors.academic_level.message}</p>
                  )}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-8 shadow-md"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </motion.button>
            </form>

            {/* Login Link */}
            <p className="text-center mt-6 text-gray-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 font-bold hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 text-xs text-gray-500"
        >
          Al registrarte aceptas nuestros <a href="#" className="underline hover:text-blue-600">Términos de Servicio</a> y <a href="#" className="underline hover:text-blue-600">Política de Privacidad</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;