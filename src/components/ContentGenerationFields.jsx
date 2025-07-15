import { Box, TextField, Select, MenuItem, Typography, Button } from '@mui/material';
import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CircularProgress from '@mui/material/CircularProgress';

const API_BASE = import.meta.env.PROD
  ? 'https://content-generation-webapp-server.onrender.com/api'
  : '/api';

export function ContentFormFields({ form, onChange, selectedClient, setSelectedClient, clients, setContent, setLoading, setMessage, setValidation }) {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  });

  const handleGenerate = async (isRegenerate = false) => {
    fetch(`${API_BASE}/content/track-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ type: isRegenerate ? 'regeneration' : 'generation' })
    });

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
  
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField name="title" label="Title" value={form.title} onChange={onChange} fullWidth />
      <TextField name="keywords" label="Keywords (comma separated)" value={form.keywords} onChange={onChange} fullWidth />
      <TextField name="length" label="Length" type="number" value={form.length} onChange={onChange} fullWidth />
      <TextField name="headings" label="Headings" type="number" value={form.headings} onChange={onChange} fullWidth />
      <Select name="type" value={form.type} onChange={onChange} fullWidth>
        <MenuItem value="blog">Blog</MenuItem>
        <MenuItem value="website">Website</MenuItem>
      </Select>
      <ClientSelect selectedClient={selectedClient} setSelectedClient={setSelectedClient} clients={clients} />
      {/* <Button variant="contained" color="primary" onClick={() => handleGenerate(false)}>Generate</Button> */}
    </Box>
  );
}

export function ClientSelect({ selectedClient, setSelectedClient, clients }) {
  return (
    <Select
      value={selectedClient}
      onChange={e => setSelectedClient(e.target.value)}
      displayEmpty
      fullWidth
    >
      <MenuItem value="">Select client</MenuItem>
      {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
    </Select>
  );
}

export function GeneratedContentDisplay({ content, onSave, onRegenerate, loading }) {
  const [copyMsg, setCopyMsg] = useState('');
  const [loadingBtn, setLoadingBtn] = useState('');
  const [featureMsg, setFeatureMsg] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyMsg('Copied!');
    } catch {
      setCopyMsg('Copy failed');
    } finally {
      setTimeout(() => setCopyMsg(''), 1500);
    }
  };

  const handleFeature = (type) => {
    setLoadingBtn(type);
    setFeatureMsg('');
    setTimeout(() => {
      setLoadingBtn('');
      setFeatureMsg('This feature is coming soon...');
    }, 1200);
  };

  return (
    <Box mt={3}>
      <Typography variant="h6">Generated Content</Typography>
      <TextField
        value={content}
        multiline
        rows={10}
        fullWidth
        InputProps={{ readOnly: true }}
      />
      <Box display="flex" gap={2} mt={2} flexWrap="wrap">
        <Button onClick={onSave} variant="contained" color="success">Save</Button>
        <Button onClick={handleCopy} variant="outlined" color="info" startIcon={<ContentCopyIcon />}>
          {copyMsg || 'Copy'}
        </Button>
        <Button
          onClick={() => handleFeature('plagiarism')}
          variant="contained"
          color="secondary"
          startIcon={loadingBtn === 'plagiarism' ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
          disabled={loadingBtn === 'plagiarism'}
        >
          {loadingBtn === 'plagiarism' ? 'Checking...' : 'Check Plagiarism'}
        </Button>
        <Button
          onClick={onRegenerate}
          disabled={loading}
          variant="outlined"
          sx={{
            borderColor: 'secondary.main',
            color: 'secondary.main',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'secondary.main',
              color: 'primary.contrastText',
              borderColor: 'secondary.dark',
            },
          }}
        >
          Regenerate
        </Button>
        <Button
          onClick={() => handleFeature('eliminate')}
          variant="outlined"
          color="secondary"
          startIcon={loadingBtn === 'eliminate' ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
          disabled={loadingBtn === 'eliminate'}
        >
          {loadingBtn === 'eliminate' ? 'Eliminating...' : 'Eliminate Plagiarism'}
        </Button>
      </Box>
      {featureMsg && (
        <Typography sx={{ mt: 2, color: 'info.main', fontWeight: 600 }}>{featureMsg}</Typography>
      )}
    </Box>
  );
}
