export function ToastContainer({ toasts }) {
  const icons = {
    success: '✅',
    error: '❌',
    info: '💡'
  };

  return (
    <div class="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          class={`toast toast-${toast.type} ${toast.exiting ? 'toast-out' : ''}`}
        >
          <span class="toast-icon">{icons[toast.type]}</span>
          <div class="toast-content">
            <span class="toast-title">{toast.title}</span>
            <span class="toast-message">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
