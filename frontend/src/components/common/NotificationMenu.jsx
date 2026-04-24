import React, { useState, useEffect } from "react";
import { IconButton, Badge, Popover, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined"; // Softer outlined icon
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notificationApi";
import NotificationHeader from "../notifications/NotificationHeader";
import NotificationList from "../notifications/NotificationList";

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
        // Optimistically update the list so we don't have to re-fetch immediately if filtering "all"
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
        sx={{
          mr: 2,
          transition: 'all 0.2s',
          backgroundColor: open ? 'rgba(0,0,0,0.04)' : 'transparent',
          '&:focus': { outline: 'none' },
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{ '& .MuiBadge-badge': { fontWeight: 'bold', border: '2px solid white' } }}
        >
          <NotificationsIcon sx={{ color: 'var(--text-color)', fontSize: '1.6rem' }} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              width: 380,
              minHeight: 350,
              maxHeight: 550,
              mt: 1.5,
              display: "flex",
              flexDirection: "column",
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--panel)',
              color: 'var(--text)',
            }
          }
        }}
        // Kept PaperProps for Mui backward compatibility just in case
        PaperProps={{
          style: {
            width: 380,
            minHeight: 350,
            maxHeight: 550,
            marginTop: '12px',
            display: "flex",
            flexDirection: "column",
            borderRadius: '12px',
            backgroundColor: 'var(--panel)',
            color: 'var(--text)',
            boxShadow: 'var(--shadow-lg)'
          },
        }}
      >
        <NotificationHeader 
          unreadCount={unreadCount}
          filter={filter}
          onFilterChange={handleFilterChange}
          onMarkAllRead={handleMarkAllRead}
        />
        
        <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
          <NotificationList 
            loading={loading}
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
          />
        </Box>
      </Popover>
    </>
  );
}

export default NotificationMenu;
