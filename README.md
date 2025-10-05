# Interview Readme

## Setup

- This code developed using Node.js v24. If installed dependencies seem to be having issues with the node environment, please install `nvm` (see below) and run `nvm use` to switch to the correct Node version.
- Follow the rest of the instructions in the original README below to install dependencies and run the project.
- Update OPEN_WEATHER_API_KEY in `.env` file with your own API key to use the weather download feature

## Notes

- Use `yarn playwright test` to run the automated tests. This will be in the place of traditional unit tests run with `yarn test` from the starter repo
- Use ` yarn playwright test --ui` to run the interactive test runner, which can be useful for stakeholder review

## Testing strategy

1. Use playwright for automated testing and interactive stakeholder review
1. Report coverage `with playwright show-report` (after running `yarn playwright`)
1. UI components are developed with the correct semantic tags and accessibility in mind, so that they can be tested with screen readers and other assistive technologies, as well as being SEO friendly and easy to test from an automation perspective (e.g. @testing-library/react [guidelines](https://testing-library.com/docs/guiding-principles/).

## Feature development procedure

This section is just to get an idea of how I approached development for this project, in the place of normal Agile/Scrum ceremonies.

1. Review core product requirements above.
1. Create user stories for each feature
1. Create UX designs / wireframes if needed
1. Create technical requirements for each user story
1. Create tasks for each technical requirement
1. Estimate tasks
1. Implement tasks
1. Implement test cases for each user story as possible with completed tasks
1. For each extension or enhancement, repeat the above steps

## Use of AI

Copilot Agent mode was used heavily to draft stories, test cases, sample data, UX design, and technical requirements. It was also used to help install and configure tooling like Playwright and @testing-library/react, as these can be time consuming to set up from scratch, and I wanted to spend more of my time on the actual implementation.

**=========== ORIGINAL README FROM STARTER REPO BELOW THIS LINE ===========**

# Express React Webpack starter

A starter Webpack 4 configuration for basic projects with Express and React.

## Features

- Build single page web apps with typescript.

## Dependencies

- Install `node`
  - Use NVM (https://github.com/nvm-sh/nvm): `nvm install lts/dubnium && nvm use lts/dubnium`
  - Alternatively you can download and install it manually: https://nodejs.org/en/download/
- Install `yarn ^1.10.1`
  - Use brew (https://brew.sh/): `brew install yarn`
  - Alternatively you can download and install it manually: https://classic.yarnpkg.com/en/docs/install

## Development

- Download and install VSCode: https://code.visualstudio.com/
- Read the setup guide https://code.visualstudio.com/docs/setup/setup-overview
  - Launching VSCode from the command line: Open the Command Palette (F1) and type `shell command` to find the `Shell Command: Install 'code' command in PATH command`
    - After doing this you can start VSCode on a repo with `code .`
- Install TSLint extension in VSCode https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin
- In order to run the debugger for backend/tests put a breakpoint in VSCode and run this command in VSCode (`CMD + SHIFT + P`): `Debug: attach node to process`. You can also enable `Debug: Toggle Auto Attach` to start the debugger every time a node process is started from VSCode terminal.
- To open a terminal in VSCode: `` CTRL + `  ``

## Usage

- Install dependencies: `yarn install`
- Build application (both frontend and backend in http://localhost:8080): `yarn build`
  - Some browser automatically redirects you to `https` so make sure to disable the automatic redirect
- Watch for changes and build application: `yarn build-watch`
- Build frontend, watch for changes and hot reload (port 8000): `yarn build-hot-reload`
  - All the backend requests will be forwarded to port 8080 so you need to run the backend
- Run application (port 8080): `yarn start`
- Run tests: `yarn test`
- Remove all the generated files: `yarn clean`

## Useful links

- Typescript guide: https://basarat.gitbook.io/typescript/
- VSCode custom settings: https://github.com/gianluca-venturini/env_confs/tree/master/vs_codet
