
var formidable = require('formidable');
var fs = require('fs');
var unzip = require("unzip");//解压缩
var db = require("../model/db.js");
// var uuid = require('node-uuid');
var sd = require('silly-datetime');
const FormData = require('form-data');
const config=require('../settings.js')
const request=require('request')

exports.pulicData=function(req,res1,next){
    
 
    var form=new formidable.IncomingForm()
    form.parse(req,function(err,fields,file){
        let url=fields.data
        var target =  config.public_net_server;

        var rs = fs.createReadStream(url);
        var ws = request.post(target,function(err,res,body){
             
            // console.log(body)
            // file_uid=res.body.uid
            res1.send({uid:JSON.parse(res.body)})
            // res1.send({uid:uid})
       

        });
         

        ws.on('drain', function () {
        console.log('drain', new Date());
        rs.resume();
        });

        rs.on('end', function (err) {
        console.log('uploaded to ' + target);

        });

        ws.on('error', function (err) {
        console.error('cannot send file to ' + target + ': ' + err);
        });
        

        rs.pipe(ws);
        
    })      
}

exports.pulicDataInfo=function(req,res1,next){

    var form=new formidable.IncomingForm()
    form.parse(req,function(err,fields,file){
        const formData={
            'info':fields.info,
            "dataFile_id":fields.uid
            
        }
        request.post({url:config.data_desc, formData: formData}, function optionalCallback(err, httpResponse, body) {
        if (err) {
          return console.error('upload failed:', err);
        }
        
        res1.send({data:JSON.parse(body)})

      });
    })

}

exports.filterLocalData=function(req,res,next){
    let cont=req.query.words
    let page=req.query.page-1
    
    let query={"name":new RegExp(cont)}
     

    db.find('udx_source',query,{},function(err,result){
        console.log(query,result.length)
         db.find('udx_source',query,{"pageamount":10,"page":page},function(err,result){
        let re=[]
        result.forEach(el => {
            let obj={}
            obj["id"]=el.id
            obj["name"]=el.name
            obj["img"]=el.img
            obj["tags"]=el.tags
            obj["describe"]=el.describe
            obj["uid"]=el.uid
            obj["datetime"]=el.datetime
            obj["workSpaceName"]=el.workSpaceName
            obj["dataTemplate"]=el.dataTemplate


            re.push(obj)

            });
        res.send({total:result.length,data:re})
        })

    })
   

}