const API_BASE = import.meta.env.PROD
  ? 'https://content-generation-webapp-server.onrender.com/api'
  : '/api';

import { useState, useEffect } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

export default function UsageWidget({ token }) {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/content/usage?by=day`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setUsage(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load usage data');
        setLoading(false);
      });
  }, [token]);

  return (
    <Paper elevation={3} sx={{ p: 3, minWidth: 320, maxWidth: 500, width: 400, minHeight: 300, maxHeight: 400, height: 340, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', letterSpacing: 0.5 }}>Usage (Last 30 Days)</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : usage.length === 0 ? (
        <Typography color="text.secondary">No usage data found.</Typography>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={usage} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="generations" stroke="#1976d2" strokeWidth={3} name="Generations" />
            <Line type="monotone" dataKey="regenerations" stroke="#9c27b0" strokeWidth={3} name="Regenerations" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
