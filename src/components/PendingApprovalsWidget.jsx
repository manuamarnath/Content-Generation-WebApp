import { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress, List, ListItem, ListItemText, Button, Box, Badge, Avatar } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

export default function PendingApprovalsWidget({ token, onApproved }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setPending(Array.isArray(data) ? data.filter(u => !u.approved) : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load pending users');
        setLoading(false);
      });
  }, [token]);

  const handleApprove = async (id) => {
    const res = await fetch('/api/auth/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: id })
    });
    if (res.ok) {
      setPending(pending.filter(u => u._id !== id));
      if (onApproved) onApproved(id);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, minWidth: 320, maxWidth: 500, width: 400, minHeight: 300, maxHeight: 400, height: 340, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={1}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72, mb: 1 }}>
          <HourglassEmptyIcon sx={{ fontSize: 48, color: 'primary.contrastText' }} />
        </Avatar>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', letterSpacing: 0.5, textAlign: 'center' }}>Pending User Approvals</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : pending.length === 0 ? (
        <Typography color="text.secondary">No pending users.</Typography>
      ) : (
        <List sx={{ width: '100%' }}>
          {pending.map(user => (
            <ListItem key={user._id} secondaryAction={
              <Button variant="contained" color="success" size="small" onClick={() => handleApprove(user._id)}>
                Approve
              </Button>
            }>
              <ListItemText
                primary={<Box><Typography fontWeight={700}>{user.name}</Typography><Typography variant="body2" color="text.secondary">{user.email}</Typography></Box>}
                secondary={<Typography variant="caption" color="text.secondary">Requested on {user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
