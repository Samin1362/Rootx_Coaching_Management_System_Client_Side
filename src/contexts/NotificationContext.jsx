/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from "react";
import Notification from "../components/Notification";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const showNotification = useCallback(
    ({
      type = "info",
      message,
      title,
      duration = 5000,
      position = "top-right",
    }) => {
      const id = Date.now() + Math.random();
      const newNotification = {
        id,
        type,
        message,
        title,
        duration,
        position,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration + 300); // Add extra time for exit animation
      }

      return id;
    },
    [removeNotification]
  );

  // Helper methods for different notification types
  const success = useCallback(
    (message, title = "Success", options = {}) => {
      return showNotification({
        type: "success",
        message,
        title,
        ...options,
      });
    },
    [showNotification]
  );

  const error = useCallback(
    (message, title = "Error", options = {}) => {
      return showNotification({
        type: "error",
        message,
        title,
        ...options,
      });
    },
    [showNotification]
  );

  const warning = useCallback(
    (message, title = "Warning", options = {}) => {
      return showNotification({
        type: "warning",
        message,
        title,
        ...options,
      });
    },
    [showNotification]
  );

  const info = useCallback(
    (message, title = "Info", options = {}) => {
      return showNotification({
        type: "info",
        message,
        title,
        ...options,
      });
    },
    [showNotification]
  );

  const value = {
    showNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render all active notifications */}
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          type={notif.type}
          message={notif.message}
          title={notif.title}
          duration={notif.duration}
          position={notif.position}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};
