import { useState } from 'preact/hooks';
import styles from './OnboardingView.module.css';

export function OnboardingView({ onComplete }) {
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onComplete(apiKey.trim());
    }
  };

  return (
    <section class={`view active ${styles.onboardingView}`}>
      <div class={styles.container}>
        {/* Hero Section */}
        <div class={styles.hero}>
          <div class={styles.icon}>🏇</div>
          <h1 class={styles.title}>
            <span class={styles.titleLineSmall}>Welcome to</span>
            <span class={styles.titleLine}>Uma<span class={styles.titleAccent}>Tracker</span></span>
          </h1>
          <p class={styles.subtitle}>
            Track your Uma Musume test race results with AI-powered screenshot analysis
          </p>
        </div>

        {/* Features */}
        <div class={styles.features}>
          <div class={styles.featureCard}>
            <span class={styles.featureIcon}>📸</span>
            <h3 class={styles.featureTitle}>Screenshot OCR</h3>
            <p class={styles.featureDesc}>Upload race screenshots and let AI extract all the details automatically</p>
          </div>
          <div class={styles.featureCard}>
            <span class={styles.featureIcon}>📊</span>
            <h3 class={styles.featureTitle}>Performance Stats</h3>
            <p class={styles.featureDesc}>Track win rates, podium finishes, and per-character statistics</p>
          </div>
          <div class={styles.featureCard}>
            <span class={styles.featureIcon}>🎯</span>
            <h3 class={styles.featureTitle}>Race Conditions</h3>
            <p class={styles.featureDesc}>Filter results by specific race conditions to optimize training</p>
          </div>
        </div>

        {/* API Key Setup */}
        <div class={styles.setup}>
          {!showKeyInput ? (
            <>
              <div class={styles.setupHeader}>
                <h2 class={styles.setupTitle}>Quick Setup</h2>
                <p class={styles.setupDesc}>
                  UmaTracker uses Google's Gemini AI to analyze your screenshots. 
                  You'll need a free API key to get started.
                </p>
              </div>

              <div class={styles.freeTierBadge}>
                <span class={styles.badgeIcon}>✨</span>
                <div class={styles.badgeContent}>
                  <span class={styles.badgeTitle}>100% Free Tier Available</span>
                  <span class={styles.badgeDesc}>Google AI Studio offers generous free usage — perfect for tracking races!</span>
                </div>
              </div>

              <div class={styles.steps}>
                <div class={styles.step}>
                  <span class={styles.stepNumber}>1</span>
                  <div class={styles.stepContent}>
                    <span class={styles.stepTitle}>Visit Google AI Studio</span>
                    <a 
                      href="https://aistudio.google.com/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class={styles.stepLink}
                    >
                      aistudio.google.com/apikey →
                    </a>
                  </div>
                </div>
                <div class={styles.step}>
                  <span class={styles.stepNumber}>2</span>
                  <div class={styles.stepContent}>
                    <span class={styles.stepTitle}>Create an API key</span>
                    <span class={styles.stepHint}>Sign in with Google and click "Create API Key"</span>
                  </div>
                </div>
                <div class={styles.step}>
                  <span class={styles.stepNumber}>3</span>
                  <div class={styles.stepContent}>
                    <span class={styles.stepTitle}>Paste it below</span>
                    <span class={styles.stepHint}>Your key stays in your browser — we never see it</span>
                  </div>
                </div>
              </div>

              <button 
                class="btn btn-primary btn-large"
                onClick={() => setShowKeyInput(true)}
              >
                <span class="btn-icon">🔑</span>
                I have my API key
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} class={styles.keyForm}>
              <div class={styles.keyFormHeader}>
                <h2 class={styles.setupTitle}>Enter Your API Key</h2>
                <p class={styles.setupDesc}>
                  Paste your Google AI Studio API key below
                </p>
              </div>

              <div class={styles.keyInputGroup}>
                <input
                  type="password"
                  value={apiKey}
                  onInput={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  class={styles.keyInput}
                  autoFocus
                />
              </div>

              <div class={styles.keyFormHint}>
                <span class={styles.hintIcon}>🔒</span>
                <span>Your API key is stored locally in your browser and never sent to any server except Google's API.</span>
              </div>

              <div class={styles.keyFormActions}>
                <button 
                  type="button"
                  class="btn btn-secondary"
                  onClick={() => setShowKeyInput(false)}
                >
                  Back
                </button>
                <button 
                  type="submit"
                  class="btn btn-primary"
                  disabled={!apiKey.trim()}
                >
                  <span class="btn-icon">🚀</span>
                  Start Tracking
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div class={styles.footer}>
          <p class={styles.footerNote}>
            Data is stored locally in your browser. Export anytime from Settings.
          </p>
        </div>
      </div>
    </section>
  );
}
