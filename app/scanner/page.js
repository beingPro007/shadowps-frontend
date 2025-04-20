'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function ScannerPage() {
  const [target, setTarget] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);

  useEffect(() => {
    if (results && typingIndex < results.length) {
      const timer = setTimeout(() => {
        setTypingIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [results, typingIndex]);

  const displayedResults = results.substring(0, typingIndex);

  const formatResults = (data, target) => {
    const lines = [];

    // Header
    lines.push(`[Recon] ▶ Starting: subfinder -d ${target}`);
    lines.push(`[Recon] ✅ Completed successfully`);
    lines.push(`Hi2`);
    lines.push(`Hi3`);
    lines.push(`Found 0 subdomains`);
    lines.push(`Basic Recon Data ${JSON.stringify(data.recondata || [])}`);
    lines.push(``);

    // Port Scan - RustScan
    lines.push(`[*] Scanning open ports with RustScan...`);
    lines.push(`[RustScan] ▶ Starting: rustscan -a ${target} --ulimit 5000 -- -Pn -n`);
    lines.push(`[RustScan] ✅ Completed successfully`);

    const openPorts = data.rustscan || [];
    lines.push(`[+] RustScan Open Ports:\n [`);
    
    openPorts.forEach(port => {
      lines.push(`  {\n    port: ${port},\n    protocol: '${protocol}',\n    state: '${state}',\n    service: '${service}',\n    version: '${version}'\n  },`);
    });
    lines.push(`]`);

    // FTP port checks
    if (openPorts.some(p => p.port === 21)) {
      lines.push(`[RustScan-FTP-Port] ▶ Starting: rustscan -a ${target} -p 21 --ulimit 5000`);
      lines.push(`[RustScan-FTP-Port] ✅ Completed successfully`);

      lines.push(`[FTP-Anonymous-Check] ▶ Starting: nmap -p21 --script ftp-anon ${target}`);
      lines.push(`[FTP-Anonymous-Check] ✅ Completed successfully`);

      const bruteCombos = [
        { user: 'ftp', pass: 'ftp' },
        { user: 'admin', pass: 'admin' },
        { user: 'anonymous', pass: '' },
        { user: 'test', pass: 'test' },
      ];

      bruteCombos.forEach(({ user, pass }) => {
        lines.push(`[FTP-Brute] ▶ Starting: hydra -t 4 -l ${user} -p ${pass} ftp://${target}`);
        lines.push(`[FTP-Brute] ✅ Completed successfully`);
      });
    }

    // Vulnerability Scan Results
    const vulns = data.port?.flatMap(g => g.filter(p => p.type === 'misconfiguration')) || [];

    lines.push(`Vulnerability Results: [`);
    vulns.forEach(group => {
      lines.push(`  [`);
      lines.push(`    {`);
      lines.push(`      type: '${group.type}',`);
      lines.push(`      id: '${group.id}',`);
      lines.push(`      name: '${group.name}',`);
      lines.push(`      verified: ${group.verified},`);
      lines.push(`      severity: '${group.severity}',`);
      lines.push(`      description: '${group.description}',`);
      lines.push(`      output: \`${group.output.replace(/\n/g, '\\n')}\``);
      lines.push(`    }`);
      lines.push(`  ]`);
    });
    lines.push(`]`);

    // Tech Detection
    lines.push(`[*] Detecting tech for https://${target}`);
    if (data.detectedTech && Object.keys(data.detectedTech).length > 0) {
      lines.push(`[+] Detected tech:`);
      Object.entries(data.detectedTech).forEach(([key, value]) => {
        lines.push(`    - ${key}: ${value}`);
      });
    } else {
      lines.push(`[-] Failed to detect tech: ${data.techDetectError || ''}`);
      lines.push(`Detect Tech ${JSON.stringify(data.detectedTech || {})}`);
    }

    return lines.join('\n');
  };


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
      const response = await fetch("http://localhost:3001/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: target }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      console.log("Data is: ", data);
      const formatted = formatResults(data.data, target);
      setResults(formatted);
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to complete scan. Please try again.');
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

        <button type="submit" className={styles.button} disabled={loading}>
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

        <pre className={styles.resultContent}>
          {displayedResults}
          {typingIndex < results.length && <span className={styles.cursorBlink}>|</span>}
        </pre>
      </div>
    </div>
  );
}
