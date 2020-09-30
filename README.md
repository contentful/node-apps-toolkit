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

getManagementToken(PRIVATE_KEY)
    .then(token => {
      console.log('Here is your app token')
      console.log(token)
    })
```

## API Docs

API documentation is available [here](https://contentful.github.io/node-apps-toolkit/)