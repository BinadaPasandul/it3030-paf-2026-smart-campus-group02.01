import api from "./axios";

export const getNotifications = async (unreadOnly = false) => {
  const url = unreadOnly ? "/notifications/unread" : "/notifications";
  const response = await api.get(url);
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data.count;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};
