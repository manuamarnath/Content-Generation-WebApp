import { Box, TextField, Select, MenuItem, Typography, Button } from '@mui/material';

export function ContentFormFields({ form, onChange, selectedClient, setSelectedClient, clients }) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        name="title"
        label="Title"
        value={form.title}
        onChange={onChange}
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
        name="keywords"
        label="Keywords (comma separated)"
        value={form.keywords}
        onChange={onChange}
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
        name="length"
        label="Length"
        type="number"
        value={form.length}
        onChange={onChange}
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
        name="headings"
        label="Headings"
        type="number"
        value={form.headings}
        onChange={onChange}
        fullWidth
        InputLabelProps={{
          sx: {
            color: 'text.secondary',
            '&.Mui-focused': { color: 'primary.main' },
          },
        }}
        sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
      />
      <Select name="type" value={form.type} onChange={onChange} fullWidth>
        <MenuItem value="blog">Blog</MenuItem>
        <MenuItem value="website">Website</MenuItem>
      </Select>
      <ClientSelect
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        clients={clients}
      />
    </Box>
  );
}

export function ClientSelect({ selectedClient, setSelectedClient, clients }) {
  return (
    <Select
      value={selectedClient}
      onChange={e => setSelectedClient(e.target.value)}
      displayEmpty
      sx={{ minWidth: 200 }}
    >
      <MenuItem value="">Select client</MenuItem>
      {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
    </Select>
  );
}

import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CircularProgress from '@mui/material/CircularProgress';

export function GeneratedContentDisplay({ content, onSave }) {
  const [copyMsg, setCopyMsg] = useState('');
  const [loadingBtn, setLoadingBtn] = useState(''); // 'plagiarism' | 'eliminate' | ''
  const [featureMsg, setFeatureMsg] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyMsg('Copied!');
      setTimeout(() => setCopyMsg(''), 1500);
    } catch {
      setCopyMsg('Copy failed');
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
        InputLabelProps={{
          sx: {
            color: 'text.secondary',
            '&.Mui-focused': { color: 'primary.main' },
          },
        }}
        sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
      />
      <Box display="flex" gap={2} mt={2}>
        <Button onClick={onSave} variant="contained" color="success">Save</Button>
        <Button onClick={handleCopy} variant="outlined" color="info" startIcon={<ContentCopyIcon />}>{copyMsg || 'Copy'}</Button>
        <Button 
          onClick={() => handleFeature('plagiarism')} 
          variant="contained" 
          color="secondary" 
          startIcon={loadingBtn==='plagiarism'?<CircularProgress size={18} color="inherit" />:<SearchIcon />} 
          disabled={loadingBtn==='plagiarism'}
          sx={{ fontWeight: 700, color: 'primary.contrastText', minWidth: 150, boxShadow: 2, '&:hover': { bgcolor: 'secondary.dark', color: 'primary.contrastText' } }}
        >
          {loadingBtn==='plagiarism' ? 'Checking...' : 'Check Plagiarism'}
        </Button>
        <Button onClick={() => handleFeature('eliminate')} variant="outlined" color="secondary" startIcon={loadingBtn==='eliminate'?<CircularProgress size={18} color="inherit" />:<AutoFixHighIcon />} disabled={loadingBtn==='eliminate'}>
          {loadingBtn==='eliminate' ? 'Eliminating...' : 'Eliminate Plagiarism'}
        </Button>
      </Box>
      {featureMsg && (
        <Typography sx={{ mt: 2, color: 'info.main', fontWeight: 600 }}>{featureMsg}</Typography>
      )}
    </Box>
  );
}
