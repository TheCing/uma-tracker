import { useState } from 'preact/hooks';

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
    <section class="view active onboarding-view">
      <div class="onboarding-container">
        {/* Hero Section */}
        <div class="onboarding-hero">
          <div class="onboarding-icon">🏇</div>
          <h1 class="onboarding-title">
            <span class="title-line">Welcome to</span>
            <span class="title-line">Uma<span class="title-accent">Tracker</span></span>
          </h1>
          <p class="onboarding-subtitle">
            Track your Uma Musume test race results with AI-powered screenshot analysis
          </p>
        </div>

        {/* Features */}
        <div class="onboarding-features">
          <div class="feature-card">
            <span class="feature-icon">📸</span>
            <h3 class="feature-title">Screenshot OCR</h3>
            <p class="feature-desc">Upload race screenshots and let AI extract all the details automatically</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">📊</span>
            <h3 class="feature-title">Performance Stats</h3>
            <p class="feature-desc">Track win rates, podium finishes, and per-character statistics</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🎯</span>
            <h3 class="feature-title">Race Conditions</h3>
            <p class="feature-desc">Filter results by specific race conditions to optimize training</p>
          </div>
        </div>

        {/* API Key Setup */}
        <div class="onboarding-setup">
          {!showKeyInput ? (
            <>
              <div class="setup-header">
                <h2 class="setup-title">Quick Setup</h2>
                <p class="setup-desc">
                  UmaTracker uses Google's Gemini AI to analyze your screenshots. 
                  You'll need a free API key to get started.
                </p>
              </div>

              <div class="free-tier-badge">
                <span class="badge-icon">✨</span>
                <div class="badge-content">
                  <span class="badge-title">100% Free Tier Available</span>
                  <span class="badge-desc">Google AI Studio offers generous free usage — perfect for tracking races!</span>
                </div>
              </div>

              <div class="setup-steps">
                <div class="step">
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <span class="step-title">Visit Google AI Studio</span>
                    <a 
                      href="https://aistudio.google.com/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="step-link"
                    >
                      aistudio.google.com/apikey →
                    </a>
                  </div>
                </div>
                <div class="step">
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <span class="step-title">Create an API key</span>
                    <span class="step-hint">Sign in with Google and click "Create API Key"</span>
                  </div>
                </div>
                <div class="step">
                  <span class="step-number">3</span>
                  <div class="step-content">
                    <span class="step-title">Paste it below</span>
                    <span class="step-hint">Your key stays in your browser — we never see it</span>
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
            <form onSubmit={handleSubmit} class="key-form">
              <div class="key-form-header">
                <h2 class="setup-title">Enter Your API Key</h2>
                <p class="setup-desc">
                  Paste your Google AI Studio API key below
                </p>
              </div>

              <div class="key-input-group">
                <input
                  type="password"
                  value={apiKey}
                  onInput={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  class="key-input"
                  autoFocus
                />
              </div>

              <div class="key-form-hint">
                <span class="hint-icon">🔒</span>
                <span>Your API key is stored locally in your browser and never sent to any server except Google's API.</span>
              </div>

              <div class="key-form-actions">
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
        <div class="onboarding-footer">
          <p class="footer-note">
            Data is stored locally in your browser. Export anytime from Settings.
          </p>
        </div>
      </div>
    </section>
  );
}
