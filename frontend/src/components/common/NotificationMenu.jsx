import React, { useState, useEffect } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notificationApi";

function NotificationMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (e) {
      console.error("Failed to fetch unread count", e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchList = async (currentFilter) => {
    try {
      setLoading(true);
      const data = await getNotifications(currentFilter === "unread");
      setNotifications(data);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchList(filter);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      fetchList(newFilter);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      if (filter === "unread") {
        setNotifications([]);
      } else {
        fetchList("all");
      }
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (e) {
        console.error("Failed to mark as read", e);
      }
    } 
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleOpen} 
        sx={{ mr: 2, '&:focus': { outline: 'none' } }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon sx={{ color: 'var(--text-color)' }} />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          style: { width: 350, maxHeight: 500, display: "flex", flexDirection: "column" },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: 'var(--text-color)' }}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead} startIcon={<CheckCircleIcon />}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
            aria-label="notification filter"
          >
            <ToggleButton value="all" aria-label="all notifications">
              All
            </ToggleButton>
            <ToggleButton value="unread" aria-label="unread notifications">
              Unread
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Divider />
        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="textSecondary">No notifications to show.</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <ListItem
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: notification.read ? "inherit" : "rgba(25, 118, 210, 0.08)",
                      '&:hover': {
                        backgroundColor: "rgba(0, 0, 0, 0.04)"
                      }
                    }}
                  >
                    <ListItemText
                      primary={notification.message}
                      secondary={new Date(notification.createdAt).toLocaleString()}
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: notification.read ? "normal" : "bold",
                        color: "var(--text-color)"
                      }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}

export default NotificationMenu;
