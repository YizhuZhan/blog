var comments = [];
// 每次加载页面后都查询并展示已有评论
$.ajax({
    type: 'POST',
    url: '/api/comment',
    data: {
        contentId: $('#contentId').val()
    },
    success: (result) => {
        comments = result.data;
        renderComment(comments);
    }
});

// 提交评论
$('#messageBtn').on('click', () => {
    $.ajax({
        type: 'POST',
        url: '/api/comments/post',
        data: {
            contentId: $('#contentId').val(),// 可以从url参数中获取，也可以在页面中填入一个隐藏的input中
            content: $('#messageContent').val()
        },
        success: (result) => {
            if(!result.code) {
                $('#messageContent').val('');
                comments = result.data;
                renderComment(comments);
            }
        }
    });
});

/**
 * 评论分页展示
 */
var page = 1;
var perPage = 4;

$('.previous').on('click', () => {
    page--;
    renderComment(comments);
});
$('.next').on('click', () => {
    page++;
    renderComment(comments);
});
function renderComment(comments) {
    // 每次刷新或者提交评论，均更新分页信息
    var commentsCount = comments.length;
    var pages = Math.max(Math.ceil(commentsCount / perPage), 1);
    if(page <= 1) {
        page = 1;
        $('.previous').eq(0).html('没有上一页了');
    } else {
        $('.previous').eq(0).html('上一页');
    }
    if(page >= pages) {
        page = pages;
        $('.next').eq(0).html('没有下一页了');
    } else {
        $('.next').eq(0).html('下一页');
    }
    var start = (page - 1) * perPage;
    var end = Math.min(start + perPage - 1, commentsCount - 1);
    $('#curPage').html(page);
    $('#pages').html(pages);

    var html = '';
    for(let i = start; i <= end; i++) {
    // comments.forEach(comment => {
        html += `<div class="messageBox">
        <p class="messageInfo clear"><span class="fl">${comments[i].username}</span><span class="fr">${comments[i].postTime}</span></p>
        <p>${comments[i].content}</p>
    </div>`
    };
    $('#messageList').html(html);
}