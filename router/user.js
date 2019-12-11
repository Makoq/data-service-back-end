
var formidable = require('formidable');
var db = require("../model/db.js");
var uuid = require('node-uuid');
var sd = require('silly-datetime');

exports.action = function (req, res, next) {
  // res.send( { errno:0, errmsg:0, data: {uid:1,name:"jin"} } );
  var action = req.params.action;

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var username = fields.user;
    var password = fields.pass; // MD5加密了

    if (action == 'login') {
      db.find("users", { "name": username, 'password': password }, (err1, result1) => {
        if (err1) {
          console.log(err);
          res.send({
            errno: -1,
            errmsg: '查询数据库错误',
            data: {}
          });
          return;
        }
        // 登录成功
        if (result1.length == 1) {
          req.session.islogin = true; // 往session中存登录成功的标识和用户名
          req.session.username = username;

          res.send({
            errno: 0,
            errmsg: '',
            data: { uid: result1[0].uid, name: result1[0].name }
          });
        }else{
          res.send({errno:-1, errmsg: '登录失败',data:{}});
        }
      });

    } else if (action == 'reg') {
      //查询数据库，看看有没有个这个人
      db.find("users", { "name": username }, (err2, result2) => {
        if (err2) {
          console.log(err2);
          res.send({
            errno: 3,
            errmsg: '查询users文档出错',
            data: { }
          });
          return;
        }

        if (result2.length == 0) {
          // 不存在
          var uid = uuid.v4();
          var datetime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');

          // 1. 插入数据库
          db.insertOne('users', { name: username, password: password, uid: uid, datetime: datetime }, function (err3, result3) {
            if (err3) {
              console.log(err3);
              res.send({
                errno: 5,
                errmsg: '插入数据库失败',
                data: {  }
              });
              return;
            }
            // 注册成功，自动登录
            res.send({
              errno: 0,
              errmsg: '',
              data: { uid: uid, name: username }
            });
          });

        } else {
          res.send({
            errno: 4,
            errmsg: '用户已存在',
            data: {}
          });
        }

      });
    }



  });

}



