/**
 * Created by lizm on 2017/5/2.
 */


// 预览大图
function showBigImg(e) {
    
    var img = $('#big-img');
    img.attr('src', e.src);
    var marginTop = (document.body.clientHeight - img[0].height) / 2 - 50;
    $('#img-box').css('margin-top', marginTop < 35 ? 35 : marginTop);
    $('#img-modal').show();
}

// 关闭预览
function closeImgBox() {
    
    $('#img-modal').hide();
}

$(function () {
    
    var $okBtn = $('.nick-name-ok');
    var $mask = $('#nick-name-mask');
    var $chatWin = $('#content');
    var $userNameInput = $('.nick-name-input');
    var $sexContent = $('.select-sex');
    var $sendMsgInput = $('#send-message');
    var $sendMsgBtn = $('#send-button');
    var $msgArea = $('.message-area');
    var $userListArea = $('#user-list');
    var $userNum = $('.online-num');
    var $closeBtn = $('.close-ico');
    var $emojiContent = $('#emoji-content');
    var $emojiBtn = $('.emoji-ico');
    var $sendImgBtn = $('.img-ico');
    var $imgFile = $('#btn-send-img');
    
    var $logout = $('#logout-a');
    var $setting = $('#setting-a');
    
    var connected = false;
    var userName = '';
    var userSex = '1';
    var TYPING_TIMER_LENGTH = 1000; // ms
    var typing = false;
    var lastTypingTime;
    
    // 防止注入攻击
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }
    
    // 设置昵称,性别
    function setUserName() {
        /* userName = cleanInput($userNameInput.val().trim());
         if (userName) {
         $mask.hide();
         $chatWin.show();
         socket.emit('join', {
         name: userName,
         sex: userSex
         });
         }*/
        userName = $('span#username').text().trim();
        userSex = $('input#gender').val();
        var uuid = $('input#uuid').val();
        $chatWin.show();
        socket.emit('join', {
            name: userName,
            sex: userSex,
            uuid: uuid
        });
    }
    
    // 发送自己的消息
    function sendMessage() {
        var message = $sendMsgInput.html().replace(/&nbsp;/g, '');
        
        if (!!message && connected) {
            $sendMsgInput.html('');
            $sendMsgInput.focus();
            if ($emojiContent.is(':visible')) {
                $emojiContent.hide();
                $emojiBtn.removeClass('open');
            }
            if (message.charAt(0) === '/') {
                processCommand(message);
            } else {
                
                var html = '<div class="msg-box my-msg">' + message + '</div>' +
                    '<div class="avatar my-avatar_' + userSex + '"></div>' +
                    '<div class="my-nick-name">' + userName + '</div>';
                var $el = $('<div>').addClass('my-message').html(html);
                $msgArea.append($el);
                $msgArea[0].scrollTop = $msgArea[0].scrollHeight;
                // 通知服务器去触发 send message 事件
                socket.emit('send message', message);
            }
        }
    }
    
    function processCommand(message) {
        var params = message.split(' ');
        var command = params[0].split('/')[1].toLowerCase();
        var newName = params[1];
        var msg = false;
        
        switch (command) {
            case 'nick':
                userName = newName;
                socket.emit('change name', newName);
                break;
            default:
                msg = '未识别的指令';
                logOnMsgBox(msg);
                break;
        }
        
        return msg;
    }
    
    // 显示服务器消息
    function acceptMessage(data, type) {
        var typing = '';
        if (type === 'typing') {
            typing = 'typing';
        }
        var html = '<div class="avatar others-avatar_' + data.usersex + '"></div>' +
            '<div class="msg-box others-msg">' + data.message + '</div>' +
            '<div class="others-nick-name">' + data.username + '</div>';
        
        var $el = $('<div>').addClass('others-message ' + typing).html(html);
        $msgArea.append($el);
        $msgArea[0].scrollTop = $msgArea[0].scrollHeight;
    }
    
    // 更新右侧在线用户
    function updateUserNum(data, action) {
        
        if (action === 'add') {
            $userListArea.empty();
            for (var id in data.usersInRoom) {
                var $el = $('<li>').attr({
                    id: id,
                    class: 'sex_' + data.usersInRoom[id].sex
                }).text(data.usersInRoom[id].name);
                $userListArea.append($el);
            }
            
        } else if (action === 'delete') {
            $userListArea.find('#' + data.socketId).remove();
        }
        $userNum.text(data.userCount);
    }
    
    // 删除正在输入...
    function removeIsTyping(data) {
        /*var getTypingMessages = function (data) {
            return $('.others-message.typing').filter(function (i) {
                return $(this).children('.others-nick-name').text() === data.username;
            });
        };
        getTypingMessages(data).fadeOut(10, function () {
            $(this).remove();
        });*/
        $userListArea.find('#' + data.socketId).removeClass('typing');
    }
    
    // 是否在输入
    
    function updateTypingStatus(data, type) {
        if (!data.username) {
            return false;
        }
        data.message = '正在输入...';
        if (type) {
            //acceptMessage(data, 'typing');
            var tarUser = $userListArea.find('#' + data.socketId);
            !tarUser.hasClass('typing') && tarUser.addClass('typing');
        } else {
            removeIsTyping(data);
        }
    }
    
    function wrapDateTime(str) {
        var now = new Date(),
            yyyy = now.getFullYear(),
            mm = now.getMonth() < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1),
            dd = now.getDate() < 10 ? '0' + now.getDate() : now.getDate(),
            HH = now.getHours() < 10 ? '0' + now.getHours() : now.getHours(),
            MM = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes(),
            SS = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds(),
            time = '[' + yyyy + '-' + mm + '-' + dd + ' ' + HH + ':' + MM + ':' + SS + ']：';
        
        return time + str;
    }
    
    // 在message区域输出消息
    function logOnMsgBox(msg) {
        
        var message = wrapDateTime(msg);
        var $el = $('<div>').addClass('log').text(message);
        $msgArea.append($el);
        $msgArea[0].scrollTop = $msgArea[0].scrollHeight;
    }
    
    // 加载emoji
    loadEmoji();
    
    function loadEmoji() {
        var imgHtml = '';
        for (var i = 1001, j = 1101; i < j; i++) {
            imgHtml += '<img src="../images/emoji/n' + i.toString().substr(1) + '.gif" />';
        }
        for (var i = 1001, j = 1057; i < j; i++) {
            imgHtml += '<img src="../images/emoji/s' + i.toString().substr(1) + '.png" style="margin-right: 1px"/>';
        }
        $emojiContent.html(imgHtml);
    }
    
    //
    $emojiBtn.on('click', function () {
        if ($emojiContent.is(':visible')) {
            $emojiContent.hide();
            $emojiBtn.removeClass('open');
        } else {
            $emojiContent.show();
            $emojiBtn.addClass('open');
        }
    });
    $emojiContent.on('click', 'img', function () {
        var emojiTarget = $(this)[0].outerHTML;
        $sendMsgInput.append(emojiTarget);
        $emojiContent.hide();
        $emojiBtn.removeClass('open');
    });
    $imgFile.on('change', function () {
        getFile(this);
    });
    $sendImgBtn.on('click', function () {
        $imgFile.click();
    });
    
    // 选择图片
    var countImg = 0; // 图片计数
    function getFile(element) {
        
        if (!element.files[0]) {
            return false;
        }
        var imgType = element.files[0].type.split('/')[1];
        if (!(['png', 'jpeg', 'jp2', 'gif'].indexOf(imgType) > -1)) {
            
            alert('只支持图片文件上传');
            $imgFile.val(null);
            return false;
        }
        if (element.files[0].size > 3145728) { // 3 * 1024 *1024
            
            alert('图片大小不能超过3M');
            $imgFile.val(null);
            return false;
        }
        if (element.files.length > 9) {
            
            alert('一次最多只能添加9张图片');
            $imgFile.val(null);
            return false;
        } else {
            
            for (var i = 0; i < element.files.length; i++) {
                
                if (countImg > 9) {
                    
                    alert('一次最多只能添加9张图片');
                    return false;
                } else {
                    
                    getImgFile(element.files[i]);
                }
            }
        }
        
        function getImgFile(element) {
            
            
            var photofile = element;
            var reader = new FileReader();
            reader.onload = function (e) {
                
                var img = new Image();
                img.src = e.target.result;
                var imgHtml = '<img id="img_"' + countImg + ' src="' + img.src + '" onclick="showBigImg(this)"/>';
                $sendMsgInput.append(imgHtml);
                //var compressedImg = reduceImage.compress(img, 100).src;
                
                countImg++;
            };
            reader.readAsDataURL(photofile);
        }
        
        var reduceImage = {
            /**
             * Receives an Image Object (can be JPG OR PNG) and returns a new Image Object compressed
             * @param {Image} source_img_obj The source Image Object
             * @param {Integer} quality The output quality of Image Object
             * @return {Image} result_image_obj The compressed Image Object
             */
            compress: function (source_img_obj, quality, output_format) {
                
                var mime_type = 'image/jpeg';
                if (output_format != undefined && output_format == 'png') {
                    
                    mime_type = 'image/png';
                }
                var cvs = document.createElement('canvas');
                //naturalWidth真实图片的宽度
                //cvs.width = source_img_obj.naturalWidth;
                //cvs.height = source_img_obj.naturalHeight;
                var xRate = 100 / source_img_obj.naturalWidth;
                var yRate = 100 / source_img_obj.naturalHeight;
                cvs.width = 100;
                cvs.height = 100;
                var cvsContext = cvs.getContext('2d');
                cvsContext.scale(xRate, yRate);
                var ctx = cvsContext.drawImage(source_img_obj, 0, 0);
                var newImageData = cvs.toDataURL(mime_type, quality / 100);
                var result_image_obj = new Image();
                result_image_obj.src = newImageData;
                return result_image_obj;
            }
        };
        
    }
    
    // 设置昵称
    $okBtn.on('click', setUserName);
    
    // 没有这个dom，预留
    $closeBtn.on('click', function () {
        open(window.location, '_self').close();
    });
    
    //设置
    $setting.on('click', function () {
        layer.open({
            type: 2,
            title: '个人信息修改',
            shadeClose: true,
            shade: 0.8,
            area: ['840px', '580px'],
            content: '/etb-chat/home/setting' //iframe的url
        });
    });
    
    // 退出登录
    $logout.on('click', function () {
        layer.confirm('确定不再聊会儿？', {
            btn: ['再聊5毛钱', '溜了溜了'] //按钮
        }, function (index) {
            layer.close(index);
        }, function () {
            sessionStorage.clear();
            window.location.href = '/users/logout.do';
        });
    });
    
    // 自己发送消息
    $sendMsgBtn.on('click', sendMessage);
    
    //
    $sexContent.on('click', 'input', function () {
        $(this).prop('checked', 'true').siblings().removeAttr('checked');
        userSex = $(this).val();
    });
    
    // 发送消息
    $sendMsgInput.on('keydown', function (event) {
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $sendMsgInput.focus();
        }
        
        if (event.which === 13 && userName) {
            sendMessage();
            return false;
        } else {
            if (connected) {
                if (!typing) {
                    typing = true;
                    socket.emit('typing');
                }
                lastTypingTime = (new Date()).getTime();
                
                setTimeout(function () {
                    var typingTimer = (new Date()).getTime();
                    var timeDiff = typingTimer - lastTypingTime;
                    if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                        socket.emit('stop typing');
                        typing = false;
                    }
                }, TYPING_TIMER_LENGTH);
            }
        }
        
    });
    
    // 回车事件
    $userNameInput.on('keydown', function (event) {
        
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $userNameInput.focus();
        }
        
        if (event.which === 13 && !userName) {
            setUserName();
        }
    });
    
    
    var socket = io();
    
    // 有人进入聊天室时，在他自己的客户端输出消息
    socket.on('login', function (data) {
        connected = true;
        $msgArea.empty();
        var msg = '欢迎欢迎，' + data.username;
        if (!data.username) {
            return false;
        }
        logOnMsgBox(msg);
        updateUserNum(data, 'add');
        $sendMsgInput.focus();
    });
    
    // 接收服务器的新消息通知
    socket.on('new message', function (data) {
        acceptMessage(data);
    });
    
    // 有人加入聊天室，输出消息
    socket.on('user joined', function (data) {
        var msg = data.username + ' 加入了聊天室';
        if (!data.username) {
            return false;
        }
        logOnMsgBox(msg);
        updateUserNum(data, 'add');
    });
    
    // 有人断开连接时，输出消息
    socket.on('user left', function (data) {
        var msg = data.username + ' 离开了聊天室';
        if (!data.username) {
            return false;
        }
        removeIsTyping(data);
        logOnMsgBox(msg);
        // 更新在线用户，删除一个
        updateUserNum(data, 'delete');
    });
    
    // 修改昵称
    socket.on('new name', function (data) {
        var msg = data.oldname + ' 修改昵称为：' + data.username;
        logOnMsgBox(msg);
        updateUserNum(data, 'add');
    });
    
    // 有人正在输入时，输出xxx正在输入的消息
    socket.on('typing', function (data) {
        updateTypingStatus(data, true);
    });
    
    // 停止输入时，删除消息
    socket.on('stop typing', function (data) {
        updateTypingStatus(data, false);
    });
    
    socket.on('disconnect', function () {
        //logOnMsgBox('服务器开了个小差');
    });
    
    socket.on('reconnect', function () {
        //location.reload(true);
    });
    
    socket.on('reconnect_error', function () {
        //logOnMsgBox('重新连接失败');
    });
    
    
    // 初始化
    
    setUserName();
    
    util.enableDrag('.room-title','#content');
});

