import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

export default function ExportLogsButton({ logs }) {
  const handleExport = () => {
    const csv = [
      'Date,User,Email,Client,Title',
      ...logs.map(log => `"${log.createdAt?.slice(0,19).replace('T',' ')}","${log.user?.name}","${log.user?.email}","${log.client?.name}","${log.title}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generation_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button
      onClick={handleExport}
      variant="contained"
      startIcon={<DownloadIcon />}
      sx={{
        ml: 2,
        bgcolor: 'secondary.main',
        color: 'primary.contrastText',
        fontWeight: 600,
        boxShadow: 2,
        borderRadius: 2,
        '&:hover': {
          bgcolor: 'secondary.dark',
          color: 'primary.contrastText'
        },
        '&:active': {
          bgcolor: 'secondary.light',
          color: 'primary.contrastText',
        },
        transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
      }}
    >
      Export Logs
    </Button>
  );
}
