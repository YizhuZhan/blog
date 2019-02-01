var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Contents');

router.use((req, res, next) => {
    if(!req.userInfo.isAdmin) {
        // 如果当前用户为非管理员
        res.send('对不起，您无权限进入后台管理');
        return;
    }
    next();
});

/**
 * 后台管理首页
 */
router.get('/', (req, res, next) => {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

/**
 * 用户管理
 */
router.get('/user', (req, res, next) => {
    /**
     * 从数据库中读取所有的用户记录
     * 
     * limit(Number)：限制获取的数据条数
     * 
     * skip(n)：忽略前n条数据，从第n+1条开始取
     * 
     * 每页显示2条：
     * 1： 1-2 skip:0 -> （当前页-1） * limit
     * 2： 3-4 skip:2 
     * 
     */
    var page = Number(req.query.page || 1);
    var limit = 2;
    
    User.countDocuments().then((count)  => {
        // 计算总页数
        maxPage = Math.ceil(count / limit);
        // 取值不超过总页数
        page = Math.min(page, maxPage);
        // 取值不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        /**
         * sort：排序
         * -1：升序
         * 1：降序
         */
        User.find().sort({_id: -1}).skip(skip).limit(limit).then((users) => {
            // console.log(users);// 拿到一个users数组
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                page: page,
                count: count,
                maxPage: maxPage,
                limit: limit,
                url: '/admin/user'
            });
        });
    });
});

/**
 * 分类管理
 */
router.get('/category', (req, res, next) => {
    var page = Number(req.query.page || 1);
    var limit = 2;
    
    Category.countDocuments().then((count)  => {
        // 计算总页数
        var maxPage = Math.ceil(count / limit);
        // 取值不超过总页数
        page = Math.min(page, maxPage);
        // 取值不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        
        Category.find().sort({_id: 1}).skip(skip).limit(limit).then((categories) => {
            // console.log(users);// 拿到一个users数组
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                page: page,
                count: count,
                maxPage: maxPage,
                limit: limit
            });
        });
    });
});

router.get('/category/add', (req, res, next) => {
    res.render('admin/category_add.html', { 
        userInfo: req.userInfo
    });
});

/**
 * 分类的保存
 */
router.post('/category/add', (req, res, next) => {
    console.log(req.body);
    
    var name = req.body.name || '';
    if(name == '') {
        res.render('admin/error.html', {
            message: '名称不能为空',
        });
        return Promise.reject();
    }

    // 数据库中是否已经存在同名的分类名称
    Category.findOne({name:name}).then((rs) => {
        if(rs) {
            res.render('admin/error.html', {
               userInfo: req.userInfo,
               message: '分类已存在' 
            });
        } else {
            return new Category({
                name: name
            }).save().then((newCategory) => {
                res.render('admin/success.html', {
                    message: '分类保存成功',
                    userInfo: req.userInfo,
                    url: '/admin/category' // 点击回到分类管理页面
                });
            });;
        }
    })
    // 
    
});

/**
 * 分类修改
 */
router.get('/category/edit', (req, res, next) => {
    // 从request对象中获取要修改的分类信息id
    var id = req.query.id || '';

    // 从数据库中查看要修改的分类信息是否存在
    Category.findOne({
        _id: id
    }).then((category) => {
        if(!category) {
            res.render('admin/error.html', {
                message: '分类信息不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/category_edit', {
                // 将category信息携带到真正的修改页面，用作后续数据库中信息修改的查询条件
                // userInfo: res.userInfo,
                category: category
            });
        }
    });
});

router.post('/category/edit', (req, res, next) => {
    // 获取要修改的分类信息，并且用表单的形式展现出来
    var id = req.query.id || '';
    // 获取post提交过来的分类名称
    var name = req.body.name || ''; 

    // 获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then((category) => {
        if(!category) {
            res.render('admin/error.html', {
                message: '分类信息不存在'
            });
            return Promise.reject();
        } else {
            // 用户没有做任何修改就提交的情况
            if (name == category.name) {
                res.render('admin/success', {
                    // userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category' // 点击跳转回分类信息展示页面
                });
                return Promise.reject();
            } else {
                // 新的分类名称是否在数据库中已存在
                Category.findOne({
                    _id: {$ne: id}, // _id不等于当前的id
                    name: name
                }).then((sameCategory) => {
                    if(sameCategory) {
                        res.render('admin/error.html', {
                            // userInfo: req.userInfo,
                            message: '数据库中已有同名的分类存在'
                        });
                        return Promise.reject();
                    } else {
                        return Category.updateOne({
                            _id: id
                        }, {name: name}); // 将当前id修改为新的分类名称
                    }
                }).then(() => {
                    res.render('admin/success', {
                        // userInfo: req.userInfo,
                        message: '修改成功',
                        url: '/admin/category' // 点击跳转回分类信息展示页面
                    });
                });
            }
        }


    });
});

 /**
  * 分类删除
  */
router.get('/category/delete', (req, res, next) => {
    var id = req.query.id || '';
    Category.findOne({
        _id: id
    }).then((category) => {
        if(!category) {
            // 要删除的数据不存在
            res.render('admin/error.html', {
                message: '要删除的数据不存在'
            });
            return Promise.reject();
        } else {
            Category.remove({
                _id: id
            }).then((rs) =>{
                res.render('admin/success.html', {
                    message: '删除成功',
                    url: '/admin/category'
                });
            });
        }
    });

});

/**
 * 内容首页
 */
router.get('/content', (req, res, next) => {
    var page = Number(req.query.page || 1);
    var limit = 2;

    Content.countDocuments().then((count) => {
        var maxPage = Math.ceil(count/limit);
        page = Math.min(maxPage, page);
        page = Math.max(1, page)
        var skip = (page - 1) * limit;
        
        
        Content.find().sort({_id: 1}).skip(skip).limit(limit).populate(['category', 'user']).then((contents) => {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                url: '/admin/content',
                page: page,
                count: count,
                limit: limit,
                maxPage: maxPage
            });
        });
    });
    
    
   
});

/**
 * 内容添加页面
 */
router.get('/content/add', (req, res, next) => {
    Category.find().sort({_id: -1}).then((categories) => {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories  
        });
    });
});

/**
 * 内容保存
 */
router.post('/content/add', (req, res, next) => {
    // console.log(req.body);
    if(req.body.category == '') {
        res.render('admin/error', {
            // userInfo: req.userInfo,
            message: '分类不能为空'
        });
        return;
    }

    if(req.body.title == '') {
        res.render('admin/error', {
            // userInfo: req.userInfo,
            message: '内容标题不能为空'
        });
        return;
    }

    // 保存到数据库
    return new Content({
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        user: req.userInfo._id.toString()
    }).save().then((rs) =>{
        res.render('admin/success', {
            // userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        });
    });
});

/**
 * 内容修改
 */
router.get('/content/edit', (req, res, next) => {
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id: 1}).then((rs) => {
        categories = rs;
        return Content.findOne({_id: id}).populate('category'); // 注意！！！
    }).then((content) => {
        if(!content) {
            res.render('admin/error', {
                // userInfo: req.userInfo,
                message: '要修改的内容不存在'
            });
            return Promise.reject();
        }
        
        res.render('admin/content_edit', {
            // userInfo: res.userInfo,
            content: content,
            categories: categories
        });
    });;

});

/**
 * 保存修改内容
 */
router.post('/content/edit', (req, res, next) => {
    var id = req.query.id || '';
    if(req.body.category == '') {
        res.render('admin/error', {
            // userInfo: req.userInfo,
            message: '分类不能为空'
        });
        return;
    }

    if(req.body.title == '') {
        res.render('admin/error', {
            // userInfo: req.userInfo,
            message: '内容标题不能为空'
        });
        return;
    }

    Content.updateOne({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(() => {
        res.render('admin/success', {
            // userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        });
    });

});

/**
 * 内容删除
 */
router.get('/content/delete', (req, res, next) => {
    var id = req.query.id || '';
    Content.findOne({
        _id: id
    }).then((content) => {
        if(!content) {
            // 要删除的数据不存在
            res.render('admin/error.html', {
                message: '要删除的数据不存在'
            });
            return Promise.reject();
        } else {
            Content.remove({
                _id: id
            }).then((rs) =>{
                res.render('admin/success.html', {
                    message: '删除成功',
                    url: '/admin/content'
                });
            });
        }
    });
});
module.exports = router;