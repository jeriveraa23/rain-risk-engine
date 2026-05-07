import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AlertTriangle, TrendingUp, Droplets } from 'lucide-react';
import './Risk.css';

export const Risk = () => {
const [current, setCurrent] = useState(null);
const [history, setHistory] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchData = async () => {
    try {
        const [curRes, histRes] = await Promise.all([
        fetch('http://localhost:8000/api/risk/current'),
        fetch('http://localhost:8000/api/risk/history'),
        ]);
        if (curRes.ok) setCurrent(await curRes.json());
        if (histRes.ok) setHistory(await histRes.json());
    } catch (err) {
        console.error('Error fetching risk:', err);
    } finally {
        setLoading(false);
    }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
}, []);

const getBadgeClass = (level) => {
    if (!level) return '';
    switch (level.toLowerCase()) {
    case 'alto': return 'badge-danger';
    case 'medio': return 'badge-warning';
    default: return 'badge-success';
    }
};

return (
    <div className="page-container">
    <div className="dashboard-header">
        <div>
        <h1>Riesgo</h1>
        <p className="text-muted">Nivel de riesgo actual e histórico</p>
        </div>
    </div>

    <div className="metrics-grid">
        <Card className="metric-card">
        <div className="metric-header">
            <h3 className="metric-title">Nivel de Riesgo</h3>
            <div className="metric-icon"><AlertTriangle size={24} /></div>
        </div>
        <div className="metric-value">
            {current
            ? <span className={`badge ${getBadgeClass(current.nivel_riesgo)}`}>{current.nivel_riesgo}</span>
            : '—'}
        </div>
        <p className="metric-trend text-muted">
            <TrendingUp size={16} /> Score: {current ? parseFloat(current.riesgo_score).toFixed(0) : '—'}%
        </p>
        </Card>

        <Card className="metric-card">
        <div className="metric-header">
            <h3 className="metric-title">Nivel de Lluvia</h3>
            <div className="metric-icon"><Droplets size={24} /></div>
        </div>
        <div className="metric-value">{current ? `${current.nivel_lluvia}` : '—'}</div>
        <p className="metric-trend text-muted">
            Última evaluación: {current ? new Date(current.evaluated_at).toLocaleString('es-ES') : '—'}
        </p>
        </Card>
    </div>

    <Card title="Histórico de Riesgo">
        <div className="table-responsive">
        <table className="risk-table">
            <thead>
            <tr>
                <th>Fecha y hora</th>
                <th>Nivel</th>
                <th>Score</th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
                <tr><td colSpan="3" className="text-center">Cargando...</td></tr>
            ) : history.length === 0 ? (
                <tr><td colSpan="3" className="text-center">No hay datos disponibles.</td></tr>
            ) : (
                history.map((item, i) => (
                <tr key={i}>
                    <td>{new Date(item.evaluated_at).toLocaleString('es-ES')}</td>
                    <td><span className={`badge ${getBadgeClass(item.nivel_riesgo)}`}>{item.nivel_riesgo}</span></td>
                    <td>{(item.riesgo_score * 100).toFixed(0)}%</td>
                </tr>
                ))
            )}
            </tbody>
        </table>
        </div>
    </Card>
    </div>
);
};