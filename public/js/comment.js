// 每次加载页面后都查询并展示已有评论
$.ajax({
    type: 'POST',
    url: '/api/comment',
    data: {
        contentId: $('#contentId').val()
    },
    success: (result) => {
        renderComment(result.data);
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
                renderComment(result.data);
            }
        }
    });
});

function renderComment(comments) {
    // console.log(comments);
    var html = '';
    comments.forEach(comment => {
        html += `<div class="messageBox">
        <p class="messageInfo clear"><span class="fl">${comment.username}</span><span class="fr">${comment.postTime}</span></p>
        <p>${comment.content}</p>
    </div>`
    });
    console.log($('#messageList'), html);
    $('#messageList').html(html);
}