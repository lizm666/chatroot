/**
 * 工具类
 * author:lizm
 *
 */

var util = {
    /**
     * 根据元素id 查找其中的 name 属性的元素，取值组成一个对象返回
     * @param id
     */
    getFormData: function (id) {
        var els = document.querySelectorAll('#' + id + ' [name]'); // NodeList 不是 Array
        var data = {};
        var errors = [];
        Array.prototype.map.call(els, function (el) {
            // do something you want deal with DOM
            var errorText = el.getAttribute('requiredText');
            if (errorText && !el.value) {
                errors.push(errorText);
            }
            data[el.getAttribute('name')] = el.value;
        });
        if (errors.length) {
            layer.msg(errors.join('<br />'));
            return null;
        }
        return data;
    },
    enableDrag: function (selectSelector, dragSelector) {
        var selectObj = document.querySelector(selectSelector);
        var dragObj = document.querySelector(dragSelector);
        dragObj.style.left = '0px';
        dragObj.style.top = '0px';
        
        var mouseX,
            mouseY,
            objX,
            objY;
        var dragging = false;
        selectObj.style.cursor = 'grab';
        selectObj.onclick = function () {
            selectObj.style.cursor = 'grabbing';
        };
        selectObj.onmouseup = function () {
            setTimeout(function () {
                selectObj.style.cursor = 'grab';
            }, 0);
        };
        selectObj.onmousedown = function (event) {
            event = event || window.event;
            dragging = true;
            dragObj.style.position = 'relative';
            selectObj.style.cursor = 'grabbing';
            mouseX = event.clientX;
            mouseY = event.clientY;
            objX = parseInt(dragObj.style.left);
            objY = parseInt(dragObj.style.top);
        };
        
        document.onmousemove = function (event) {
            event = event || window.event;
            if (dragging) {
                dragObj.style.left = parseInt(event.clientX - mouseX + objX) + 'px';
                dragObj.style.top = parseInt(event.clientY - mouseY + objY) + 'px';
            }
            
        };
        
        document.onmouseup = function () {
            dragging = false;
        };
    }
};