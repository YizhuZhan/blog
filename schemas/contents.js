const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    // 关联字段 - 内容分类的id
    category: {// 对应路由中从数据库读取时的populate('category')
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'Category'
    },
    // 内容标题
    title: String,
    // 简介
    description: {
        type: String,
        default: ''
    },
    // 作者
    user: {// 对应populate('user')
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    // 添加时间
    addTime: {
        type: Date,
        default: new Date()
    },
    // 阅读量
    views: {
        type: Number,
        default: 0
    },
    // 内容
    content: {
        type: String,
        default: ''
    },
    // 评论
    comments: {
        type: Array,
        default: []
    }
});