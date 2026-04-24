import React from "react";
import { Box, Typography, List, CircularProgress, Divider } from "@mui/material";
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import NotificationItem from "./NotificationItem";

function NotificationList({ loading, notifications, onNotificationClick }) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4, height: 200 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        p: 6,
        color: "text.disabled",
        height: 200
      }}>
        <NotificationsOffIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="body1" fontWeight="500">
          All caught up!
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          You have no notifications to show.
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ p: 0, '& .MuiListItem-root': { py: 0 } }}>
      {notifications.map((notification, index) => (
        <React.Fragment key={notification.id}>
          <NotificationItem 
            notification={notification} 
            onClick={onNotificationClick} 
          />
          {index < notifications.length - 1 && <Divider component="li" sx={{ opacity: 0.4 }} />}
        </React.Fragment>
      ))}
    </List>
  );
}

export default NotificationList;
