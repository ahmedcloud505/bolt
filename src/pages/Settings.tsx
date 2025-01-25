import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import { useThemeStore } from '../lib/store';

export default function Settings() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <List>
          <ListItem>
            <ListItemText
              primary="Dark Mode"
              secondary="Toggle between light and dark theme"
            />
            <ListItemSecondaryAction>
              <Switch checked={isDarkMode} onChange={toggleTheme} />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Email Notifications"
              secondary="Receive email notifications for important updates"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Desktop Notifications"
              secondary="Show desktop notifications for important updates"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={desktopNotifications}
                onChange={(e) => setDesktopNotifications(e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        About
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          ERP System v1.0.0
        </Typography>
        <Typography variant="body2" color="textSecondary">
          A comprehensive enterprise resource planning system for managing employees,
          products, and sales invoices.
        </Typography>
      </Paper>
    </Box>
  );
}