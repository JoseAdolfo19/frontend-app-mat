import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const userSchema = yup.object().shape({
  full_name: yup.string().required('Nombre completo es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().min(8, 'Mínimo 8 caracteres'),
  role: yup.string().required('Rol es requerido'),
  institution: yup.string().nullable(),
  grade: yup.string().nullable()
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(userSchema)
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await axios.put(`/admin/users/${editingUser.id}`, data);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await axios.post('/admin/users', data);
        toast.success('Usuario creado exitosamente');
      }
      setShowModal(false);
      reset();
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await axios.delete(`/admin/users/${id}`);
      toast.success('Usuario eliminado exitosamente');
      fetchUsers();
    } catch (error) {
      toast.error('Error al eliminar usuario');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await axios.post(`/admin/users/${id}/deactivate`);
        toast.success('Usuario desactivado');
      } else {
        await axios.post(`/admin/users/${id}/activate`);
        toast.success('Usuario activado');
      }
      fetchUsers();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    reset({
      full_name: user.full_name,
      email: user.email,
      role: user.role.name,
      institution: user.institution || '',
      grade: user.grade || ''
    });
    setShowModal(true);
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-red-500';
      case 'teacher': return 'bg-blue-500';
      case 'student': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl p-8 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-[var(--on-surface)]">
            Gestión de Usuarios
          </h3>
          <p className="text-[var(--on-surface-variant)]">
            Administra todos los usuarios de la plataforma
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            reset({
              full_name: '',
              email: '',
              password: '',
              role: 'student',
              institution: '',
              grade: ''
            });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
        >
          <FaUserPlus />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
          <p className="text-sm text-[var(--on-surface-variant)]">Total Usuarios</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{users.length}</p>
        </div>
        <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
          <p className="text-sm text-[var(--on-surface-variant)]">Estudiantes</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {users.filter(u => u.role.name === 'student').length}
          </p>
        </div>
        <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
          <p className="text-sm text-[var(--on-surface-variant)]">Docentes</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {users.filter(u => u.role.name === 'teacher').length}
          </p>
        </div>
        <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
          <p className="text-sm text-[var(--on-surface-variant)]">Administradores</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {users.filter(u => u.role.name === 'admin').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--surface-container-low)]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--on-surface-variant)]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-container)]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[var(--surface-container-low)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--on-surface)]">{user.full_name}</p>
                      <p className="text-sm text-[var(--on-surface-variant)]">ID: {user.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--on-surface)]">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getRoleBadgeColor(user.role.name)}`}>
                    {user.role.name.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={`p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors ${
                        user.is_active ? 'text-red-500' : 'text-green-500'
                      }`}
                      title={user.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {user.is_active ? <FaTimes /> : <FaCheck />}
                    </button>
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] text-[var(--primary)] transition-colors"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    {user.role.name !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Creación/Edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-6">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  {...register('full_name')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-lowest)]"
                />
                {errors.full_name && (
                  <p className="text-sm text-[var(--error)] mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-lowest)]"
                />
                {errors.email && (
                  <p className="text-sm text-[var(--error)] mt-1">{errors.email.message}</p>
                )}
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-lowest)]"
                  />
                  {errors.password && (
                    <p className="text-sm text-[var(--error)] mt-1">{errors.password.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  Rol
                </label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-lowest)]"
                >
                  <option value="student">Estudiante</option>
                  <option value="teacher">Docente</option>
                  <option value="admin">Administrador</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-[var(--error)] mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  Institución
                </label>
                <input
                  type="text"
                  {...register('institution')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-lowest)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  Grado
                </label>
                <input
                  type="text"
                  {...register('grade')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-lowest)]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    reset();
                  }}
                  className="px-6 py-3 bg-[var(--surface-container-high)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-highest)] transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;