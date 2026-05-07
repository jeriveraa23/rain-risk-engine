import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import './Alerts.css';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/risk/history');
        if (res.ok) {
          const data = await res.json();
          // Filter out low risk if desired, or show all
          const formatted = data.map((item, index) => {
            const dateObj = new Date(item.evaluated_at);
            // Generar un número aleatorio de usuarios para el mockup
            const randomUsers = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
            return {
              id: index,
              riesgo: item.nivel_riesgo,
              fecha: dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
              hora: dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              usuarios: item.nivel_riesgo.toLowerCase() === 'bajo' ? 0 : randomUsers
            };
          });
          setAlerts(formatted);
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getRiskBadgeClass = (risk) => {
    switch (risk.toLowerCase()) {
      case 'alto': return 'badge-danger';
      case 'medio': return 'badge-warning';
      default: return 'badge-success';
    }
  };

  return (
    <div className="page-container">
      <Card className="alerts-card">
        <div className="alerts-header">
          <h2>Reporte de Alertas</h2>
        </div>
        <div className="table-responsive">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Riesgo</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Usuarios Alertados</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center">Cargando reportes...</td></tr>
              ) : alerts.length === 0 ? (
                <tr><td colSpan="4" className="text-center">No hay alertas registradas.</td></tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <span className={`badge ${getRiskBadgeClass(alert.riesgo)}`}>
                        {alert.riesgo}
                      </span>
                    </td>
                    <td>{alert.fecha}</td>
                    <td>{alert.hora}</td>
                    <td className="users-count">{alert.usuarios}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="alerts-footer">
          <span className="text-muted">Última actualización: {new Date().toLocaleString('es-ES')}</span>
        </div>
      </Card>
    </div>
  );
};
