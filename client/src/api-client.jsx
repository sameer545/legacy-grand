const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("REACT_APP_API_BASE_URL is not defined in .env file");
}

// âœ… Helper function for error handling
const handleResponse = async (response) => {
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return body;
};

// ========== AUTHENTICATION ==========
export const register = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  return handleResponse(response);
};

export const login = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });
  return handleResponse(response);
};

export const validateToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Token invalid");
  }
  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    credentials: "include",
    method: "POST"
  });
  if (!response.ok) {
    throw new Error("Error during sign out");
  }
};

// ========== ROOMS ==========
export const getRooms = async () => {
  const response = await fetch(`${API_BASE_URL}/api/rooms`, {
    credentials: "include"
  });
  return handleResponse(response);
};

export const getRoomById = async (roomId) => {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
    credentials: "include"
  });
  return handleResponse(response);
};

// ========== GALLERY ==========
export const uploadGalleryImage = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/api/gallery/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return handleResponse(response);
};

export const getGalleryImages = async (roomType) => {
  const response = await fetch(`${API_BASE_URL}/api/gallery/${roomType}`, {
    credentials: "include"
  });
  return handleResponse(response);
};

// ========== PAYMENTS ==========
export const createPaymentOrder = async (amount) => {
  const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ amount })
  });
  return handleResponse(response);
};

export const verifyPayment = async (paymentData) => {
  const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(paymentData)
  });
  return handleResponse(response);
};

// ========== BOOKINGS ==========
export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(bookingData)
  });
  return handleResponse(response);
};

export const getUserBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/api/bookings/user`, {
    credentials: "include"
  });
  return handleResponse(response);
};

export const getAllBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/api/bookings/admin`, {
    credentials: "include"
  });
  return handleResponse(response);
};

// ========== CONTACT/MESSAGES ==========
export const sendContactMessage = async (messageData) => {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(messageData)
  });
  return handleResponse(response);
};

export const getMessages = async () => {
  const response = await fetch(`${API_BASE_URL}/api/contact/messages`, {
    credentials: "include"
  });
  return handleResponse(response);
};

// ========== ADMIN FUNCTIONS ==========
export const getAdminStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    credentials: "include"
  });
  return handleResponse(response);
};

export const deleteBooking = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
    method: "DELETE",
    credentials: "include"
  });
  return handleResponse(response);
};

export const updateBookingStatus = async (bookingId, status) => {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });
  return handleResponse(response);
};