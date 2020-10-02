Node Apps Toolkit
===

A collection of helpers and utilities for creating NodeJS Contentful Apps

## Getting started
 
You can install this library via
 
```
npm install --save contentful-node-apps-toolkit
```

and include it in your code like

```js
const {getManagementToken} = require('contentful-node-apps-toolkit');
const {appInstallationId, spaceId, privateKey} = require('./some-constants');

getManagementToken(privateKey, {appInstallationId, spaceId})
    .then((token) => {
      console.log('Here is your app token')
      console.log(token)
    })
```

## API Docs

API documentation is available [here](https://contentful.github.io/node-apps-toolkit/)

## Testing

> **:warning: Please Note**
> 
> In order to run integration tests all the environment variables present in 
[`.env.tpl`](./.env.tpl) must be provided.