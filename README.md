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

## Setup

To get started with development, you will need to have Node.js LTS installed.

We recommend using a version manager like [Volta](https://docs.volta.sh/guide/getting-started) to manage your Node.js versions. Alternatively, you can use [nvm-linux](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows).

If you are going to update the OpenAPI schema, you will need to have Java installed to run the OpenAPI generator.

After you have Node.js installed, you can run the following commands to get started:

```bash
npm i
npm run dev
```

## Available Commands

- `npm i` - Install dependencies
- `npm run dev` - Start the development server
- `npm run build` - Build the project
- `npm run preview` - Preview the built project
- `npx openapi-generator-cli generate` - Generate the API client
