# Security Policy

OpenShock controls devices that people wear, so we take security reports seriously.
This file covers what is specific to the OpenShock web frontend. Everything else, including scope, rules for
testing, response times, disclosure and safe harbor, is in the
**[OpenShock security policy](https://github.com/OpenShock/.github/blob/main/SECURITY.md)**.
Please read it before testing.

## Reporting a vulnerability

**Do not open a public issue, pull request or Discord thread for a security vulnerability.**

Report it privately through one of these channels:

- [GitHub private vulnerability reporting](https://github.com/OpenShock/Frontend/security/advisories/new) (preferred)
- Email to [security@openshock.org](mailto:security@openshock.org)

We acknowledge reports within 3 working days (7 days at most), give a triage result within
14 days, and follow coordinated disclosure with a default deadline of 90 days. OpenShock does not
pay bounties; reporters are credited in the advisory and in our
[security acknowledgments](https://github.com/OpenShock/.github/blob/main/SECURITY-ACKNOWLEDGMENTS.md)
if they wish.

## Supported versions

| Version                                                          | Receives security fixes                                   |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| Latest [release](https://github.com/OpenShock/Frontend/releases) | Yes                                                       |
| Older releases                                                   | No, update to the latest release                          |
| `develop` branch and preview deployments                         | Handled as regular bugs unless a release is also affected |

The officially hosted instance at `openshock.app` always runs a current version.

## What we are most interested in

- Cross-site scripting and HTML injection, especially through user-controlled content such as
  names, share links and device data.
- Leaks of session cookies, API tokens or other credentials to third parties or to other users.
- Cross-site request forgery and cross-origin attacks against authenticated actions.
- Open redirects that can be used to steal credentials or bypass the login flow.
- Weaknesses in the Content Security Policy that make another vulnerability exploitable.
- The web flasher delivering or accepting firmware it should not.
- Vulnerabilities introduced through the build and dependency chain of this repository.

## Testing

- Run the frontend locally against your own backend wherever possible.
- On the officially hosted service, use only accounts and devices you own, and **never send a
  command to another person's device**.

## Not considered vulnerabilities in this repository

- Self-XSS, and attacks that require the victim to paste code or follow attacker instructions.
- Missing security headers or cookie flags without a demonstrated attack.
- Clickjacking on pages without sensitive actions.
- Attacks that require a malicious browser extension or an outdated browser.
- Authorization flaws in the API. Those are welcome, but belong in the
  [API repository](https://github.com/OpenShock/API/security/advisories/new).

## For self-hosters

The frontend serves `/.well-known/security.txt` from the `PUBLIC_SECURITY_*` environment
variables. If you host your own instance, set them to your own contact details or leave
`PUBLIC_SECURITY_CONTACT` empty to disable the file. Do not publish OpenShock's contact for an
instance we do not operate.
