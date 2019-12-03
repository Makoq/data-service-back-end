
var formidable = require('formidable');
var fs = require('fs');
var unzip = require("unzip");//解压缩
var db = require("../model/db.js");
var uuid = require('node-uuid');
var sd = require('silly-datetime');


var xml2js = require("xml2js");
var cp = require('child_process');

var basedir = __dirname + '/../upload/'; // 例如： xx/xxx/datamap/ 

//递归拷贝文件相关
function copyDir(src, dist, callback) {

  fs.access(dist, function (err) {
    if (err) {
      // 目录不存在时创建目录
      fs.mkdirSync(dist);
    }
    _copy(null, src, dist);
  });

  function _copy(err, src, dist) {
    if (err) {
      callback(err);
    } else {
      fs.readdir(src, function (err, paths) {
        if (err) {
          callback(err)
        } else {
          paths.forEach(function (path) {
            var _src = src + '/' + path;
            var _dist = dist + '/' + path;
            fs.stat(_src, function (err, stat) {
              if (err) {
                callback(err);
              } else {
                // 判断是文件还是目录
                if (stat.isFile()) {
                  fs.writeFileSync(_dist, fs.readFileSync(_src));
                } else if (stat.isDirectory()) {
                  // 当是目录是，递归复制
                  copyDir(_src, _dist, callback)
                }
              }
            })
          })
        }
      })
    }




  }
}
exports.uploadUdxSource = function (req, res, next) {
  // var isLogin = req.session.islogin;
  // var username = req.session.username;
  // if (true != isLogin) {
  //   res.send({ errno: -1 });
  //   return;
  // }

  var form = new formidable.IncomingForm();
  form.uploadDir = __dirname + '/../data_dir';    // 上传临时目录

  
    form.parse(req, function (err, fields, files) {
      var id = uuid.v4();


      let localPath = fields.localpath


      var new_path = basedir + "_" + id;
      // console.log("localPath:",localPath)
      // console.log("new pATH:",new_path)

      // 先解压到本地的，再保存到数据库
      //.pipe().unzip.Extract({ path: new_path })
      //拷贝文件
      copyDir(localPath, new_path, function (err) {
        if (err) {
          console.log(err);
        }


      })
      var datetime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');

      db.insertOne("udx_source", { id: id, name: fields.name, img:fields.img,tags: fields.tags, describe: fields.desc, username: fields.username, uid: fields.uid, datetime: datetime, workspace: fields.workspace, workSpaceName: fields.workSpaceName, localPath: fields.localpath, share: '-1', delete: '-1' }
        , function (err3, result3) {
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
            // fs.copyFileSync( localPath,new_path);
            res.send({
              errno: 0,
              msg: 'ok'
            });
          })

        });

      // fs.createReadStream("F:/udx/UdxServer/Server/tmp/testschema").on('data', function () {

      //   var datetime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');

      //   // inset into db
      //   db.insertOne("udx_source", { id: id, name: fields.name, tags: fields.tags, describe: fields.desc, username: fields.username, uid: fields.uid, datetime: datetime, workspace: fields.workspace, workSpaceName: fields.workSpaceName,localPath:fields.localPath, share: '-1', delete: '-1' }, function (err3, result3) {
      //     if (err3) {
      //       console.log(err3);
      //       return;
      //     }
      //     //同时在工作空间中增加
      //     db.updateMany("workspace", { id: fields.workspace }, { $push: { filelist: id } }, function (err, result3) {

      //       if (err) {
      //         console.log(err)
      //       }
      //       //TODO; 
      //       //拷贝文件从一个目录到另一个目录,这里目录写死了*******************
      //       fs.copyFileSync( localPath,new_path);
      //       res.send({
      //         errno: 0,
      //         msg: 'ok'
      //       });
      //     })


      //   });
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

exports.schemaDataXml=function(req,res,next){
  let id=req.query.id
  let schemaData=req.query.schemaData

  let new_path = basedir + "_" + id;

  console.log("get schema data:",schemaData)

  
   
  //读取udx
  let schemaFile;
  try {
    schemaFile = fs.readFileSync(new_path + "/"+schemaData, 'utf-8');
  } catch (e) {
    console.log('read cfg.json error: ' + e);
    res.send('-1');
    return;
  }

  res.send({
    errno: 0,
    data:schemaFile
  })


  console.log("test")
}

exports.config=function(req,res,next){
  let id = req.query.id
  console.log("get node",id)

  let new_path = basedir + "_" + id;

  

  //读取配置文件
  let configFile = '';
  try {
    configFile = fs.readFileSync(new_path + "/config.json", 'utf-8');
  } catch (e) {
    console.log('read cfg.json error: ' + e);
    res.send('-1');
    return;
  }
   
  let configArray=(JSON.parse(configFile)).config

  res.send({
    errno: 0,
    data:  configArray,
       
    
  })
  

  
}

exports.udxNode = function (req, res, next) {



  let id = req.query.id
  let schema = req.query.schema


  let new_path = basedir + "_" + id;

  console.log("get node",id)

   
   
  //读取udx
  let schemaFile;
  try {
    schemaFile = fs.readFileSync(new_path + "/"+schema, 'utf-8');
  } catch (e) {
    console.log('read cfg.json error: ' + e);
    res.send('-1');
    return;
  }
  
  let resultJson;
  xml2js.parseString(schemaFile, {
    explicitArray: false,
  }, function (err, result) {
    resultJson = JSON.parse(JSON.stringify(result));
     
    // console.log(resultJson)
  });    
  
      res.send({
        errno: 0,
        data:{
          json:resultJson
        
        }
      })
   
}


exports.soloudxschema=function(req,res,next){
  let id=req.query.id

  db.find('udx_source',{id:id},function(err,result3){
    if(err){
      console.log(err)
    }

    res.send({
      errno:0,
      data:result3
    })
  })




}

exports.updateschema=function(req,res,next){

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
      if(err){
          console.log(err)
      }
    var datetime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
    console.log("wksp",fields.workspace)
    db.find('workspace',{id:fields.workspace},function(err1,result3){
      if(err1){
        console.log(err1)
      }
    

      
      if(result3[0].id===fields.originalWS){
        //当不切换工作空间时
        db.updateMany('udx_source',{id:fields.id},{$set:{name:fields.name,tags:fields.tags,img:fields.img,describe:fields.desc,datetime:datetime,localPath:fields.localpath}},function(err2,result3){
          if(err2){
            console.log(err2)
          }
          console.log("update udx schema",fields.id)
          res.send(
            { errno: 0, 
              msg:'ok'
            }
          );

        })

      }else{//当切换工作空间时
        db.updateMany('workspace',{id:fields.originalWS},{$pull:{filelist:fields.id}},function(err2,result1){
          if(err2){
            console.log(err2)
          }
          db.updateMany('workspace',{id:fields.workspace},{$push:{filelist:fields.id}},function(err3,result2){
            if(err3){
              console.log(err3)
            }
            db.updateMany('udx_source',{id:fields.id},{$set:{name:fields.name,tags:fields.tags,describe:fields.desc,datetime:datetime,localPath:fields.localpath,workSpaceName:fields.workSpaceName,workspace:fields.workspace}},function(err2,result3){
              if(err2){
                console.log(err2)
              }
              
              console.log("update udx workspace schema ")
              
              res.send(
                { errno: 0, 
                  msg:'ok'
                }
              );
    
            })



            
           


          })



        })
      }

    })
    // originalWS

         


  })





}

//data source schema tree
exports.dataDetail=function(req,res,next){
  let id=req.query.id

  let new_path = basedir + "_" + id;

  //读取udx
  let schemaFile;
  try {
    schemaFile = fs.readFileSync(new_path + "/schema.xml", 'utf-8');
  } catch (e) {
    console.log('read cfg.json error: ' + e);
    res.send('-1');
    return;
  }
  
  let resultJson;
  xml2js.parseString(schemaFile, {
    explicitArray: false,
  }, function (err, result) {
    resultJson = JSON.parse(JSON.stringify(result));
     
    // console.log(resultJson)
  });    
  
      res.send({
        errno: 0,
        data: resultJson
      })



  
}


//for test
exports.test=function(req,res,next){

  console.log("test")
  console.log("process_id",__dirname,__filename)
  // cp.exec('ipconfig',function(e,stdout,stderr){
  //   if(!e){
  //     console.log(stdout)
  //   }
  // });


  res.send({code:"copy that"})
}
//insert new block log
exports.newBlockLog=function(req,res,next){

 // blocklog
  let name=req.query.name
  console.log(req.query.name)
  var datetime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
  let id= uuid.v4();
  db.insertOne('blocklog',{id:id,name:name,time:datetime},function(err,result){
    if(err){
      console.log(err)
    }

    res.send({
      errno:0,
      data:'ok'
    })
  })

}

exports.blockLog=function(req,res,next){
   let page=req.query.page
  //  pageamount:10,page:page-1
   db.find('blocklog',{},{},function(err,result){
      if(err){
        console.log(err)
      }

      res.send({
        errno:0,
        data:result
      })
   })
}

exports.testChart=function(req,res,next){
var basedir = __dirname + '/../data_dir/'; // 例如： xx/xxx/datamap/ 
  let file_path=req.query.file
  let new_path = basedir + "/"+file_path;
    //读取udx
  let schemaFile;
  try {
    schemaFile = fs.readFileSync(new_path + "/data.xml", 'utf-8');
  } catch (e) {
    console.log('read cfg.json error: ' + e);
    res.send('-1');
    return;
  }
  
  // let resultJson;
  // xml2js.parseString(schemaFile, {
  //   explicitArray: false,
  // }, function (err, result) {
  //   resultJson = JSON.parse(JSON.stringify(result));
     
  //   // console.log(resultJson)
  // });    
  
      res.send({
        errno: 0,
        data: schemaFile
      })

}
