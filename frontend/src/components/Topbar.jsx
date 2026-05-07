import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, User } from 'lucide-react';
import './Topbar.css';

export const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="page-title">Sistema de Monitoreo</h2>
      </div>
      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notificaciones">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="greeting">Hola, Administrador</span>
            <span className="role">Protección Civil</span>
          </div>
        </div>

        <button className="btn-outline logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};
