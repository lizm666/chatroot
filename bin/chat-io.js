var db = require('../DAO/db');
var SQL = require('../DAO/sql');
var moment = require('moment');

var userCount = 0;
var clientNum = 0;
var usersInRoom = {};

// 输出日志
function log(msg) {
    var  now = new Date(),
        yyyy = now.getFullYear(),
        mm = now.getMonth()<10 ? '0' + now.getMonth(): now.getMonth(),
        dd = now.getDate()<10 ? '0' + now.getDate(): now.getDate(),
        HH = now.getHours()<10 ? '0' + now.getHours(): now.getHours(),
        MM = now.getMinutes()<10 ? '0' + now.getMinutes(): now.getMinutes(),
        SS = now.getSeconds()<10 ? '0' + now.getSeconds(): now.getSeconds();
    var time = '[' + yyyy + '-' + mm + '-' + dd + ' ' + HH + ':' + MM + ':' + SS +']：';
    console.log(time+msg);
}

function collectInDB(values){
    db.commit(SQL.collectRecord, values, function (err, result) {
        //console.log(result);
        // 发送大图会报错，先不管了
        if (err) {
            log(err.message);
        }
    });
}

exports.onConnection = function(io){
    io.on('connection',function (socket) {
        clientNum++;
        var clientIp = socket.handshake.address.replace('::ffff:','');
        log('IP为 < ' + clientIp + ' > 的用户连接成功，当前连接数 < ' + clientNum + ' >');

        var addedUser = false;

        // 以某个昵称加入聊天室
        socket.on('join',function (user) {
            if (addedUser) {
                return false;
            }
            socket.username = user.name;
            socket.usersex = user.sex;
            socket.uuid = user.uuid;
            userCount++;
            addedUser = true;
            usersInRoom[socket.id] = user; // 用户信息与socket id 绑定

            // 触发客户端事件
            socket.emit('login', {
                username: socket.username,
                usersex: socket.usersex,
                usersInRoom:usersInRoom,
                userCount:userCount
            });

            // 通知所有已连接的客户端，有一个新用户加入了
            socket.broadcast.emit('user joined', {
                username: socket.username,
                usersex: socket.usersex,
                userCount: userCount,
                usersInRoom:usersInRoom
            });
            collectInDB([socket.uuid, socket.username, clientIp, '加入聊天室', socket.id]);
            log('IP为 < ' + clientIp + ' > 的用户加入了房间，昵称为：' + user.name + ' ，当前房间人数为 < ' + userCount + ' >');

        });

        // 处理客户端发过来的 send message 事件通知
        socket.on('send message', function (data) {
            // 通知所有客户端，去触发 new message 事件,不包括当前客户端
            socket.broadcast.emit('new message', {
                username: socket.username,
                usersex: socket.usersex,
                message: data
            });
            collectInDB([socket.uuid, socket.username, clientIp, data, socket.id]);
        });

        // 处理客户端发过来的 change name 事件通知
        socket.on('change name', function (newName) {
            var oldname = socket.username;
            socket.username = newName;
            usersInRoom[socket.id].name = newName;

            // 通知所有客户端，去触发 new name 事件
            io.sockets.emit('new name', {
                username: socket.username,
                usersex: socket.usersex,
                oldname: oldname,
                usersInRoom:usersInRoom
            });
        });

        socket.on('disconnect', function(){
            if(addedUser){
                userCount--;
                delete usersInRoom[socket.id];

                socket.broadcast.emit('user left', {
                    username: socket.username,
                    socketId: socket.id,
                    userCount: userCount,
                    usersInRoom:usersInRoom
                });
            }
            clientNum--;
            log('IP为 < ' + clientIp + ' > 的用户断开了连接，当前连接数：< '+ clientNum + ' >，房间人数：< '+ userCount +' >');

        });
        // 正在输入
        socket.on('typing', function () {
            socket.broadcast.emit('typing', {
                username: socket.username,
                usersex: socket.usersex,
                socketId: socket.id
            });
        });

        // 停止输入
        socket.on('stop typing', function () {
            socket.broadcast.emit('stop typing', {
                username: socket.username,
                usersex: socket.usersex,
                socketId: socket.id
            });
        });
    });

};
