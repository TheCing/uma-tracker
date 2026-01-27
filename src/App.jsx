import { useState, useCallback } from 'preact/hooks';
import { Navigation } from './components/Navigation';
import { Background } from './components/Background';
import { OnboardingView } from './components/OnboardingView';
import { UploadView } from './components/UploadView';
import { ResultsView } from './components/ResultsView';
import { SettingsView } from './components/SettingsView';
import { EditRaceModal } from './components/EditRaceModal';
import { ToastContainer } from './components/Toast';
import { useRaces } from './hooks/useRaces';
import { useToast } from './hooks/useToast';
import { useSettings } from './hooks/useSettings';
import { analyzeRaceScreenshot, getOrdinalSuffix } from './utils/gemini';

export function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingRace, setPendingRace] = useState(null); // Race being reviewed before save
  const [editingRace, setEditingRace] = useState(null); // Existing race being edited
  
  const { 
    races, 
    addRace,
    updateRace,
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
      
      // Show the review modal instead of saving immediately
      setPendingRace(result);
      
      return true;
    } catch (error) {
      console.error('Analysis error:', error);
      showToast('Analysis Failed', error.message || 'Could not analyze the image.', 'error');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, showToast]);

  const handleSavePendingRace = useCallback((raceData) => {
    addRace(raceData);
    
    // Build toast message
    const playerResults = raceData.playerResults || [];
    const notPlaced = raceData.playerUmasNotPlaced || 0;
    
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

    showToast('Race Saved!', positionText, 'success');
    setPendingRace(null);
    setCurrentView('results');
  }, [addRace, showToast]);

  const handleCancelPendingRace = useCallback(() => {
    setPendingRace(null);
    showToast('Cancelled', 'Race was not saved.', 'info');
  }, [showToast]);

  const handleEditRace = useCallback((race) => {
    setEditingRace(race);
  }, []);

  const handleSaveEditedRace = useCallback((raceData) => {
    updateRace(raceData.id, raceData);
    showToast('Race Updated', 'Your changes have been saved.', 'success');
    setEditingRace(null);
  }, [updateRace, showToast]);

  const handleCancelEditRace = useCallback(() => {
    setEditingRace(null);
  }, []);

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
            onEditRace={handleEditRace}
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

      {/* Review Modal - shown after AI analysis */}
      {pendingRace && (
        <EditRaceModal
          race={pendingRace}
          isNew={true}
          onSave={handleSavePendingRace}
          onCancel={handleCancelPendingRace}
        />
      )}

      {/* Edit Modal - shown when editing existing race */}
      {editingRace && (
        <EditRaceModal
          race={editingRace}
          isNew={false}
          onSave={handleSaveEditedRace}
          onCancel={handleCancelEditRace}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
