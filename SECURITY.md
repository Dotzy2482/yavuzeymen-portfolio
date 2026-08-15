# Security Policy

## Reporting a Vulnerability

Please **do not** open a public issue for security problems.

Report privately through GitHub:

1. Go to the **Security** tab of this repository.
2. Choose **Report a vulnerability** (Private vulnerability reporting).
3. Describe the issue, the affected files, and reproduction steps.

You will get an acknowledgement through the advisory thread. Please allow a
reasonable window for a fix before any public disclosure.

## Scope

This is a static, client-side site. Reports of interest include exposed
credentials in the repository or build output, dependency vulnerabilities,
and anything that leaks personal data.

## Note on environment variables

Every `VITE_`-prefixed variable is inlined into the production bundle and is
visible to anyone loading the site. They are kept out of the repository, but
they are **not secret**. Genuine secrets must never use the `VITE_` prefix and
must not reach this codebase.
