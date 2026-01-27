import { useState, useCallback } from 'preact/hooks';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, message, type = 'info') => {
    const id = `toast_${Date.now()}`;
    const toast = { id, title, message, type };
    
    setToasts(prev => [...prev, toast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.map(t => 
        t.id === id ? { ...t, exiting: true } : t
      ));
      
      // Actually remove after animation
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => 
      t.id === id ? { ...t, exiting: true } : t
    ));
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return { toasts, showToast, dismissToast };
}
