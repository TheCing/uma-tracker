import { useState } from 'preact/hooks';

export function ResultsView({ 
  races, 
  stats, 
  characterStats, 
  conditions,
  currentCondition,
  conditionFilter,
  onConditionChange,
  onDeleteRace, 
  onClearAll 
}) {
  const [charactersExpanded, setCharactersExpanded] = useState(false);
  const { totalRaces, totalPlayerEntries, wins, podium, notPlaced, winRate, distribution } = stats;
  
  // Get max count for chart scaling (excluding NP for better visualization)
  const placedCounts = Object.entries(distribution)
    .filter(([pos]) => pos !== 'NP')
    .map(([, count]) => count);
  const maxCount = Math.max(...placedCounts, 1);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRaceDetails = (race) => {
    const parts = [
      race.raceGrade,
      race.distance,
      race.surface,
      race.condition
    ].filter(Boolean);
    return parts.join(' • ') || 'Details not available';
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all race history? This cannot be undone.')) {
      onClearAll();
    }
  };

  // Get the best position from player results for border color
  const getBestPosition = (race) => {
    if (!race.playerResults || race.playerResults.length === 0) return 9;
    return Math.min(...race.playerResults.map(r => r.position));
  };

  const toggleCharactersExpanded = () => {
    setCharactersExpanded(prev => !prev);
  };

  return (
    <section class="view active">
      {/* Condition Filter */}
      {conditions.length > 0 && (
        <div class="condition-filter-section">
          <div class="condition-filter-header">
            <span class="condition-filter-label">Race Conditions</span>
            <select 
              class="condition-select"
              value={conditionFilter}
              onChange={(e) => onConditionChange(e.target.value)}
            >
              <option value="all">All Conditions ({races.length + (conditionFilter !== 'all' ? conditions.reduce((sum, c) => sum + c.count, 0) - races.length : 0)} races)</option>
              {conditions.map(cond => (
                <option key={cond.key} value={cond.key}>
                  {cond.label} ({cond.count} races)
                </option>
              ))}
            </select>
          </div>
          
          {currentCondition && (
            <div class="condition-info">
              <div class="condition-details">
                <span class="condition-name">{currentCondition.raceName}</span>
                <span class="condition-specs">
                  {[currentCondition.raceGrade, currentCondition.distance, currentCondition.surface, currentCondition.condition]
                    .filter(Boolean)
                    .join(' • ')}
                </span>
                {currentCondition.venue && (
                  <span class="condition-venue">@ {currentCondition.venue}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <div class="stat-icon">🏁</div>
          <div class="stat-content">
            <span class="stat-value">{totalRaces}</span>
            <span class="stat-label">Races</span>
          </div>
        </div>
        <div class="stat-card stat-wins">
          <div class="stat-icon">🥇</div>
          <div class="stat-content">
            <span class="stat-value">{wins}</span>
            <span class="stat-label">1st Place</span>
          </div>
        </div>
        <div class="stat-card stat-podium">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <span class="stat-value">{podium}</span>
            <span class="stat-label">Top 3</span>
          </div>
        </div>
        <div class="stat-card stat-rate">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <span class="stat-value">{winRate}%</span>
            <span class="stat-label">Win Rate</span>
          </div>
        </div>
      </div>

      {/* Position Distribution */}
      <div class="distribution-section">
        <h2 class="section-title">Position Distribution</h2>
        <p class="section-subtitle">
          {notPlaced > 0 && `${notPlaced} entries finished outside top positions`}
        </p>
        <div class="distribution-chart">
          {Object.entries(distribution)
            .filter(([pos]) => pos !== 'NP')
            .map(([pos, count]) => {
              const height = (count / maxCount) * 100;
              return (
                <div key={pos} class="distribution-bar">
                  <div 
                    class="bar-fill" 
                    style={{ height: `${Math.max(height, count > 0 ? 8 : 3)}%` }}
                    data-count={count}
                  ></div>
                  <span class="bar-label">{pos}</span>
                </div>
              );
            })}
          {/* Not Placed bar */}
          {distribution['NP'] > 0 && (
            <div class="distribution-bar distribution-bar-np">
              <div 
                class="bar-fill bar-fill-np" 
                style={{ height: `${Math.max((distribution['NP'] / maxCount) * 100, 8)}%` }}
                data-count={distribution['NP']}
              ></div>
              <span class="bar-label">NP</span>
            </div>
          )}
        </div>
      </div>

      {/* Character Stats */}
      {characterStats.length > 0 && (
        <div class="character-section">
          <div class="character-section-header">
            <div>
              <h2 class="section-title">Character Performance</h2>
              <p class="section-subtitle">Individual statistics for each uma</p>
            </div>
            <button 
              class="btn btn-small" 
              onClick={toggleCharactersExpanded}
            >
              {charactersExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
          <div class="character-grid">
            {characterStats.map(char => {
              const isExpanded = charactersExpanded;
              const charMaxCount = Math.max(...Object.values(char.positions).filter((_, i) => i < 9), 1);
              
              return (
                <div 
                  key={char.name} 
                  class={`character-card ${isExpanded ? 'expanded' : ''}`}
                >
                  <div class="character-header">
                    <div class="character-name">{char.name}</div>
                    <div class="character-quick-stats">
                      <span class="quick-stat quick-stat-races">{char.totalRaces} races</span>
                      <span class="quick-stat quick-stat-wins">{char.winRate}% WR</span>
                    </div>
                  </div>
                  
                  <div class="character-summary">
                    <div class="summary-item">
                      <span class="summary-value">{char.wins}</span>
                      <span class="summary-label">1st</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-value">{char.podiums}</span>
                      <span class="summary-label">Top 3</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-value">{char.podiumRate}%</span>
                      <span class="summary-label">Podium</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div class="character-details">
                      <div class="character-distribution">
                        {Object.entries(char.positions)
                          .filter(([pos]) => pos !== 'NP')
                          .map(([pos, count]) => {
                            const height = charMaxCount > 0 ? (count / charMaxCount) * 100 : 0;
                            return (
                              <div key={pos} class="char-bar">
                                <div 
                                  class="char-bar-fill" 
                                  style={{ height: `${Math.max(height, count > 0 ? 15 : 5)}%` }}
                                  data-position={pos}
                                >
                                  {count > 0 && <span class="char-bar-count">{count}</span>}
                                </div>
                                <span class="char-bar-label">{pos}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Race History */}
      <div class="history-section">
        <div class="history-header">
          <h2 class="section-title">Race History</h2>
          {races.length > 0 && (
            <button class="btn btn-ghost" onClick={handleClearAll}>
              <span>Clear All</span>
            </button>
          )}
        </div>

        {races.length > 0 ? (
          <div class="race-list">
            {races.map(race => {
              const playerResults = race.playerResults || [];
              const notPlacedCount = race.playerUmasNotPlaced || 0;
              const bestPosition = getBestPosition(race);
              
              return (
                <div 
                  key={race.id} 
                  class="race-item" 
                  data-position={bestPosition}
                >
                  <div class="race-position-group">
                    {/* Show placed player umas */}
                    {playerResults.map((result, idx) => (
                      <div 
                        key={idx}
                        class="race-position-badge"
                        data-position={result.position}
                        title={`${result.characterName} - ${result.position}${getOrdinalSuffix(result.position)}`}
                      >
                        {result.position}
                      </div>
                    ))}
                    {/* Show not-placed indicators */}
                    {Array.from({ length: notPlacedCount }).map((_, idx) => (
                      <div 
                        key={`np-${idx}`}
                        class="race-position-badge race-position-np"
                        title="Did not place in visible positions"
                      >
                        —
                      </div>
                    ))}
                    {/* If no player results at all, show placeholder */}
                    {playerResults.length === 0 && notPlacedCount === 0 && (
                      <div class="race-position-badge race-position-na">?</div>
                    )}
                  </div>
                  <div class="race-info">
                    <span class="race-name">
                      {race.raceName}
                      {race.venue && <span class="race-venue"> @ {race.venue}</span>}
                    </span>
                    <span class="race-details">{getRaceDetails(race)}</span>
                    {playerResults.length > 0 && (
                      <span class="race-characters">
                        {playerResults.map(r => r.characterName).join(', ')}
                        {notPlacedCount > 0 && ` (+${notPlacedCount} NP)`}
                      </span>
                    )}
                  </div>
                  <span class="race-date">{formatDate(race.timestamp)}</span>
                  <button 
                    class="race-delete" 
                    onClick={() => onDeleteRace(race.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div class="empty-state">
            <div class="empty-icon">🎠</div>
            <p class="empty-text">No races recorded yet</p>
            <p class="empty-hint">Upload a screenshot to get started!</p>
          </div>
        )}
      </div>
    </section>
  );
}

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
