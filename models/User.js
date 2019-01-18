const mongoose = require('mongoose');
var usersSchema = require('../schemas/users');

// Users模型类其实是一个构造函数，后面可以通过其创建Users对象，可以像操作对象一样操作数据库，手册中的Model.表示静态方法，Model#表示动态方法
module.exports = mongoose.model('Users', usersSchema);
