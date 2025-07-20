import React from 'react';
import { Globe, Star, Users, Zap, CheckCircle, AlertCircle } from 'lucide-react';

// Import components that handle i18n
import HOCDemo from '../components/HOCDemo';
import HookDemo from '../components/HookDemo';

const HomePage = () => {

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <Globe size={80} className="hero-icon" />
            <h1 className="hero-title">
              Custom i18n Demo with $LS Function
            </h1>
            <p className="hero-description">
              This demo showcases different patterns for internationalization
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary">
                Get Started
              </button>
              <button className="btn btn-outline">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Component Demos */}
        <section className="demo-section">
          <h2 className="section-title">🌍 Language Switching Components</h2>
          <p className="section-subtitle">
            Use the language switcher above to see all content change instantly!
          </p>

          <div className="component-demos">
            <div className="demo-section">
              <h3>HOC Demo Component (Higher-Order Component Pattern)</h3>
              <HOCDemo />
            </div>

            <div className="demo-section">
              <h3>Hook Demo Component (Custom Hook Pattern)</h3>
              <HookDemo />
            </div>
          </div>
        </section>

        {/* Missing Translations Demo */}
        <section className="missing-section">
          <h2 className="section-title">🔍 Missing Translations Demo</h2>
          <p className="section-subtitle">
            These texts demonstrate what @i18n-toolkit/scanner can detect:
          </p>

          <div className="missing-examples">
            <div className="example-item found">
              <CheckCircle className="example-icon" />
              <span>"Translated text" - Found in language files</span>
            </div>

            <div className="example-item missing">
              <AlertCircle className="example-icon" />
              <span>"This text is missing from Chinese translation"</span>
            </div>

            <div className="example-item missing">
              <AlertCircle className="example-icon" />
              <span>"Este texto falta en la traducción al inglés"</span>
            </div>

            <div className="example-item missing">
              <AlertCircle className="example-icon" />
              <span>"这段文字在英文翻译中缺失"</span>
            </div>
          </div>

          <div className="scanner-info">
            <h3>🛠️ How @i18n-toolkit/scanner helps:</h3>
            <ul>
              <li>✅ Automatically detects $LS() function calls</li>
              <li>✅ Finds missing translations in language files</li>
              <li>✅ Generates Excel reports for translators</li>
              <li>✅ Suggests translation keys based on file structure</li>
              <li>✅ Works with custom i18n patterns like $LS()</li>
              <li>✅ Zero configuration - just install and run!</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
