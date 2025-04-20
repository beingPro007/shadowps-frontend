export async function GET(request) {
  // Extract the target from the URL params
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');

  if (!target) {
    return Response.json(
      { error: 'Target parameter is required' },
      { status: 400 }
    );
  }

  // Simulate scan delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock scan results
  const mockResults = generateMockResults(target);

  return Response.json({ result: mockResults });
}

function generateMockResults(target) {
  // Generate realistic-looking scan output for the mock API
  return `
> ShadowOps Scan v1.0
> Target: ${target}
> Scan started at ${new Date().toISOString()}

[+] Running port scan...
[+] Found open ports: 22, 80, 443
[+] Service detection...
    - 22/tcp: SSH (OpenSSH 8.2p1)
    - 80/tcp: HTTP (nginx 1.18.0)
    - 443/tcp: HTTPS (nginx 1.18.0)

[+] Running vulnerability scan...
[+] Checking for known CVEs...
[!] CVE-2021-44228 may affect services on this host
[!] Web server potentially vulnerable to directory traversal

[+] Running SSL/TLS analysis...
[+] TLS 1.2 supported
[+] TLS 1.3 supported
[+] Strong cipher suites detected

[+] Basic web enumeration...
[+] Discovered endpoints:
    - /login
    - /admin (403 Forbidden)
    - /api/v1
    - /images

[+] Scan completed
[+] 3 potential vulnerabilities found
[+] 4 endpoints discovered
[+] Recommendations: Patch systems and review access controls

> Scan finished at ${new Date().toISOString()}
  `;
} 