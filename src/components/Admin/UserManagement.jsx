import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useLanguage } from '../../contexts/LanguageContext';
import { toArray } from '../../utils/helpers';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { t } = useLanguage();

  const up = (key) => t(`admin.usersPage.${key}`);

  const userSchema = yup.object().shape({
    full_name: yup.string().required(up('nameFull') + ' es requerido'),
    email: yup.string().email('Email inválido').required('Email es requerido'),
    password: yup.string().min(8, 'Mínimo 8 caracteres'),
    role: yup.string().required(up('role') + ' es requerido'),
    institution: yup.string().nullable(),
    grade: yup.string().nullable()
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(userSchema)
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setUsers(toArray(response.data?.data));
    } catch (error) {
      toast.error(up('errorLoad'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await axios.put(`/admin/users/${editingUser.id}`, data);
        toast.success(up('successUpdate'));
      } else {
        await axios.post('/admin/users', data);
        toast.success(up('successCreate'));
      }
      setShowModal(false);
      reset();
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || up('errorSave'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(up('confirmDelete'))) return;
    
    try {
      await axios.delete(`/admin/users/${id}`);
      toast.success(up('successDelete'));
      fetchUsers();
    } catch (error) {
      toast.error(up('errorDelete'));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await axios.post(`/admin/users/${id}/deactivate`);
        toast.success(up('deactivated'));
      } else {
        await axios.post(`/admin/users/${id}/activate`);
        toast.success(up('activated'));
      }
      fetchUsers();
    } catch (error) {
      toast.error(up('errorStatus'));
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    reset({
      full_name: user.full_name,
      email: user.email,
      role: user.role?.name || 'student',
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
      case 'parent': return 'bg-purple-500';
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-[var(--on-surface)]">
            {up('title')}
          </h3>
          <p className="text-[var(--on-surface-variant)]">
            {up('subtitle')}
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
          {up('addUser')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
          <p className="text-sm text-[var(--on-surface-variant)]">{up('totalUsers')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{users.length}</p>
        </div>
        <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
          <p className="text-sm text-[var(--on-surface-variant)]">{up('students')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {users.filter(u => u.role?.name === 'student').length}
          </p>
        </div>
        <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
          <p className="text-sm text-[var(--on-surface-variant)]">{up('teachers')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {users.filter(u => u.role?.name === 'teacher').length}
          </p>
        </div>
        <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
          <p className="text-sm text-[var(--on-surface-variant)]">{up('admins')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {users.filter(u => u.role?.name === 'admin').length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--surface-container-low)]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">
                {up('user')}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">
                {up('email')}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">
                {up('role')}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">
                {up('status')}
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--on-surface-variant)]">
                {up('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-container)]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[var(--surface-container-low)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold">
                      {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--on-surface)]">{user.full_name || up('sinNombre')}</p>
                      <p className="text-sm text-[var(--on-surface-variant)]">ID: {user.id?.slice(0, 8) || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--on-surface)]">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getRoleBadgeColor(user.role?.name)}`}>
                    {user.role?.name?.toUpperCase() || up('sinRol')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.is_active ? up('active') : up('inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={`p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors ${
                        user.is_active ? 'text-red-500' : 'text-green-500'
                      }`}
                      title={user.is_active ? up('deactivate') : up('activate')}
                    >
                      {user.is_active ? <FaTimes /> : <FaCheck />}
                    </button>
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] text-[var(--primary)] transition-colors"
                      title={up('edit')}
                    >
                      <FaEdit />
                    </button>
                    {user.role?.name !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] text-red-500 transition-colors"
                        title={up('delete')}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label={editingUser ? up('editUser') : up('newUser')}>
          <div className="bg-[var(--surface)] rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-6">
              {editingUser ? up('editUser') : up('newUser')}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="admin-user-name" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  {up('nameFull')}
                </label>
                <input
                  id="admin-user-name"
                  type="text"
                  {...register('full_name')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-lowest)]"
                />
                {errors.full_name && (
                  <p className="text-sm text-[var(--error)] mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="admin-user-email" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  {up('email')}
                </label>
                <input
                  id="admin-user-email"
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
                  <label htmlFor="admin-user-password" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                    {up('password')}
                  </label>
                  <input
                    id="admin-user-password"
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
                <label htmlFor="admin-user-role" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  {up('role')}
                </label>
                <select
                  id="admin-user-role"
                  {...register('role')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-lowest)]"
                >
                  <option value="student">{up('roleStudent')}</option>
                  <option value="teacher">{up('roleTeacher')}</option>
                  <option value="admin">{up('roleAdmin')}</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-[var(--error)] mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="admin-user-institution" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  {up('institution')}
                </label>
                <input
                  id="admin-user-institution"
                  type="text"
                  {...register('institution')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-lowest)]"
                />
              </div>

              <div>
                <label htmlFor="admin-user-grade" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  {up('grade')}
                </label>
                <input
                  id="admin-user-grade"
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
                  {editingUser ? up('update') : up('create')}
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
                  {up('cancel')}
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
