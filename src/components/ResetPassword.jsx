import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

// Define API_BASE to match the backend API URL
const API_BASE = import.meta.env.PROD
  ? 'https://content-generation-webapp-server.onrender.com/api'
  : '/api';

// Log current environment and API_BASE for debugging
console.log(`Environment: ${import.meta.env.MODE}, API_BASE: ${API_BASE}`);

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Add the style to hide the AppBar for this page
    const style = document.createElement('style');
    style.innerHTML = `
      .MuiAppBar-root,
      .MuiToolbar-root {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Log URL parameters for debugging
    console.log('Current URL:', window.location.href);
    console.log('Token from params:', token);
    
    // Verify token presence
    if (!token) {
      setTokenValid(false);
      setMessage('Invalid reset link. Token is missing.');
      setSeverity('error');
    } else {
      console.log(`Reset password page loaded with token: ${token.substring(0, 10)}...`);
      
      // Check token validity against backend (optional)
      fetch(`${API_BASE}/auth/verify-token/${token}`)
        .then(res => res.json())
        .then(data => {
          if (!data.valid) {
            setTokenValid(false);
            setMessage('This reset link is invalid or has expired.');
            setSeverity('error');
          }
        })
        .catch(err => {
          console.error('Error verifying token:', err);
        });
    }
    
    return () => {
      document.head.removeChild(style);
    };
  }, [token, API_BASE]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Validate passwords
    if (!password || !confirmPassword) {
      setMessage('Please enter and confirm your new password');
      setSeverity('error');
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setSeverity('error');
      return;
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setSeverity('error');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Submitting password reset with token: ${token.substring(0, 10)}...`);
      
      const resetUrl = `${API_BASE}/auth/reset-password/${token}`;
      console.log(`API endpoint: ${resetUrl}`);
      
      const res = await fetch(resetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password })
      });
      
      const data = await res.json();
      console.log('Response received:', data);
      setLoading(false);
      
      if (res.ok) {
        setSeverity('success');
        setMessage('Password has been reset successfully. You will be redirected to login...');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setSeverity('error');
        setMessage(data.message || 'Failed to reset password');
        console.error('Reset failed:', data.message);
        
        if (data.message === 'Invalid or expired token') {
          setTokenValid(false);
        }
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setLoading(false);
      setSeverity('error');
      setMessage('Network error. Please try again.');
    }
  };
  
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
      <img src="/mainlogo.png" alt="Logo" style={{ width: 220, maxWidth: '90%', margin: '20px 0' }} />
      <Paper elevation={6} sx={{
        p: 4,
        width: 380,
        maxWidth: '90%',
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: 8,
        color: 'text.primary',
      }}>
        <Typography variant="h5" mb={3} sx={{ color: '#f15a24', fontWeight: 700, textAlign: 'center' }}>
          Reset Password
        </Typography>
        
        {!tokenValid ? (
          <Box textAlign="center">
            <Alert severity="error" sx={{ mb: 2 }}>
              This reset link is invalid or has expired.
            </Alert>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                mt: 2,
                fontWeight: 700,
                bgcolor: '#f15a24',
                color: 'white',
                '&:hover': { bgcolor: '#c94c1c' },
              }}
            >
              Return to Login
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ style: { color: '#cbd5e1' } }}
              InputProps={{ style: { color: '#fff', background: '#222a', borderRadius: 8 } }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ style: { color: '#cbd5e1' } }}
              InputProps={{ style: { color: '#fff', background: '#222a', borderRadius: 8 } }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                fontWeight: 700,
                fontSize: 16,
                py: 1.5,
                borderRadius: 2,
                bgcolor: '#f15a24',
                color: 'white',
                '&:hover': { bgcolor: '#c94c1c' },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              fullWidth
              sx={{
                mt: 2,
                color: '#f15a24',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: 14,
                '&:hover': { color: '#c94c1c' },
              }}
            >
              Back to Login
            </Button>
          </form>
        )}
        
        {message && (
          <Alert severity={severity} sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}>
            {message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
