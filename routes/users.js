var express = require('express');
var router = express.Router();
var db = require('../DAO/db');
var SQL = require('../DAO/sql');
var moment = require('moment');

/**
 * 统一返回数据的格式
 * @param d
 * @returns {any}
 */
function resultDto(d) {
    return Object.assign({}, {
        success: true,
        value: null,
        message: null,
        msgCode: null
    }, d);
}

/* GET users listing. */

/**
 * 登录
 */
router.post('/login.do', function (req, res, next) {
    //var SQL = 'select * from users t where t.username=? and t.password=?';
    var data = req.body;
    var values = [
        data.username,
        data.password
    ];
    db.commit(SQL.login, values, function (err, result) {
        //console.log(result);
        if (err) {
            res.send(resultDto({
                success: false,
                message: err.toLocaleString()
            }));
        } else if (result.length) {
            const userInfo = result[0];
            req.session.loggedIn = true;
            req.session.userInfo = userInfo;
            res.send(resultDto({
                success: true,
                value: {
                    username: userInfo.username,
                    isAdmin: userInfo.isAdmin === 1 ? '是' : '否',
                    email: userInfo.email,
                    gender: userInfo.gender === '1' ? '男' : userInfo.gender === 0 ? '女' : '保密',
                    registryDate: moment(userInfo.registryDate).format('YYYY-MM-DD'),
                    status: userInfo.status === '1' ? '正常' : '异常'
                }
            }));
            //res.redirect('/etb-chat/home');
            
        } else {
            res.send(resultDto({
                success: false,
                message: '用户名或密码不正确'
            }));
        }
        
    });
});
/**
 * 登出
 */
router.all('/logout.do', function (req, res, next) {
    req.session.destroy();
    res.redirect('/etb-chat/login');
});

/**
 * 注册时，校验用户名是否重复
 */
router.post('/checkUsername.do', function (req, res, next) {
    var data = req.body;
    var values = [
        data.username
    ];
    //var querySQL = 'select * from users t where t.username=?';
    db.commit(SQL.checkUsername, values, function (err, result) {
        //console.log(result);
        if (err) {
            res.send(resultDto({
                success: false,
                message: err.toLocaleString()
            }));
        } else if (result.length) {
            res.send(resultDto({
                success: false,
                message: '用户已存在'
            }));
        } else {
            res.send(resultDto({
                success: true
            }));
        }
    });
});

/**
 * 注册提交
 */
router.post('/register.do', function (req, res, next) {
    var data = req.body;
    var values = [
        data.username,
        data.password,
        data.gender,
        data.email,
        data.question,
        data.answer
    ];
    if(data.username.length > 16){
        res.send(resultDto({
            success: false,
            message: '用户名长度不能超过16个字符'
        }));
        return;
    }
    //var querySQL = 'select * from users t where t.username=?';
    db.commit(SQL.checkUsername, [data.username], function (err, result) {
        //console.log(result);
        if (err) {
            res.send(resultDto({
                success: false,
                message: err.toLocaleString()
            }));
        } else if (result.length) {
            res.send(resultDto({
                success: false,
                message: '用户已存在'
            }));
            
        } else {
            
            //var SQL = 'insert into users (uuid, isAdmin, username, password, gender, email, question, answer, registryDate, status) values (replace(uuid(),"-",""),0,?,?,?,?,?,?,now(),1)';
            
            db.commit(SQL.register, values, function (err, result) {
                //console.log(result);
                if (err) {
                    res.send(resultDto({
                        success: false,
                        message: err.toLocaleString()
                    }));
                } else {
                    res.send(resultDto({success: true}));
                }
            });
        }
    });
});

/**
 * 删除、注销用户
 */
router.all('/delete.do', function (req, res, next) {
    var values = [req.body.username || req.session.userInfo.username, req.body.password || req.session.userInfo.password];
    //var SQL = 'delete from users where username=?';
    db.commit(SQL.deleteUser, values, function (err, result) {
        //console.log(result);
        if (err) {
            res.send(resultDto({
                success: false,
                message: err.toLocaleString()
            }));
        } else {
            req.session.destroy();
            res.redirect('/etb-chat/login');
        }
    });
});

/**
 * 更新用户信息
 */
router.post('/update.do', function (req, res, next) {
    var data = req.body;
    var values = [
        data.newpwd,
        data.email,
        data.username,
        data.password
    ];
    //var SQL = 'update users set password=?, email=? where username=? and password=?';
    db.commit(SQL.updateUser, values, function (err, result) {
        //console.log(result);
        if (err) {
            res.send(resultDto({
                success: false,
                message: err.toLocaleString()
            }));
        } else if (result.length) {
            res.redirect('/etb-chat/home');
            //res.send(resultDto({value:result[0]}));
            
        } else {
            res.send(resultDto({
                success: false,
                message: '修改失败'
            }));
        }
        
    });
});

router.post('/changePassword.do', function (req, res, next) {
    var data = req.body;
    var values = [
        data.newPassword,
        data.username,
        data.password
    ];
    //var SQL = 'update users set password=?, email=? where username=? and password=?';
    db.commit(SQL.login, [data.username, data.password], function (err, result) {
        //console.log(result);
        if (err) {
            res.send(resultDto({
                success: false,
                message: err.toLocaleString()
            }));
        } else if (result.length) {
            db.commit(SQL.changePassword, values, function (err, result) {
                //console.log(result);
                if (err) {
                    res.send(resultDto({
                        success: false,
                        message: err.toLocaleString()
                    }));
                }else{
                    res.send(resultDto({
                        success: true,
                        message: '密码修改成功，请重新登录'
                    }));
                }
            });
            
        } else {
            res.send(resultDto({
                success: false,
                message: '原密码不正确'
            }));
        }
        
    });
});

/**
 * 找回密码时，查询用户的安全问题
 */
router.post('/querySecurityQuestion.do', function (req, res, next) {
    var data = req.body;
    var values = [
        data.username,
        data.email
    ];
    //var querySQL = 'select * from users t where t.username=? and t.email=?';
    db.commit(SQL.querySecurityQuestion, values, function (err, result) {
        //console.log(result);
        if (err) {
            res.send(resultDto({
                success: false,
                message: err.toLocaleString()
            }));
        } else if (result.length) {
            res.send(resultDto({
                success: true,
                value: result[0].question
            }));
            
        } else {
            res.send(resultDto({
                success: false,
                message: '用户名和邮箱地址不匹配'
            }));
        }
    });
});

/**
 * 提交找回密码
 */
router.post('/findPasswordBack.do', function (req, res, next) {
    var data = req.body;
    var values = [
        data.username,
        data.email,
        data.question,
        data.answer
    ];
    //var querySQL = 'select * from users t where t.username=? and t.email=? and t.question=? and t.answer=?';
    db.commit(SQL.findPasswordBack, values, function (err, result) {
        //console.log(result);
        if (err) {
            res.send(resultDto({
                success: false,
                message: err.toLocaleString()
            }));
        } else if (result.length) {
            // 找回成功，返回uuid
            res.send(resultDto({
                success: true,
                value: result[0].uuid
            }));
        } else {
            res.send(resultDto({
                success: false,
                message: '安全问题答案错误'
            }));
        }
    });
});


module.exports = router;
