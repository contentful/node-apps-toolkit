# Node Toolkit for Contentful Apps

The `node-apps-toolkit` is a growing collection of helpers and utilities for building [Contentful Apps](https://www.contentful.com/developers/docs/extensibility/app-framework/) with Node.js.

## Compatibiltiy

Requires an [Node.js LTS version](https://github.com/nodejs/Release). Currently supported node versions:
 - v18
 - v20
Odd-numbered and not-yet LTS major versions are not supported.

## Installation
 
```shell
npm install --save @contentful/node-apps-toolkit
# or
yarn add @contentful/node-apps-toolkit
```

## Available features

 - :lock: Request Verification
 - :writing_hand: Request Signing
 - :bust_in_silhouette:	CMA Token generation for App Identities

For more details, check out the [API documentation](https://contentful.github.io/node-apps-toolkit/).

## Example Usage

```js
const { getManagementToken } = require('@contentful/node-apps-toolkit');
const { appInstallationId, spaceId, environmentId, privateKey } = require('./some-constants');

getManagementToken(privateKey, { appInstallationId, spaceId, environmentId })
    .then((token) => {
      console.log('Here is your app token:', token)
    })
```

For more information, check out the full [API documentation](https://contentful.github.io/node-apps-toolkit/).

## More coming soon
We're excited to expand this toolkit with new features. If you have any suggestions or requests for features you'd like to see, please [create an issue](https://github.com/contentful/node-apps-toolkit/issues/new) in this repo.

## Contributing and local development
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to contribute to this project.
