# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT open a public issue.**
2. Email **heznpc@gmail.com** or use [GitHub Security Advisories](../../security/advisories/new).
3. Include steps to reproduce, impact assessment, and suggested fix if possible.

We will respond within 48 hours and work with you to resolve the issue.

## Security Features

This template includes automated security checks in CI:

- **Dependency audit** — `npm audit` on every push (HIGH/CRITICAL threshold)
- **Secret leak detection** — [gitleaks](https://github.com/gitleaks/gitleaks) scans every commit (SHA-pinned binary, checksum-verified)
- **GitHub-side secret scanning** — repo-level secret scanning + push protection enabled, plus Dependabot security updates
- **Dependency updates** — [Dependabot](https://docs.github.com/en/code-security/dependabot) monitors for vulnerable dependencies
- **Permission audit** — CI warns on risky browser permissions (debugger, cookies, <all_urls>)
- **Manifest validation** — Verifies MV3 compliance on every push
- **Build provenance** — CD workflows attach SLSA build provenance attestations to `dist/extension.zip` via [actions/attest-build-provenance](https://github.com/actions/attest-build-provenance), so downstream auditors can verify the artifact came from this repo's CI

## Best Practices

- Never commit `.env` files or secrets — they are gitignored by default
- Use GitHub Secrets for deployment credentials
- Keep dependencies up to date by merging Dependabot PRs
