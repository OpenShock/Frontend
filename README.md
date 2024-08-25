# OpenShock Frontend

[![Documentation](https://img.shields.io/badge/docs-mkdocs-blue.svg)](https://openshock.org)
[![GitHub license](https://img.shields.io/github/license/openshock/frontend.svg)](https://raw.githubusercontent.com/openshock/frontend/master/LICENSE)
[![GitHub Releases](https://img.shields.io/github/release/openshock/frontend.svg)](https://github.com/openshock/frontend/releases)
[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-ff69b4)](https://github.com/sponsors/openshock)
[![Discord](https://img.shields.io/discord/1078124408775901204)](https://discord.gg/openshock)

<table>
  <tr>
    <td>master</td>
    <td><a href="https://github.com/OpenShock/Frontend/actions/workflows/ci-master.yml"><img src="https://github.com/OpenShock/Frontend/actions/workflows/ci-master.yml/badge.svg?branch=master" alt="Build Status" /></a></td>
  </tr>
</table>

This is the frontend for the OpenShock project that interfaces with the OpenShock API.

## Technologies

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SveltKit](https://img.shields.io/badge/SvelteKit-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00)
![Skeleton UI](https://img.shields.io/badge/💀_Skeleton_UI-646CFF?style=for-the-badge&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Available Commands

- `npm i` - Install dependencies
- `npm run dev` - Start the development server
- `npm run build` - Build the project
- `npm run preview` - Preview the built project
- `npx openapi-generator-cli generate` - Generate the API client

## Setup

To get started with development, you will need to have **Node.js** and **npm** installed.

We recommend using a version manager like [Volta](https://docs.volta.sh/guide/getting-started) to manage your Node.js versions.

### Install Node.js and npm

Install on Linux:
```bash
curl https://get.volta.sh | bash
```

Install on Windows:
```pwsh
winget install Volta.Volta
```

Then you can install the required **Node.js** and **npm** version by running a single command in the repository root directory:
```bash
volta install
```

### Install dependencies and build project

With Node.js installed, you can run the following commands to get started:

```bash
npm i
npm run build
```

## Running locally

Running the frontend locally is as simple as this:
```bash
npm run dev
```

### Hosts redirect

If you do not have a hosts file config for your domain and try to run the project you will get the following example message:
```
Please ensure that local.openshock.app resolves to 127.0.0.1 in your hosts file

On macOS and Linux, you can do this by running the following command:
echo "127.0.0.1 local.openshock.app" | sudo tee -a /etc/hosts

On Windows, you can do this by running the following command in PowerShell as an administrator:
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "127.0.0.1 local.openshock.app"

Then restart your development server
```

This action is required because of cookie policy, once you have done this you should be set!

Try closing and re-opening your development environment or console to refresh its cached system config.

## Support

You can support the openshock dev team here: [Sponsor OpenShock](https://github.com/sponsors/OpenShock)