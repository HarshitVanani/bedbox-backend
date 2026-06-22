// frontend/src/utils/notificationSystem.js

/**
 * Global trigger engine to dispatch a secure browser banner alert
 * @param {string} title - The header context (e.g., "Fee Invoice Issued")
 * @param {string} body - The descriptive text line
 */
export const triggerAppNotification = (title, body) => {
  // 1. Core Constraint Check: Read the exact preference state we built in your SettingsPanel!
  const isMuted = localStorage.getItem('bedbox_notifications') === 'muted';
  
  if (isMuted) {
    console.log(`⚠️ Notification suppressed by user preference parameters: "${title}"`);
    return; // Exits instantly without displaying anything to the user
  }

  // 2. Fallback execution: Create a beautiful in-app alert notification banner
  // (Can be linked directly to your Socket.io architecture later)
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/shield.png" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }

  // 3. Fallback broadcast: Dispatch a custom browser DOM event so active open panels can react
  const alertEvent = new CustomEvent('bedbox_live_alert', { detail: { title, body } });
  window.dispatchEvent(alertEvent);
};