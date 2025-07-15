const API_BASE = import.meta.env.PROD
  ? 'https://content-generation-webapp-server.onrender.com/api'
  : '/api';
import { useState } from 'react';
import { Paper, Typography, TextField, Button, Box, Alert, IconButton, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function ClientProfileForm({ token, onCreated }) {
  const [form, setForm] = useState({ name: '', website: '', prompt: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMessage('Client profile created!');
      setForm({ name: '', website: '', prompt: '' });
      onCreated && onCreated();
    } else {
      const data = await res.json();
      setMessage(data.message || 'Error');
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1">Create Client Profile</Typography>
      <form onSubmit={handleSubmit}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField name="name" label="Client Name" value={form.name} onChange={handleChange} required sx={{ flex: 1 }} />
          <TextField name="website" label="Website" value={form.website} onChange={handleChange} required sx={{ flex: 1 }} />
        </Box>
        <Box mt={2} mb={2}>
          <TextField
            name="prompt"
            label="Nature/Prompt"
            value={form.prompt}
            onChange={handleChange}
            sx={{ width: '100%' }}
            multiline
            minRows={5}
            maxRows={10}
            inputProps={{ maxLength: 700 }}
            placeholder="Describe the business, audience, and unique points (up to 100 words)"
            InputProps={{
              endAdornment: (
                <Tooltip
                  title={<Box>
                    <b>Tip:</b> Be specific about the business, target audience, and any unique selling points. This will improve the quality and relevance of the generated content.<br/>
                    <div>Examples:<br/>
                    "Digital marketing agency specializing in SEO and PPC."<br/>
                    "E-commerce store selling eco-friendly home products."<br/>
                    "Personal finance blog focused on saving and investing tips."<br/>
                    "Law firm offering family and corporate legal services."<br/>
                    "Restaurant serving Italian cuisine with a modern twist."</div>
                  </Box>}
                  placement="top"
                  arrow
                >
                  <IconButton size="small" tabIndex={-1}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }}
          />
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Button type="submit" variant="contained" color="secondary" sx={{ minWidth: 120, fontWeight: 700, fontSize: 16, borderRadius: 2, py: 1, bgcolor: 'secondary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'secondary.dark', color: 'primary.contrastText' } }}>Create</Button>
        </Box>
      </form>
      {message && <Alert severity={message.includes('created') ? 'success' : 'error'} sx={{ mt: 1 }}>{message}</Alert>}
    </Paper>
  );
}
