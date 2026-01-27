import { useState, useEffect } from 'preact/hooks';
import styles from './EditRaceModal.module.css';

export function EditRaceModal({ race, onSave, onCancel, isNew = false }) {
  const [formData, setFormData] = useState({
    raceName: '',
    raceGrade: '',
    venue: '',
    distance: '',
    surface: 'Turf',
    condition: '',
    playerResults: [],
    playerUmasNotPlaced: 0
  });

  useEffect(() => {
    if (race) {
      setFormData({
        raceName: race.raceName || '',
        raceGrade: race.raceGrade || '',
        venue: race.venue || '',
        distance: race.distance || '',
        surface: race.surface || 'Turf',
        condition: race.condition || '',
        playerResults: race.playerResults || [],
        playerUmasNotPlaced: race.playerUmasNotPlaced || 0
      });
    }
  }, [race]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResultChange = (index, field, value) => {
    setFormData(prev => {
      const newResults = [...prev.playerResults];
      newResults[index] = { ...newResults[index], [field]: value };
      return { ...prev, playerResults: newResults };
    });
  };

  const addPlayerResult = () => {
    if (formData.playerResults.length >= 3) return;
    setFormData(prev => ({
      ...prev,
      playerResults: [...prev.playerResults, { position: 1, characterName: '', isPlayerUma: true }],
      playerUmasNotPlaced: Math.max(0, prev.playerUmasNotPlaced - 1)
    }));
  };

  const removePlayerResult = (index) => {
    setFormData(prev => ({
      ...prev,
      playerResults: prev.playerResults.filter((_, i) => i !== index),
      playerUmasNotPlaced: Math.min(3, prev.playerUmasNotPlaced + 1)
    }));
  };

  const handleNotPlacedChange = (value) => {
    const np = Math.max(0, Math.min(3 - formData.playerResults.length, parseInt(value) || 0));
    setFormData(prev => ({ ...prev, playerUmasNotPlaced: np }));
  };

  const handleSave = () => {
    // Validate
    if (!formData.raceName.trim()) {
      alert('Race name is required');
      return;
    }

    // Sort player results by position
    const sortedResults = [...formData.playerResults].sort((a, b) => a.position - b.position);

    onSave({
      ...race,
      ...formData,
      playerResults: sortedResults
    });
  };

  const totalUmas = formData.playerResults.length + formData.playerUmasNotPlaced;

  return (
    <div class={styles.overlay} onClick={onCancel}>
      <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div class={styles.header}>
          <h2 class={styles.title}>{isNew ? 'Review Race Results' : 'Edit Race'}</h2>
          <button class={styles.closeBtn} onClick={onCancel}>✕</button>
        </div>

        <div class={styles.content}>
          {isNew && (
            <p class={styles.hint}>
              Review the AI-extracted data below. Make any corrections needed before saving.
            </p>
          )}

          {/* Race Info Section */}
          <div class={styles.section}>
            <h3 class={styles.sectionTitle}>Race Information</h3>
            
            <div class={styles.fieldRow}>
              <div class={styles.field}>
                <label class={styles.label}>Race Name *</label>
                <input
                  type="text"
                  class={styles.input}
                  value={formData.raceName}
                  onInput={(e) => handleFieldChange('raceName', e.target.value)}
                  placeholder="e.g., Takamatsunomiya Kinen"
                />
              </div>
              <div class={styles.fieldSmall}>
                <label class={styles.label}>Grade</label>
                <select
                  class={styles.select}
                  value={formData.raceGrade}
                  onChange={(e) => handleFieldChange('raceGrade', e.target.value)}
                >
                  <option value="">—</option>
                  <option value="G1">G1</option>
                  <option value="G2">G2</option>
                  <option value="G3">G3</option>
                  <option value="OP">OP</option>
                </select>
              </div>
            </div>

            <div class={styles.fieldRow}>
              <div class={styles.field}>
                <label class={styles.label}>Venue</label>
                <input
                  type="text"
                  class={styles.input}
                  value={formData.venue}
                  onInput={(e) => handleFieldChange('venue', e.target.value)}
                  placeholder="e.g., Chukyo"
                />
              </div>
              <div class={styles.fieldSmall}>
                <label class={styles.label}>Distance</label>
                <input
                  type="text"
                  class={styles.input}
                  value={formData.distance}
                  onInput={(e) => handleFieldChange('distance', e.target.value)}
                  placeholder="e.g., 1200m"
                />
              </div>
            </div>

            <div class={styles.fieldRow}>
              <div class={styles.fieldSmall}>
                <label class={styles.label}>Surface</label>
                <select
                  class={styles.select}
                  value={formData.surface}
                  onChange={(e) => handleFieldChange('surface', e.target.value)}
                >
                  <option value="Turf">Turf</option>
                  <option value="Dirt">Dirt</option>
                </select>
              </div>
              <div class={styles.field}>
                <label class={styles.label}>Condition</label>
                <input
                  type="text"
                  class={styles.input}
                  value={formData.condition}
                  onInput={(e) => handleFieldChange('condition', e.target.value)}
                  placeholder="e.g., Good, Soft"
                />
              </div>
            </div>
          </div>

          {/* Player Results Section */}
          <div class={styles.section}>
            <div class={styles.sectionHeader}>
              <h3 class={styles.sectionTitle}>Your Umas ({totalUmas}/3)</h3>
              {formData.playerResults.length < 3 && (
                <button class={styles.addBtn} onClick={addPlayerResult}>
                  + Add Placed Uma
                </button>
              )}
            </div>

            {formData.playerResults.length > 0 && (
              <div class={styles.resultsList}>
                {formData.playerResults.map((result, index) => (
                  <div key={index} class={styles.resultItem}>
                    <div class={styles.positionField}>
                      <label class={styles.label}>Position</label>
                      <select
                        class={styles.select}
                        value={result.position}
                        onChange={(e) => handleResultChange(index, 'position', parseInt(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div class={styles.nameField}>
                      <label class={styles.label}>Character Name</label>
                      <input
                        type="text"
                        class={styles.input}
                        value={result.characterName}
                        onInput={(e) => handleResultChange(index, 'characterName', e.target.value)}
                        placeholder="e.g., Air Groove"
                      />
                    </div>
                    <button 
                      class={styles.removeBtn}
                      onClick={() => removePlayerResult(index)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div class={styles.notPlacedField}>
              <label class={styles.label}>Umas Not Placing (NP)</label>
              <div class={styles.notPlacedInput}>
                <input
                  type="number"
                  class={styles.input}
                  value={formData.playerUmasNotPlaced}
                  onInput={(e) => handleNotPlacedChange(e.target.value)}
                  min="0"
                  max={3 - formData.playerResults.length}
                />
                <span class={styles.notPlacedHint}>
                  Umas that didn't appear in top positions
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class={styles.footer}>
          <button class="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button class="btn btn-primary" onClick={handleSave}>
            {isNew ? 'Save Race' : 'Update Race'}
          </button>
        </div>
      </div>
    </div>
  );
}
