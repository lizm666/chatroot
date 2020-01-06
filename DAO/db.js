var mysql = require('mysql');

// 创建一个数据库连接池
var pool = mysql.createPool({
    connectionLimit: 100, // 连接数
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'node'
});

/**
 * 查询
 * 支持两种参数格式
 * 1. 完整的sql语句 + 回调方法
 * 2. 空缺参数的sql语句 + 参数数组 + 回调函数
 * @param sql
 * @param P
 * @param C
 */
exports.commit = function (sql, P, C) {
    var params = [],
        callback;
    
    // 如果用户传入了两个参数，就是SQL和callback
    if (arguments.length === 2 && typeof arguments[1] === 'function') {
        callback = P;
        
        // 如果用户传入了三个参数，那么就是SQL和参数数组、回调函数
    } else if (arguments.length === 3 && Array.isArray(arguments[1]) && typeof arguments[2] === 'function') {
        params = P;
        callback = C;
        
    } else {
        throw new Error('参数个数不匹配或者参数类型错误');
    }
    
    // 从池子里面拿一个可以使用的连接
    pool.getConnection(function (err, connection) {
        // Use the connection
        if (err) {
            callback.apply(null, arguments);
            return;
        }
        connection.query(sql, params, function () {
            // 使用完毕之后，将该连接释放回连接池
            connection.release();
            callback.apply(null, arguments);
        });
    });
};
