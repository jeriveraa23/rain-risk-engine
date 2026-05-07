import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Save, Bell, Sliders } from 'lucide-react';
import './Configuration.css';

export const Configuration = () => {
  const [formData, setFormData] = useState({
    updateFrequency: '15',
    riskThreshold: '75',
    emailAlerts: true,
    smsAlerts: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate save
    alert('Configuración guardada exitosamente.');
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>Configuración del Sistema</h1>
          <p className="text-muted">Ajusta los parámetros de alertas y notificaciones</p>
        </div>
      </div>

      <div className="config-grid">
        <Card title="Parámetros del Motor de Lógica Difusa" className="config-card">
          <form onSubmit={handleSubmit} className="config-form">
            
            <div className="form-group">
              <label className="form-label" htmlFor="updateFrequency">
                Frecuencia de Actualización de Sensores (Minutos)
              </label>
              <select 
                id="updateFrequency" 
                name="updateFrequency" 
                className="form-input"
                value={formData.updateFrequency}
                onChange={handleChange}
              >
                <option value="5">5 minutos</option>
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="riskThreshold">
                Umbral de Alerta de Riesgo (%)
              </label>
              <div className="range-container">
                <input 
                  type="range" 
                  id="riskThreshold" 
                  name="riskThreshold" 
                  min="0" max="100" 
                  className="range-input"
                  value={formData.riskThreshold}
                  onChange={handleChange}
                />
                <span className="range-value">{formData.riskThreshold}%</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Canales de Notificación</label>
              
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  name="emailAlerts" 
                  checked={formData.emailAlerts}
                  onChange={handleChange}
                />
                <span className="slider round"></span>
                <span className="toggle-label"><Bell size={16}/> Correo Electrónico</span>
              </label>

              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  name="smsAlerts" 
                  checked={formData.smsAlerts}
                  onChange={handleChange}
                />
                <span className="slider round"></span>
                <span className="toggle-label"><Bell size={16}/> SMS</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          </form>
        </Card>

        <Card title="Estado del Sistema" className="config-card">
          <div className="system-status-list">
            <div className="status-item">
              <div className="status-info">
                <Sliders size={20} className="status-icon" />
                <div>
                  <h4 className="status-title">Motor de Inferencia</h4>
                  <p className="status-desc">Operando normalmente</p>
                </div>
              </div>
              <span className="badge badge-success">En línea</span>
            </div>
            
            <div className="status-item">
              <div className="status-info">
                <Bell size={20} className="status-icon" />
                <div>
                  <h4 className="status-title">Servicio de Notificaciones</h4>
                  <p className="status-desc">Último envío hace 2 hrs</p>
                </div>
              </div>
              <span className="badge badge-success">En línea</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
