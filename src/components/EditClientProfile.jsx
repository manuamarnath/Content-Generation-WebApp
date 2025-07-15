const API_BASE = import.meta.env.PROD
  ? 'https://content-generation-webapp-server.onrender.com/api'
  : '/api';
import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';

export default function EditClientProfile({ client, token, onUpdated, onCancel }) {
  const [form, setForm] = useState({ name: client.name, website: client.website, prompt: client.prompt });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    const res = await fetch(`${API_BASE}/clients/${client._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMessage('Updated!');
      onUpdated && onUpdated();
    } else {
      const data = await res.json();
      setMessage(data.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this client profile?')) return;
    const res = await fetch(`${API_BASE}/clients/${client._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setMessage('Deleted!');
      onUpdated && onUpdated();
    } else {
      const data = await res.json();
      setMessage(data.message || 'Error');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: '#fffbe6' }}>
      <Typography variant="subtitle1">Edit Client Profile</Typography>
      <form onSubmit={handleSubmit}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField name="name" label="Client Name" value={form.name} onChange={handleChange} required sx={{ flex: 1 }} />
          <TextField name="website" label="Website" value={form.website} onChange={handleChange} required sx={{ flex: 1 }} />
          <TextField name="prompt" label="Nature/Prompt" value={form.prompt} onChange={handleChange} sx={{ flex: 1 }} />
          <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>Update</Button>
          <Button type="button" onClick={handleDelete} color="error" variant="outlined" sx={{ minWidth: 120 }}>Delete</Button>
          <Button type="button" onClick={onCancel} sx={{ minWidth: 120 }}>Cancel</Button>
        </Box>
      </form>
      {message && <Alert severity={message.includes('Deleted') ? 'error' : 'success'} sx={{ mt: 1 }}>{message}</Alert>}
    </Paper>
  );
}
