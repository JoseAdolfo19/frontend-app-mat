import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaSave, FaGoogle } from 'react-icons/fa';
import Loading from '../Common/Loading';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch
  } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.getProfile();
      const data = response.data?.user || response.data || null;
      setProfile(data);
      if (data) {
        resetProfile({
          full_name: data.full_name || '',
          email: data.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const onSaveProfile = async (data) => {
    try {
      setSaving(true);
      await authApi.updateProfile(data);
      toast.success('Perfil actualizado exitosamente');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    if (data.new_password !== data.new_password_confirmation) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    try {
      setChangingPassword(true);
      await authApi.changePassword(data);
      toast.success('Contraseña actualizada exitosamente');
      resetPassword();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <Loading />;

  const isGoogleAccount = profile?.provider === 'google';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[var(--on-surface)]">Mi Perfil</h2>
        <p className="text-[var(--on-surface-variant)]">
          Administra tu información personal y seguridad de cuenta
        </p>
      </div>

      {/* Avatar + info básica */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)] flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-3xl font-bold text-[var(--primary)]">
          {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--on-surface)]">{profile?.full_name || 'Usuario'}</h3>
          <p className="text-[var(--on-surface-variant)]">{profile?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)]">
            {profile?.role?.name?.toUpperCase() || 'SIN ROL'}
          </span>
          {isGoogleAccount && (
            <span className="inline-flex items-center gap-1 ml-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              <FaGoogle className="w-3 h-3" /> Cuenta de Google
            </span>
          )}
        </div>
      </div>

      {/* Editar información */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">Información Personal</h3>
        <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              <FaUser className="inline mr-2" />
              Nombre completo
            </label>
            <input
              type="text"
              {...registerProfile('full_name', { required: true })}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              <FaEnvelope className="inline mr-2" />
              Correo electrónico
            </label>
            <input
              type="email"
              {...registerProfile('email', { required: true })}
              disabled={isGoogleAccount}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] disabled:opacity-60"
            />
            {isGoogleAccount && (
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                El correo de cuentas de Google no se puede editar aquí
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Cambiar contraseña (no aplica a cuentas de Google) */}
      {!isGoogleAccount && (
        <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">Cambiar Contraseña</h3>
          <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                <FaLock className="inline mr-2" />
                Contraseña actual
              </label>
              <input
                type="password"
                {...registerPassword('current_password', { required: true })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                {...registerPassword('new_password', { required: true, minLength: 8 })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                {...registerPassword('new_password_confirmation', { required: true })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-3 bg-[var(--secondary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FaLock />
              {changingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;