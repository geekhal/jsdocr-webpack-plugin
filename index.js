/**
 * @fileOverview
 * `JsdocrWebpackPlugin`插件，用于实时监听文件改变并生成jsdoc，同时使用了`express server`对生成的文档进行伺服
 * 执行命令的位置必须和jsdoc配置文件处于同一级，另外需要事先全局安装好`jsdoc`
 * `tips: npm install -g jsdoc`
 * 
 * @author halzhan
 * @version 1.0
 * @licence MIT
 */
const { spawn } = require('child_process');
const helpers = require('./helpers');
const fs = require('fs');
const express = require('express');
const _favicon = require('serve-favicon');

let server;

const STYLES = {
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m', // 洋红色
    CYAN: '\x1b[36m', // 青色
    WHITE: '\x1b[37m',
    CLEAR: '\x1b[0m', // 清除样式
};

const STATUS = {
    ERROR: -1,
    EXCEPTION: -2,
    OK: 0,
    NOTICE: 1
};

const DEFAULT_OPTIONS = {
    hook: 'done', // webpack编译时机，默认为`done`
    readme: helpers.root('readme.md'), // jsdoc所使用的readme文件路径
    port: 4545, // 服务监听的端口
    serve: true, // 是否启动一个服务
    favicon: helpers.root('favicon.ico'), // 默认favicon路径
    conf: helpers.root('jsdoc.conf.json'), // 默认配置文件路径
    destDir: helpers.root('jsdocs'), // 伺服文件目录
    address: '0.0.0.0', // 绑定ip
    jsdocDebug: false, // 是否完整打印jsdoc的debug信息
    serverDebug: false // 是否打印完整debug信息
};

function log(content = '', status = STATUS.OK) {
    if (status < STATUS.OK) {
        console.error(`${STYLES.RED}Jsdocr:  ${content}${STYLES.CLEAR}`);
    }
    else if (status === STATUS.NOTICE) {
        console.log(`${STYLES.YELLOW}Jsdocr:  ${content}${STYLES.CLEAR}`);
    }
    else {
        console.log(`${STYLES.GREEN}Jsdocr:  ${content}${STYLES.CLEAR}`);
    }
}

function runSpawn(cmd = '', args = [], callbacks = {}) {
    let spawnor = null;
    let { beforeSpawn, onOut, onError, onClose } = callbacks;
    if (cmd) {
        try {
            spawnor = spawn(cmd, args, {
                shell: process.platform === 'win32'
            });
            if (typeof beforeSpawn === 'function') {
                beforeSpawn();
            }
            spawnor.stdout.on('data', (data) => {
                if (typeof onOut === 'function') {
                    onOut(data);
                }
            });
            spawnor.stderr.on('data', (data) => {
                if (typeof onError === 'function') {
                    onError(data);
                }
            });
            spawnor.on('close', (code) => {
                if (typeof onClose === 'function') {
                    onClose(code);
                }
            });
        } catch (error) {
            log(`Failed to run command ${cmd} with an error: ${error}`, STATUS.ERROR)
        }
    }
    else {
        log(`You have to input valid command!`, STATUS.ERROR);
    }
    return spawnor;
}

function startServer(options) {
    let {
        port, destDir, address, favicon, serverDebug
    } = options || DEFAULT_OPTIONS;
    if (!server) {
        server = express();
        if (fs.existsSync(favicon)) {
            server.use(_favicon(favicon));
        }
        else {
            log(`Invalid favicon path: ${favicon}!`, STATUS.ERROR);
        }
        server.use((req, res, next) => {
            if (serverDebug) {
                log(`${req.method} ${req.originalUrl} - ${new Date()}`);
            }
            next();
        });
        server.use(express.static(destDir));
        server.listen(port, () => {
            log(`Server listening on http://${address}:${port}`);
        });
    }
}

function runJsdoc(options) {
    let {
        conf, destDir, jsdocDebug, readme
    } = options || DEFAULT_OPTIONS,
        isWaiting = false,
        args = [
            '-c', conf,
            '-d', destDir
        ];
    if (readme && fs.existsSync(readme)) {
        args.push('-R', readme);
    }
    runSpawn('jsdoc', args, {
        beforeSpawn() {
            if (!isWaiting) {
                log(`Starting to build jsdoc...`, STATUS.NOTICE);
                isWaiting = true;
            }
        },
        onOut(data) {
            if (jsdocDebug) {
                log(`${data}`);
            }
        },
        onError(data) {
            if (jsdocDebug) {
                log(`${data}`, STATUS.ERROR);
            }
        },
        onClose(code) {
            if (code) {
                log('Failed to build jsdoc!', STATUS.ERROR)
            }
            else {
                log('Jsdoc has been built successfully!')
            }
            isWaiting = false;
        }
    });
}

/**
 * The plugin for webpack to build jsdoc and provide a server to serve generated files.
 * 
 * @param {Object} [options={}] Options for the plugin.
 * @param {String} [options.address] The host which will be binded to serve jsdoc files.
 * @param {String} [options.conf] The path of jsdoc config json file's.
 * @param {String} [options.destDir] The path of generated jsdoc files'.
 * @param {String} [options.favicon] The path of favicon.ico's.
 * @param {String} [options.hook] The hook of webpack when we will build jsdoc.
 * @param {Boolean} [options.jsdocDebug] Display or not the debug info of jsdoc's. (Error info will still be displayed.)
 * @param {Boolean} [options.port] The port which will be binded to serve jsdoc files.
 * @param {String} [options.readme] The path of readme.md for jsdoc.
 * @param {Boolean} [options.serve] Start or not a server to serve files.
 * @param {Boolean} [options.serverDebug] Display or not the debug info of server's. (Error info will still be displayed.)
 */
function JsdocrWebpackPlugin(options = {}) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
}

JsdocrWebpackPlugin.prototype.apply = function (compiler) {
    if (this.options.serve) {
        startServer(this.options);
    }

    compiler.plugin(this.options.hook, (compilation, callback) => {
        runJsdoc(this.options);
        if (callback) {
            callback();
        }
    })
}

module.exports = JsdocrWebpackPlugin;