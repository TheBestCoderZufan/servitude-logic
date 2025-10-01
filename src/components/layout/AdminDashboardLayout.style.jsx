import styled from "styled-components";

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const Sidebar = styled.aside`
  width: ${({ $iscollapsed }) => ($iscollapsed ? "80px" : "280px")};
  background-color: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  transition: width ${({ theme }) => theme.transitions.base};
  flex-shrink: 0;
  position: relative;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    position: fixed;
    top: 0;
    left: ${({ $ismobileopen }) => ($ismobileopen ? "0" : "-280px")};
    height: 100vh;
    z-index: ${({ theme }) => theme.zIndices.overlay};
    width: 280px;
  }
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  display: ${({ $iscollapsed }) => ($iscollapsed ? "none" : "block")};
`;

const CollapseButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.secondary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const Navigation = styled.nav`
  padding: ${({ theme }) => theme.spacing.md};
`;

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const NavSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: 0 ${({ theme }) => theme.spacing.sm};
  display: ${({ $iscollapsed }) => ($iscollapsed ? "none" : "block")};
`;

const NavItem = styled.a`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : theme.colors.text.secondary};
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.infoLight : "transparent"};
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.infoLight : theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
    text-decoration: none;
    outline: none;
  }

  svg {
    width: 20px;
    height: 20px;
    margin-right: ${({ theme, $iscollapsed }) =>
      $iscollapsed ? "0" : theme.spacing.md};
    flex-shrink: 0;
  }

  span {
    display: ${({ $iscollapsed }) => ($iscollapsed ? "none" : "inline")};
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const TopBar = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MobileMenuButton = styled.button`
  display: none;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  outline: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
    outline: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const NotificationButton = styled.button`
  position: relative;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.secondary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.full};
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    outline: none;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  line-height: 1.2;
`;

const UserRole = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.2;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
`;

const MobileOverlay = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: ${({ $ismobileopen }) => ($ismobileopen ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: ${({ theme }) => theme.zIndices.modal};
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.sm};
  min-width: 200px;
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  display: ${({ $isopen }) => ($isopen ? "block" : "none")};
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: left;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export {
  LayoutContainer,
  Sidebar,
  SidebarHeader,
  Logo,
  Navigation,
  NavSectionTitle,
  NavItem,
  CollapseButton,
  MainContent,
  TopBar,
  MobileMenuButton,
  TopBarActions,
  NotificationButton,
  NotificationBadge,
  UserMenu,
  UserButton,
  Avatar,
  UserInfo,
  UserName,
  UserRole,
  ContentArea,
  MobileOverlay,
  UserDropdown,
  DropdownItem,
  NavSection,
};
