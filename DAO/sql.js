/**
 * SQL 语句
 */
const SQL = {
    /*登录*/
    login: 'select * from users t where t.username=? and t.password=?',
    /*注册前，校验用户名重复*/
    checkUsername: 'select * from users t where t.username=?',
    /*注册*/
    register: 'insert into users (uuid, isAdmin, username, password, gender, email, question, answer, registryDate, status) values (replace(uuid(),"-",""),0,?,?,?,?,?,?,now(),1)',
    /*删除，注销用户*/
    deleteUser: 'delete from users where username=? and password=?',
    /*更新用户信息*/
    updateUser: 'update users set password=?, email=? where username=? and password=?',
    /*修改密码*/
    changePassword: 'update users set password=? where username=? and password=?',
    /*找回密码之前的安全问题查询*/
    querySecurityQuestion: 'select * from users t where t.username=? and t.email=?',
    /*找回密码*/
    findPasswordBack: 'select * from users t where t.username=? and t.email=? and t.question=? and t.answer=?'
    
};

module.exports = SQL;