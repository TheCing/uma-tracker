import { useState, useRef } from 'preact/hooks';
import styles from './SettingsView.module.css';

export function SettingsView({ 
  apiKey, 
  onSaveApiKey, 
  onExport,
  onImport,
  showToast
}) {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const importInputRef = useRef(null);

  const handleSaveKey = () => {
    const key = keyInput.trim();
    if (!key) {
      showToast('Invalid Key', 'Please enter an API key.', 'error');
      return;
    }
    onSaveApiKey(key);
    showToast('API Key Saved', 'Your API key has been stored securely.', 'success');
  };

  const handleExport = () => {
    const dataStr = onExport();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `uma-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data Exported', 'Your race data has been downloaded.', 'success');
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        const count = onImport(imported);
        showToast('Data Imported', `Added ${count} new race records.`, 'success');
      } catch (error) {
        showToast('Import Failed', 'Invalid file format.', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };

  return (
    <section class="view active">
      <div class="view-header">
        <h1 class="page-title">
          <span class="title-line">APP</span>
          <span class="title-line title-accent">SETTINGS</span>
        </h1>
        <p class="page-subtitle">Configure your tracker preferences</p>
      </div>

      <div class={styles.settingsCard}>
        {/* API Key */}
        <div class={styles.settingGroup}>
          <label class={styles.settingLabel}>
            <span class={styles.settingIcon}>🔑</span>
            <span>Google AI API Key</span>
          </label>
          <p class={styles.settingDescription}>
            Required for OCR analysis. Get your key from{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">
              Google AI Studio
            </a>
          </p>
          <div class={styles.settingInputGroup}>
            <input
              type={showKey ? 'text' : 'password'}
              class={styles.settingInput}
              placeholder="Enter your API key"
              value={keyInput}
              onInput={(e) => setKeyInput(e.target.value)}
            />
            <button 
              class="btn btn-small" 
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <button class="btn btn-primary" onClick={handleSaveKey}>
            Save API Key
          </button>
        </div>

        <div class={styles.settingDivider}></div>

        {/* How It Works */}
        <div class={styles.settingGroup}>
          <label class={styles.settingLabel}>
            <span class={styles.settingIcon}>ℹ️</span>
            <span>How It Works</span>
          </label>
          <p class={styles.settingDescription}>
            Upload screenshots of your race results. The app automatically detects your umas 
            by their <strong>gold/yellow background</strong> in the results list. 
            Each race has 3 of your umas competing against 6 others (9 total entrants).
          </p>
          <p class={styles.settingDescription}>
            Results are automatically grouped by <strong>race conditions</strong> (race name, distance, surface, etc.) 
            so you can track performance for specific Champions Meet races like the Capricorn Cup.
          </p>
          <p class={styles.settingDescription}>
            Umas that don't appear in the visible top positions are marked as "Not Placed" (NP).
          </p>
        </div>

        <div class={styles.settingDivider}></div>

        {/* Data Management */}
        <div class={styles.settingGroup}>
          <label class={styles.settingLabel}>
            <span class={styles.settingIcon}>💾</span>
            <span>Data Management</span>
          </label>
          <p class={styles.settingDescription}>Export or import your race data</p>
          <div class={styles.settingButtonGroup}>
            <button class="btn btn-secondary" onClick={handleExport}>
              Export Data
            </button>
            <button class="btn btn-secondary" onClick={handleImportClick}>
              Import Data
            </button>
          </div>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            hidden
            onChange={handleImportFile}
          />
        </div>
      </div>
    </section>
  );
}
