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

  // 🎯 FIXED: Wrap native browser Notification API in a safety check for mobile WebView containers
  if (typeof Notification !== 'undefined') {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/shield.png" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  } else {
    console.log(`📱 Running inside mobile sandbox container. Alert caught: [${title}] - ${body}`);
  }

  // 3. Fallback broadcast: Dispatch a custom browser DOM event so active open panels can react
  const alertEvent = new CustomEvent('bedbox_live_alert', { detail: { title, body } });
  window.dispatchEvent(alertEvent);
};