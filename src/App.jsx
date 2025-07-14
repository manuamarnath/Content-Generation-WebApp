import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1e293b', contrastText: '#fff' }, // dark blue-gray
    secondary: { main: '#ff9800' },
    background: {
      default: '#1e293b',
      paper: '#1e293b',
    },
    text: {
      primary: '#fff',
      secondary: '#cbd5e1',
      disabled: '#64748b',
    },
    divider: '#334155',
  },
  shape: { borderRadius: 8 },
});

function App() {
  const [user, setUserState] = useState(null);

  // Persist user in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUserState(JSON.parse(stored));
  }, []);

  const setUser = u => {
    if (u) {
      setUserState(u);
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      setUserState(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'left' }}>
        <AppBar
          position="static"
          elevation={4}
          sx={{
            bgcolor: '#1e293b !important',
            color: 'primary.contrastText',
            minHeight: 56,
            boxShadow: 'none',
            borderBottom: '1.5px solid #222a',
            zIndex: 1201,
            borderRadius: { xs: 2, sm: 2, md: 2 },
            overflow: 'hidden',
            m: { xs: 1, sm: 2 },
            width: '98%',
            maxWidth: { xs: '100%', sm: 900, md: 1200 },
          }}
        >
          <Toolbar
            sx={{
              minHeight: 56,
              px: { xs: 2, sm: 4 },
              justifyContent: 'space-between',
              bgcolor: '#1e293b !important',
              boxShadow: 'none',
              borderRadius: { xs: 2, sm: 2, md: 2 },
              overflow: 'hidden',
            }}
          >
            {/* Left: Greeting */}
            {user && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: 'primary.contrastText',
                  textShadow: '0 2px 12px #0008',
                  fontSize: { xs: 18, sm: 22, md: 24 },
                  userSelect: 'none',
                }}
              >
                {`Hello, ${user.name || 'User'}!`}
              </Typography>
            )}
            {/* Right: Notification, User Type, Logout */}
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <IconButton color="inherit" sx={{ p: 1 }}>
                  <NotificationsIcon />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    color: user.role === 'superadmin' ? '#38bdf8' : 'secondary.main',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    bgcolor: 'primary.dark',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: { xs: 13, sm: 15 },
                    textTransform: 'capitalize',
                  }}
                >
                  {user.role || 'User'}
                </Typography>
                <IconButton
                  color="inherit"
                  sx={{ p: 1, ml: { xs: 0, sm: 1 } }}
                  onClick={() => setUser(null)}
                  title="Logout"
                >
                  <LogoutIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      {user ? (
        <Dashboard user={user} setUser={setUser} />
      ) : (
        <Auth setUser={setUser} />
      )}
    </ThemeProvider>
  );
}

export default App;
