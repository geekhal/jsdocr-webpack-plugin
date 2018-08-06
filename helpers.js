/**
 * @fileOverview
 * tools for project
 * @author halzhan
 */
const path = require('path');
const _root = path.resolve(__dirname, '..');

/**
 * @desc 获得以开发目录为根目录的绝对路径
 * @param {string} dir 传入当前目录地址
 * @param {String} 返回绝对路径
 */
exports.root = function (args) {
  args = Array.prototype.slice.call(arguments, 0);
  let objPath = path.join.apply(path, [_root].concat(args));
  return objPath;
}