// src/components/ui/Toast.js
"use client";
import { createContext, useContext, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
} from "react-icons/fi";

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  z-index: ${({ theme }) => theme.zIndices.toast};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 400px;
  width: 100%;
  pointer-events: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    top: ${({ theme }) => theme.spacing.md};
    right: ${({ theme }) => theme.spacing.md};
    left: ${({ theme }) => theme.spacing.md};
    max-width: none;
  }
`;

const ToastItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  pointer-events: all;
  position: relative;
  overflow: hidden;

  ${({ variant, theme }) => {
    switch (variant) {
      case "success":
        return `
          border-left: 4px solid ${theme.colors.success};
        `;
      case "error":
        return `
          border-left: 4px solid ${theme.colors.error};
        `;
      case "warning":
        return `
          border-left: 4px solid ${theme.colors.warning};
        `;
      case "info":
        return `
          border-left: 4px solid ${theme.colors.info};
        `;
      default:
        return `
          border-left: 4px solid ${theme.colors.primary};
        `;
    }
  }}

  animation: ${({ $isleaving }) =>
    $isleaving ? slideOut : slideIn} 0.3s ease-out;
`;

const ToastIcon = styled.div`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;

  ${({ variant, theme }) => {
    switch (variant) {
      case "success":
        return `color: ${theme.colors.success};`;
      case "error":
        return `color: ${theme.colors.error};`;
      case "warning":
        return `color: ${theme.colors.warning};`;
      case "info":
        return `color: ${theme.colors.info};`;
      default:
        return `color: ${theme.colors.primary};`;
    }
  }}
`;

const ToastContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  line-height: 1.4;
`;

const ToastMessage = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const ToastCloseButton = styled.button`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  transition: color ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-top: 2px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ToastProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  overflow: hidden;
`;

const ToastProgressBar = styled.div`
  height: 100%;
  background-color: ${({ variant, theme }) => {
    switch (variant) {
      case "success":
        return theme.colors.success;
      case "error":
        return theme.colors.error;
      case "warning":
        return theme.colors.warning;
      case "info":
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  }};
  transition: width linear;
  width: ${({ progress }) => progress}%;
`;

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      variant: "info",
      duration: 5000,
      ...toast,
      isLeaving: false,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, isLeaving: true } : toast
      )
    );

    // Remove from DOM after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const toast = useCallback(
    (message, options = {}) => {
      return addToast({ message, ...options });
    },
    [addToast]
  );

  const success = useCallback(
    (message, options = {}) => {
      return addToast({
        message,
        variant: "success",
        title: options.title || "Success",
        ...options,
      });
    },
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      return addToast({
        message,
        variant: "error",
        title: options.title || "Error",
        duration: options.duration || 7000, // Longer duration for errors
        ...options,
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return addToast({
        message,
        variant: "warning",
        title: options.title || "Warning",
        ...options,
      });
    },
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      return addToast({
        message,
        variant: "info",
        title: options.title || "Info",
        ...options,
      });
    },
    [addToast]
  );

  const getIcon = (variant) => {
    switch (variant) {
      case "success":
        return <FiCheckCircle size={20} />;
      case "error":
        return <FiAlertCircle size={20} />;
      case "warning":
        return <FiAlertTriangle size={20} />;
      case "info":
        return <FiInfo size={20} />;
      default:
        return <FiInfo size={20} />;
    }
  };

  const value = {
    toast,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            variant={toast.variant}
            $isleaving={toast.isLeaving}
          >
            <ToastIcon variant={toast.variant}>
              {getIcon(toast.variant)}
            </ToastIcon>
            <ToastContent>
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              <ToastMessage>{toast.message}</ToastMessage>
            </ToastContent>
            <ToastCloseButton onClick={() => removeToast(toast.id)}>
              <FiX size={16} />
            </ToastCloseButton>
            {toast.duration > 0 && (
              <ToastProgress>
                <ToastProgressBar
                  variant={toast.variant}
                  progress={100}
                  style={{
                    animationDuration: `${toast.duration}ms`,
                    animationName: "toast-progress",
                    animationTimingFunction: "linear",
                    animationFillMode: "forwards",
                  }}
                />
              </ToastProgress>
            )}
          </ToastItem>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// CSS for progress bar animation (add to global styles)
export const toastProgressKeyframes = `
  @keyframes toast-progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

// Hook for programmatic toast usage
export const useToastNotifications = () => {
  const { success, error, warning, info, toast } = useToast();

  const notifySuccess = useCallback(
    (message, title) => {
      success(message, { title });
    },
    [success]
  );

  const notifyError = useCallback(
    (message, title) => {
      error(message, { title });
    },
    [error]
  );

  const notifyWarning = useCallback(
    (message, title) => {
      warning(message, { title });
    },
    [warning]
  );

  const notifyInfo = useCallback(
    (message, title) => {
      info(message, { title });
    },
    [info]
  );

  const notifyApiError = useCallback(
    (err, defaultMessage = "An error occurred") => {
      const message =
        err?.response?.data?.message || err?.message || defaultMessage;
      error(message, { title: "API Error" });
    },
    [error]
  );

  const notifyFormSuccess = useCallback(
    (action = "saved") => {
      success(`Changes ${action} successfully`, { title: "Success" });
    },
    [success]
  );

  const notifyFormError = useCallback(
    (errors) => {
      if (Array.isArray(errors)) {
        errors.forEach((err) => error(err, { title: "Validation Error" }));
      } else {
        error(errors || "Please check your input and try again", {
          title: "Validation Error",
        });
      }
    },
    [error]
  );

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyApiError,
    notifyFormSuccess,
    notifyFormError,
    toast,
  };
};
