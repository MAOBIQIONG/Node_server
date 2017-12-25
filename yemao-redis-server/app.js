var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
    else  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

/**接口文件**/
// var interfaces = require('./interfaces')
// /******************app接口*********************/
// app.get('/appApi', function(req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//
//     var obj = {"code":"200","msg":"请求成功","remark":"appApi get request ！"};
//     console.log("get:");
//
//     //var body = req.body || {};
//     //console.log('body:'+JSON.stringify(body))
//
//     var url_info = require('url').parse(req.url, true);
//     //console.log("url_info:"+JSON.stringify(url_info))
//     interfaces.getData(url_info.query,function (result) {
//         //console.log('result:'+JSON.stringify(result));
//         obj.data = result;
//         res.end(JSON.stringify(obj));
//     });
// });
//
// app.post('/appApi', function(req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//
//     var obj = {"code":"200","msg":"请求成功","remark":"webApi post request ！"};
//     console.log("post:");
//
//     var body = req.body || {}
//     //console.log('body:'+JSON.stringify(body))
//     interfaces.getData(body.params,function (result) {
//         //console.log('result:'+JSON.stringify(result));
//         obj.data = result;
//         res.end(JSON.stringify(obj));
//     });
// });

/******************mongodb*********************/
// var mongotest = require('./mongotest')
var mongo = require('./mongo')
app.get('/mongoApi', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});

    var obj = {"code":"200","msg":"请求成功","remark":"mongoApi get request ！"};
    console.log("get:");

    var url_info = require('url').parse(req.url, true);
    //console.log("url_info:"+JSON.stringify(url_info))
    url_info.query.rm = 0;//请求方式:0.get,1.post
    mongo.getData(url_info.query,function (result) {
        //console.log('result:'+JSON.stringify(result));
        obj.data = result;
        res.end(JSON.stringify(obj));
    });
});

app.post('/mongoApi', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});

    var obj = {"code":"200","msg":"请求成功","remark":"mongoApi post request ！"};
    console.log("post:");

    var body = req.body || {}
    //console.log('body:'+JSON.stringify(body))
    body.params.rm = 1;//请求方式:0.get,1.post
    mongo.getData(body.params,function (result) {
        //console.log('result:'+JSON.stringify(result));
        obj.data = result;
        res.end(JSON.stringify(obj));
    });
});

/******************web接口*********************/
app.get('/webApi', function(req, res) {
    var obj = {"code":"200","msg":"请求成功","remark":"webApi get request ！"};
    console.log("get:");

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(JSON.stringify(obj));
});

app.post('/webApi', function(req, res) {
    var obj = {"code":"200","msg":"请求成功","remark":"webApi post request ！"};
    console.log("post:");

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(JSON.stringify(obj));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
