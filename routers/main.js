var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Contents');

var data;
/**
 * 处理通用的数据
 */
router.use((req, res, next) => {
    data = {
        userInfo: req.userInfo,
        categories: []
    };

    /**
     * 1: 升序
     * -1：降序，新数据在前
     * 也可以按照分类热门度、文章阅读数进行排序...
     */
    Category.find().sort({_id:-1}).then((categories) => {
        // console.log(categories); // 数组
        // res.send('首页');
        data.categories = categories;
        // 进入下一个处理函数
        next();
    });
});


router.get('/', (req, res, next) => {
    data.page = Number(req.query.page || 1) ;
    data.limit = 3;
    data.maxPage = 0;
    data.count = 0;
    data.category = req.query.category || ''; // 分类id，用于前台分类展示
    data.contents = [];

    var where = {};
    if(data.category) {
        where.category = data.category;
    }
    
    Content.where(where).countDocuments().then((count) => {
        data.count = count;
        data.maxPage = Math.ceil(count / data.limit);
        data.page = Math.min(data.page, data.maxPage);
        data.page = Math.max(data.page, 1);
        var skip = data.limit * (data.page - 1);
        // 解决count==0（分类下无数据情况）时的skip可能为负的问题；或者将data.page的两次赋值更改顺序，是的page最后的赋值>=1
        // if(data.maxPage == 0) {
        //     skip = 0;
        // }
        return Content.where(where).find().skip(skip).limit(data.limit).populate(['category', 'user']).sort({addTime: -1})
    }).then((contents) => {
        data.contents = contents;
        res.render('main/index.html', data);
        // 只有中间件中对data的赋值才是全局的，各路由中都是局部的，不能互相共享
    });;
});

/**
 * 内容详情
 */
router.get('/views', (req, res, next) => {
    var contentId = req.query.contentId || '';
    Content.findOne({
        _id: contentId
    }).then((content) => {
        data.content = content;
        content.views++;
        content.save(); // 不许要和渲染模板同步进行，不需要后续处理
        res.render('main/view', data);
    });
});


module.exports = router;