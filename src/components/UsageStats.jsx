const API_BASE = import.meta.env.PROD
  ? 'https://content-generation-webapp-server.onrender.com/api'
  : '/api';
import { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function UsageStats({ token }) {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchUsage = () => {
    setLoading(true);
    fetch(`${API_BASE}/content/usage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsage(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsage();
  }, [token]);

  // Filter by month/year
  const filtered = usage.filter(u => u.month === month && u.year === year);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228' }}>
        Usage Statistics
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl>
          <InputLabel>Month</InputLabel>
          <Select value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Year</InputLabel>
          <Select value={year} onChange={e => setYear(e.target.value)}>
            {Array.from({ length: 5 }, (_, i) => (
              <MenuItem key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper elevation={2} sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
          <List>
            {filtered.length === 0 ? (
              <ListItem><ListItemText primary="No usage data for this period." /></ListItem>
            ) : filtered.map((u, index) => (
              <ListItem key={index} sx={{ borderBottom: '1px solid', borderColor: 'secondary.light' }}>
                <ListItemText
                  primary={`${u.user} (${u.email})`}
                  secondary={`Generations: ${u.totalGenerations}, Regenerations: ${u.totalRegenerations}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
