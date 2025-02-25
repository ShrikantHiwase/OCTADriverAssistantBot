// This is a dummy dashboard you can take actual vehicle data and show fault analysis here also you can create some backend for service alert and show here
import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Modal,
  Box,
  Alert,
  Grow,
  IconButton,
} from '@mui/material';
import { ArrowBackIos } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Modal style for detailed view
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

const VehicleService = () => {
  const navigate = useNavigate();

  // Sample data for demonstration
  const serviceHistoryData = [
    {
      date: '2025-01-01',
      service: 'Oil Change',
      details: 'Changed engine oil and filter.',
    },
    {
      date: '2024-12-15',
      service: 'Tire Rotation',
      details: 'Rotated tires for even wear.',
    },
  ];

  const faultHistoryData = [
    {
      date: '2025-01-10',
      fault: 'Engine Warning',
      details: 'Minor engine misfire detected.',
    },
    {
      date: '2024-11-22',
      fault: 'Brake Issue',
      details: 'Brake pads worn out; replaced pads.',
    },
  ];

  const serviceSuggestions = [
    { suggestion: 'Replace Air Filter', dueIn: '200 miles' },
    { suggestion: 'Check Battery', dueIn: '1 month' },
  ];

  // Sample notifications
  const notifications = [
    { id: 1, message: 'Engine Warning detected on 2025-01-10.' },
    { id: 2, message: 'Scheduled Oil Change on 2025-02-15.' },
  ];

  // State for modal detail view
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});

  const handleOpenModal = (data) => {
    setModalData(data);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalData({});
  };

  // Chart data sample: service and fault counts by month
  const chartData = {
    labels: ['Nov 2024', 'Dec 2024', 'Jan 2025'],
    datasets: [
      {
        label: 'Services',
        data: [0, 1, 1],
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
      {
        label: 'Faults',
        data: [1, 0, 1],
        backgroundColor: 'rgba(255,99,132,0.6)',
      },
    ],
  };

  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{
        position: 'relative',
        px: { xs: 1, sm: 3 },
        py: { xs: 3, sm: 5 },
        overflowX: 'hidden',
      }}
    >
      {/* Circular Back Arrow Button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1000,
          color: '#000',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '50%',
          width: 40,
          height: 40,
          '&:hover': {
            backgroundColor: '#ddd',
          },
        }}
      >
        <ArrowBackIos sx={{ fontSize: 18 }} />
      </IconButton>

      {/* Notifications Section */}
      <Grow in timeout={800}>
        <Card sx={{ mb: 1, backgroundColor: '#fff3e0', boxShadow: 2, minHeight: 70, maxHeight: 150 }}>
          <CardContent sx={{ py: { xs: 0.5, sm: 1 } }}>
            <Typography variant="h6" gutterBottom>
              Notifications & Alerts
            </Typography>
            {notifications.map((note) => (
              <Alert key={note.id} severity="warning" sx={{ mb: 0.5 }}>
                {note.message}
              </Alert>
            ))}
          </CardContent>
        </Card>
      </Grow>

      {/* Service Reminder Card */}
      <Grow in timeout={1000}>
        <Card sx={{ mb: 2, backgroundColor: '#f9fbe7', boxShadow: 2 }}>
          <CardContent sx={{ py: { xs: 1, sm: 2 } }}>
            <Typography variant="h5" gutterBottom>
              Upcoming Service Reminder
            </Typography>
            <Typography variant="body1">
              Your next scheduled service is an Oil Change on <strong>2025-02-15</strong>.
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 1 }}>
              Schedule Service
            </Button>
          </CardContent>
        </Card>
      </Grow>

      {/* Dashboard Header */}
      <Typography variant="h4" gutterBottom>
        Vehicle Service Dashboard
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        {/* Service History */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1200}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="h6" gutterBottom>
                  Service History
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {serviceHistoryData.map((row, index) => (
                      <TableRow
                        key={index}
                        onClick={() => handleOpenModal(row)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                      >
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.service}</TableCell>
                        <TableCell>{row.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                  View Full History
                </Button>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Fault History */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1200}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="h6" gutterBottom>
                  Fault History
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Fault</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {faultHistoryData.map((row, index) => (
                      <TableRow
                        key={index}
                        onClick={() => handleOpenModal(row)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                      >
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.fault}</TableCell>
                        <TableCell>{row.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="contained" color="secondary" sx={{ mt: 1 }}>
                  View Fault Logs
                </Button>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Graphical Insights & Service Suggestions */}
        <Grid item xs={12} container spacing={2}>
          {/* Graphical Insights */}
          <Grid item xs={12} md={6}>
            <Grow in timeout={1400}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent sx={{ p: 1.5, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Service & Fault Trends
                  </Typography>
                  <Box sx={{ position: 'relative', height: 220 }}>
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'top' },
                          title: {
                            display: true,
                            text: 'Monthly Service and Fault Count',
                          },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Service Suggestions */}
          <Grid item xs={12} md={6}>
            <Grow in timeout={1400}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="h6" gutterBottom>
                    Service Suggestions
                  </Typography>
                  <List dense>
                    {serviceSuggestions.map((item, index) => (
                      <ListItem key={index} divider disableGutters>
                        <ListItemText
                          primary={item.suggestion}
                          secondary={`Due in: ${item.dueIn}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="contained" sx={{ mt: 1 }}>
                    Get More Suggestions
                  </Button>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>
      </Grid>

      {/* Detail View Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Detailed Information
          </Typography>
          {modalData.service && (
            <>
              <Typography>Date: {modalData.date}</Typography>
              <Typography>Service: {modalData.service}</Typography>
              <Typography>Details: {modalData.details}</Typography>
            </>
          )}
          {modalData.fault && (
            <>
              <Typography>Date: {modalData.date}</Typography>
              <Typography>Fault: {modalData.fault}</Typography>
              <Typography>Details: {modalData.details}</Typography>
            </>
          )}
          <Button onClick={handleCloseModal} variant="contained" sx={{ mt: 1 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default VehicleService;
