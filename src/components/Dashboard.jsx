const API_BASE = import.meta.env.PROD
  ? 'https://content-generation-webapp-server.onrender.com/api'
  : '/api';
import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button, Typography, MenuItem, Select, TextField, Paper, Alert, CircularProgress, IconButton, Tabs, Tab, Snackbar, Badge, Popover, List, ListItem, ListItemText, AppBar, Toolbar, Stack, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ContentFormFields, ClientSelect, GeneratedContentDisplay } from './ContentGenerationFields';
import BugReportForm from './BugReportForm';
import FeatureRequestForm from './FeatureRequestForm';
import ExportLogsButton from './ExportLogsButton';
import ManageUsers from './ManageUsers';
import UsageStats from './UsageStats';
import UsageWidget from './UsageWidget';
import ReportsBarChartWidget from './ReportsBarChartWidget';
import PendingApprovalsWidget from './PendingApprovalsWidget';
import ClientsUsersBarWidget from './ClientsUsersBarWidget';

import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';
import ClientProfileForm from './ClientProfileForm';
import EditClientProfile from './EditClientProfile';
import ChangePasswordForm from './ChangePasswordForm';
import theme from '../theme';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';
import InfoIcon from '@mui/icons-material/Info';

export default function Dashboard({ user, setUser }) {
  // Advanced form state (independent)
  const [advForm, setAdvForm] = useState({ topic: '', words: '', prompt: '' });

  // Advanced content generation handler (uses advForm only)
  const handleGenerateAdvanced = async (isRegenerate = false) => {
    if (!selectedClient || !(advForm.topic && advForm.topic.trim()) || !(advForm.words && Number(advForm.words) > 0) || !(advForm.prompt && advForm.prompt.trim())) {
      setValidation('Please select a client and enter topic, word count, and a custom prompt.');
      return;
    }
    setLoading(true);
    setMessage(isRegenerate ? 'Regenerating...' : 'Generating...');
    setContent('');
    try {
      await fetch(`${API_BASE}/content/track-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ type: isRegenerate ? 'regeneration' : 'generation' })
      });
      const advPrompt = advForm.prompt
        .replace(/mention topic/gi, advForm.topic)
        .replace(/500-word|\d+-word/gi, `${advForm.words}-word`);
      // Send all required fields to backend
      const res = await fetch(`${API_BASE}/content/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          clientId: selectedClient,
          title: advForm.topic,
          keywords: [], // Advanced mode: no keywords field, send empty array
          length: Number(advForm.words),
          type: 'blog', // Default to blog, or could add a dropdown for type
          headings: 1, // Default to 1 heading, or could add a field for this
          prompt: advPrompt
        })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setMessage(data.message || data.error || 'OpenAI error');
        return;
      }
      setContent(data.generatedContent);
      setMessage('');
    } catch (err) {
      setLoading(false);
      setMessage('Network or server error');
    }
  };
  const [contentTab, setContentTab] = useState(0);
  // Acknowledgement dialog state
  const [ackOpen, setAckOpen] = useState(() => {
    // Only show once per session
    return !window.sessionStorage.getItem('acknowledgedOpenAI');
  });

  const handleAckClose = () => {
    setAckOpen(false);
    window.sessionStorage.setItem('acknowledgedOpenAI', 'true');
  };
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [form, setForm] = useState({
    title: '',
    keywords: '',
    length: 500,
    type: 'blog',
    headings: 3
  });
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [clientTab, setClientTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: '' });
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [validation, setValidation] = useState('');
  // Bug/Feature Request state
  const [requestTab, setRequestTab] = useState(0); // 0: Bug, 1: Feature
  const [bugForm, setBugForm] = useState({ title: '', description: '' });
  const [featureForm, setFeatureForm] = useState({ title: '', description: '' });
  const [bugMsg, setBugMsg] = useState('');
  const [featureMsg, setFeatureMsg] = useState('');
  const [bugImages, setBugImages] = useState([]);
  // Local state for active requests (frontend only, persist in localStorage)
  const [activeRequests, setActiveRequests] = useState(() => {
    try {
      const saved = window.localStorage.getItem('activeRequests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [resolvedRequests, setResolvedRequests] = useState(() => {
    try {
      const saved = window.localStorage.getItem('resolvedRequests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist requests to localStorage on change
  useEffect(() => {
    window.localStorage.setItem('activeRequests', JSON.stringify(activeRequests));
  }, [activeRequests]);
  useEffect(() => {
    window.localStorage.setItem('resolvedRequests', JSON.stringify(resolvedRequests));
  }, [resolvedRequests]);
  const [activeTab, setActiveTab] = useState(0); // 0: Pending, 1: Resolved

  // Helper to get user info for requests
  const getRequestUser = () => ({
    name: user?.name || 'Unknown',
    email: user?.email || '',
    id: user?._id || '',
  });

  const refreshClients = () => {
    fetch(`${API_BASE}/clients`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(setClients);
    setEditingClient(null);
  };

  // Add a function to refresh logs
  const refreshLogs = () => {
    fetch(`${API_BASE}/content/logs`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(setLogs);
  };

  useEffect(() => {
    refreshClients();
    if (user.role === 'superadmin') {
      refreshLogs();
    }
  }, [user]);

  useEffect(() => {
    if (user.role === 'superadmin') {
      fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${user.token}` } })
        .then(r => r.json()).then(data => {
          setPendingCount(data.filter(u => !u.approved).length);
          setPendingUsers(data.filter(u => !u.approved));
        });
    }
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidation('');
  };

  const handleGenerate = async (isRegenerate = false) => {
    // Track usage immediately
    fetch(`${API_BASE}/content/track-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ type: isRegenerate ? 'regeneration' : 'generation' })
    });
    // Validation: require client, title, and keywords
    if (!selectedClient || !form.title.trim() || !form.keywords.trim()) {
      setValidation('Please select a client and enter both a title and keywords before generating.');
      return;
    }
    setLoading(true);
    setMessage(isRegenerate ? 'Regenerating...' : 'Generating...');
    setContent('');
    const res = await fetch(`${API_BASE}/content/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({
        clientId: selectedClient,
        title: form.title,
        keywords: form.keywords.split(',').map(k => k.trim()),
        length: Number(form.length),
        type: form.type,
        headings: Number(form.headings),
        prompt: `Generate a ${form.type} post.\nTitle: ${form.title}\nKeywords: ${form.keywords}\nThe content should start with the title as an H1 heading, followed by the generated text using the keywords.`
      })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMessage(data.message || 'Error');
    setContent(data.generatedContent);
    setMessage('');
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('Saving...');
    const res = await fetch(`${API_BASE}/content/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({
        clientId: selectedClient,
        ...form,
        keywords: form.keywords.split(',').map(k => k.trim()),
        length: Number(form.length),
        headings: Number(form.headings),
        generatedContent: content
      })
    });
    setLoading(false);
    if (res.ok) setMessage('Saved!');
    else setMessage('Save failed');
  };

  const notify = msg => setSnack({ open: true, msg });

  const handleNotifClick = (event) => {
    setNotifAnchor(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchor(null);
  };
  const notifOpen = Boolean(notifAnchor);

  const handleApproveFromNotif = async (id) => {
    const res = await fetch(`${API_BASE}/auth/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ userId: id })
    });
    if (res.ok) {
      setPendingUsers(pendingUsers.filter(u => u._id !== id));
      setPendingCount(pendingCount - 1);
      notify('User approved');
    }
  };

  // Add: Delete log handler
  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Delete this log entry?')) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/content/logs/${logId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setLoading(false);
    if (res.ok) {
      setLogs(logs.filter(log => log._id !== logId));
      notify('Log deleted');
    } else {
      notify('Failed to delete log');
    }
  };

  // Dashboard "apps" for sidebar
  const appTabs = [
    { label: 'Dashboard', icon: <DashboardIcon />, show: true, content: 'dashboard' },
    { label: 'Client Management', icon: <PeopleIcon />, show: true, content: 'client' },
    { label: 'Content Generation', icon: <ArticleIcon />, show: true, content: 'content' },
    { label: 'Logs', icon: <ListAltIcon />, show: user.role === 'superadmin', content: 'logs' },
    { label: 'Usage', icon: <AssessmentIcon />, show: user.role === 'superadmin', content: 'usage' },
    { label: 'Manage Users', icon: <PeopleIcon />, show: user.role === 'superadmin', content: 'manageUsers' },
    { label: 'Reports/Request', icon: <ReportProblemIcon />, show: true, content: 'reports' },
    { label: 'Settings', icon: <SettingsIcon />, show: true, content: 'settings' },
    { label: 'About', icon: <InfoIcon />, show: true, content: 'about' },
  ];
  const visibleTabs = appTabs.filter(t => t.show);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 0, display: 'flex' }}>
        {/* OpenAI Acknowledgement Dialog */}
        <Dialog open={ackOpen} onClose={handleAckClose} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>Important Acknowledgement</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ color: 'text.primary', fontSize: 18, mb: 2, textAlign: 'justify', maxHeight: 400, overflow: 'auto' }}>
              Echo5Digital Content Generator utilizes OpenAI's GPT-3.5 Turbo model to generate content for a variety of business and creative needs. While this advanced AI system is capable of producing high-quality, contextually relevant, and engaging text, it is important to understand the inherent limitations and responsibilities associated with AI-generated content.<br/><br/>
              <b>Accuracy Disclaimer:</b> The content generated by this platform is based on patterns and information present in the data used to train OpenAI's models. As such, the generated text may not always be factually accurate, up-to-date, or free from errors. The AI does not possess real-world understanding or the ability to verify facts, and it may inadvertently produce outdated, incomplete, or incorrect information. Users are strongly encouraged to review, fact-check, and edit all generated content before publishing or distributing it.<br/><br/>
              <b>Plagiarism Disclaimer:</b> While OpenAI's models are designed to generate original content and avoid direct copying from their training data, there is no absolute guarantee that the output will be 100% unique or free from similarities to existing works. The AI does not intentionally plagiarize, but due to the vast amount of data it has been exposed to, some phrases or ideas may resemble publicly available content. It is the user's responsibility to ensure that all generated material complies with copyright laws and best practices for originality.<br/><br/>
              <b>Ethical Use:</b> By using this platform, you acknowledge that you are responsible for the appropriate and ethical use of AI-generated content. This includes, but is not limited to, avoiding the dissemination of false information, respecting intellectual property rights, and ensuring that the content aligns with your organization's standards and values.<br/><br/>
              <b>Summary:</b> AI-generated content can be a powerful tool for productivity and creativity, but it is not a substitute for human judgment, expertise, or due diligence. Always review, edit, and verify the content before use. Echo5Digital and its developers disclaim any liability for inaccuracies, copyright issues, or misuse of the generated material.<br/><br/>
              By clicking "Acknowledge", you confirm that you understand and accept these terms regarding the use of AI-generated content on this platform.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button onClick={handleAckClose} variant="contained" color="primary" sx={{ fontWeight: 700, px: 4, py: 1.5, fontSize: 18, borderRadius: 2 }}>Acknowledge</Button>
          </DialogActions>
        </Dialog>
        {/* Sidebar AppBar (vertical navigation) */}
      <AppBar position="static" sx={{ width: 240, minWidth: 240, height: '92vh', maxHeight: '100vh', borderTopRightRadius: 16, borderBottomRightRadius: 16, boxShadow: 4, alignItems: 'flex-start', justifyContent: 'flex-start', pt: 7, bgcolor: '#f15a24', color: '#fff', marginTop: 4 }}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', width: '100%', p: 0, minHeight: '100vh', maxHeight: '100vh', gap: 2, bgcolor: '#f15a24', color: '#fff' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1, mb: 1, color: '#fff', textAlign: 'left', width: '100%' }}>
            Echo5Digital Content Generator
          </Typography>
          <Tabs
            orientation="vertical"
            value={tab}
            onChange={(_, v) => setTab(v)}
            textColor="inherit"
            TabIndicatorProps={{ style: { background: '#c94c1c' } }}
            sx={{ minWidth: 200, width: '100%', bgcolor: '#f15a24', color: '#fff',
              '& .MuiTab-root': {
                transition: 'background 0.2s, color 0.2s',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#c94c1c',
                  color: '#fff',
                },
              },
              '& .Mui-selected': {
                bgcolor: '#c94c1c',
                color: '#fff',
              },
            }}
          >
            {visibleTabs.map((t, i) => (
              <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} sx={{ minHeight: 56, minWidth: 200, maxWidth: 200, justifyContent: 'flex-start', fontWeight: 600, color: '#fff', '&.Mui-selected': { color: '#fff' } }} />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
        {/* Main content area */}
        <Box sx={{ flex: 1, p: 4, maxWidth: 1200
          , mx: 'auto', minHeight: '100vh', maxHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'auto' }}>
          {/* Main content mapped to visibleTabs */}
          {visibleTabs[tab]?.content === 'dashboard' && (
            <>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                <UsageWidget token={user.token} />
                <Box display="flex" flexDirection="column" alignItems="center">
                  <ReportsBarChartWidget activeRequests={activeRequests} resolvedRequests={resolvedRequests} />
                </Box>
              </Box>
              {user.role === 'superadmin' && (
                <Box mt={3} display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                  <PendingApprovalsWidget token={user.token} />
                  <ClientsUsersBarWidget token={user.token} />
                </Box>
              )}
            </>
          )}
          {visibleTabs[tab]?.content === 'client' && (
            <Box>
              <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'background.paper', borderRadius: 3, width: '100%', minWidth: 824, maxWidth: 824, minHeight: 320, maxHeight: 700, height: 'auto', overflow: 'auto', color: 'text.primary', boxSizing: 'border-box' }}>
                <Tabs value={clientTab} onChange={(_, v) => setClientTab(v)} sx={{ mb: 2,
                  '& .MuiTab-root': {
                    transition: 'background 0.2s, color 0.2s',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'secondary.main',
                      color: 'primary.contrastText',
                    },
                  },
                  '& .Mui-selected': {
                    bgcolor: 'secondary.main',
                    color: 'primary.contrastText',
                  },
                }}>
                  <Tab label="Create Client" />
                  <Tab label="Existing Clients" />
                </Tabs>
                {clientTab === 0 ? (
                  <ClientProfileForm token={user.token} onCreated={refreshClients} />
                ) : (
                  <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 6, mb: 2, width: '100%', minWidth: 824, maxWidth: 824, boxSizing: 'border-box' }}>
                    <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228' }}>Existing Clients</Typography>
                    {clients.length === 0 ? (
                      <Typography color="text.secondary">No clients found.</Typography>
                    ) : (
                      <List sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 0, p: 0 }}>
                        {clients.map(client => (
                          <ListItem
                            key={client._id}
                            sx={{
                              borderBottom: '1px solid',
                              borderColor: 'secondary.light',
                              bgcolor: 'background.default',
                              borderRadius: 2,
                              mb: 2,
                              px: 2,
                              py: 2,
                              alignItems: 'flex-start',
                              boxShadow: 1,
                              '&:hover': { boxShadow: 4, bgcolor: 'secondary.light' },
                              transition: 'box-shadow 0.2s, background 0.2s',
                            }}
                            secondaryAction={
                              <IconButton edge="end" aria-label="edit" onClick={() => setEditingClient(client)} sx={{ color: 'secondary.main', '&:hover': { color: 'secondary.dark', bgcolor: 'secondary.light' }, borderRadius: 2 }}>
                                <EditIcon />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={<Typography fontWeight={800} color="text.primary" sx={{ fontSize: 18 }}>{client.name}</Typography>}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{client.website}</Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 0.5 }}>{client.prompt}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Created by: {client.createdBy?.name || 'Unknown'} ({client.createdBy?.email || ''})<br/>
                                    {client.createdAt ? `on ${new Date(client.createdAt).toLocaleString()}` : ''}
                                    {client.updatedAt && client.updatedBy ? <><br/>Last updated by: {client.updatedBy?.name || 'Unknown'} ({client.updatedBy?.email || ''})<br/>on {new Date(client.updatedAt).toLocaleString()}</> : null}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                )}
              </Paper>
              {editingClient && (
                <EditClientProfile
                  client={editingClient}
                  token={user.token}
                  onUpdated={refreshClients}
                  onCancel={() => setEditingClient(null)}
                />
              )}
            </Box>
          )}
          {visibleTabs[tab]?.content === 'content' && (
            <Box>
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 3, width: '100%', minWidth: 824, maxWidth: 824, minHeight: 400, maxHeight: 700, height: 600, overflow: 'auto', color: 'text.primary', boxSizing: 'border-box' }}>
                <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228' }}>Content Generation</Typography>
                <Tabs value={contentTab} onChange={(_, v) => setContentTab(v)} sx={{ mb: 2 }}>
                  <Tab 
                    label="Easy" 
                    sx={{
                      minWidth: 120,
                      fontWeight: 700,
                      fontSize: 18,
                      color: contentTab === 0 ? 'primary.contrastText' : 'secondary.main',
                      bgcolor: contentTab === 0 ? 'secondary.main' : 'background.paper',
                      borderRadius: 2,
                      mx: 1,
                      boxShadow: contentTab === 0 ? 2 : 0,
                      transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                        color: 'primary.contrastText',
                        boxShadow: 3,
                      },
                    }}
                  />
                  <Tab 
                    label="Advanced" 
                    sx={{
                      minWidth: 120,
                      fontWeight: 700,
                      fontSize: 18,
                      color: contentTab === 1 ? 'primary.contrastText' : 'secondary.main',
                      bgcolor: contentTab === 1 ? 'secondary.main' : 'background.paper',
                      borderRadius: 2,
                      mx: 1,
                      boxShadow: contentTab === 1 ? 2 : 0,
                      transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                        color: 'primary.contrastText',
                        boxShadow: 3,
                      },
                    }}
                  />
                </Tabs>
                {contentTab === 0 && (
                  <>
                    <ContentFormFields
                      form={form}
                      onChange={handleChange}
                      selectedClient={selectedClient}
                      setSelectedClient={setSelectedClient}
                      clients={clients}
                    />
                    <Box mt={2} display="flex" gap={2}>
                      <Button onClick={() => handleGenerate(false)} disabled={loading} variant="contained" sx={{ bgcolor: 'secondary.main', color: 'primary.contrastText', fontWeight: 600, '&:hover': { bgcolor: 'secondary.dark', color: 'primary.contrastText' } }}>Generate</Button>
                      <Button onClick={() => handleGenerate(true)} disabled={loading} variant="outlined" sx={{ borderColor: 'secondary.main', color: 'secondary.main', fontWeight: 600, '&:hover': { bgcolor: 'secondary.main', color: 'primary.contrastText', borderColor: 'secondary.dark' } }}>Regenerate</Button>
                    </Box>
                    {validation && <Alert severity="warning" sx={{ mt: 2 }}>{validation}</Alert>}
                    {loading && <CircularProgress sx={{ mt: 2 }} />}
                    {message && <Alert severity={message === 'Saved!' ? 'success' : 'info'} sx={{ mt: 2 }}>{message}</Alert>}
                    <Dialog open={!!content} onClose={() => setContent('')} maxWidth="md" fullWidth>
                      <DialogTitle 
                        sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center', px: 4, pt: 3, pb: 2, bgcolor: 'background.paper', borderTopLeftRadius: 8, borderTopRightRadius: 8, position: 'relative' }}
                      >
                        Generated Content
                        <IconButton
                          aria-label="close"
                          onClick={() => setContent('')}
                          sx={{
                            position: 'absolute',
                            right: 12,
                            top: 12,
                            color: (theme) => theme.palette.grey[500],
                            bgcolor: 'transparent',
                            '&:hover': { bgcolor: 'grey.800', color: 'primary.contrastText' },
                            zIndex: 1
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </IconButton>
                      </DialogTitle>
                      <DialogContent 
                        dividers 
                        sx={{ 
                          maxHeight: { xs: '70vh', md: '60vh' }, 
                          minWidth: { xs: 320, sm: 500, md: 700 },
                          bgcolor: 'background.default',
                          p: { xs: 2, sm: 3 },
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          borderBottomLeftRadius: 8, 
                          borderBottomRightRadius: 8,
                        }}
                      >
                        <Box sx={{ width: '100%', maxWidth: 650 }}>
                          <GeneratedContentDisplay
                            content={content}
                            onSave={handleSave}
                            rows={8}
                          />
                        </Box>
                      </DialogContent>
                      <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 2, bgcolor: 'background.paper', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                        <Button onClick={() => setContent('')} variant="outlined" color="primary" sx={{ minWidth: 120, fontWeight: 700, borderRadius: 2 }}>Close</Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )}
                {contentTab === 1 && (
                  <Box>
                    <Box display="flex" flexDirection="column" gap={2} maxWidth={600} mx="auto">
                      {/* Client selection dropdown (always visible in Advanced tab) */}
                      <FormControl fullWidth variant="outlined" sx={{ mb: 1 }}>
                        <InputLabel id="adv-client-label">Select Client</InputLabel>
                        <Select
                          labelId="adv-client-label"
                          value={selectedClient}
                          onChange={e => setSelectedClient(e.target.value)}
                          label="Select Client"
                        >
                          <MenuItem value=""><em>None</em></MenuItem>
                          {clients.map(client => (
                            <MenuItem key={client._id} value={client._id}>{client.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label="Topic"
                        name="topic"
                        value={advForm.topic}
                        onChange={e => setAdvForm(f => ({ ...f, topic: e.target.value }))}
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        label="Word Count"
                        name="words"
                        type="number"
                        value={advForm.words}
                        onChange={e => setAdvForm(f => ({ ...f, words: e.target.value }))}
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        label="Custom Prompt"
                        name="prompt"
                        value={advForm.prompt}
                        onChange={e => setAdvForm(f => ({ ...f, prompt: e.target.value }))}
                        fullWidth
                        multiline
                        minRows={4}
                        variant="outlined"
                        placeholder={`Please write a 500-word blog post on 'mention topic'\nUse a professional tone and mimic the natural writing style of a industry expert. Incorporate varied sentence structures, subtle imperfections, and organic flow to emulate human writing. Include specific details, examples, or anecdotes relevant to the topic, and avoid overly polished or formulaic language. Ensure the content is 100% original, with no direct quotes or paraphrasing from existing sources. If applicable, use APA for formatting. Optionally, add a touch of curiosity to make the writing feel authentic and engaging.`}
                        sx={{ mb: 1 }}
                      />
                      <Box mt={1} display="flex" gap={2}>
                        <Button onClick={() => handleGenerateAdvanced(false)} disabled={loading} variant="contained" sx={{ bgcolor: 'secondary.main', color: 'primary.contrastText', fontWeight: 600, '&:hover': { bgcolor: 'secondary.dark', color: 'primary.contrastText' } }}>Generate</Button>
                        <Button onClick={() => handleGenerateAdvanced(true)} disabled={loading} variant="outlined" sx={{ borderColor: 'secondary.main', color: 'secondary.main', fontWeight: 600, '&:hover': { bgcolor: 'secondary.main', color: 'primary.contrastText', borderColor: 'secondary.dark' } }}>Regenerate</Button>
                      </Box>
                      {validation && <Alert severity="warning" sx={{ mt: 2 }}>{validation}</Alert>}
                      {loading && <CircularProgress sx={{ mt: 2 }} />}
                      {message && <Alert severity={message === 'Saved!' ? 'success' : 'info'} sx={{ mt: 2 }}>{message}</Alert>}
                    </Box>
                    <Dialog open={!!content} onClose={() => setContent('')} maxWidth="md" fullWidth>
                      <DialogTitle 
                        sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center', px: 4, pt: 3, pb: 2, bgcolor: 'background.paper', borderTopLeftRadius: 8, borderTopRightRadius: 8, position: 'relative' }}
                      >
                        Generated Content
                        <IconButton
                          aria-label="close"
                          onClick={() => setContent('')}
                          sx={{
                            position: 'absolute',
                            right: 12,
                            top: 12,
                            color: (theme) => theme.palette.grey[500],
                            bgcolor: 'transparent',
                            '&:hover': { bgcolor: 'grey.800', color: 'primary.contrastText' },
                            zIndex: 1
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </IconButton>
                      </DialogTitle>
                      <DialogContent 
                        dividers 
                        sx={{ 
                          maxHeight: { xs: '70vh', md: '60vh' }, 
                          minWidth: { xs: 320, sm: 500, md: 700 },
                          bgcolor: 'background.default',
                          p: { xs: 2, sm: 3 },
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          borderBottomLeftRadius: 8, 
                          borderBottomRightRadius: 8,
                        }}
                      >
                        <Box sx={{ width: '100%', maxWidth: 650 }}>
                          <GeneratedContentDisplay
                            content={content}
                            onSave={handleSave}
                            rows={8}
                          />
                        </Box>
                      </DialogContent>
                      <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 2, bgcolor: 'background.paper', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                        <Button onClick={() => setContent('')} variant="outlined" color="primary" sx={{ minWidth: 120, fontWeight: 700, borderRadius: 2 }}>Close</Button>
                      </DialogActions>
                    </Dialog>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
          {visibleTabs[tab]?.content === 'logs' && user.role === 'superadmin' && (
            <Box>
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 3, width: '100%', minWidth: 824, maxWidth: 824, minHeight: 400, maxHeight: 700, height: 600, overflow: 'auto', color: 'text.primary', boxSizing: 'border-box' }}>
                <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228' }}>Generation Logs</Typography>
                <ExportLogsButton logs={logs} />
                <Button onClick={refreshLogs} variant="outlined" sx={{ ml: 2, borderColor: 'secondary.main', color: 'secondary.main', fontWeight: 600, '&:hover': { bgcolor: 'secondary.main', color: 'primary.contrastText', borderColor: 'secondary.dark' } }}>Refresh Logs</Button>
                <List>
                  {logs.map(log => (
                    <ListItem key={log._id} sx={{ borderBottom: '1px solid #e0e0e0' }}
                      secondaryAction={
                        <Button size="small" color="error" onClick={() => handleDeleteLog(log._id)}
                          sx={{ fontWeight: 600, bgcolor: 'error.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'error.dark', color: 'primary.contrastText' } }}>
                          Delete
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={
                          <>
                            <Typography fontWeight={600}>{log.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{log.createdAt?.slice(0, 19).replace('T', ' ')} by {log.user?.name} ({log.user?.email})</Typography>
                          </>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">Client: {log.client?.name}</Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
          {visibleTabs[tab]?.content === 'usage' && user.role === 'superadmin' && (
            <Box>
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 3, width: '100%', minWidth: 824, maxWidth: 824, minHeight: 400, maxHeight: 700, height: 600, overflow: 'auto', color: 'text.primary', boxSizing: 'border-box' }}>
                <UsageStats token={user.token} />
              </Paper>
            </Box>
          )}
          {visibleTabs[tab]?.content === 'manageUsers' && user.role === 'superadmin' && (
            <Box>
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 3, width: '100%', minWidth: 824, maxWidth: 824, minHeight: 400, maxHeight: 700, height: 600, overflow: 'auto', color: 'text.primary', boxSizing: 'border-box' }}>
                {/* Ensure ManageUsers is rendered with all required props and correct logic */}
                <ManageUsers token={user.token} notify={notify} />
              </Paper>
            </Box>
          )}
          {visibleTabs[tab]?.content === 'reports' && (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={400}>
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 3, width: '100%', minWidth: 824, maxWidth: 824, minHeight: 400, maxHeight: 700, height: 600, overflow: 'auto', color: 'text.primary', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Tabs
                  value={requestTab}
                  onChange={(_, v) => setRequestTab(v)}
                  variant="fullWidth"
                  sx={{ mb: 2,
                    width: '100%',
                    minWidth: 0,
                    '& .MuiTab-root': {
                      minWidth: 180,
                      maxWidth: 300,
                      fontSize: 18,
                      fontWeight: 700,
                      px: 3,
                      py: 2,
                      transition: 'background 0.2s, color 0.2s',
                      borderRadius: 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      '&:hover': {
                        bgcolor: 'secondary.main',
                        color: 'primary.contrastText',
                      },
                    },
                    '& .Mui-selected': {
                      bgcolor: 'secondary.main',
                      color: 'primary.contrastText',
                    },
                  }}
                >
                  <Tab icon={<ReportProblemIcon />} iconPosition="start" label="Bug Report" sx={{ minHeight: 56, minWidth: 180, maxWidth: 300, fontWeight: 700, fontSize: 18, px: 3, py: 2, textAlign: 'center' }} />
                  <Tab icon={<AddCircleOutlineIcon />} iconPosition="start" label="Feature Request" sx={{ minHeight: 56, minWidth: 180, maxWidth: 300, fontWeight: 700, fontSize: 18, px: 3, py: 2, textAlign: 'center' }} />
                  {user.role === 'superadmin' && (
                    <Tab icon={<ListAltIcon />} iconPosition="start" label="Active Requests" sx={{ minHeight: 56, minWidth: 180, maxWidth: 300, fontWeight: 700, fontSize: 18, px: 3, py: 2, textAlign: 'center' }} />
                  )}
                </Tabs>
                {/* Only render the selected tab's content, not both at once */}
                {requestTab === 0 && (
                  <Box width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228', textAlign: 'center' }}>
                      Submit a Bug Report
                    </Typography>
                    <BugReportForm
                      onSubmit={bug => {
                        setActiveRequests(prev => {
                          const updated = [bug, ...prev];
                          window.localStorage.setItem('activeRequests', JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      getRequestUser={getRequestUser}
                    />
                  </Box>
                )}
                {requestTab === 1 && (
                  <Box width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228', textAlign: 'center' }}>
                      Submit a Feature Request
                    </Typography>
                    <FeatureRequestForm
                      onSubmit={feature => {
                        setActiveRequests(prev => {
                          const updated = [feature, ...prev];
                          window.localStorage.setItem('activeRequests', JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      getRequestUser={getRequestUser}
                    />
                  </Box>
                )}
                {user.role === 'superadmin' && requestTab === 2 && (
                  <Box width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228', textAlign: 'center' }}>
                      Active Feature Requests & Bug Reports
                    </Typography>
                    <Paper elevation={2} sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, maxWidth: 700, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 6 }}>
                      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                        <Tab 
                          label="Pending" 
                          sx={{
                            fontWeight: 700,
                            color: activeTab === 0 ? 'info.main' : 'text.primary',
                            bgcolor: activeTab === 0 ? 'info.light' : 'background.paper',
                            borderRadius: 2,
                            mx: 1,
                            '&.Mui-selected': {
                              color: 'info.contrastText',
                              bgcolor: 'info.main',
                            },
                          }}
                        />
                        <Tab 
                          label="Resolved" 
                          sx={{
                            fontWeight: 700,
                            color: activeTab === 1 ? 'info.main' : 'text.primary',
                            bgcolor: activeTab === 1 ? 'info.light' : 'background.paper',
                            borderRadius: 2,
                            mx: 1,
                            '&.Mui-selected': {
                              color: 'info.contrastText',
                              bgcolor: 'info.main',
                            },
                          }}
                        />
                      </Tabs>
                      {activeTab === 0 ? (
                        activeRequests.length === 0 ? (
                          <Typography color="text.secondary" sx={{ mb: 2 }}>
                            No pending feature requests or bug reports.
                          </Typography>
                        ) : (
                          <List sx={{ width: '100%' }}>
                            {activeRequests.map((req, idx) => (
                              <ListItem key={req.id || idx} alignItems="flex-start" sx={{ borderBottom: '1px solid', borderColor: 'secondary.light', mb: 1, alignItems: 'flex-start' }}
                                secondaryAction={
                                  user.role === 'superadmin' && (
                                    <Box display="flex" gap={1}>
                                      <Button
                                        size="small"
                                        color="success"
                                        variant="contained"
                                        sx={{ fontWeight: 700, borderRadius: 2, bgcolor: 'success.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'success.dark', color: 'primary.contrastText' } }}
                                        onClick={() => {
                                          setActiveRequests(prev => {
                                            const updated = prev.filter(r => (r.id || r) !== (req.id || req));
                                            window.localStorage.setItem('activeRequests', JSON.stringify(updated));
                                            return updated;
                                          });
                                        }}
                                      >
                                        Delete
                                      </Button>
                                      <Button
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{ fontWeight: 700, borderRadius: 2, borderColor: 'info.main', color: 'info.main', '&:hover': { bgcolor: 'info.main', color: 'primary.contrastText', borderColor: 'info.dark' } }}
                                        onClick={() => {
                                          setActiveRequests(prev => {
                                            const updated = prev.filter(r => (r.id || r) !== (req.id || req));
                                            window.localStorage.setItem('activeRequests', JSON.stringify(updated));
                                            return updated;
                                          });
                                          setResolvedRequests(prev => {
                                            const updated = [req, ...prev];
                                            window.localStorage.setItem('resolvedRequests', JSON.stringify(updated));
                                            return updated;
                                          });
                                        }}
                                      >
                                        Mark Resolved
                                      </Button>
                                    </Box>
                                  )
                                }
                              >
                                <ListItemText
                                  primary={<>
                                    <Typography fontWeight={700} color={req.type === 'bug' ? 'error.main' : 'primary.main'}>
                                      {req.type === 'bug' ? '🐞 Bug Report' : '✨ Feature Request'}
                                    </Typography>
                                    <Typography fontWeight={600}>{req.title}</Typography>
                                  </>}
                                  secondary={<>
                                    <Typography variant="body2" color="text.secondary">{req.description}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {req.user?.name ? `Requested by: ${req.user.name}` : ''}
                                      {req.user?.email ? ` (${req.user.email})` : ''}
                                      {req.date ? ` on ${new Date(req.date).toLocaleString()}` : ''}
                                    </Typography>
                                    {req.images && req.images.length > 0 && (
                                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                        {req.images.map((img, i) => (
                                          <Box key={i} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'secondary.main', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={URL.createObjectURL(img)} alt={`screenshot-${i}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                          </Box>
                                        ))}
                                      </Box>
                                    )}
                                  </>}
                                />
                              </ListItem>
                            ))}
                          </List>
                        )
                      ) : (
                        resolvedRequests.length === 0 ? (
                          <Typography color="text.secondary" sx={{ mb: 2 }}>
                            No resolved feature requests or bug reports.
                          </Typography>
                        ) : (
                          <List sx={{ width: '100%' }}>
                            {resolvedRequests.map((req, idx) => (
                              <ListItem key={req.id || idx} alignItems="flex-start" sx={{ borderBottom: '1px solid', borderColor: 'secondary.light', mb: 1, alignItems: 'flex-start', opacity: 0.7 }}
                                secondaryAction={
                                  user.role === 'superadmin' && (
                                    <Button
                                      size="small"
                                      color="error"
                                      variant="contained"
                                      sx={{ fontWeight: 700, borderRadius: 2, bgcolor: 'error.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'error.dark', color: 'primary.contrastText' } }}
                                      onClick={() => {
                                        setResolvedRequests(prev => {
                                          const updated = prev.filter(r => (r.id || r) !== (req.id || req));
                                          window.localStorage.setItem('resolvedRequests', JSON.stringify(updated));
                                          return updated;
                                        });
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  )
                                }
                              >
                                <ListItemText
                                  primary={<>
                                    <Typography fontWeight={700} color={req.type === 'bug' ? 'error.main' : 'primary.main'}>
                                      {req.type === 'bug' ? '🐞 Bug Report' : '✨ Feature Request'}
                                    </Typography>
                                    <Typography fontWeight={600}>{req.title}</Typography>
                                  </>}
                                  secondary={<>
                                    <Typography variant="body2" color="text.secondary">{req.description}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {req.user?.name ? `Requested by: ${req.user.name}` : ''}
                                      {req.user?.email ? ` (${req.user.email})` : ''}
                                      {req.date ? ` on ${new Date(req.date).toLocaleString()}` : ''}
                                    </Typography>
                                    {req.images && req.images.length > 0 && (
                                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                        {req.images.map((img, i) => (
                                          <Box key={i} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'secondary.main', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={URL.createObjectURL(img)} alt={`screenshot-${i}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                          </Box>
                                        ))}
                                      </Box>
                                    )}
                                  </>}
                                />
                              </ListItem>
                            ))}
                          </List>
                        )
                      )}
                    </Paper>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
          {visibleTabs[tab]?.content === 'settings' && (
            <Box>
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 3, minWidth: 824, maxWidth: 824, width: '100%', minHeight: 400, maxHeight: 700, height: 600, overflow: 'auto', color: 'text.primary', boxSizing: 'border-box' }}>
                <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 8px #2228' }}>Change Password</Typography>
                <ChangePasswordForm user={user} notify={notify} setUser={setUser}
                  buttonProps={{
                    sx: {
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
                    }
                  }}
                />
              </Paper>
            </Box>
          )}

          {visibleTabs[tab]?.content === 'about' && (
            <Box>
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 3, width: '100%', minWidth: 824, maxWidth: 824, minHeight: 400, maxHeight: 700, height: 600, overflow: 'auto', color: 'text.primary', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', fontWeight: 900, letterSpacing: 1, textAlign: 'center' }}>
                  Echo5Digital Content Generator
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', textAlign: 'center' }}>
                  Version 1.0.0
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', textAlign: 'center', maxWidth: 600 }}>
                  Echo5Digital Content Generator is a modern AI-powered platform for generating, managing, and tracking content for clients. It is designed for agencies and businesses to streamline content creation and management.
                </Typography>
                <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.main', fontWeight: 700, textAlign: 'center' }}>
                  Technologies Used
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mb: 2 }}>
                  <img src="/vite.svg" alt="Vite" style={{ height: 40, animation: 'spin 2.5s linear infinite' }} />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" style={{ height: 40, animation: 'spin 3s linear infinite reverse' }} />
                  <img src="https://webassets.mongodb.com/_com_assets/cms/mongodb_logo1-76twgcu2dm.png" alt="MongoDB" style={{ height: 40, animation: 'pulse 2s ease-in-out infinite' }} />
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                    @keyframes pulse {
                      0%, 100% { filter: brightness(1); transform: scale(1); }
                      50% { filter: brightness(1.3); transform: scale(1.12); }
                    }
                  `}</style>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 2 }}>
                  <b>Frontend:</b> Vite + React<br/>
                  <b>Backend:</b> Express.js<br/>
                  <b>Database:</b> MongoDB<br/>
                  <b>AI:</b> OpenAI GPT-3.5 Turbo
                </Typography>
                <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.main', fontWeight: 700, textAlign: 'center' }}>
                  Features
                </Typography>
                <ul style={{ color: '#888', textAlign: 'left', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
                  <li>AI-powered content generation (blog, website, etc.)</li>
                  <li>Customizable generation: title, keywords, length, type, headings</li>
                  <li>Client profiles based on website data</li>
                  <li>Bug/feature request system</li>
                </ul>
                <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', mt: 2 }}>
                  &copy; {new Date().getFullYear()} Echo5Digital. All rights reserved.
                </Typography>
              </Paper>
            </Box>
          )}


        </Box>
      </Box>
    </ThemeProvider>
  );
}
