var formidable = require('formidable');
var db = require("../model/db.js");
var uuid = require('node-uuid');
var sd = require('silly-datetime');
var ObjectID = require('mongodb').ObjectID;//数据库ObjectId

exports.createChart = function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {

    var title = fields.title;
    var uid = fields.uid;

    var _id = uuid.v4();
    var datetime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
    // 插入数据库
    db.insertOne('chart', {
      title: title,
      img: '',
      id: _id,
      uid: uid,
      view: 0, // 浏览次数
      datetime: datetime,
      delete: '-1',
      chartData: {
        "w": 1200,
        "h": 800,
        "bgcolor": "#999999",
        "bgimage": "",
        "bgimagesize": "cover",
        "elements": []
      }
    }, function (err, result) {
      if (err) {
        console.log(err);
        res.send({ errno: -1 });
        return;
      }
      res.send({ errno: 0, errmsg: '创建成功', data: { id: _id } });
    });

  });
}

// 获取用户创建的所有的charts
exports.getCharts = function (req, res, next) {
  var uid = req.query.uid;

  db.find('chart', { uid: uid }, function (err, result) {

    if (err) {
      console.log(err);
      res.send({ errno: -1 });
      return;
    }

    res.send({
      errno: 0,
      data: result,
    });

  });
}

// 获取单个chart的信息
exports.getChart = function (req, res, next) {
  var id = req.params.id;

  db.find('chart', { id: id }, function (err, result) {

    if (err) {
      console.log(err);
      res.send({ errno: -1 });
      return;
    }

    res.send({
      errno: 0,
      data: result[0],
    });

  });
}

// 更新chart（保存）
exports.updateChart = function (req, res, next) {

  var chart_id = req.params.id;

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {

    db.updateMany('chart', { id: chart_id }, { $set: fields }, (err, result) => {
      if (err) {
        console.log(err);
        res.send({ errno: -1 });
        return;
      }
      res.send({ errno: 0 });
    });


  });

}

// 删除chart
exports.deleteChart = function (req, res, next) {

  var chart_id = req.params.id;

  db.deleteMany('chart', { id: chart_id }, function (err, result) {
    if (err) {
      console.log(err);
      res.send({ errno: -1 });
      return;
    }

    res.send({ errno: 0 });

  });
}

// 复制chart
exports.copyChart = function (req, res, next) {

  var chart_id = req.params.id;

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {

    var title = fields.title;
    var uid = fields.uid;

    db.find('chart', { id: chart_id }, function (err, result) {

      if (err) {
        console.log(err);
        res.send({ errno: -1 });
        return;
      }

      var chart = result[0];
      chart.id = uuid.v4();
      chart.title = title;
      chart.uid = uid;
      chart._id = new ObjectID();

      db.insertOne('chart', chart, function (err2, result2) {
        if (err2) {
          console.log(err2);
          res.send({ errno: -1 });
          return;
        }
        res.send({ errno: 0 });

      });

    });

  });

}