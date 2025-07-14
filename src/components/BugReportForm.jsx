import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

export default function BugReportForm({ onSubmit, getRequestUser }) {
  const [bugForm, setBugForm] = useState({ title: '', description: '' });
  const [bugMsg, setBugMsg] = useState('');
  const [bugImages, setBugImages] = useState([]);

  const handleSubmit = e => {
    e.preventDefault();
    setBugMsg('');
    if (!bugForm.title.trim() || !bugForm.description.trim()) {
      setBugMsg('All fields are required.');
      return;
    }
    onSubmit({
      ...bugForm,
      images: bugImages,
      type: 'bug',
      date: new Date().toISOString(),
      user: getRequestUser(),
      id: Math.random().toString(36).slice(2)
    });
    setBugMsg('Bug report submitted!');
    setBugForm({ title: '', description: '' });
    setBugImages([]);
  };

  return (
    <Paper elevation={2} sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, maxWidth: 500, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 6 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Stack spacing={2} alignItems="center">
          <TextField
            label="Title"
            value={bugForm.title}
            onChange={e => setBugForm({ ...bugForm, title: e.target.value })}
            required
            fullWidth
            autoComplete="off"
            InputLabelProps={{ sx: { color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } } }}
            sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
          />
          <TextField
            label="Description"
            value={bugForm.description}
            onChange={e => setBugForm({ ...bugForm, description: e.target.value })}
            required
            fullWidth
            multiline
            minRows={4}
            InputLabelProps={{ sx: { color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } } }}
            sx={{ bgcolor: 'background.default', input: { color: 'text.primary' } }}
          />
          <Box width="100%" sx={{ mt: -2, mb: 1 }} display="flex" flexDirection="row" gap={2} alignItems="center">
            <Button
              variant="outlined"
              component="label"
              startIcon={<DownloadIcon />}
              sx={{ flex: 1, py: 2, fontWeight: 600, fontSize: 16, borderStyle: 'dashed', borderColor: 'secondary.main', color: 'secondary.main', bgcolor: 'background.default', '&:hover': { bgcolor: 'secondary.light', borderColor: 'secondary.dark', color: 'secondary.dark' } }}
            >
              Upload Screenshot(s)
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                multiple
                hidden
                style={{ display: 'none' }}
                onChange={e => {
                  const files = Array.from(e.target.files);
                  setBugImages(files);
                }}
              />
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ flex: 1, py: 2, bgcolor: 'secondary.main', color: 'primary.contrastText', fontWeight: 700, borderRadius: 2, boxShadow: 2, fontSize: 16, '&:hover': { bgcolor: 'secondary.dark', color: 'primary.contrastText', boxShadow: 4 }, '&:active': { bgcolor: 'secondary.light', color: 'primary.contrastText' }, transition: 'background 0.2s, color 0.2s, box-shadow 0.2s' }}
            >
              Submit Bug Report
            </Button>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
            {bugImages.map((img, idx) => (
              <Box key={idx} sx={{ width: 64, height: 64, border: '1px solid', borderColor: 'secondary.main', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={URL.createObjectURL(img)} alt={`screenshot-${idx}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
              </Box>
            ))}
          </Box>
          {bugMsg && <Alert severity="info" sx={{ width: '100%' }}>{bugMsg}</Alert>}
        </Stack>
      </form>
    </Paper>
  );
}
