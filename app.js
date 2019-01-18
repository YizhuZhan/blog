const express = require('express');
const path = require('path');
const swig = require('swig');
// const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Cookies = require('cookies');
// 相当于http.createServer()，app相当于服务器对象
var app = express();
// 配置应用模板，在./views目录下使用自定义名为html的模板引擎（即swig.renderFile）
// 定义当前应用所使用的模板引擎，第一个参数也可以填其它模板引擎的名称
app.engine('html', swig.renderFile);
// 设置模板引擎存放的目录，第一个参数必须是views，第二个参数是目录
app.set('views', path.join(__dirname, 'views'));
// 注册所使用的模板引擎，第一个参数必须是view engine，第二个参数和app engine这个方法中定义的模板引擎的名称（第一个参数是一致的）
app.set('view engine', 'html');
// app.set('view engine', 'ejs');
// 在开发过程中，需要取消模板缓存
swig.setDefaults({cache: false});// 默认为true

// bodyParser设置
// 返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
app.use(bodyParser.urlencoded({extended:true}));

// cookie设置，只要用户访问该站点，就会走这个中间件
app.use((req, res, next) => {
    req.cookies = new Cookies(req, res);

    // 解析登录用户的cookie信息
    req.userInfo = [];
    if(req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
        } catch(e) {

        }
    }
    next();
});

app.use('/public', express.static(__dirname + '/public'))
// app.get('/public/main.css', (req, res, next) => {
//     res.setHeader('content-type', 'text/css');
//     res.send("body {background: red}") 
// });

// app.get('/', (req, res, next) => {
//     // res.send('<h1>欢迎来到我的博客</h1>');
//     res.render('index');
// });

app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));

// 连接mongodb数据库
mongoose.connect('mongodb://localhost:27017/blog', (err)=>{
    if(err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
        app.listen(8081);
    }
})


 