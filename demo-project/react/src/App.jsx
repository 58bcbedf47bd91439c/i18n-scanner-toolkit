import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';

// Components
import LanguageSwitcher from './components/LanguageSwitcher';
import HomePage from './pages/HomePage';

// Styles
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        {/* Header with language switcher */}
        <header className="header">
          <div className="container">
            <h1 className="app-title">React i18n Demo</h1>
            <LanguageSwitcher />
          </div>
        </header>

        {/* Main content */}
        <main className="main-content">
          <HomePage />
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>&copy; 2024 React i18n Demo. Demonstrating @i18n-toolkit/scanner</p>
          </div>
        </footer>
      </div>
    </Provider>
  );
}

export default App;
