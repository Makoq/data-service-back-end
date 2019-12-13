
const db = require("../model/db.js");
const formidable = require('formidable');
const uuid = require('node-uuid');
var sd = require('silly-datetime');

exports.createDataTemplate=function(req,res,next){
    var form=new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        const uid=uuid.v4();
        const datetime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');

        db.insertOne('dataTemplate',{uid:uid,name:fields.name,xml:fields.xml,date:datetime,tags:fields.tags},function(err,re){
            if(err){
                console.log(err)
            }
            console.log("create data template->"+uid)
            res.send({uid})
        })

    })
}



exports.templateList=function(req,res,next){
    let page=req.query.page
    
    db.find('dataTemplate',{},{"pageamount":10,"page":page},function(err,re){
        db.getAllCount('dataTemplate',function(cont){
            if(err){
                console.log(err)
            }
            let list=[]
           
            re.forEach(v=>{
             
                let obj={}
                obj['uid']=v['uid']
                obj['name']=v['name']
                obj['tags']=v['tags']
                obj['date']=v['date']
                list.push(obj)
            })
            console.log("template list")
            res.send({list:list,total:cont})

        })
    })
}
exports.temCont=function(req,res,next){
    let uid=req.query.uid


    db.find('dataTemplate',{uid:uid},{"pageamount":10,"page":0},function(err,re){
        console.log(re)
        res.send({xml:re[0]['xml']})
    })

}