export function getApiErrorMessage(error, fallbackMessage = "Something went wrong.") {
  const data = error?.response?.data;

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (data?.messages && typeof data.messages === "object") {
    const firstMessage = Object.values(data.messages)[0];
    if (typeof firstMessage === "string" && firstMessage.trim()) {
      return firstMessage;
    }
  }

  return fallbackMessage;
}
