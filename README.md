# jsdocr-webpack-plugin

One small plugin for `webpack` to build `jsdoc`, and provide a server which is based on `express` to serve generated jsdoc files. **All of paths based on the place where you start the webpack.**

## Links

- [NPM](https://www.npmjs.com/package/jsdocr-webpack-plugin)
- [Github](https://github.com/HalZhan/jsdocr-webpack-plugin)

## Installation

```js
npm install jsdoc -g

npm install jsdocr-webpack-plugin -D
```

## Usage

```js
// In your webpack config files, add these options to `plugins`, all of below are default options.
plugins: [
    // ...
    new JsdocrWebpackPlugin({
        hook: 'done', // The hook of webpack when build jsdoc.
        serve: true, // Shall we start a server?
        address: '0.0.0.0', // The host will be binded to serve files.
        port: 4545, // Port to serve generated jsdoc files.
        conf: helpers.root('jsdoc.conf.json'), // Jsdoc config json file's path.
        destDir: helpers.root('jsdocs'), // Generated jsdoc files' directory.
        readme: helpers.root('readme.md'), // Readme for jsdoc, which can be setted in the `jsdoc.conf.json`.
        favicon: helpers.root('favicon.png'), // Favicon's path.
        jsdocDebug: false, // Display jsdoc detail info in your terminal?
        serverDebug: false // Display server detail info in your terminal?
    }),
    // ...
]
```

## Change Logs

### v0.0.1(2018/08/06)

First version.