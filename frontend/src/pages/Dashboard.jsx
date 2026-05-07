import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Droplets, Activity } from 'lucide-react';
import './Dashboard.css';

export const Dashboard = () => {
  const [currentRisk, setCurrentRisk] = useState(null);
  const [currentPrecipitation, setCurrentPrecipitation] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const riskRes = await fetch('http://localhost:8000/api/risk/current');
        if (riskRes.ok) setCurrentRisk(await riskRes.json());

        const precRes = await fetch('http://localhost:8000/api/precipitation/current');
        if (precRes.ok) setCurrentPrecipitation(await precRes.json());

        const histRes = await fetch('http://localhost:8000/api/risk/history');
        if (histRes.ok) {
          const histData = await histRes.json();
          // Transform for chart (assuming we want to chart riesgo_score)
          const formatted = histData.map(item => ({
            time: new Date(item.evaluated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            flow: parseFloat(item.riesgo_score) || 0
          })).reverse(); // Assuming history comes newest first, reverse to show oldest to newest
          setHistoryData(formatted);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Optional: Refresh every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fallback data if DB is empty
  const displayRiskScore = currentRisk ? (currentRisk.riesgo_score * 100).toFixed(0) : '0';
  const displayRiskLevel = currentRisk ? currentRisk.nivel_riesgo : 'Desconocido';
  const displayCaudal = currentPrecipitation ? currentPrecipitation.nivel_lluvia : (currentRisk ? currentRisk.nivel_lluvia : '0');
  
  const isDanger = displayRiskLevel.toLowerCase() === 'alto';
  const isWarning = displayRiskLevel.toLowerCase() === 'medio';

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>El Tablero</h1>
          <p className="text-muted">Monitoreo en tiempo real de niveles y caudales</p>
        </div>
        {(isDanger || isWarning) && (
          <div className={`status-badge ${isDanger ? 'danger-pulse' : 'warning-pulse'}`}>
            <AlertTriangle size={20} />
            <span>Alerta {displayRiskLevel} Activa</span>
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <Card className={`metric-card ${isDanger ? 'primary' : ''}`}>
          <div className="metric-header">
            <h3 className="metric-title">Nivel de Riesgo</h3>
            <div className="metric-icon"><AlertTriangle size={24} /></div>
          </div>
          <div className="metric-value">{displayRiskLevel} ({displayRiskScore}%)</div>
          <p className={`metric-trend ${isDanger ? 'danger' : (isWarning ? 'warning' : 'success')}`}>
            <TrendingUp size={16} /> Calculado recientemente
          </p>
        </Card>

        <Card className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Caudal / Lluvia Actual</h3>
            <div className="metric-icon"><Droplets size={24} /></div>
          </div>
          <div className="metric-value">{displayCaudal} mm/h</div>
          <p className="metric-trend text-muted">
            <Activity size={16} /> Última medición
          </p>
        </Card>

        <Card className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Sensores Activos</h3>
            <div className="metric-icon"><Activity size={24} /></div>
          </div>
          <div className="metric-value">24 / 24</div>
          <p className="metric-trend success">
            Todos operando normalmente
          </p>
        </Card>
      </div>

      <Card title="Histórico de Riesgo" className="chart-card">
        <div className="chart-container">
          {loading ? (
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>Cargando datos...</div>
          ) : historyData.length === 0 ? (
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%', color:'var(--text-muted)'}}>No hay datos históricos disponibles.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                  itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="flow" 
                  name="Puntaje de Riesgo"
                  stroke="var(--primary-color)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
};
