
var formidable = require('formidable');
var fs = require('fs');
var unzip = require("unzip");//解压缩
var db = require("../model/db.js");
var uuid = require('node-uuid');
var sd = require('silly-datetime');

exports.uploadUdxSource = function (req, res, next) {
  // var isLogin = req.session.islogin;
  // var username = req.session.username;
  // if (true != isLogin) {
  //   res.send({ errno: -1 });
  //   return;
  // }

  var form = new formidable.IncomingForm();
  form.uploadDir = __dirname + '/../tmp';    // 上传临时目录
  form.parse(req, function (err, fields, files) {
    var id = uuid.v4();
    var basedir = __dirname + '/../upload/'; // 例如： xx/xxx/datamap/ 

    var file = files.file;
    var old_path = file.path;
    
     

    var new_path = basedir + file.name + "_" + id;

    // 新建文件夹，解压文件
    if (!fs.existsSync(new_path)) {
      fs.mkdirSync(new_path);
    }

    // 先解压到本地的，再保存到数据库
    //.pipe().unzip.Extract({ path: new_path })

    fs.createReadStream(old_path).on('data', function () {
      
      var datetime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
      
      // inset into db
      db.insertOne("udx_source", {id:id,  name: fields.name, tags: fields.tags,describe: fields.desc, file: file.name, username: 'jin', datetime: datetime, share: '-1', delete: '-1' }, function (err3, result3) {
        if (err3) {
          console.log(err3);
          // res.send({
          //   errno: -1,
          //   msg: '保存数据库失败'
          // });
          return;
        }
        console.log("insert success",fields.name)


        res.send({
          errno: 0,
          msg: 'ok'
        });


      });

      // res.send({
      //   errno: 0,
      //   msg: 'ok'
      // });

    });



    // fs.rename(old_path, new_path, function (err2) {
    //   if (err2) {
    //     console.log(err2);
    //     res.send({
    //       errno: 1,
    //       msg: '服务器端保存文件失败'
    //     });
    //     return;
    //   }

    //   iterator(index + 1);
    // });


  });
}

exports.udxSchemaInfo = function (req, res, next) {

  let id = req.query.id
  let pageamount=parseInt(req.query.pageamount);
  let page=parseInt(req.query.page)-1

  // console.log(id)
  db.find("udx_source",{id:id},{pageamount:pageamount,page:page},(err3, result3)=>{
    if (err3) {
      console.log(err3);
      //查找失败
      return;
    }

    res.send({
      errno: 0,
      data: result3
    })
    console.log('check udx schema info',id)

  })

}