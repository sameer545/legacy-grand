import React, { createContext, useContext, useState } from "react";
import Toast from "../components/Toast"; // Make sure Toast component exists
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client"; // 👈 Make sure this path is correct

// Create context
const AppContext = createContext(undefined);

// Provider
export const AppContextProvider = ({ children }) => {
  const [toast, setToast] = useState(undefined);
  const [role, setRole] = useState(null);

  const showToast = (toastMessage) => {
    setToast(toastMessage);
  };

  const { data, isError } = useQuery({
    queryKey: ["validateToken"],
    queryFn: apiClient.validateToken,
    retry: false,
  });

  const isLoggedIn = !isError;

  // Store role if logged in
  React.useEffect(() => {
    if (data?.role) {
      setRole(data.role);
    } else {
      setRole(null);
    }
  }, [data]);

  return (
    <AppContext.Provider value={{ showToast, isLoggedIn, role }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(undefined)}
        />
      )}
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
