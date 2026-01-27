import { useState, useCallback } from 'preact/hooks';
import { Navigation } from './components/Navigation';
import { Background } from './components/Background';
import { OnboardingView } from './components/OnboardingView';
import { UploadView } from './components/UploadView';
import { ResultsView } from './components/ResultsView';
import { SettingsView } from './components/SettingsView';
import { ToastContainer } from './components/Toast';
import { useRaces } from './hooks/useRaces';
import { useToast } from './hooks/useToast';
import { useSettings } from './hooks/useSettings';
import { analyzeRaceScreenshot, getOrdinalSuffix } from './utils/gemini';

export function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    races, 
    addRace, 
    deleteRace, 
    clearAllRaces, 
    importRaces, 
    exportRaces,
    getConditions,
    getFilteredRaces,
    getStats,
    getCharacterStats
  } = useRaces();
  
  const { toasts, showToast } = useToast();
  const { 
    apiKey, 
    setApiKey, 
    conditionFilter, 
    setConditionFilter
  } = useSettings();

  const handleAnalyze = useCallback(async (file) => {
    if (!apiKey) {
      showToast('API Key Required', 'Please set your Google AI API key in Settings.', 'error');
      setCurrentView('settings');
      return false;
    }

    setIsProcessing(true);

    try {
      const result = await analyzeRaceScreenshot(apiKey, file);
      
      addRace(result);

      // Build toast message
      const playerResults = result.playerResults || [];
      const notPlaced = result.playerUmasNotPlaced || 0;
      
      let positionText = '';
      if (playerResults.length > 0) {
        const positions = playerResults
          .map(r => `${r.position}${getOrdinalSuffix(r.position)}`)
          .join(', ');
        positionText = `Placed: ${positions}`;
        if (notPlaced > 0) {
          positionText += ` | ${notPlaced} did not place`;
        }
      } else if (notPlaced > 0) {
        positionText = `${notPlaced} umas did not place in top positions`;
      } else {
        positionText = 'Race recorded';
      }

      showToast('Race Analyzed!', positionText, 'success');
      
      setCurrentView('results');
      return true;
    } catch (error) {
      console.error('Analysis error:', error);
      showToast('Analysis Failed', error.message || 'Could not analyze the image.', 'error');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, addRace, showToast]);

  const handleClearAll = useCallback(() => {
    clearAllRaces();
    showToast('History Cleared', 'All race data has been deleted.', 'info');
  }, [clearAllRaces, showToast]);

  const conditions = getConditions();
  const filteredRaces = getFilteredRaces(conditionFilter);
  const stats = getStats(conditionFilter);
  const characterStats = getCharacterStats(conditionFilter);

  // Get current condition info for display
  const currentCondition = conditionFilter === 'all' 
    ? null 
    : conditions.find(c => c.key === conditionFilter);

  const handleOnboardingComplete = useCallback((key) => {
    setApiKey(key);
    showToast('Welcome!', 'Your API key has been saved. Start uploading race screenshots!', 'success');
  }, [setApiKey, showToast]);

  // Show onboarding if no API key is set
  if (!apiKey) {
    return (
      <div class="app-container">
        <Background />
        <OnboardingView onComplete={handleOnboardingComplete} />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  return (
    <div class="app-container">
      <Background />
      
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />

      <main class="main-content">
        {currentView === 'upload' && (
          <UploadView 
            onAnalyze={handleAnalyze}
            isProcessing={isProcessing}
          />
        )}

        {currentView === 'results' && (
          <ResultsView 
            races={filteredRaces}
            stats={stats}
            characterStats={characterStats}
            conditions={conditions}
            currentCondition={currentCondition}
            conditionFilter={conditionFilter}
            onConditionChange={setConditionFilter}
            onDeleteRace={deleteRace}
            onClearAll={handleClearAll}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView 
            apiKey={apiKey}
            onSaveApiKey={setApiKey}
            onExport={exportRaces}
            onImport={importRaces}
            showToast={showToast}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
