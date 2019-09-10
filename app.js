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
//udx schema
app.get('/udxSchemaInfo',router.udxSchemaInfo)


// udx source
// 上传 udx source
app.post("/udxSource", router.uploadUdxSource);


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