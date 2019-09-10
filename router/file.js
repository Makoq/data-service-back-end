/**
 * by kingw
 * 
 * IO操作的帮助类
 */

var fs = require('fs');
var path = require('path');

var child_process = require('child_process');

// 使用时第二个参数可以忽略  
exports.mkdir = function mkdir(dirpath, dirname) {
    //判断是否是第一次调用  
    if (typeof dirname === "undefined") {
        if (fs.existsSync(dirpath)) {
            return;
        } else {
            mkdir(dirpath, path.dirname(dirpath));
        }
    } else {
        //判断第二个参数是否正常，避免调用时传入错误参数  
        if (dirname !== path.dirname(dirpath)) {
            mkdir(dirpath);
            return;
        }
        if (fs.existsSync(dirname)) {
            fs.mkdirSync(dirpath)
        } else {
            mkdir(dirname, path.dirname(dirname));
            fs.mkdirSync(dirpath);
        }
    }
}

// 删除文件夹
// cwd：当前工作目录
// dir：要删除的当前工作目录下的文件夹
// 回调函数
exports.deleteDir = function (cwd, dir, callback) {
    child_process.exec('rd /s /q ' + dir, { cwd: cwd }, function (err, data, stderr) {
        callback (err, data, stderr)
    });
}