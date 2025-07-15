const API_BASE = import.meta.env.PROD
  ? 'https://content-generation-webapp-server.onrender.com/api'
  : '/api';

import { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ClientsUsersBarWidget({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/clients`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([clients, users]) => {
        setData({
          totalClients: Array.isArray(clients) ? clients.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          pendingUsers: Array.isArray(users) ? users.filter(u => !u.approved).length : 0
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, [token]);

  const chartData = data ? [
    { name: 'Total Clients', count: data.totalClients },
    { name: 'Total Users', count: data.totalUsers },
    { name: 'Pending Users', count: data.pendingUsers }
  ] : [];

  return (
    <Paper elevation={3} sx={{ p: 3, minWidth: 320, maxWidth: 500, width: 400, minHeight: 300, maxHeight: 400, height: 340, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', letterSpacing: 0.5, textAlign: 'center' }}>Clients & Users Overview</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box width="100%" height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 14 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1976d2" barSize={48} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
