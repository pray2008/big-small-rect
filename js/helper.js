const Helper = {
    $d: (id) => {
        return document.getElementById(id);
    },
    showTips: (str) => {
        Helper.$d('tips').innerHTML = str;
        Helper.$d('tips').classList.add("show");
        setTimeout(()=>{
            Helper.hideTips();
        }, 3000);
    },
    hideTips: () => {
        Helper.$d('tips').classList.remove("show");
    },
    /**
     * 将大矩形分成三个矩形
     * @param {*} bigRectTopLeft 
     * @param {*} bigRectWidth 
     * @param {*} bigRectHeight 
     * @param {*} smallRectWidth 
     * @param {*} smallRectHeight 
     */
    cutBigRectBySmallRect: (bigRectTopLeft, bigRectWidth, bigRectHeight, smallRectWidth, smallRectHeight) => {
        let widthCount = parseInt(bigRectWidth / smallRectWidth);
        let heightCount = parseInt(bigRectHeight / smallRectHeight);
        let rect1 = {
            topLeft: bigRectTopLeft,
            width: widthCount * smallRectWidth,
            height: heightCount * smallRectHeight,
        };
        //剩余宽度
        let leftWidth = bigRectWidth - rect1.width;
        //剩余高度
        let leftHeight = bigRectHeight - rect1.height;

        let rect2 = {
            topLeft: {
                top: bigRectTopLeft.top,
                left: bigRectTopLeft.left + rect1.width
            },
            width: leftWidth,
        }

        let rect3 = {
            topLeft: {
                top: bigRectTopLeft.top + rect1.height,
                left: bigRectTopLeft.left
            },
            height: leftHeight,
        }

        //重叠部分用作rect2
        if (rect2.width > rect3.height) {
            rect2.height = bigRectHeight;
            rect3.width = rect1.width;
        }
        else {
            rect2.height = rect1.height;
            rect3.width = bigRectWidth;
        }

        return {
            rect1,
            rect2,
            rect3
        };
    },

    /**
     * 始终是从左往右放
     * @param {Number} bigRectTopLeft 大矩形左上角坐标
     * @param {Number} bigRectWidth 大矩形右上角坐标
     * @param {Number} bigRectHeight 大矩形左下角坐标
     * @param {Number} lastSmallRectTopLeft 大矩形右下角坐标
     * @param {Number} smallRectWidth 上一小矩形右上角坐标
     * @param {Number} smallRectHeight 上一小矩形右下角坐标
     * @param {Object} 返回新的小矩形的左上角坐标
     */
    calcNewSmallPos: (bigRectTopLeft, bigRectWidth, bigRectHeight, lastSmallRectTopLeft, smallRectWidth, smallRectHeight) => {
        let smallRectTopLeft;
        if (!lastSmallRectTopLeft) {
            smallRectTopLeft = bigRectTopLeft;
        }
        else {
            smallRectTopLeft = {
                top: lastSmallRectTopLeft.top,
                left: lastSmallRectTopLeft.left + smallRectWidth
            }

            //超出宽度边界了，该下一行
            if (smallRectTopLeft.left + smallRectWidth > bigRectTopLeft.left + bigRectWidth) {
                smallRectTopLeft = {
                    top: lastSmallRectTopLeft.top + smallRectHeight,
                    left: bigRectTopLeft.left
                }
            }
        }

        //超出宽度边界了
        if (smallRectTopLeft.left + smallRectWidth > bigRectTopLeft.left + bigRectWidth) {
            return null;
        }
        //超出高度边界了
        if (smallRectTopLeft.top + smallRectHeight > bigRectTopLeft.top + bigRectHeight) {
            return null;
        }

        return smallRectTopLeft;
    }
};