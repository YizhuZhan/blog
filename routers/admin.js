var express = require('express');
var router = express.Router();

router.use((req, res, next) => {
    if(!req.userInfo.isAdmin) {
        // 如果当前用户为非管理员
        res.send('对不起，您无权限进入后台管理');
        return;
    }
    next();
});

router.get('/', (req, res, next) => {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

module.exports = router;