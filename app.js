var express = require("express");//内部引用了ejs
var router = require("./router/router.js");
var session = require('express-session');

var app = express();

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 10006030 }, //设置maxAge是ms单位，cookic失效过期
}));




//http://www.freesion.com/article/348313475/
// 设置跨域
// app.all('*', (req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*')
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With')
//     res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
//     res.header('X-Powered-By', '3.2.1')
//     res.header('Access-Control-Allow-Credentials', 'true');//允许携带cookie
//     res.header('Content-type', 'application/json;charset=utf-8')
//     next()
// });

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1708");
    // res.header('Access-Control-Allow-Origin', '*') // 使用session时不能使用*，只能对具体的ip开放。
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("X-Powered-By", ' 3.2.1')
    if (req.method == "OPTIONS") res.send(200);/*让options请求快速返回*/
    else next();
});

// user
app.post('/user/:action',router.action);

// data source
// 获取数据源列表
app.get('/dataSource', router.getDataSource);
app.get('/deleteSource', router.deleteDataSource);
//getDataSourceCount
app.get('/dataCount', router.getDataSourceCount);
//udx schema  soloudxschema
app.get('/udxSchemaInfo',router.udxSchemaInfo)
app.get('/soloudxschema',router.soloudxschema)
app.post('/updateschema',router.updateschema)
 
//workspace  soloworkspace
app.post('/workspace',router.createWorkspace)
app.get('/delworkspace',router.delworkspace)
app.get('/soloworkspace',router.soloworkspace)
app.post('/workspaceupdate',router.updateworkspace)

//data source detail
app.get('/schemafile',router.dataDetail)

//screen background img
app.post('/canvasimg',router.canvasImgUpload)
app.get('/canimg/:id',router.canvasImgGet)
// udx source
// 上传 udx source
app.post("/udxSource", router.uploadUdxSource);
app.get('/udxnode',router.udxNode)
app.get('/config',router.config)
app.get('/schemadataxml',router.schemaDataXml)

//配置block相关
app.get('/newblocklog',router.newBlockLog)
app.get('/blocklog',router.blockLog)

//发布数据
app.post('/onlinedata/',router.publicData)
app.post('/onlinedatainfo/',router.pulicDataInfo)


//test
app.get('/test',router.test)
app.get('/testChart',router.testChart)
app.get('/chart/view/:id',router.viewChart)

// 可视化
app.get('/chart', router.getCharts); 
app.get('/chart/:id', router.getChart); 
app.delete('/chart/:id', router.deleteChart); 

app.post('/chart', router.createChart); 
// 复制一个chart
app.post('/chart/import/:id',router.copyChart);
app.put('/chart/:id', router.updateChart); 

app.listen(8897);

console.log("服务器启动成功.");