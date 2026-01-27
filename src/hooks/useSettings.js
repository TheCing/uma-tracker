import { useState, useEffect, useCallback } from 'preact/hooks';

const API_KEY_STORAGE = 'uma-tracker-api-key';
const CONDITION_FILTER_STORAGE = 'uma-tracker-condition-filter';

export function useSettings() {
  const [apiKey, setApiKeyState] = useState('');
  const [conditionFilter, setConditionFilterState] = useState('all');

  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE);
    const savedFilter = localStorage.getItem(CONDITION_FILTER_STORAGE);
    
    if (savedKey) setApiKeyState(savedKey);
    if (savedFilter) setConditionFilterState(savedFilter);
  }, []);

  const setApiKey = useCallback((key) => {
    setApiKeyState(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  }, []);

  const setConditionFilter = useCallback((value) => {
    setConditionFilterState(value);
    localStorage.setItem(CONDITION_FILTER_STORAGE, value);
  }, []);

  return {
    apiKey,
    setApiKey,
    conditionFilter,
    setConditionFilter
  };
}
