import { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function BugFeatureBarWidget({ activeRequests, resolvedRequests }) {
  // Count bugs and features
  const totalBugs = (activeRequests || []).filter(r => r.type === 'bug').length + (resolvedRequests || []).filter(r => r.type === 'bug').length;
  const totalFeatures = (activeRequests || []).filter(r => r.type === 'feature').length + (resolvedRequests || []).filter(r => r.type === 'feature').length;

  const chartData = [
    { name: 'Bugs', count: totalBugs },
    { name: 'Features', count: totalFeatures }
  ];

  return (
    <Paper elevation={3} sx={{
      p: 3,
      minWidth: 320,
      maxWidth: 500,
      width: 400,
      minHeight: 220,
      maxHeight: 300,
      height: 240,
      bgcolor: 'background.paper',
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s',
      '&:hover': {
        bgcolor: 'rgba(255, 0, 208, 1)', // blue with low opacity
      },
    }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', letterSpacing: 0.5, textAlign: 'center' }}>Bug & Feature Requests</Typography>
      <Box width="100%" height={120}>
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
    </Paper>
  );
}
