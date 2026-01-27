import styles from './Navigation.module.css';

export function Navigation({ currentView, onViewChange }) {
  const navItems = [
    { id: 'upload', icon: '📷', label: 'Upload' },
    { id: 'results', icon: '📊', label: 'Results' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <nav class={styles.nav}>
      <div class={styles.brand}>
        <span class={styles.brandIcon}>🏆</span>
        <span class={styles.brandText}>
          Uma<span class={styles.brandAccent}>Tracker</span>
        </span>
      </div>
      <div class={styles.links}>
        {navItems.map(item => (
          <button
            key={item.id}
            class={`${styles.navBtn} ${currentView === item.id ? styles.active : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span class={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
