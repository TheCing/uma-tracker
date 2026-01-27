export function Navigation({ currentView, onViewChange }) {
  const navItems = [
    { id: 'upload', icon: '📷', label: 'Upload' },
    { id: 'results', icon: '📊', label: 'Results' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <nav class="main-nav">
      <div class="nav-brand">
        <span class="brand-icon">🏆</span>
        <span class="brand-text">
          Uma<span class="brand-accent">Tracker</span>
        </span>
      </div>
      <div class="nav-links">
        {navItems.map(item => (
          <button
            key={item.id}
            class={`nav-btn ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span class="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
