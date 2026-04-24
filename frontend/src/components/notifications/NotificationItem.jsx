import React from "react";
import { ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Box, Badge } from "@mui/material";
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'; // For tickets
import EventIcon from '@mui/icons-material/Event'; // For bookings
import SettingsIcon from '@mui/icons-material/Settings'; // For system
import PersonIcon from '@mui/icons-material/Person'; // For user/defaults

function NotificationItem({ notification, onClick }) {
  // Determine icon and color based on category
  const getIconConfig = (category) => {
    switch (category?.toUpperCase()) {
      case "TICKET":
        return { icon: <ConfirmationNumberIcon fontSize="small" />, color: "rgba(34, 197, 94, 0.15)", iconColor: "#22c55e" };
      case "BOOKING":
        return { icon: <EventIcon fontSize="small" />, color: "var(--primary-soft)", iconColor: "var(--primary)" };
      case "SYSTEM":
        return { icon: <SettingsIcon fontSize="small" />, color: "rgba(239, 68, 68, 0.15)", iconColor: "#ef4444" };
      default:
        return { icon: <PersonIcon fontSize="small" />, color: "rgba(250, 204, 21, 0.15)", iconColor: "#facc15" };
    }
  };

  const config = getIconConfig(notification.category);
  const isUnread = !notification.read;

  return (
    <ListItem
      onClick={() => onClick(notification)}
      alignItems="flex-start"
      sx={{
        cursor: 'pointer',
        px: 2,
        py: 1.5,
        position: 'relative',
        transition: 'background-color 0.2s ease',
        backgroundColor: isUnread ? "rgba(255, 255, 255, 0.03)" : "transparent",
        borderLeft: isUnread ? "4px solid var(--primary)" : "4px solid transparent",
        '&:hover': {
          backgroundColor: isUnread ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.03)",
        }
      }}
    >
      <ListItemAvatar sx={{ minWidth: 50 }}>
        <Badge
          color="primary"
          variant="dot"
          invisible={!isUnread}
          sx={{ '& .MuiBadge-badge': { right: 4, top: 4, border: '2px solid white' } }}
        >
          <Avatar sx={{ bgcolor: config.color, color: config.iconColor, width: 40, height: 40 }}>
            {config.icon}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontWeight: isUnread ? 500 : 400,
              color: isUnread ? 'var(--text)' : 'var(--muted)',
              display: 'block',
              lineHeight: 1.4,
              mb: 0.5
            }}
          >
            {notification.message}
          </Typography>
        }
        secondary={
          <Typography
            component="span"
            variant="caption"
            sx={{ color: "rgba(255, 255, 255, 0.4)", fontWeight: 400 }}
          >
            {new Date(notification.createdAt).toLocaleString(undefined, { 
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </Typography>
        }
      />
    </ListItem>
  );
}

export default NotificationItem;
