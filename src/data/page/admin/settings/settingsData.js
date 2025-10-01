// src/data/page/admin/settings/settingsData.js
import {
  FiUser,
  FiSettings,
  FiBell,
  FiUsers,
  FiLock,
  FiCreditCard,
  FiGlobe,
} from "react-icons/fi";

/**
 * @typedef {Object} SettingsNavItem
 * @property {string} id - Unique id used to control the active settings tab.
 * @property {string} label - Visible label shown in the settings navigation.
 * @property {Function} icon - React icon component rendered next to the label.
 */
/**
 * Settings navigation items for the Admin Settings page.
 *
 * Used in `src/app/admin/settings/page.js` to render the vertical navigation and
 * control the active settings section.
 * @type {SettingsNavItem[]}
 */
export const settingsNavItems = [
  { id: "profile", label: "Profile", icon: FiUser },
  { id: "account", label: "Account", icon: FiSettings },
  { id: "notifications", label: "Notifications", icon: FiBell },
  { id: "team", label: "Team", icon: FiUsers },
  { id: "security", label: "Security", icon: FiLock },
  { id: "billing", label: "Billing", icon: FiCreditCard },
  { id: "preferences", label: "Preferences", icon: FiGlobe },
];
