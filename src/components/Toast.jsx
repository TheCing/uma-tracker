import styles from './Toast.module.css';

export function ToastContainer({ toasts }) {
  const icons = {
    success: '✅',
    error: '❌',
    info: '💡'
  };

  const typeClasses = {
    success: styles.toastSuccess,
    error: styles.toastError,
    info: styles.toastInfo
  };

  return (
    <div class={styles.toastContainer}>
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          class={`${styles.toast} ${typeClasses[toast.type]} ${toast.exiting ? styles.toastOut : ''}`}
        >
          <span class={styles.toastIcon}>{icons[toast.type]}</span>
          <div class={styles.toastContent}>
            <span class={styles.toastTitle}>{toast.title}</span>
            <span class={styles.toastMessage}>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
