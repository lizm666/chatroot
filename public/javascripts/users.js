$(function () {

    var regName = sessionStorage.getItem('regName');
    var password = $('#password');
    regName && $('#username').val(regName);
    
    password.on('keydown', function (e) {
        if (e.keyCode === 13) {
            var data = util.getFormData('login-box');
            data && doLogin(data);
        }
    });
    
    $('#login-btn').on('click', function () {
        var data = util.getFormData('login-box');
        data && doLogin(data);
    });
    
    function doLogin(data){
        $.ajax({
            url:'/users/login.do',
            method: 'POST',
            data: {
                username: data.username,
                password: data.password
            },
            success: function (res) {
                if(res.success){
                    layer.msg('登录成功');
                    sessionStorage.setItem('userInfo',JSON.stringify(res.value));
                    location.href='/etb-chat/home';
                }else{
                    layer.alert(res.message || '登录失败');
                }
            }
        })
    }

    $('#reg-username').on('blur',function () {
        var username = $(this).val();
        var dom = $(this);
        if(username){
            $.ajax({
                url:'/users/checkUsername.do',
                method: 'POST',
                data: {
                    username: username
                },
                success: function (res) {
                    if (!res.success) {
                        layer.alert(res.message.toString() || '用户名已存在', function (index) {
                            layer.close(index);
                            //dom.select();
                        });
                    }
                }
            })
        }
    });
    
    $('#register-btn').on('click',function () {
        var data = util.getFormData('register-box');
        if(data){
            if(data.password !== data.password2){
                layer.alert('两次密码不一致');
                return;
            }
            $.ajax({
                url:'/users/register.do',
                method: 'POST',
                data: {
                    username: data.username,
                    password: data.password,
                    gender: data.gender,
                    email:data.email,
                    question:data.question,
                    answer:data.answer
                },
                success: function (res) {
                    if(res.success){
                        layer.msg('注册成功');
                        setTimeout(function () {
                            sessionStorage.setItem('regName',data.username);
                            location.href = 'login';
                        },1000)
                    }else{
                        layer.alert(res.message.toString() || '注册失败');
                    }
                }
            })
        }
    })
});