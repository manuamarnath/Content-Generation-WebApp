const API_BASE = import.meta.env.PROD
  ? 'https://content-generation-webapp-server.onrender.com/api'
  : '/api';
import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';

export default function ChangePasswordForm({ user, notify, setUser, buttonProps }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    setLoading(false);
    if (res.ok) {
      setSuccess('Password changed successfully. Please log in again.');
      setTimeout(() => {
        setUser(null);
      }, 2000);
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to change password.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'background.paper', p: 3, borderRadius: 3, boxShadow: 4 }}>
      <TextField
        label="Current Password"
        type="password"
        value={oldPassword}
        onChange={e => setOldPassword(e.target.value)}
        required
        fullWidth
        InputLabelProps={{
          sx: {
            color: 'text.secondary',
            '&.Mui-focused': { color: 'primary.main' },
          },
        }}
        sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
      />
      <TextField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
        fullWidth
        InputLabelProps={{
          sx: {
            color: 'text.secondary',
            '&.Mui-focused': { color: 'primary.main' },
          },
        }}
        sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
      />
      <TextField
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
        fullWidth
        InputLabelProps={{
          sx: {
            color: 'text.secondary',
            '&.Mui-focused': { color: 'primary.main' },
          },
        }}
        sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
      />
      <Button type="submit" variant="contained" disabled={loading}
        {...(buttonProps || {})}
      >Change Password</Button>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
    </Box>
  );
}
