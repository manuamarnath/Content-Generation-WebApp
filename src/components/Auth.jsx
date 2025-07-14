import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';

export default function Auth({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    const url = `/api/auth/${isRegister ? 'register' : 'login'}`;
    const body = isRegister ? form : { email: form.email, password: form.password };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.message || 'Error');
    if (isRegister) return setMessage('Registered! Awaiting admin approval.');
    setUser({ ...data.user, token: data.token });
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" height="100vh" bgcolor="background.default" sx={{ overflow: 'hidden' }}>
      <Paper elevation={6} sx={{
        p: { xs: 2, sm: 4 },
        minWidth: 340,
        width: 380,
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: 8,
        color: 'text.primary',
        mx: 2,
        maxHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Typography variant="h4" mb={2} sx={{ color: '#ffffff', fontWeight: 900, letterSpacing: 1, textAlign: 'center' }}>
          Echo5Digital Content Generator
        </Typography>
        <Typography variant="h6" mb={2} sx={{ color: '#38bdf8', fontWeight: 700, textAlign: 'center', letterSpacing: 0.5 }}>
          {isRegister ? 'Register' : 'Login'}
        </Typography>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <TextField name="name" label="Name" value={form.name} onChange={handleChange} fullWidth margin="normal" required
              InputLabelProps={{ style: { color: '#cbd5e1' } }}
              InputProps={{ style: { color: '#fff', background: '#222a', borderRadius: 8 } }}
            />
          )}
          <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required
            InputLabelProps={{ style: { color: '#cbd5e1' } }}
            InputProps={{ style: { color: '#fff', background: '#222a', borderRadius: 8 } }}
          />
          <TextField name="password" label="Password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required
            InputLabelProps={{ style: { color: '#cbd5e1' } }}
            InputProps={{ style: { color: '#fff', background: '#222a', borderRadius: 8 } }}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, fontWeight: 700, fontSize: 18, borderRadius: 2, py: 1.2, bgcolor: '#38bdf8', color: 'primary.contrastText', '&:hover': { bgcolor: '#0ea5e9', color: 'primary.contrastText' } }}>
            {isRegister ? 'Register' : 'Login'}
          </Button>
        </form>
        <Button onClick={() => { setIsRegister(r => !r); setMessage(''); }} fullWidth sx={{ mt: 2, color: '#38bdf8', fontWeight: 700, textTransform: 'none', fontSize: 16 }}>
          {isRegister ? 'Have an account? Login' : 'No account? Register'}
        </Button>
        {message && <Alert severity={isRegister ? 'info' : 'error'} sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}>{message}</Alert>}
      </Paper>
    </Box>
  );
}
