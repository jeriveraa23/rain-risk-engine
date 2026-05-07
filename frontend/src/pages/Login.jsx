import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Lock, Mail } from 'lucide-react';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Use mock login for now
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="logo-circle">
            <Droplets size={32} className="logo-icon-large" />
          </div>
          <h1>Bienvenido a Alerto</h1>
          <p className="text-muted">Ingresa tus credenciales para continuar</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo Electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                id="email"
                type="email" 
                className="form-input with-icon" 
                placeholder="usuario@alerto.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                id="password"
                type="password" 
                className="form-input with-icon" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Recordarme
            </label>
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>
          
          <button type="submit" className="btn-primary login-btn">
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};
