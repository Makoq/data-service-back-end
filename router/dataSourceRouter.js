var db = require("../model/db.js");
var file = require('./file.js');

// 从数据库获取数据源列表


exports.getDataSourceCount=function(req,res,next){
  var collectionName=req.query.type

  db.getAllCount(collectionName,function(result){
    res.send({
      errno:0,
      data:result
    })
  })

}
exports.getDataSource = function (req, res, next) {
  // var isLogin = req.session.islogin;
  // var username = req.session.username;
  // if (true != isLogin) {
  //   res.send({ errno: -1 });
  //   return;
  // }

  // 每种数据源都对应一个collection。type表示collection的名字
  var collectionName = req.query.type;
  let username=req.query.username;
  let uid=req.query.uid;

  let page=Number(req.query.page)-1
  let pageSize=Number(req.query.pageSize)

  if(collectionName==="udx_source"){
    console.log("udx list")
  }else{
    console.log("work space list")
  }
  
  // 排序  "sort":{"name":1}
  //"$or": findConditioin, delete: isdelete
  //"pageamount": pageamount, "page": page, "sort": { "datetime": 1 }
  db.find(collectionName, { username: username,uid:uid }, {pageamount:pageSize,page:page}, function (err, result) {
    if (err) {
      console.log(err);
      res.send({ errno: -1, errmsg: '获取数据失败' });
      return;
    }
    res.send({ errno: 0, data: result });
  });

}

exports.deleteDataSource = function (req, res, next) {
  var collectionName = req.query.type;
  var id = req.query.id;
  let username=req.query.username
  let uid =req.query.uid
  let workspace =req.query.workspace

  
console.log("delete udx",id,collectionName)
  db.find(collectionName, { username: username, id: id,uid:uid }, function (err2, result2) {
    if (err2) {
      console.log(err2);
      res.send({ errno: -1 });
      return;
    }
    var basedir = __dirname + '/../upload/';
    
    var dir =  '_' + id;
    // 删除解压的文件夹
    file.deleteDir(basedir, dir, function (err3, data, stderr) {
      if (err3) {
        console.log(err3);
        res.send({ errno: -1 });
        return;
      }
      // 删除数据库
      db.deleteMany(collectionName, { id: id }, function (err, result) {

        if (err) {
          console.log(err);
          res.send({ errno: -1, errmsg: '删除失败' });
          return;
        }
        //删除tmp文件夹中的临时文件
        // fs.unlink(files.files.path);


              db.updateMany("workspace",{id:workspace},{$pull:{filelist:id}},function(err,result3){

                if(err){
                  console.log(err)
                }
                  //todo 拷贝文件
                    res.send({ errno: 0, errmsg: '删除成功' });


              })
       
      });
    });

  });
}

