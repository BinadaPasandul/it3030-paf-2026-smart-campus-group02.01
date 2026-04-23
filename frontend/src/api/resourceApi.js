import api from "./axios";

export const getAllResources = async (params = {}) => {
  const response = await api.get("/resources", { params });
  return response.data;
};

export const getResourceById = async (id) => {
  const response = await api.get(`/resources/${id}`);
  return response.data;
};

export const createResource = async (data) => {
  const response = await api.post("/resources", data);
  return response.data;
};

export const updateResource = async (id, data) => {
  const response = await api.put(`/resources/${id}`, data);
  return response.data;
};

export const updateResourceStatus = async (id, status) => {
  const response = await api.patch(`/resources/${id}/status`, { status });
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await api.delete(`/resources/${id}`);
  return response.data;
};