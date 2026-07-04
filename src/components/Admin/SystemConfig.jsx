import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import toast from 'react-hot-toast';
import { FaSave, FaDatabase, FaCloudUploadAlt, FaHistory } from 'react-icons/fa';
import Loading from '../Common/Loading';

const SystemConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    institution_name: '',
    primary_color: '#004AC6',
    secondary_color: '#006C49',
    logo: '',
    email_notifications: {},
    backup_frequency: 'daily'
  });
  const [periods, setPeriods] = useState([]);
  const [newPeriod, setNewPeriod] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    description: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const [configRes, periodsRes] = await Promise.all([
        adminApi.getConfig(),
        adminApi.getPeriods()
      ]);
      
      setConfig(configRes.data);
      setPeriods(periodsRes.data || []);
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handlePeriodChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPeriod(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      await adminApi.updateConfig(config);
      toast.success('Configuración actualizada exitosamente');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const createPeriod = async () => {
    try {
      await adminApi.createPeriod(newPeriod);
      toast.success('Período académico creado exitosamente');
      setNewPeriod({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false,
        description: ''
      });
      fetchConfig();
    } catch (error) {
      console.error('Error creating period:', error);
      toast.error('Error al crear el período académico');
    }
  };

  const deletePeriod = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este período académico?')) return;
    
    try {
      await adminApi.deletePeriod(id);
      toast.success('Período académico eliminado');
      fetchConfig();
    } catch (error) {
      console.error('Error deleting period:', error);
      toast.error('Error al eliminar el período');
    }
  };

  const createBackup = async () => {
    try {
      await adminApi.createBackup();
      toast.success('Copia de seguridad creada exitosamente');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Error al crear la copia de seguridad');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-[var(--on-surface)]">Configuración del Sistema</h2>

      {/* Configuración General */}
      <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">Configuración General</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Nombre de la Institución
            </label>
            <input
              type="text"
              name="institution_name"
              value={config.institution_name || ''}
              onChange={handleConfigChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Logo URL
            </label>
            <input
              type="text"
              name="logo"
              value={config.logo || ''}
              onChange={handleConfigChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              placeholder="URL del logo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Frecuencia de Backup
            </label>
            <select
              name="backup_frequency"
              value={config.backup_frequency || 'daily'}
              onChange={handleConfigChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            >
              <option value="hourly">Cada hora</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>

      {/* Períodos Académicos */}
      <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">Períodos Académicos</h3>
        
        {/* Crear nuevo período */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            name="name"
            value={newPeriod.name}
            onChange={handlePeriodChange}
            placeholder="Nombre del período"
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <input
            type="date"
            name="start_date"
            value={newPeriod.start_date}
            onChange={handlePeriodChange}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <input
            type="date"
            name="end_date"
            value={newPeriod.end_date}
            onChange={handlePeriodChange}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <button
            onClick={createPeriod}
            className="px-4 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Crear Período
          </button>
        </div>

        {/* Lista de períodos */}
        <div className="space-y-3">
          {periods.map((period) => (
            <div key={period.id} className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-xl">
              <div>
                <p className="font-medium text-[var(--on-surface)]">{period.name}</p>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  period.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {period.is_active ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={() => deletePeriod(period.id)}
                  className="text-[var(--error)] hover:bg-[var(--error)]/10 p-2 rounded-lg transition-colors"
                >
                  <FaDatabase className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup */}
      <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">Copias de Seguridad</h3>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={createBackup}
            className="px-6 py-3 bg-[var(--secondary)] text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
          >
            <FaCloudUploadAlt />
            Crear Backup
          </button>
          <button
            className="px-6 py-3 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-high)] transition-all flex items-center gap-2"
          >
            <FaHistory />
            Ver Historial
          </button>
        </div>
        
        <p className="mt-4 text-sm text-[var(--on-surface-variant)]">
          Último backup: {config.last_backup ? new Date(config.last_backup).toLocaleString() : 'No realizado'}
        </p>
      </div>
    </div>
  );
};

export default SystemConfig;