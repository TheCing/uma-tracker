import { useState, useRef } from 'preact/hooks';
import styles from './UploadView.module.css';

export function UploadView({ onAnalyze, isProcessing }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return false;
    }
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearPreview = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (selectedFile) {
      const success = await onAnalyze(selectedFile);
      if (success) {
        clearPreview();
      }
    }
  };

  return (
    <section class="view active">
      <div class="view-header">
        <h1 class="page-title">
          <span class="title-line">RACE</span>
          <span class="title-line title-accent">CAPTURE</span>
        </h1>
        <p class="page-subtitle">Upload your race result screenshot for instant analysis</p>
      </div>

      {/* Upload Zone */}
      {!selectedFile && !isProcessing && (
        <div 
          class={`${styles.uploadZone} ${isDragOver ? styles.dragOver : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={handleDrop}
        >
          <div class={styles.uploadZoneInner}>
            <div class={styles.uploadIcon}>
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8L12 28H24V44H40V28H52L32 8Z" fill="currentColor"/>
                <path d="M8 52V56H56V52H8Z" fill="currentColor"/>
              </svg>
            </div>
            <div class={styles.uploadText}>
              <span class={styles.uploadPrimary}>Drop your screenshot here</span>
              <span class={styles.uploadSecondary}>or click to browse files</span>
            </div>
            <div class={styles.uploadFormats}>PNG, JPG, WEBP supported</div>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            hidden 
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* Preview Area */}
      {selectedFile && !isProcessing && (
        <div class={styles.previewArea}>
          <div class={styles.previewCard}>
            <div class={styles.previewHeader}>
              <span class={styles.previewBadge}>Preview</span>
              <button class={styles.previewClear} onClick={clearPreview}>✕</button>
            </div>
            <div class={styles.previewImageContainer}>
              <img src={previewUrl} alt="Race screenshot preview" />
            </div>
            <div class={styles.previewActions}>
              <button 
                class="btn btn-secondary" 
                onClick={() => fileInputRef.current?.click()}
              >
                <span>Change Image</span>
              </button>
              <button class="btn btn-primary" onClick={handleAnalyze}>
                <span class="btn-icon">✨</span>
                <span>Analyze Race</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div class={styles.processingState}>
          <div class={styles.processingCard}>
            <div class={styles.processingAnimation}>
              <div class={styles.horseRunner}>🏇</div>
              <div class={styles.trackLine}></div>
            </div>
            <div class={styles.processingText}>
              <span class={styles.processingTitle}>Analyzing Race Results</span>
              <span class={styles.processingSubtitle}>Reading screenshot data...</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
