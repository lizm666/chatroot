$(function () {
    
    $('.setting-menu ul li').on('click', function () {
        $(this).removeClass('active').addClass('active').siblings().removeClass('active');
        var tar = $(this).attr('data-tab');
        $('#' + tar).removeClass('active').addClass('active').siblings().removeClass('active');
    });
    
    $('#change-pwd-btn').on('click', function () {
        var data = util.getFormData('change-pwd-tab');
        var userInfo = sessionStorage.getItem('userInfo');
        userInfo = userInfo ? JSON.parse(userInfo) : {};
        if (data) {
            if (data['new-pwd'] !== data['new-pwd-confirm']) {
                layer.alert('两次新密码不一致');
                return;
            }
            $.ajax({
                url: '/users/changePassword.do',
                method: 'POST',
                data: {
                    username: userInfo.username,
                    password: data['origin-pwd'],
                    newPassword: data['new-pwd']
                },
                success: function (res) {
                    if (res.success) {
                        layer.alert(res.message.toString() || '密码修改成功，请重新登录', function (index) {
                            layer.close(index);
                            sessionStorage.clear();
                            top.location.href = '/users/logout.do';
                        });
                    } else {
                        layer.alert(res.message || '密码修改失败');
                    }
                }
            });
        }
    });
});