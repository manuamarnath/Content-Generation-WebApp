import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Stack, TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert, List, ListItem, ListItemText, CircularProgress, IconButton } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';

export default function ManageUsers({ token, notify }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [pending, setPending] = useState([]);
  const [userTab, setUserTab] = useState(0); // 0: Create, 1: Pending, 2: Existing, 3: Blocked
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [formError, setFormError] = useState('');
  useEffect(() => {
    fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => {
        setUsers(data);
        setPending(data.filter(u => !u.approved));
        setBlockedUsers(data.filter(u => u.blocked));
      }).finally(() => setLoading(false));
  }, [token]);

  // Handlers for user management
  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      setUsers(users.filter(u => u._id !== id));
      notify('User deleted');
    }
  };
  const handleCreate = async e => {
    e.preventDefault();
    setFormError('');
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newUser.email)) {
      setFormError('Enter a valid email address.');
      return;
    }
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newUser)
    });
    if (res.ok) {
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      notify('User created');
      fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(data => {
          setUsers(data);
          setPending(data.filter(u => !u.approved));
        });
    } else {
      setFormError('Failed to create user');
      notify('Failed to create user');
    }
  };
  const handleApprove = async id => {
    const res = await fetch('/api/auth/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: id })
    });
    if (res.ok) {
      setUsers(users.map(u => u._id === id ? { ...u, approved: true } : u));
      setPending(pending.filter(u => u._id !== id));
      notify('User approved');
    }
  };
  const handleReject = async id => {
    if (!window.confirm('Reject this user?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      setUsers(users.filter(u => u._id !== id));
      setPending(pending.filter(u => u._id !== id));
      notify('User rejected and deleted');
    }
  };
  const handleBlock = async id => {
    if (!window.confirm('Revoke access and block this user from logging in?')) return;
    const res = await fetch(`/api/users/${id}/block`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setUsers(users.map(u => u._id === id ? { ...u, blocked: true } : u));
      setBlockedUsers([...blockedUsers, users.find(u => u._id === id)]);
      notify('User access revoked and blocked');
    } else {
      notify('Failed to block user');
    }
  };
  const handleUnblock = async id => {
    if (!window.confirm('Unblock this user and restore login access?')) return;
    const res = await fetch(`/api/users/${id}/unblock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setUsers(users.map(u => u._id === id ? { ...u, blocked: false } : u));
      setBlockedUsers(blockedUsers.filter(u => u._id !== id));
      notify('User unblocked');
    } else {
      notify('Failed to unblock user');
    }
  };

  return (
    <Box>
      <Tabs
        value={userTab}
        onChange={(_, v) => setUserTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{ style: { background: '#c94c1c' } }}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            minWidth: 180,
            fontWeight: 700,
            color: '#f15a24',
            bgcolor: 'background.paper',
            borderRadius: 2,
            mx: 1,
            '&:hover': {
              bgcolor: '#c94c1c',
              color: '#fff',
            },
          },
          '& .Mui-selected': {
            bgcolor: '#f15a24',
            color: '#fff',
          },
        }}
      >
        <Tab icon={<PersonAddAltIcon />} label="Create User" />
        <Tab icon={<HourglassEmptyIcon />} label="Pending Users" />
        <Tab icon={<VerifiedUserIcon />} label="Existing Users" />
        <Tab icon={<BlockIcon />} label="Blocked Users" />
      </Tabs>
      {userTab === 0 && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={400}>
          <Typography variant="h5" sx={{ mb: 2, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228', textAlign: 'center' }}>Create User</Typography>
          <Paper elevation={2} sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 6 }}>
            <form onSubmit={handleCreate} style={{ width: '100%' }}>
              <Stack spacing={2} alignItems="center">
                <TextField
                  label="Name"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  fullWidth
                  autoComplete="off"
                  InputLabelProps={{
                    sx: {
                      color: 'text.secondary',
                      '&.Mui-focused': { color: 'primary.main' },
                    },
                  }}
                  sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
                />
                <TextField
                  label="Email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  fullWidth
                  autoComplete="off"
                  type="email"
                  InputLabelProps={{
                    sx: {
                      color: 'text.secondary',
                      '&.Mui-focused': { color: 'primary.main' },
                    },
                  }}
                  sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
                  helperText="User will receive an invite email."
                />
                <TextField
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  fullWidth
                  autoComplete="new-password"
                  InputLabelProps={{
                    sx: {
                      color: 'text.secondary',
                      '&.Mui-focused': { color: 'primary.main' },
                    },
                  }}
                  sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
                />
                <FormControl fullWidth>
                  <InputLabel
                    id="role-label"
                    sx={{ color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } }}
                  >Role</InputLabel>
                  <Select
                    labelId="role-label"
                    value={newUser.role}
                    label="Role"
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    sx={{ bgcolor: 'background.default', color: 'text.primary' }}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="superadmin">Super Admin</MenuItem>
                  </Select>
                </FormControl>
                {formError && <Alert severity="error" sx={{ width: '100%' }}>{formError}</Alert>}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'primary.contrastText',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: 2,
                    py: 1.5,
                    fontSize: 16,
                    '&:hover': { bgcolor: 'secondary.dark', color: 'primary.contrastText', boxShadow: 4 },
                    '&:active': { bgcolor: 'secondary.light', color: 'primary.contrastText' },
                    transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                  }}
                >
                  Create
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      )}
      {userTab === 1 && (
        <Box>
          <Typography variant="h6">Pending Approvals</Typography>
          {pending.length === 0 ? (
            <Typography color="text.secondary">No pending users.</Typography>
          ) : (
            <Paper elevation={3} sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'secondary.main' }}>
              <List>
                {pending.map(u => (
                  <ListItem key={u._id} sx={{ borderBottom: '1px solid', borderColor: 'secondary.light', bgcolor: 'background.default', borderRadius: 2, mb: 1 }}
                    secondaryAction={
                      <Box display="flex" gap={1}>
                        <Button size="small" color="success" variant="contained" sx={{ fontWeight: 600, bgcolor: 'success.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'success.dark', color: 'primary.contrastText' } }} onClick={() => handleApprove(u._id)}>
                          Approve
                        </Button>
                        <Button size="small" color="error" variant="outlined" sx={{ borderColor: 'error.main', color: 'error.main', fontWeight: 600, '&:hover': { bgcolor: 'error.main', color: 'primary.contrastText', borderColor: 'error.dark' } }} onClick={() => handleReject(u._id)}>
                          Reject
                        </Button>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={<>
                        <Typography fontWeight={600} color="text.primary">{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </>}
                      secondary={
                        <span>
                          <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500, display: 'block' }}>Pending Approval</Typography>
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      )}
      {userTab === 2 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228' }}>Existing Users</Typography>
          {loading ? <CircularProgress /> : (
            <Paper elevation={2} sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
              <List>
                {users.filter(u => !u.blocked).map(u => (
                  <ListItem key={u._id} sx={{ borderBottom: '1px solid', borderColor: 'secondary.light' }}
                    secondaryAction={
                      <Box display="flex" gap={1}>
                        <Button size="small" color="error" sx={{ fontWeight: 600, bgcolor: 'error.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'error.dark', color: 'primary.contrastText' } }} onClick={() => handleDelete(u._id)}>
                          Delete
                        </Button>
                        <Button size="small" color="warning" variant="outlined" sx={{ borderColor: 'warning.main', color: 'warning.main', fontWeight: 600, '&:hover': { bgcolor: 'warning.main', color: 'primary.contrastText', borderColor: 'warning.dark' } }} onClick={() => handleBlock(u._id)} disabled={u.blocked}>
                          Revoke Access
                        </Button>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={<>
                        <Typography fontWeight={600}>{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </>}
                      secondary={
                        <span>
                          <Typography variant="body2" color="text.secondary" display="block">Role: {u.role}</Typography>
                          <Typography variant="body2" color={u.approved ? 'success.main' : 'warning.main'} display="block">
                            {u.approved ? 'Approved' : 'Pending'}
                          </Typography>
                          {u.blocked && <Typography variant="body2" color="error.main" display="block">Blocked</Typography>}
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      )}
      {userTab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mt: 3 }}>Blocked Users</Typography>
          {blockedUsers.length === 0 ? (
            <Typography color="text.secondary">No blocked users.</Typography>
          ) : (
            <Paper elevation={2} sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
              <List>
                {blockedUsers.map(u => (
                  <ListItem key={u._id} sx={{ borderBottom: '1px solid', borderColor: 'error.light' }}
                    secondaryAction={
                      <Button size="small" color="success" variant="outlined" sx={{ borderColor: 'success.main', color: 'success.main', fontWeight: 600, '&:hover': { bgcolor: 'success.main', color: 'primary.contrastText', borderColor: 'success.dark' } }} onClick={() => handleUnblock(u._id)}>
                        Unblock
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={<>
                        <Typography fontWeight={600}>{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </>}
                      secondary={
                        <span>
                          <Typography variant="body2" color="text.secondary" display="block">Role: {u.role}</Typography>
                          <Typography variant="body2" color="error.main" display="block">Blocked</Typography>
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}