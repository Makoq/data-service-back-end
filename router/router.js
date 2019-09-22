var user = require('./user.js');
var udxSource = require('./udxSourceRouter');
var workspace = require('./workSpaceRouter');

var dataSource = require('./dataSourceRouter');
var chart = require('./chartRouter');
//user
exports.action = user.action;

// udxSource
exports.uploadUdxSource = udxSource.uploadUdxSource;
exports.udxSchemaInfo=udxSource.udxSchemaInfo;
exports.udxNode=udxSource.udxNode;
exports.soloudxschema=udxSource.soloudxschema;
exports.updateschema=udxSource.updateschema;
exports.config=udxSource.config;
exports.schemaDataXml=udxSource.schemaDataXml;
exports.newBlockLog=udxSource.newBlockLog;
exports.blockLog=udxSource.blockLog;

exports.test=udxSource.test;


//workspace
exports.createWorkspace=workspace.createWorkspace;
exports.delworkspace=workspace.delworkspace;
exports.soloworkspace=workspace.soloworkspace;
exports.updateworkspace=workspace.updateworkspace;




exports.getDataSource = dataSource.getDataSource;
exports.deleteDataSource = dataSource.deleteDataSource;

// 可视化
exports.createChart = chart.createChart;
exports.getCharts = chart.getCharts;
exports.getChart = chart.getChart;
exports.deleteChart = chart.deleteChart;
exports.updateChart = chart.updateChart;
exports.copyChart = chart.copyChart;
