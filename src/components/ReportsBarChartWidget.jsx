

import { Paper, Typography, Box } from '@mui/material';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

export default function ReportsBarChartWidget({ activeRequests, resolvedRequests }) {
  // Prepare data for the bar chart
  const data = [
    {
      name: 'Pending',
      Bugs: activeRequests.filter(r => r.type === 'bug').length,
      Features: activeRequests.filter(r => r.type === 'feature').length,
    },
    {
      name: 'Resolved',
      Bugs: resolvedRequests.filter(r => r.type === 'bug').length,
      Features: resolvedRequests.filter(r => r.type === 'feature').length,
    },
  ];



  return (
    <Paper elevation={3} sx={{ p: 3, minWidth: 320, maxWidth: 500, width: 400, minHeight: 300, maxHeight: 400, height: 340, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', letterSpacing: 0.5 }}>Requests Overview</Typography>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Bugs" fill="#d32f2f" name="Bugs" barSize={32} />
          <Bar dataKey="Features" fill="#1976d2" name="Features" barSize={32} />
        </BarChart>
      </ResponsiveContainer>
      {/* Removed total bugs and features count as requested */}
    </Paper>
  );
}
