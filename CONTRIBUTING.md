# Contributing to node apps toolkit
Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

## Getting started

### Requirements

- Node.js: `>=14.15.0`

To install all dependencies and build all packages run the following commands from the root of the project.

```
npm
npm run build
```

## Submitting a Pull Request

Good pull requests, such as patches, improvements, and new features, are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

Please ask first if somebody else is already working on this or the Contentful developers think your feature is in-scope. If one does not already exist then please create a related issue for the changes you plan to make.

## Folder structure

Source code and associated unit tests can be found in the `src/` directory. 
Integration tests can be found in the `test/` directory.

## Quality & Code Style

### Commit messages

All commit messages should meet the [conventional commit format](https://github.com/conventional-changelog/commitlint). 

### Code formatting

You don't need to worry about formatting your code. It is automatically reformatted using `prettier` on every commit using Git hooks.

### Linting

We use [ESLint](https://eslint.org/) and [Typescript ESLint](https://github.com/typescript-eslint/typescript-eslint) for linting and checking code for errors.

All modern editors should automatically pick up configuration and show errors and warnings while you type.

### Tests

We use [Mocha](https://mochajs.org/) for writing tests.

#### Setup tests
Before running tests please run the `preTest` command. It will generate a keypair to enable testing of the related functionality.

```bash
npm run pretest
```

#### Run unit tests

```bash
npm run test:unit
```

#### Run integration tests
> **:warning: Please Note**
> 
> In order to run integration tests all the environment variables present in 
[`.env.tpl`](./.env.tpl) must be provided.

```bash
npm run test:integration
```
