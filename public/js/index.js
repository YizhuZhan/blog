$(function() {
	var $loginBox = $("#loginBox");
	var $registerBox = $("#registerBox");
	var $userInfo = $("#userInfo");
	
	// 切换到注册面板
	$loginBox.find('a').on('click', ()=>{
		$registerBox.show();
		$loginBox.hide();
	});

	// 切换到登录面板
	$registerBox.find('a').on('click', ()=>{
		$loginBox.show();
		$registerBox.hide();
	});

	$registerBox.find('.btn').on('click', ()=>{
		$.ajax({
			type: 'post',
			url: '/api/user/register',
			data: {
				username: $registerBox.find('[name="username"]').val(),
				password: $registerBox.find('[name="password"]').val(),
				repassword: $registerBox.find('[name="repassword"]').val()
			},
			dataType: 'json',
			success: function(result) {
				$registerBox.find('.colWarning').html(result.message);
				if(!result.code) {
					// 注册成功，result.code为0
					// 注册成功一秒后跳转到登录框
					setTimeout(()=>{
						$loginBox.show();
						$registerBox.hide();
					}, 0);
				}
			}
		});
	});

	$loginBox.find('.btn').on('click', ()=>{
		$.ajax({
			url: '/api/user/login',
			type: 'post',
			data:{
				username: $loginBox.find('[name="username"]').val(),
				password: $loginBox.find('[name="password"]').val()
			},
			dataType: 'json',
			success: function(result) {
				$loginBox.find('.colWarning').html(result.message);
				if(!result.code) {
					// 登录成功
					window.location.reload();
					// setTimeout(()=>{
					// 	$loginBox.hide();
					// 	$userInfo.show();

					// 	// 显示用户登录信息
					// 	$userInfo.find('.username').html(result.userInfo.username);
					// 	$userInfo.find('.info').html("你好，欢迎光临我的博客！");
					// }, 1000);
					
				}
			} 
		});
	});

	$('#logout').on('click', () => {
		$.ajax({
			type: 'get',
			url: '/api/user/logout',
			success: function(result) {
				if(!result.code) {
					window.location.reload();
				}
			}
		});
	});

})
