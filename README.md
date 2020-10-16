Node Apps Toolkit
===

The Node Apps Toolkit is a growing collection of helpers, and utilities, for creating NodeJS Contentful Apps.

## Getting started
 
You can install this library with npm or yarn
 
```
npm install --save @contentful/node-apps-toolkit
or
yarn add @contentful/node-apps-toolkit
```

You can include the library in your project like this
```js
const { getManagementToken } = require('@contentful/node-apps-toolkit');
const { appInstallationId, spaceId, privateKey } = require('./some-constants');

getManagementToken(privateKey, {appInstallationId, spaceId})
    .then((token) => {
      console.log('Here is your app token')
      console.log(token)
    })
```

## API Documentation

In depth API documentation is available [here](https://contentful.github.io/node-apps-toolkit/)

## More coming soon
We're excited to expand this toolkit with new features. If you have any suggestions or requests for features you'd like to see please create an issue in this repo!

## Contributing and local development
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to contribute to this project.


