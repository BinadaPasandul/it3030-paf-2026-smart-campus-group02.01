import axiosInstance from "../../../api/axios";

export const bookingService = {
  // Create a booking
  createBooking: async (bookingData) => {
    const response = await axiosInstance.post("/bookings", bookingData);
    return response.data;
  },

  // Get current user's bookings
  getMyBookings: async () => {
    const response = await axiosInstance.get("/bookings/my");
    return response.data;
  },

  // Get a specific booking by ID
  getBookingById: async (id) => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  },

  // Get all bookings (optional status filter for admins)
  getAllBookings: async (status = "") => {
    const response = await axiosInstance.get(`/bookings${status ? `?status=${status}` : ""}`);
    return response.data;
  },

  // Admin review a booking
  reviewBooking: async (id, status, reason) => {
    const response = await axiosInstance.patch(`/bookings/${id}/review`, { status, reason });
    return response.data;
  },

  // Cancel own booking
  cancelBooking: async (id) => {
    const response = await axiosInstance.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  // Check in to an approved booking
  checkInBooking: async (id) => {
    const response = await axiosInstance.patch(`/bookings/${id}/check-in`);
    return response.data;
  },

  // Delete a pending booking
  deleteBooking: async (id) => {
    const response = await axiosInstance.delete(`/bookings/${id}`);
    return response.data;
  }
};
