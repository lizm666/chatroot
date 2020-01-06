$(function () {
    var unMatch = false;
    
    $('#email,#username').on('blur', function () {
        var username = $('#username').val();
        var email = $('#email').val();
        if (username && email) {
            $.ajax({
                url: '/users/querySecurityQuestion.do',
                method: 'POST',
                data: {
                    username: username,
                    email: email
                },
                success: function (res) {
                    var qs = $('#question');
                    if (res.success) {
                        qs.val(res.value);
                        unMatch = false;
                    } else {
                        qs.val(undefined);
                        unMatch = res.message || '用户名和邮箱地址不匹配';
                        layer.alert(unMatch);
                    }
                }
            });
        }
    });
    
    $('#find-pwd-btn').on('click', function () {
        if(unMatch){
            layer.alert(unMatch);
            return;
        }
        var data = util.getFormData('find-pwd-box');
        if (data) {
            $.ajax({
                url: '/users/findPasswordBack.do',
                method: 'POST',
                data: {
                    username: data.username,
                    email: data.email,
                    question: data.question,
                    answer: data.answer
                },
                success: function (res) {
                    if (res.success) {
                        layer.msg('登录成功');
                        location.href = '/etb-chat/home';
                    } else {
                        layer.alert(res.message || '登录失败');
                    }
                }
            });
        }
    });
});