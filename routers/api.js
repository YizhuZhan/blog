var express = require('express');
var User = require('../models/User');
var router = express.Router();
var Content = require('../models/Contents');

// 统一放回格式
var responseData;
// invoked for any requests passed to this router
router.use((req, res, next) => {
    responseData = {
        code: 0,
        message: ''
    };
    next();
});


// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.Format = function(fmt)   
{ //author: meizz   
var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
};   
if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
return fmt;   
}


/**
 * 用户注册
 * 	注册逻辑：
 * 1. 用户名不能为空
 * 2. 密码不能为空
 * 3. 两次输入密码必须一致
 * 
 * 1. 用户是否已经被注册了
 * 		数据库查询
 *  
 */
router.post('/user/register', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    if(username == '') {
        responseData.code = 1;
        responseData.message = "用户名不能为空";
        // 把对象转成json格式返回给前端
        res.json(responseData);
        return;
    }
    if(password == '') {
        responseData.code = 2;
        responseData.message = "密码不能为空";
        res.json(responseData);
        return;
    }
    if(password != repassword) {
        responseData.code = 3;
        responseData.message = "两次输入的密码不一致";
        res.json(responseData);
        return;
    }

    // 用户名是否已经被注册了，如果数据库中已经存在和我们要注册的用户名同名的数据，表示该用户名已经被注册了
    User.findOne({ // 返回一个Promise对象
        username: username
    }).then((userInfo) => {
        // console.log("userInfo" ,userInfo);
        if(userInfo) {
            responseData.code = 4;
            responseData.message = "用户名已经被注册了";
            res.json(responseData);
            return;
        }
        // 保存用户注册的信息到数据库中
        var user = new User({
            username: username,
            password: password
        });
        return user.save();
    }).then((newUserInfo) => {
        // console.log("newUserInfo", newUserInfo);
        responseData.message = "注册成功";
        res.json(responseData);
    });
});


/**
 * 登录
 */
router.post('/user/login', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    if(username == '' || password == '') {
        responseData.code = 1;
        responseData.message = "用户名和密码不能为空";
        res.json(responseData);
        return;
    }

    // 查询数据库中相同用户名和密码的记录是否存在，如果存在则登录成功
    User.findOne({
        username: username,
        password: password
    }).then((userInfo) => {
        if(!userInfo) {
            responseData.code = 2;
            responseData.message = "用户名或密码错误";
            res.json(responseData);
            return;
        }
        // 用户名密码正确
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        };
        req.cookies.set('userInfo', JSON.stringify(responseData.userInfo));
        responseData.message = "登录成功";
        res.json(responseData);
    });
});

router.get('/user/logout', (req, res, next) => {
    req.cookies.set('userInfo', null);
    res.json(responseData);
});

/**
 * 获取指定文章的所有评论
 */
router.post('/comment', (req, res) => {
    var contentId = req.body.contentId || '';
    Content.findOne({
        _id:contentId
    }).then((content) => {
        responseData.message = '评论获取成功';
        responseData.data = content.comments.reverse();
        res.json(responseData);
    });
})

/**
 * 评论提交
 */
router.post('/comments/post', (req, res) => {
    // 内容的id
    var contentId = req.body.contentId || '';
    
    var postData = {
        username: req.userInfo.username,
        postTime: new Date().Format("yyyy年MM月dd日 hh:mm:ss"),
        content: req.body.content
    };
    // 查询当前这篇内容的信息
    Content.findOne({_id: contentId}).then((content) => {
        content.comments.push(postData);
        // if(postData.comment && postData.comment != '') {
            return content.save();
        // } else {
        //     return Promise.reject();
        // }
        
    }).then((newContent) => {
        responseData.message = '评论成功';
        responseData.data = newContent.comments.reverse(); // 数组反转，最新在前面
        res.json(responseData);
    });
});

module.exports = router;