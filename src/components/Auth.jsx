import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';

export default function Auth({ setUser }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .MuiAppBar-root,
      .MuiToolbar-root {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('error');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Use full backend URL in production, relative in dev
  const API_BASE = import.meta.env.PROD
    ? 'https://content-generation-webapp-server.onrender.com/api'
    : '/api';

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    if (isForgotPassword) {
      if (!form.email) {
        setMessage('Please enter your email');
        setSeverity('error');
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email })
        });
        
        const data = await res.json();
        setLoading(false);
        
        if (res.ok) {
          setMessage(data.message);
          setSeverity('success');
        } else {
          setMessage(data.message || 'Error sending reset link');
          setSeverity('error');
        }
      } catch (err) {
        setMessage('Network error');
        setSeverity('error');
        setLoading(false);
      }
      return;
    }
    
    const url = `${API_BASE}/auth/${isRegister ? 'register' : 'login'}`;
    const body = isRegister ? form : { email: form.email, password: form.password };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      let data;
      try {
        data = await res.json();
      } catch (err) {
        setLoading(false);
        return setMessage('Server error: Invalid response');
      }
      setLoading(false);
      if (!res.ok) {
        setSeverity('error');
        return setMessage(data.message || 'Error');
      }
      if (isRegister) {
        setMessage('Registered! Awaiting admin approval.');
        setSeverity('info');
        return;
      }
      setUser({ ...data.user, token: data.token });
    } catch (err) {
      setLoading(false);
      setMessage('Network error');
      setSeverity('error');
    }
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="auto" height="auto" bgcolor="background.default" sx={{ overflow: 'hidden' }}>
      <img src="/mainlogo.png" alt="Logo" style={{ paddingBottom:50, width: 420, maxHeight:250, maxWidth: '90%', margin: '2px 0 2px 0', display: 'block' }} />
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
        <Typography variant="h6" mb={2} sx={{ color: '#f15a24', fontWeight: 700, textAlign: 'center', letterSpacing: 0.5 }}>
          {isForgotPassword ? 'Forgot Password' : isRegister ? 'Register' : 'Login'}
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {isRegister && !isForgotPassword && (
            <TextField name="name" label="Name" value={form.name} onChange={handleChange} fullWidth margin="normal" required
              InputLabelProps={{ style: { color: '#cbd5e1' } }}
              InputProps={{ style: { color: '#fff', background: '#222a', borderRadius: 8 } }}
            />
          )}
          <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required
            InputLabelProps={{ style: { color: '#cbd5e1' } }}
            InputProps={{ style: { color: '#fff', background: '#222a', borderRadius: 8 } }}
          />
          {!isForgotPassword && (
            <TextField name="password" label="Password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required
              InputLabelProps={{ style: { color: '#cbd5e1' } }}
              InputProps={{ style: { color: '#fff', background: '#222a', borderRadius: 8 } }}
            />
          )}
          {!isRegister && !isForgotPassword && (
            <Box sx={{ width: '100%', textAlign: 'right', mt: 1 }}>
              <Button 
                onClick={() => {
                  setIsForgotPassword(true);
                  setMessage('');
                  setForm({ ...form, password: '' });
                }} 
                sx={{ 
                  fontSize: 14, 
                  color: '#cbd5e1', 
                  textTransform: 'none', 
                  '&:hover': { color: '#f15a24' }
                }}
              >
                Forgot Password?
              </Button>
            </Box>
          )}
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading}
            sx={{ 
              mt: 2, 
              fontWeight: 700, 
              fontSize: 18, 
              borderRadius: 2, 
              py: 1.2, 
              bgcolor: '#f15a24', 
              color: 'primary.contrastText', 
              '&:hover': { 
                bgcolor: '#c94c1c', 
                color: 'primary.contrastText' 
              } 
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isForgotPassword ? 'Send Reset Link' : isRegister ? 'Register' : 'Login'
            )}
          </Button>
        </form>
        
        {isForgotPassword ? (
          <Button 
            onClick={() => { 
              setIsForgotPassword(false); 
              setMessage(''); 
            }} 
            fullWidth 
            sx={{ 
              mt: 2, 
              color: '#f15a24', 
              fontWeight: 700, 
              textTransform: 'none', 
              fontSize: 16, 
              '&:hover': { color: '#c94c1c' } 
            }}
          >
            Back to Login
          </Button>
        ) : (
          <Button 
            onClick={() => { 
              setIsRegister(r => !r); 
              setMessage(''); 
            }} 
            fullWidth 
            sx={{ 
              mt: 2, 
              color: '#f15a24', 
              fontWeight: 700, 
              textTransform: 'none', 
              fontSize: 16, 
              '&:hover': { color: '#c94c1c' } 
            }}
          >
            {isRegister ? 'Have an account? Login' : 'No account? Register'}
          </Button>
        )}
        
        {message && (
          <Alert 
            severity={severity} 
            sx={{ 
              mt: 2, 
              fontWeight: 600, 
              borderRadius: 2,
              width: '100%'
            }}
          >
            {message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
