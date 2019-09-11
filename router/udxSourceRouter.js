
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
  console.log("path",__dirname + '/../tmp')
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
      db.insertOne("udx_source", { id: id, name: fields.name, tags: fields.tags, describe: fields.desc, file: file.name, username: fields.username, uid: fields.uid, datetime: datetime, workspace: fields.workspace, workSpaceName: fields.workSpaceName, share: '-1', delete: '-1' }, function (err3, result3) {
        if (err3) {
          console.log(err3);
          return;
        }
        //同时在工作空间中增加
        db.updateMany("workspace", { id: fields.workspace }, { $push: { filelist: id } }, function (err, result3) {

          if (err) {
            console.log(err)
          }
          //TODO; 
          //拷贝文件从一个目录到另一个目录,这里目录写死了*******************
          fs.copyFileSync( old_path,"F:/udx/UdxServer/Server/upload/"+file.name + "_" + id+"/"+file.name+"_"+id);
          res.send({
            errno: 0,
            msg: 'ok'
          });
        })


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
  let pageamount = parseInt(req.query.pageamount);
  let page = parseInt(req.query.page) - 1

  // console.log(id)
  db.find("udx_source", { id: id }, { pageamount: pageamount, page: page }, (err3, result3) => {
    if (err3) {
      console.log(err3);
      //查找失败
      return;
    }

    res.send({
      errno: 0,
      data: result3
    })
    console.log('check udx schema info', id)

  })

}


exports.udxNode = function (req, res, next) {
  let id=req.query.id
  let fileName=req.query.fileName
  fs.readFile("F:/udx/UdxServer/Server/upload/"+fileName+"_"+id, (err, data) => {
    if (err) throw err;
    console.log(data);

    send({
      errno: 0,
      msg: 'ok'
    })
  });

}