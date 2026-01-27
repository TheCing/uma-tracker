import { useState } from 'preact/hooks';
import styles from './ResultsView.module.css';

export function ResultsView({ 
  races, 
  stats, 
  characterStats, 
  conditions,
  currentCondition,
  conditionFilter,
  onConditionChange,
  onDeleteRace,
  onEditRace,
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
        <div class={styles.conditionFilterSection}>
          <div class={styles.conditionFilterHeader}>
            <span class={styles.conditionFilterLabel}>Race Conditions</span>
            <select 
              class={styles.conditionSelect}
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
            <div class={styles.conditionInfo}>
              <div class={styles.conditionDetails}>
                <span class={styles.conditionName}>{currentCondition.raceName}</span>
                <span class={styles.conditionSpecs}>
                  {[currentCondition.raceGrade, currentCondition.distance, currentCondition.surface, currentCondition.condition]
                    .filter(Boolean)
                    .join(' • ')}
                </span>
                {currentCondition.venue && (
                  <span class={styles.conditionVenue}>@ {currentCondition.venue}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div class={styles.statsGrid}>
        <div class={`${styles.statCard} ${styles.statTotal}`}>
          <div class={styles.statIcon}>🏁</div>
          <div class={styles.statContent}>
            <span class={styles.statValue}>{totalRaces}</span>
            <span class={styles.statLabel}>Races</span>
          </div>
        </div>
        <div class={`${styles.statCard} ${styles.statWins}`}>
          <div class={styles.statIcon}>🥇</div>
          <div class={styles.statContent}>
            <span class={styles.statValue}>{wins}</span>
            <span class={styles.statLabel}>1st Place</span>
          </div>
        </div>
        <div class={`${styles.statCard} ${styles.statPodium}`}>
          <div class={styles.statIcon}>🏆</div>
          <div class={styles.statContent}>
            <span class={styles.statValue}>{podium}</span>
            <span class={styles.statLabel}>Top 3</span>
          </div>
        </div>
        <div class={`${styles.statCard} ${styles.statRate}`}>
          <div class={styles.statIcon}>📈</div>
          <div class={styles.statContent}>
            <span class={styles.statValue}>{winRate}%</span>
            <span class={styles.statLabel}>Win Rate</span>
          </div>
        </div>
      </div>

      {/* Position Distribution */}
      <div class={styles.distributionSection}>
        <h2 class="section-title">Position Distribution</h2>
        <p class="section-subtitle">
          {notPlaced > 0 && `${notPlaced} entries finished outside top positions`}
        </p>
        <div class={styles.distributionChart}>
          {Object.entries(distribution)
            .filter(([pos]) => pos !== 'NP')
            .map(([pos, count]) => {
              const height = (count / maxCount) * 100;
              return (
                <div key={pos} class={styles.distributionBar}>
                  <div 
                    class={styles.barFill} 
                    style={{ height: `${Math.max(height, count > 0 ? 8 : 3)}%` }}
                    data-count={count}
                  ></div>
                  <span class={styles.barLabel}>{pos}</span>
                </div>
              );
            })}
          {/* Not Placed bar */}
          {distribution['NP'] > 0 && (
            <div class={styles.distributionBar}>
              <div 
                class={`${styles.barFill} ${styles.barFillNp}`} 
                style={{ height: `${Math.max((distribution['NP'] / maxCount) * 100, 8)}%` }}
                data-count={distribution['NP']}
              ></div>
              <span class={styles.barLabel}>NP</span>
            </div>
          )}
        </div>
      </div>

      {/* Character Stats */}
      {characterStats.length > 0 && (
        <div class={styles.characterSection}>
          <div class={styles.characterSectionHeader}>
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
          <div class={styles.characterGrid}>
            {characterStats.map(char => {
              const isExpanded = charactersExpanded;
              const charMaxCount = Math.max(...Object.values(char.positions).filter((_, i) => i < 9), 1);
              
              return (
                <div 
                  key={char.name} 
                  class={`${styles.characterCard} ${isExpanded ? styles.expanded : ''}`}
                >
                  <div class={styles.characterHeader}>
                    <div class={styles.characterName}>{char.name}</div>
                    <div class={styles.characterQuickStats}>
                      <span class={`${styles.quickStat} ${styles.quickStatRaces}`}>{char.totalRaces} races</span>
                      <span class={`${styles.quickStat} ${styles.quickStatWins}`}>{char.winRate}% WR</span>
                    </div>
                  </div>
                  
                  <div class={styles.characterSummary}>
                    <div class={styles.summaryItem}>
                      <span class={styles.summaryValue}>{char.wins}</span>
                      <span class={styles.summaryLabel}>1st</span>
                    </div>
                    <div class={styles.summaryItem}>
                      <span class={styles.summaryValue}>{char.podiums}</span>
                      <span class={styles.summaryLabel}>Top 3</span>
                    </div>
                    <div class={styles.summaryItem}>
                      <span class={styles.summaryValue}>{char.podiumRate}%</span>
                      <span class={styles.summaryLabel}>Podium</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div class={styles.characterDetails}>
                      <div class={styles.characterDistribution}>
                        {Object.entries(char.positions)
                          .filter(([pos]) => pos !== 'NP')
                          .map(([pos, count]) => {
                            const height = charMaxCount > 0 ? (count / charMaxCount) * 100 : 0;
                            return (
                              <div key={pos} class={styles.charBar}>
                                <div 
                                  class={styles.charBarFill} 
                                  style={{ height: `${Math.max(height, count > 0 ? 15 : 5)}%` }}
                                  data-position={pos}
                                >
                                  {count > 0 && <span class={styles.charBarCount}>{count}</span>}
                                </div>
                                <span class={styles.charBarLabel}>{pos}</span>
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
      <div class={styles.historySection}>
        <div class={styles.historyHeader}>
          <h2 class="section-title">Race History</h2>
          {races.length > 0 && (
            <button class="btn btn-ghost" onClick={handleClearAll}>
              <span>Clear All</span>
            </button>
          )}
        </div>

        {races.length > 0 ? (
          <div class={styles.raceList}>
            {races.map(race => {
              const playerResults = race.playerResults || [];
              const notPlacedCount = race.playerUmasNotPlaced || 0;
              const bestPosition = getBestPosition(race);
              
              return (
                <div 
                  key={race.id} 
                  class={styles.raceItem} 
                  data-position={bestPosition}
                >
                  <div class={styles.racePositionGroup}>
                    {/* Show placed player umas */}
                    {playerResults.map((result, idx) => (
                      <div 
                        key={idx}
                        class={styles.racePositionBadge}
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
                        class={`${styles.racePositionBadge} ${styles.racePositionNp}`}
                        title="Did not place in visible positions"
                      >
                        —
                      </div>
                    ))}
                    {/* If no player results at all, show placeholder */}
                    {playerResults.length === 0 && notPlacedCount === 0 && (
                      <div class={`${styles.racePositionBadge} ${styles.racePositionNa}`}>?</div>
                    )}
                  </div>
                  <div class={styles.raceInfo}>
                    <span class={styles.raceName}>
                      {race.raceName}
                      {race.venue && <span class={styles.raceVenue}> @ {race.venue}</span>}
                    </span>
                    <span class={styles.raceDetails}>{getRaceDetails(race)}</span>
                    {playerResults.length > 0 && (
                      <span class={styles.raceCharacters}>
                        {playerResults.map(r => r.characterName).join(', ')}
                        {notPlacedCount > 0 && ` (+${notPlacedCount} NP)`}
                      </span>
                    )}
                  </div>
                  <span class={styles.raceDate}>{formatDate(race.timestamp)}</span>
                  <div class={styles.raceActions}>
                    <button 
                      class={styles.raceEdit} 
                      onClick={() => onEditRace(race)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      class={styles.raceDelete} 
                      onClick={() => onDeleteRace(race.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
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
