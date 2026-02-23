import { useResponse } from "../state/ResponseContext.jsx";
import "./ResponsePanel.css";

export default function ResponsePanel() {
  const { notifications, removeNotification } = useResponse();

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`toast toast-${notification.type}`}>
          <span>{notification.message}</span>
          <button className="toast-close" onClick={() => removeNotification(notification.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
