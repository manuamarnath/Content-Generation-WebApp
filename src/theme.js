// Vite Soft UI Dashboard theme setup for MUI
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1e293b', // Soft dark blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#38bdf8', // Soft blue accent
      contrastText: '#fff',
    },
    background: {
      default: '#111827',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#22c55e',
    },
    warning: {
      main: '#f59e42',
    },
    info: {
      main: '#38bdf8',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    fontWeightRegular: 500,
    fontWeightBold: 700,
    h6: {
      color: '#f1f5f9',
      fontWeight: 700,
    },
    h5: {
      color: '#f1f5f9',
      fontWeight: 700,
    },
    body1: {
      color: '#f1f5f9',
    },
    body2: {
      color: '#94a3b8',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          backgroundColor: '#38bdf8',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          minWidth: 160,
          fontWeight: 600,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          background: '#1e293b',
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
