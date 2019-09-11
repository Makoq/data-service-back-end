var formidable = require('formidable');
var fs = require('fs');
 
var db = require("../model/db.js");
var uuid = require('node-uuid');
var sd = require('silly-datetime');


exports.createWorkspace=function(req, res, next){

     
        
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if(err){
                console.log(err)
            }

            let id = uuid.v4();
            var datetime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
            db.insertOne("workspace", {id:id,  name: fields.name, tags: fields.tags,describe: fields.desc, username: fields.username,uid: fields.uid, datetime: datetime,filelist:[] }, function (err3, result3) {
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
        })


}

exports.delworkspace=function(req, res, next){
    let id = req.query.id;
    let username=req.query.username
    let uid=req.query.uid
    console.log("delete workspace",id)
    db.find("workspace", { username: 'jin', id: id }, function (err2, result2) {
        if (err2) {
          console.log(err2);
          res.send({ errno: -1 });
          return;
        }
        db.deleteMany("workspace", { username:username, uid:uid,id: id }, function (err, result) {

            if (err) {
            console.log(err);
            res.send({ errno: -1, errmsg: '删除失败' });
            return;
            }
            //删除tmp文件夹中的临时文件
            // fs.unlink(files.files.path);
            res.send({ errno: 0, errmsg: '删除成功' });
        });
    })
    


}

 