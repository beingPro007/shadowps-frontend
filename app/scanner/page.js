'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function ScannerPage() {
  const [target, setTarget] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);

  // For typewriter effect on results
  useEffect(() => {
    if (results && typingIndex < results.length) {
      const timer = setTimeout(() => {
        setTypingIndex(prevIndex => prevIndex + 1);
      }, 30);
      
      return () => clearTimeout(timer);
    }
  }, [results, typingIndex]);

  const displayedResults = results.substring(0, typingIndex);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!target.trim()) {
      setError('Please enter a domain or IP address');
      return;
    }

    setError('');
    setLoading(true);
    setResults('');
    setTypingIndex(0);

    try {
      const response = await fetch(`/api/scan?target=${encodeURIComponent(target)}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.result || 'Scan completed successfully.');
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to complete scan. Please try again.');
      setResults('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ShadowOps Scanner</h1>
      
      <form className={styles.scannerForm} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter domain or IP address..."
            value={target}
            onChange={e => setTarget(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.button} 
          disabled={loading}
        >
          {loading ? (
            <>
              <span className={styles.loadingSpinner}></span>
              Scanning...
            </>
          ) : 'Start Scan'}
        </button>
      </form>
      
      <div className={styles.resultsContainer}>
        <h2 className={styles.resultsTitle}>
          {loading ? 'Scanning...' : results ? 'Scan Results:' : 'Enter a target to begin scan'}
        </h2>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.resultContent}>
          {displayedResults}
          {typingIndex < results.length && <span className={styles.cursorBlink}></span>}
        </div>
      </div>
    </div>
  );
} 