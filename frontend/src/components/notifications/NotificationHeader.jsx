import React from "react";
import { Box, Typography, Button, Divider, ToggleButtonGroup, ToggleButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function NotificationHeader({ unreadCount, filter, onFilterChange, onMarkAllRead }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, pb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--text)", fontSize: "1.1rem" }}>
          Notifications
        </Typography>
        {unreadCount > 0 && (
          <Button 
            size="small" 
            onClick={onMarkAllRead} 
            startIcon={<CheckCircleIcon fontSize="small" />}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 500,
              color: 'var(--primary)',
              borderRadius: 2,
              '&:hover': { backgroundColor: 'var(--primary-soft)' }
            }}
          >
            Mark all read
          </Button>
        )}
      </Box>
      <Divider sx={{ borderColor: 'var(--border)' }} />
      <Box sx={{ p: 1.5, display: "flex", justifyContent: "center" }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={onFilterChange}
          size="small"
          aria-label="notification filter"
          sx={{
            height: '32px',
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              px: 3,
              fontWeight: 500,
              color: 'var(--muted)',
              borderColor: 'var(--border)',
              '&.Mui-selected': {
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
                '&:hover': {
                  backgroundColor: 'var(--primary-soft)',
                }
              }
            }
          }}
        >
          <ToggleButton value="all" aria-label="all notifications">All</ToggleButton>
          <ToggleButton value="unread" aria-label="unread notifications">Unread</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Divider sx={{ borderColor: 'var(--border)' }} />
    </Box>
  );
}

export default NotificationHeader;
