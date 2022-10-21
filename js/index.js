const sizeInfo = {
    rate: 1, //物理与像素比例，当显示器容不下时，缩小比例显示
};

const rectAttr = {
    big: {
        fill: 'rgba(241, 84, 84, 0.1)',
        stroke: 'rgb(241, 84, 84)',
        'stroke-width': '1',
    },
    small: {
        fill: 'rgba(20, 20, 20, 0.1)',
        stroke: 'rgb(20, 20, 20)',
        'stroke-width': '1',
    }
};

let rectWidthHeightInfo = null;

const getWidthHeight = () => {
    let bigRectWidth = parseInt(Helper.$d('bigRectWidth').value);
    let bigRectHeight = parseInt(Helper.$d('bigRectHeight').value);
    let smallRectWidth = parseInt(Helper.$d('smallRectWidth').value);
    let smallRectHeight = parseInt(Helper.$d('smallRectHeight').value);

    if (Math.max(bigRectWidth, bigRectHeight) < Math.max(smallRectWidth, smallRectHeight) || Math.min(bigRectWidth, bigRectHeight) < Math.min(smallRectWidth, smallRectHeight)) {
        Helper.showTips('大矩形容纳不了一个小矩形');
        return false;
    }

    rectWidthHeightInfo = {
        bigRectWidth,
        bigRectHeight,
        smallRectWidth,
        smallRectHeight
    };

    return rectWidthHeightInfo;
};

const drawBigRectPart = (draw, bigRectPart, smallRectWidth, smallRectHeight, arrAttr) => {
    let smallRectTopLeft = null;
    let sumCount = 0;
    do {
        smallRectTopLeft = Helper.calcNewSmallPos(bigRectPart.topLeft, bigRectPart.width, bigRectPart.height, smallRectTopLeft, smallRectWidth, smallRectHeight);
        if (smallRectTopLeft) {
            sumCount += 1;
            let smallRectAttr = Object.assign({x: smallRectTopLeft.left, y: smallRectTopLeft.top, width: smallRectWidth, height: smallRectHeight}, rectAttr.small);
            arrAttr.push(smallRectAttr);
            //draw.rect(smallRectWidth, smallRectHeight).attr(smallRectAttr);
        }
    } while(smallRectTopLeft);

    return sumCount;
}

const clearSvg = () => {
    Helper.$d('svgWrap').innerHTML = '';
    Helper.$d('rectInfo').innerText = '';
    //Helper.$d('smallRectCnt').innerText = 0;
}

const generateSvg = ()=> {
    const rectInfo = getWidthHeight();
    if (!rectInfo) {
        return;
    }
    clearSvg();
    
    Helper.$d('svgWrap').style.width = `${rectInfo.bigRectWidth}px`;
    Helper.$d('svgWrap').style.height = `${rectInfo.bigRectHeight}px`;
    let draw = SVG().addTo('#svgWrap').size(rectInfo.bigRectWidth, rectInfo.bigRectHeight);
    draw.rect(rectInfo.bigRectWidth, rectInfo.bigRectHeight).attr(rectAttr.big);

    //将大矩形切分成三部分
    let bigRectParts;

    //A切法
    let sumCountTypeA = 0;
    let arrAttrTypeA = [];
    bigRectParts = Helper.cutBigRectBySmallRect({left: 0, top: 0}, rectInfo.bigRectWidth, rectInfo.bigRectHeight, rectInfo.smallRectWidth, rectInfo.smallRectHeight);
    //draw part1
    sumCountTypeA += drawBigRectPart(draw, bigRectParts.rect1, rectInfo.smallRectWidth, rectInfo.smallRectHeight, arrAttrTypeA);
    //draw part2
    sumCountTypeA += drawBigRectPart(draw, bigRectParts.rect2, rectInfo.smallRectHeight, rectInfo.smallRectWidth, arrAttrTypeA);
    //draw part3
    sumCountTypeA += drawBigRectPart(draw, bigRectParts.rect3, rectInfo.smallRectHeight, rectInfo.smallRectWidth, arrAttrTypeA);


    //B切法：旋转小长方形
    let sumCountTypeB = 0;
    let arrAttrTypeB = [];
    bigRectParts = Helper.cutBigRectBySmallRect({left: 0, top: 0}, rectInfo.bigRectWidth, rectInfo.bigRectHeight, rectInfo.smallRectHeight, rectInfo.smallRectWidth);
    //draw part1
    sumCountTypeB += drawBigRectPart(draw, bigRectParts.rect1, rectInfo.smallRectHeight, rectInfo.smallRectWidth, arrAttrTypeB);
    //draw part2
    sumCountTypeB += drawBigRectPart(draw, bigRectParts.rect2, rectInfo.smallRectWidth, rectInfo.smallRectHeight, arrAttrTypeB);
    //draw part3
    sumCountTypeB += drawBigRectPart(draw, bigRectParts.rect3, rectInfo.smallRectWidth, rectInfo.smallRectHeight, arrAttrTypeB);

    let arrAttr = sumCountTypeB > sumCountTypeA ? arrAttrTypeB : arrAttrTypeA;
    //Helper.$d('smallRectCnt').innerText = Math.max(sumCountTypeA, sumCountTypeB);
    Helper.$d('rectInfo').innerText = `大矩形:${rectInfo.bigRectWidth} × ${rectInfo.bigRectHeight}  小矩形:${rectInfo.smallRectWidth} × ${rectInfo.smallRectHeight} 数量:${Math.max(sumCountTypeA, sumCountTypeB)}`;
    arrAttr.forEach((attr)=>{
        draw.rect(attr.width, attr.height).attr(attr);
    });
    zoomSvg();
};

//将svg缩放到合适屏幕观看的大小
const zoomSvg = () => {
    let fitHeight = Helper.$d('fitHeight').checked;
    let svgWrapHeight = Helper.$d('svgWrap').clientHeight;
    let leftBarCollapsed = Helper.$d('leftBar').classList.contains('collapsed');

    if (svgWrapHeight === 0) {
        return;
    }

    let wrapMaxWidth = document.documentElement.clientWidth - (leftBarCollapsed ? 60 : 180);
    let wrapMaxHeight = document.documentElement.clientHeight - 90;

    let widthRate = rectWidthHeightInfo.bigRectWidth / wrapMaxWidth;
    let heightRate = rectWidthHeightInfo.bigRectHeight / wrapMaxHeight;

    if (widthRate > 1) {
        Helper.$d('svgWrap').style.zoom = fitHeight ? 1 / Math.max(widthRate, heightRate) : 1 / widthRate;
    }
    else if (widthRate <= 1 && !fitHeight) {
        Helper.$d('svgWrap').style.zoom = 1;
    }
    else if (heightRate > 1 && fitHeight) {
        Helper.$d('svgWrap').style.zoom = 1 / heightRate;
    }
};

const collapseLeftBar = () => {
    let cl = Helper.$d('leftBar').classList;
    if (cl.contains('collapsed')) {
        cl.remove('collapsed');
    }
    else {
        cl.add('collapsed');
    }
    zoomSvg();
};

window.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('btnOk').addEventListener('click', generateSvg);
    document.getElementById('fitHeight').addEventListener('click', ()=>{
        zoomSvg()
    });
    document.getElementById('btnCollapse').addEventListener('click', collapseLeftBar);
});

window.addEventListener('resize', ()=>{
    zoomSvg();
});