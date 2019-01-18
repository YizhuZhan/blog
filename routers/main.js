var express = require('express');
var router = express.Router();
router.get('/', (req, res, next) => {
    // res.send('首页');
    res.render('main/index.html', {
        userInfo: req.userInfo
    });
});
module.exports = router;