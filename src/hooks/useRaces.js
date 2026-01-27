import { useState, useEffect, useCallback } from 'preact/hooks';

const STORAGE_KEY = 'uma-tracker-races';

/**
 * Generate a condition key from race data
 * Format: "RaceName | Distance | Surface | Condition"
 */
function generateConditionKey(race) {
  const parts = [
    race.raceName || 'Unknown Race',
    race.distance,
    race.surface,
    race.condition
  ].filter(Boolean);
  
  return parts.join(' | ');
}

/**
 * Generate a short display label for a condition
 */
function generateConditionLabel(race) {
  const parts = [
    race.raceName || 'Unknown',
    race.distance,
    race.surface
  ].filter(Boolean);
  
  return parts.join(' • ');
}

export function useRaces() {
  const [races, setRaces] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRaces(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved races:', e);
      }
    }
  }, []);

  // Save to localStorage whenever races change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(races));
  }, [races]);

  const addRace = useCallback((raceData) => {
    const conditionKey = generateConditionKey(raceData);
    const newRace = {
      id: `race_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...raceData,
      conditionKey,
      timestamp: new Date().toISOString()
    };
    setRaces(prev => [newRace, ...prev]);
    return newRace;
  }, []);

  const updateRace = useCallback((id, raceData) => {
    setRaces(prev => prev.map(race => {
      if (race.id !== id) return race;
      const conditionKey = generateConditionKey(raceData);
      return {
        ...race,
        ...raceData,
        conditionKey,
        id // preserve original id
      };
    }));
  }, []);

  const deleteRace = useCallback((id) => {
    setRaces(prev => prev.filter(race => race.id !== id));
  }, []);

  const clearAllRaces = useCallback(() => {
    setRaces([]);
  }, []);

  const importRaces = useCallback((importedRaces) => {
    if (!Array.isArray(importedRaces)) return 0;
    
    const existingIds = new Set(races.map(r => r.id));
    const newRaces = importedRaces
      .filter(r => !existingIds.has(r.id))
      .map(r => ({
        ...r,
        conditionKey: r.conditionKey || generateConditionKey(r)
      }));
    
    setRaces(prev => [...newRaces, ...prev]);
    return newRaces.length;
  }, [races]);

  const exportRaces = useCallback(() => {
    return JSON.stringify(races, null, 2);
  }, [races]);

  /**
   * Get unique race conditions from all recorded races
   * Returns array of { key, label, count }
   */
  const getConditions = useCallback(() => {
    const conditionMap = new Map();
    
    races.forEach(race => {
      const key = race.conditionKey || generateConditionKey(race);
      if (!conditionMap.has(key)) {
        conditionMap.set(key, {
          key,
          label: generateConditionLabel(race),
          raceName: race.raceName,
          distance: race.distance,
          surface: race.surface,
          condition: race.condition,
          raceGrade: race.raceGrade,
          venue: race.venue,
          count: 0
        });
      }
      conditionMap.get(key).count++;
    });
    
    // Sort by count (most raced first)
    return Array.from(conditionMap.values())
      .sort((a, b) => b.count - a.count);
  }, [races]);

  const getFilteredRaces = useCallback((conditionFilter) => {
    if (conditionFilter === 'all') return races;
    return races.filter(race => {
      const key = race.conditionKey || generateConditionKey(race);
      return key === conditionFilter;
    });
  }, [races]);

  /**
   * Get statistics for player's umas across filtered races
   */
  const getStats = useCallback((conditionFilter = 'all') => {
    const filtered = getFilteredRaces(conditionFilter);
    
    let totalPlayerEntries = 0;
    let totalWins = 0;        // Total 1st place finishes
    let totalPodiums = 0;     // Total top 3 finishes
    let totalNotPlaced = 0;
    let racesWon = 0;         // Races where at least one uma won
    let racesWithPodium = 0;  // Races where at least one uma got top 3
    const positionCounts = {};
    
    for (let i = 1; i <= 9; i++) {
      positionCounts[i] = 0;
    }
    positionCounts['NP'] = 0;

    filtered.forEach(race => {
      const playerResults = race.playerResults || [];
      const playerUmasNotPlaced = race.playerUmasNotPlaced || 0;

      let raceHasWin = false;
      let raceHasPodium = false;

      playerResults.forEach(result => {
        totalPlayerEntries++;
        
        if (result.position === 1) {
          totalWins++;
          raceHasWin = true;
        }
        if (result.position <= 3) {
          totalPodiums++;
          raceHasPodium = true;
        }
        
        const pos = Math.min(result.position, 9);
        positionCounts[pos]++;
      });

      if (raceHasWin) racesWon++;
      if (raceHasPodium) racesWithPodium++;

      totalNotPlaced += playerUmasNotPlaced;
      totalPlayerEntries += playerUmasNotPlaced;
      positionCounts['NP'] += playerUmasNotPlaced;
    });

    // Win rate = percentage of races where at least one uma won
    const winRate = filtered.length > 0 
      ? Math.round((racesWon / filtered.length) * 100) 
      : 0;

    // Podium rate = percentage of races where at least one uma got top 3
    const podiumRate = filtered.length > 0
      ? Math.round((racesWithPodium / filtered.length) * 100)
      : 0;

    return {
      totalRaces: filtered.length,
      totalPlayerEntries,
      wins: totalWins,
      podium: totalPodiums,
      racesWon,
      racesWithPodium,
      notPlaced: totalNotPlaced,
      winRate,
      podiumRate,
      distribution: positionCounts
    };
  }, [getFilteredRaces]);

  /**
   * Get per-character statistics across filtered races
   */
  const getCharacterStats = useCallback((conditionFilter = 'all') => {
    const filtered = getFilteredRaces(conditionFilter);
    const characterStats = {};

    filtered.forEach(race => {
      const playerResults = race.playerResults || [];
      
      playerResults.forEach(result => {
        const name = result.characterName || 'Unknown';
        
        if (!characterStats[name]) {
          characterStats[name] = {
            name,
            totalRaces: 0,
            positions: {},
            wins: 0,
            podiums: 0,
            notPlaced: 0
          };
          for (let i = 1; i <= 9; i++) {
            characterStats[name].positions[i] = 0;
          }
          characterStats[name].positions['NP'] = 0;
        }

        characterStats[name].totalRaces++;
        const pos = Math.min(result.position, 9);
        characterStats[name].positions[pos]++;
        
        if (result.position === 1) characterStats[name].wins++;
        if (result.position <= 3) characterStats[name].podiums++;
      });
    });

    const statsArray = Object.values(characterStats)
      .map(char => ({
        ...char,
        winRate: char.totalRaces > 0 
          ? Math.round((char.wins / char.totalRaces) * 100) 
          : 0,
        podiumRate: char.totalRaces > 0 
          ? Math.round((char.podiums / char.totalRaces) * 100) 
          : 0
      }))
      .sort((a, b) => b.totalRaces - a.totalRaces);

    return statsArray;
  }, [getFilteredRaces]);

  return {
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
  };
}
