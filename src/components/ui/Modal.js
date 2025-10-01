// src/components/ui/Modal.js
"use client";
import { useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Button } from "@/components/ui";
import {
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  z-index: ${({ theme }) => theme.zIndices.modal};
  animation: ${fadeIn} 0.2s ease-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.md};
    align-items: flex-end;
  }
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  width: 100%;
  max-width: ${({ size }) => {
    switch (size) {
      case "sm":
        return "400px";
      case "lg":
        return "800px";
      case "xl":
        return "1200px";
      default:
        return "600px";
    }
  }};
  max-height: 90vh;
  overflow: hidden;
  animation: ${slideUp} 0.2s ease-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    max-height: 95vh;
    border-radius: ${({ theme }) => theme.radii.lg}
      ${({ theme }) => theme.radii.lg} 0 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ModalCloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  max-height: calc(90vh - 140px);
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

// Base Modal Component
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  footer,
  ...props
}) => {
  const modalRef = useRef(null);
  const lastActiveRef = useRef(null);
  const titleId = "modal-title-" + Math.random().toString(36).slice(2, 8);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    const trapFocus = (e) => {
      if (!modalRef.current || e.key !== "Tab") return;
      const focusable = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (isOpen) {
      lastActiveRef.current = document.activeElement;
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", trapFocus);
      document.body.style.overflow = "hidden";
      // Move focus inside the modal
      setTimeout(() => {
        if (!modalRef.current) return;
        const first = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (first || modalRef.current).focus();
      }, 0);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", trapFocus);
      document.body.style.overflow = "unset";
      // Restore focus to the previously focused element
      if (lastActiveRef.current && typeof lastActiveRef.current.focus === "function") {
        lastActiveRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay role="presentation" {...props}>
      <ModalContainer
        ref={modalRef}
        size={size}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        {title && (
          <ModalHeader>
            <ModalTitle id={titleId}>{title}</ModalTitle>
            {showCloseButton && (
              <ModalCloseButton onClick={onClose} aria-label="Close dialog">
                <FiX size={18} />
              </ModalCloseButton>
            )}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </Overlay>
  );
};

// Confirmation Dialog Component
const ConfirmationIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};

  ${({ variant, theme }) => {
    switch (variant) {
      case "danger":
        return `
          background-color: ${theme.colors.errorLight};
          color: ${theme.colors.error};
        `;
      case "warning":
        return `
          background-color: ${theme.colors.warningLight};
          color: ${theme.colors.warning};
        `;
      case "success":
        return `
          background-color: ${theme.colors.successLight};
          color: ${theme.colors.success};
        `;
      default:
        return `
          background-color: ${theme.colors.infoLight};
          color: ${theme.colors.info};
        `;
    }
  }}
`;

const ConfirmationTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const ConfirmationMessage = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin: 0 0 ${({ theme }) => theme.spacing.xl} 0;
  line-height: 1.5;
`;

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <FiAlertTriangle size={24} />;
      case "warning":
        return <FiAlertCircle size={24} />;
      case "success":
        return <FiCheckCircle size={24} />;
      default:
        return <FiInfo size={24} />;
    }
  };

  const getConfirmVariant = () => {
    switch (variant) {
      case "danger":
        return "danger";
      case "warning":
        return "warning";
      case "success":
        return "success";
      default:
        return "primary";
    }
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button
        variant={getConfirmVariant()}
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={footer}
      showCloseButton={false}
    >
      <ConfirmationIcon variant={variant}>{getIcon()}</ConfirmationIcon>
      <ConfirmationTitle>{title}</ConfirmationTitle>
      <ConfirmationMessage>{message}</ConfirmationMessage>
    </Modal>
  );
};

const ButtonContainer = styled.div``;
// Form Modal Component
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = "Save",
  cancelText = "Cancel",
  isLoading = false,
  size = "md",
  submitVariant = "primary",
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button
        type="submit"
        form="modal-form"
        variant={submitVariant}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : submitText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={footer}
    >
      <form id="modal-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
};

// Drawer Component (Side Modal)
const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndices.modal};
  animation: ${fadeIn} 0.2s ease-out;
`;

const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  ${({ placement }) => (placement === "left" ? "left: 0;" : "right: 0;")}
  width: ${({ size }) => {
    switch (size) {
      case "sm":
        return "320px";
      case "lg":
        return "600px";
      case "xl":
        return "800px";
      default:
        return "480px";
    }
  }};
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  display: flex;
  flex-direction: column;
  animation: ${({ placement }) =>
      placement === "left" ? slideInFromLeft : slideInFromRight}
    0.3s ease-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100vw;
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const DrawerTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const DrawerBody = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
`;

const DrawerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  flex-shrink: 0;
`;

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  placement = "right",
  footer,
  showCloseButton = true,
}) => {
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <DrawerOverlay>
      <DrawerContainer ref={drawerRef} size={size} placement={placement}>
        {title && (
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {showCloseButton && (
              <ModalCloseButton onClick={onClose}>
                <FiX size={18} />
              </ModalCloseButton>
            )}
          </DrawerHeader>
        )}
        <DrawerBody>{children}</DrawerBody>
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContainer>
    </DrawerOverlay>
  );
};

// Popover Component
const PopoverContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const PopoverContent = styled.div`
  position: absolute;
  z-index: ${({ theme }) => theme.zIndices.popover};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.md};
  min-width: 200px;

  ${({ placement }) => {
    switch (placement) {
      case "top":
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
        `;
      case "bottom":
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
        `;
      case "left":
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 8px;
        `;
      case "right":
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 8px;
        `;
      default:
        return `
          top: 100%;
          left: 0;
          margin-top: 8px;
        `;
    }
  }}

  animation: ${slideUp} 0.15s ease-out;
`;

export const Popover = ({
  children,
  content,
  placement = "bottom",
  trigger = "click",
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen]);

  const handleTrigger = () => {
    if (trigger === "click") {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setIsOpen(false);
    }
  };

  return (
    <PopoverContainer
      ref={popoverRef}
      onClick={handleTrigger}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isOpen && (
        <PopoverContent placement={placement}>{content}</PopoverContent>
      )}
    </PopoverContainer>
  );
};
