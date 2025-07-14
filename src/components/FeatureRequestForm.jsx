import { useState } from 'react';
import { Paper, Stack, TextField, Button, Alert } from '@mui/material';

export default function FeatureRequestForm({ onSubmit, getRequestUser }) {
  const [featureForm, setFeatureForm] = useState({ title: '', description: '' });
  const [featureMsg, setFeatureMsg] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    setFeatureMsg('');
    if (!featureForm.title.trim() || !featureForm.description.trim()) {
      setFeatureMsg('All fields are required.');
      return;
    }
    onSubmit({
      ...featureForm,
      type: 'feature',
      date: new Date().toISOString(),
      user: getRequestUser(),
      id: Math.random().toString(36).slice(2)
    });
    setFeatureMsg('Feature request submitted!');
    setFeatureForm({ title: '', description: '' });
  };

  return (
    <Paper elevation={2} sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, maxWidth: 500, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 6 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Stack spacing={2} alignItems="center">
          <TextField
            label="Title"
            value={featureForm.title}
            onChange={e => setFeatureForm({ ...featureForm, title: e.target.value })}
            required
            fullWidth
            autoComplete="off"
            InputLabelProps={{ sx: { color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } } }}
            sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
          />
          <TextField
            label="Description"
            value={featureForm.description}
            onChange={e => setFeatureForm({ ...featureForm, description: e.target.value })}
            required
            fullWidth
            multiline
            minRows={4}
            InputLabelProps={{ sx: { color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } } }}
            sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
          />
          {featureMsg && <Alert severity="info" sx={{ width: '100%' }}>{featureMsg}</Alert>}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ bgcolor: 'secondary.main', color: 'primary.contrastText', fontWeight: 700, borderRadius: 2, boxShadow: 2, py: 1.5, fontSize: 16, '&:hover': { bgcolor: 'secondary.dark', color: 'primary.contrastText', boxShadow: 4 }, '&:active': { bgcolor: 'secondary.light', color: 'primary.contrastText' }, transition: 'background 0.2s, color 0.2s, box-shadow 0.2s' }}
          >
            Submit Feature Request
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
