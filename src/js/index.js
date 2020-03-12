
// 引入文件
import '../css/index.css'

import $ from 'jQuery'
$(function () {


    //获取元素
    var $layer = $('.layer');

    var $play = $('.play');

    var audio = $('#audio')[0];

    var $btn = $('.btn');

    var $mask = $('.mask');

    var $volumn = $('.volumn-layer');

    var duration = 0;

    var $speed = $('.speed');

    var lrcTop = 225;

    // 按下的时候
    var isDown = false;

    // 按下松开
    var isLeave = false;

    //保存当前激活的id
    var currentId = null;

    // 保存当前的歌词时间列表
    var currentLrc = null;


    // 获取本地存储或者默认
    var userDate = JSON.parse(localStorage.getItem('userDate')) || {
        // 1.默认列表
        defaultList: {
            listData: {

            },
            listId: []

        },
        // 2.最近播放
        nearestList: {
            listData: {

            },
            listId: []

        },
        // 3.收藏数据
        collectList: {
            listData: {

            },
            listId: []

        }
    }

    console.log('看一下userDate==>', userDate);

    // 当前列表
    var listData = userDate.defaultList.listData;

    // 保存当前列表上拥有的id
    var listId = userDate.defaultList.listId;

    // 保存当前播放状态
    var mode = 1;

    var allData = null; // 用于保存已经拿回来的数据

    // 开始截取的数据下标
    var startIndex = 0;
    // 每次截取的数据量
    var itemNum = 20;

    var isPlay = false; //是否是一个音乐播放状态

    // 0：默认 1：是最近 2：收藏 列表状态
    var typeList = 0;

    var typeLink = {
        0: 'defaultList',
        1: 'nearestList',
        2: 'collectList'
    }

    // 随机函数
    function random(max, min) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    //格式化时间
    function makeTime(number, bool = false) {

        let minutes = Math.floor(number / 60);

        minutes = minutes >= 10 ? minutes : '0' + minutes;


        let seconds = Math.floor(number % 60);

        if (bool) {
            seconds = (number % 60).toFixed(3);
        }


        seconds = seconds >= 10 ? seconds : '0' + seconds;

        // console.log(minute + ':' + seconds)
        return minutes + ':' + seconds;

    }

    // 在主体添加音乐列表
    function initList(data) {

        let newIndex = startIndex + itemNum;

        // 当数据量不够的时候
        if (newIndex > allData.length) {
            newIndex = allData.length;
        }

        for (let i = startIndex; i < newIndex; i++) {
            let o = data[i];
            let $div = $(`<div class="main-song-item" data-id="${o.id}" data-url="${o.url}" data-lrc="${o.lrc}">
                            <div class="main-song-img" data-img="${o.pic}">
                                <img class="auto-img"
                                    src="${o.pic}">
                            </div>
                            <div class="main-song-name">
                                ${o.name}
                            </div>
                            <div class="main-song-time">
                                ${makeTime(o.time)}
                            </div>
                            <div class="main-song-singer">
                                ${o.singer}
                            </div>
                        </div>`)

            $('.main-song-list').append($div);
        }

        if (newIndex === allData.length) {
            $('.main-song-list').append($(` <div>
            <p class="deadly-line">这是底线了</p>
        </div>`));
        }

        startIndex = newIndex;

    }


    // 根据本地存储数据生成默认列表
    function initDefaultList() {
        // 先清空
        $('.aside-list').html('');

        // console.log(listData)
        // console.log(listId)
        for (let i = 0; i < listId.length; i++) {
            // console.log(listId[i], 'listId[i]')
            // 看一下这个元素是否在收藏列表里面？
            let index = userDate.collectList.listId.indexOf(listId[i]);
            // listId[i] = Number(listId[i]);
            let $div = $(`<div class="song-item" data-id="${listData[listId[i]].id}" data-url="${listData[listId[i]].url}">
                            <div class="circle">
                                <div class="song-img">
                                    <img class="auto-img"
                                        src="${listData[listId[i]].pic}">
                                </div>
                            </div>
                            <div class="music-content">
                                <p class="music-title">
                                ${listData[listId[i]].singer}-${listData[listId[i]].name}
                                </p>
                                <div class="clearfix sup">
                                <div class="music-time fl">
                                    <span>00:00</span>/
                                    <span>${listData[listId[i]].time}</span>
                                </div>

                                <div class="fr">
                                ${typeList == 2 ? '' : `<i class="love ${index >= 0 ? 'real-love' : ''} iconfont icon-shoucang"></i>`}


                                    <i class="del  iconfont icon-lajixiang"></i>
                                </div>

                            </div>
                            </div>
                        </div>`)
            $('.aside-list').append($div);
        }
    }

    // 初始化默认列表
    initDefaultList();
    // 给默认列表播放数字
    $("#defaultNum").text(userDate.defaultList.listId.length);
    // 给最近播放列表数字
    $('#nearestNum').text(userDate.nearestList.listId.length);
    // 给最近播放列表数字
    $('#collectNum').text(userDate.collectList.listId.length);


    // 生成歌单界面



    //绑定歌曲列表点击事件
    $('.main-song-list').on('click', '.main-song-item', function () {
        if (typeList != 0) { //现在不是默认列表
            let v = $('.aside-nav>div[data-type="defaultList"]')[0];
            console.log(v);
            v.click();
        }

        // 如果当前列表有这个id的话不加
        let id = $(this).attr('data-id');

        let index = listId.indexOf(id);
        if (index >= 0) {

            dblEve($('.song-item').eq(index)[0])


            return;
        }

        let singer = $(this).find('.main-song-singer').text().trim();
        let name = $(this).find('.main-song-name').text().trim();
        let time = $(this).find('.main-song-time').text().trim();
        let pic = $(this).find('.main-song-img').attr('data-img');
        let url = $(this).attr('data-url');
        let lrc = $(this).attr('data-lrc');

        let elements = $(`<div class="song-item" data-id="${id}" data-url="${url}">
                                <div class="circle">
                                    <div class="song-img">
                                        <img class="auto-img"
                                            src="${pic}">
                                    </div>
                                </div>
                                <div class="music-content">
                                    <p class="music-title">
                                        ${singer}-${name}
                                    </p>
                                    <div class="clearfix sup">
                                        <div class="music-time fl">
                                            <span>00:00</span>/
                                            <span>${time}</span>
                                        </div>

                                        <div class="fr">
                                            <i class="love iconfont icon-shoucang"></i>
                                            <i class="del  iconfont icon-lajixiang"></i>
                                        </div>

                                    </div>
                                </div>
                            </div>`);
        console.log(makeTime(time))
        $('.aside-list').append(elements);

        // 当前的id
        currentId = id;
        listData[id] = {
            singer,
            name,
            id,
            time,
            pic,
            lrc,
            url
        }
        listId.push(id);

        // 挂本地存储
        localStorage.setItem('userDate', JSON.stringify(userDate));

        console.log('userDate.defaultList==>', userDate.defaultList);

        // 给默认列表播放数字
        $("#defaultNum").text(userDate.defaultList.listId.length);

        // 开始播放
        dblEve(elements[0]);
    })



    // 点击搜索之后才加载歌曲
    $('.search-btn').click(function () {
        // 获取搜索框内容
        let text = $('.search-inp').val();
        // 清空输入框
        $('.search-inp').val('');
        if (text.replace(/\s/g, '') === '') {
            alert("请输入点有用的东西");
            return;
        }

        // 变成歌曲列表
        $('.section-nav>div').eq(1).trigger('click');

        // 情空列表
        $('.main-song-list').html('');

        // 弄加载动画
        $('.loading').show();

        // 在加载之前必须做一点重置工作
        $.ajax({
            type: 'get',
            url: 'https://v1.itooi.cn/netease/search',
            data: {
                keyword: text,
                type: 'song',
                format: 1
            },
            success: (data) => {
                // 渲染列表
                allData = data.data;
                // 开始截取数据下标变为0
                startIndex = 0;

                // 停止加载动画
                $('.loading').hide();

                initList(allData);
            }


        })


    })
    // 回车一样
    $('.search-inp').on('keyup', function (e) {
        e.preventDefault();
        if (e.keyCode === 13) {
            $('.search-btn').trigger('click');
        }
    })



    // 节流函数
    function throttle(fn, delay) {

        /*这里只运行一次*/
        let valid = true;

        //这个是返回挂在外面的函数
        return function () {
            let self = this;
            let e = arguments;
            if (!valid) {
                //休息时间 暂不接客
                return false;
            }
            //工作时间，执行函数并且在间隔期内把状态设为无效
            valid = false
            setTimeout(() => {
                fn.apply(self, e);
                //执行完才重新工作
                valid = true;
            }, delay)
        }
    }


    // 滚动加载歌曲
    $('.section-main').on('scroll', throttle(function () {
        // 没有那么多数据时候直接返回去
        if (startIndex === allData.length) {
            return;
        }
        // console.log(this.scrollTop)
        // console.log($(this).find('.main-song-item:last-child')[0].offsetTop);
        // console.log($(this).height());

        // console.log('1', (this.scrollTop + $(this).height()));
        // console.log('2', $(this).find('.main-song-item:last-child').offset().top);

        let elementsTop = $(this).find('.main-song-item:last-child').offset().top;

        let y = $(this).find('.main-song-item:last-child').height();
        // console.log(y)

        // console.log('1', elementsTop - y);
        // console.log('2', $(this).height())

        // 有21px的差距怀疑是border引起

        if ((elementsTop - y) <= $(this).height() + 50 + $(this).find('.main-song-item').length) {
            console.log('加载了');
            initList(allData);
        }


    }, 500))

    // 添加歌词
    function generationLrc(lrc) {

        var reg = /(\[\d{2,3}\:\d{2,3}\.\d{2,3}\]\s?(\[\d{2,3}\:\d{2,3}\.\d{2,3}\])?)/;

        var lrcSplit = lrc.split(reg);
        console.log(lrcSplit)
        var timeArr = [];

        var lrcArr = [];

        var timeReg = /^\[\d{2,3}\:\d{2,3}\.\d{2,3}\]\s?$/;

        for (let i = 0; i < lrcSplit.length; i++) {
            // console.log(lrcSplit[i].trim())].
            if (lrcSplit[i] === undefined || lrcSplit[i].trim() === '') {
                continue;
            } else if (timeReg.test(lrcSplit[i])) {
                let v = lrcSplit[i].replace(/\[|\]/g, '')
                timeArr.push(v);
            } else if (!(/\[.*?\]/).test(lrcSplit[i])) {
                lrcArr.push(lrcSplit[i]);
            }
        }

        // 把歌词渲染到页面上

        for (let j = 0; j < lrcArr.length; j++) {
            let str = $(`<li>${lrcArr[j]}</li>`);

            $('.lrc-list').append(str);
        }

        // 获取该样式
        // lrcTop = $('.lrc-list').css('transform').replace(/[^0-9\-,]/g, '').split(',')[5];

        console.log('timeArr==>', timeArr)
        console.log('lrcArr==>', lrcArr)

        return timeArr;

    }

    // 双击事件
    function dblEve(dom) {

        // 1 把连接拿过来
        let url = $(dom).attr('data-url');
        // console.log('url', url)
        // 2 把链接给audio标签
        audio.src = url;


        // 3.把当前id给拿了
        currentId = $(dom).attr('data-id');


        // 加类名
        $(dom).addClass('active').siblings('.active').removeClass('active').find('.music-time>span:first-child').text('00:00');

        // 清除动画
        $(dom).siblings().find('.circle').css({
            animation: `none`
        })

        // 加动画
        $(dom).find('.circle').css({
            animation: `rot 2s linear infinite`
        })

        // 开始播放
        $('.play').removeClass('play icon-icon-test2').addClass('paused icon-icon-test1');
        isPlay = true;

        currentLrc = [];
        $('.lrc-list').html('');
        // ajax请求歌词
        $.ajax({
            type: 'get',
            url: 'https://v1.itooi.cn/netease/lrc',
            data: {
                id: currentId
            },
            success: (response) => {
                // console.log('response', response)
                // 根据当前的lrc生成歌词
                currentLrc = generationLrc(response);
                console.log('currentLrc', currentLrc);
            }

        })


        // 显示加载动画
        $('.loading').show();


        setTimeout(() => {
            audio.play();
        }, 100)


        console.log('typeList', typeList)

        if (typeList != 1) {

            // 当最近播放中出现具有一样id的歌曲时候，删除以前的
            let index = userDate.nearestList.listId.indexOf(currentId);
            if (index >= 0) {
                delete userDate.nearestList.listData[currentId];
                // 数组中删除一个
                userDate.nearestList.listId.splice(index, 1);

            }

            // 在播放的时候应该存储一份数据放入最近播放
            userDate.nearestList.listData[currentId] = listData[currentId];
            userDate.nearestList.listId.unshift(currentId);

            // 挂本地存储
            localStorage.setItem('userDate', JSON.stringify(userDate));

            // 给最近播放列表数字
            $('#nearestNum').text(userDate.nearestList.listId.length);

        }


        console.log("userDate.nearestList==>", userDate.nearestList)


    }

    // 主体右侧显示切换
    $('.song-list ').on('click', function () {
        if ($(this).hasClass('now')) {
            return;
        }
        $(this).addClass('now').siblings().removeClass('now');

        $('.loading').hide();

        let l = $(this).attr('data-type');

        $(`.${l}`).show().siblings().hide();
    })


    //给列表元素绑定事件
    $('.aside-list').on('dblclick', '.song-item', function () {

        if ($(this).hasClass('active')) {



            return;
        }

        dblEve(this);


    })


    // 点击上一首
    $('.prev').on('click', function () {

        if (currentId === null) {
            return;
        }

        //查找当前id在列表上的索引
        let index = listId.indexOf(currentId);
        // console.log(index)


        // 根据mode情况判断如何进行操作
        if (mode == 1) { //这是一个列表循环
            if (index == 0) {
                index = listId.length - 1;
            } else {
                index--;
            }

        } else if (mode == 2) {
            index = random(listId.length - 1, 0);

        }


        var prev = $('.song-item').eq(index)[0];
        dblEve(prev);

    })


    //点击下一首的
    $('.next').on('click', function () {


        if (currentId === null) {
            return;
        }

        let index = listId.indexOf(currentId);
        // console.log(index)

        if (mode == 1) {
            if (index == listId.length - 1) {
                index = 0;
            } else {
                index++;
            }
        } else if (mode == 2) {
            index = random(listId.length - 1, 0);
        }

        var next = $('.song-item').eq(index)[0];

        dblEve(next);


    })



    // 切换默认列表事件
    $('.aside-nav>div').on('click', function () {
        if ($(this).hasClass('now')) {
            return;
        }

        $(this).addClass('now').siblings().removeClass('now');

        // 下一步是根据当前的dataType,选择对应的数据
        let type = $(this).data('type');

        // 更换数据源头
        listData = userDate[type].listData;

        listId = userDate[type].listId;

        if (type == 'defaultList') {
            typeList = 0;
        } else if (type == 'nearestList') {
            typeList = 1;
        } else if (type == 'collectList') {
            typeList = 2;
        }

        // 初始化默认列表
        initDefaultList();

        // console.log(isPlay)
        if (isPlay) {
            $('.aside-list').find(`.song-item[data-id="${currentId}"]`).find('.circle').css({
                animation: `rot 2s linear infinite`
            })
        }

        $('.aside-list').find(`.song-item[data-id="${currentId}"]`).addClass('active');


    })

    //获取总时间  给链接后触发oncanplay事件
    audio.oncanplay = function () {

        duration = audio.duration;

        // console.log('listData==>', listData)
        // console.log('currentId==>', currentId)
        $('.music-name').text(listData[currentId].name);
        $('.total').text(makeTime(duration));

        // 展示
        $btn.show();
        $layer.show();

        // 显示加载动画
        $('.loading').hide();
    }

    // 改变模式
    $('.mode').on('click', function () {
        $('.mode-control').toggle();

    })

    $('.mode-control>div').on('click', function () {
        // console.log($(this).find('i')[0]);
        let className = $(this).find('i')[0].className;
        $('.mode>i')[0].className = className;
        // 设置播放模式 0:是循环 1:顺序 2：随机
        mode = $(this).attr('data-mode');
        // if (mode == 0) { //单曲循环
        //     audio.loop = true;
        // } else {
        //     audio.loop = false;
        // }
    })


    // 改变音量函数
    function changeVolumn(e) {
        e.preventDefault();
        let bottom = $('.volumn-line').height() - e.offsetY;

        let w = $('.volumn-btn').width();
        // 控制一些范围

        bottom = bottom < -(w / 2) ? -(w / 2) : bottom > $('.volumn-line').height() - (w / 2) ? $('.volumn-line').height() - (w / 2) : bottom;

        $('.volumn-btn').css({
            bottom: bottom + 'px'
        })

        $('.volumn-mask').css({
            height: bottom + (w / 2) + 'px'
        })

        // 修改音量
        audio.volume = (bottom + (w / 2)) / 100;
    }

    // 设置一个默认音量 .3
    audio.volume = .3;

    $('.volumn').on('mouseenter', function () {
        $('.volumn-control').show();
    })
    $('.volumn').on('mouseleave', function () {
        $('.volumn-control').hide();
    })

    // 改变音量
    $volumn.on('mousedown', function (e) {
        changeVolumn(e);
        $volumn.on('mousemove', function (e) {
            changeVolumn(e);

        })

        $volumn.on('mouseleave', function () {
            $volumn.off('mousemove');
        })
        $volumn.on('mouseup', function () {
            $volumn.off('mousemove');
        })
    })

    // 监听音量改变事件
    audio.onvolumechange = function () {
        if (audio.volume == 0) {//静音的时候
            $('.volumn i').removeClass('icon-icon-test5').addClass('icon-icon-test4');
        } else if (audio.volume < .3) {
            $('.volumn i').removeClass('icon-icon-test4 icon-icon-test6').addClass('icon-icon-test5');
        } else {
            $('.volumn i').removeClass('icon-icon-test5').addClass('icon-icon-test6');
        }
    }

    // 改变速度
    $speed.on('click', function () {
        $(this).find('.playbackRate').toggle();
        let $span = $(this).find('span');
        $('.playbackRate li').on('click', function () {
            $span.text($(this).text());
            audio.playbackRate = $(this).text();


        })
    })



    //时间更新事件
    audio.ontimeupdate = function () {
        // console.log("currentTime", this.currentTime);
        $('.current').text(makeTime(this.currentTime));

        $('.active .music-time>span:first-child').text(makeTime(this.currentTime));
        // 根据比例设置进度条的left
        let scale = this.currentTime / duration;
        let left = $layer.width() * scale;
        if (!isDown) {
            $btn.css({ left: left + 'px' });
            $mask.css({ width: left + 'px' })

        }

        let n = makeTime(this.currentTime, true);
        // console.log('n', n)

        // console.log('this.currentTime==>', this.currentTime);
        // 根据当前歌词时间列表选择激活类名，而且把要设置css样式
        if (currentLrc != null) {
            for (let i = 0; i < currentLrc.length; i++) {
                if (n < currentLrc[i] && i != 0) {
                    console.log(n, currentLrc[i])
                    // $('div').css("transform").replace(/[^0-9\-,]/g,'').split(',')[4];
                    $('.lrc-list').css({
                        transition: `all 1s linear`,
                        transform: `translateY(${(- 40 * (i - 1)) + lrcTop}px)`
                    })

                    $('.lrc-list>li').eq(i - 1).addClass('sel').siblings().removeClass('sel');

                    return;
                }
            }

            $('.lrc-list').css({
                transition: `all .5s linear`,
                transform: `translateY(${(- 40 * (currentLrc.length - 1)) + lrcTop}px)`
            })

            $('.lrc-list>li').eq(currentLrc.length - 1).addClass('sel').siblings().removeClass('sel');


        }

    }

    //播放结束事件
    audio.onended = function () {

        $('.next')[0].click();
    }

    $play.on('click', function () {
        if (!$(audio).attr('src')) {
            // 如果没有链接的话要返回 默认播放第一个

            let dom = $('.song-item').eq(0);
            if (dom) {
                dblEve(dom);
            }


            return;
        }


        if ($(this).hasClass('play')) {
            $(this).removeClass('play icon-icon-test2').addClass('paused icon-icon-test1');
            audio.play();
            isPlay = true;
            // 开始动画
            $('.active').find('.circle').css({
                animation: `rot 2s linear infinite`
            })

        } else {
            $(this).removeClass('paused icon-icon-test1').addClass('play icon-icon-test2');
            //暂停播放
            audio.pause();
            isPlay = false;

            // 暂停动画
            $('.active').find('.circle').css({
                animation: `none`
            })
        }
    })

    function move(e) {
        let w = $btn.width();

        let left = (e.offsetX - w / 2) > 0 ? (e.offsetX - w / 2) : 0;


        $btn.css({ left: left + 'px' });

        $mask.css({ width: left + 'px' })

        // 当鼠标松开时候才设置播发进度
        let scale = left / $layer.width();

        if (isLeave) {
            audio.currentTime = duration * scale;
            isLeave = false;
        }


    }

    $layer.on('mousedown', function (e) {
        move(e);
        isDown = true;
        e.preventDefault();

        $layer.on('mousemove', function (e) {
            move(e);
            e.preventDefault();
        })

        $layer.on('mouseup', function (e) {
            isLeave = true;
            isDown = false;
            move(e);
            $layer.off('mousemove');
            $layer.off('mouseleave');
        })

        $layer.on('mouseleave', function (e) {
            if (isDown) {
                isLeave = true;
                isDown = false;
                move(e);
                $layer.off('mousemove');
                $layer.off('mouseup');
            }

        })

    })

    // 重置下面播放器以及右边的歌词列表
    function resetBot() {

        $('.controls>div:nth-child(2) i').removeClass('paused icon-icon-test1').addClass('play icon-icon-test2');
        //暂停播放
        audio.pause();
        audio.src = '';
        isPlay = false;

        $('.music-name').text('熊猫音乐');
        $('.current').text('00:00');
        $('.total').text('00:00');
        audio.currentTime = 0;
        // 当前id没有
        currentId = null;

        //清空歌词
        $('.lrc-list').html('');
    }


    // 侧边栏列表删除事件
    $('.aside-list').on('click', '.del', function () {
        console.log('111');
        // 当前列表减1
        let $div = $(`.aside-nav>div[data-type="${typeLink[typeList]}"]`);


        let $parent = $(this).parents('.song-item');
        // 获取点击删除的东西的id
        let id = $parent.attr('data-id');

        if (id == currentId) {
            // 如果当前删除的id和现在播放的id一样，重置页面
            resetBot();
        }

        // 删除数据
        let index = listId.indexOf(id);

        delete listData[id];
        // 数组中删除一个
        listId.splice(index, 1);
        // 数字减一
        $div.find('span').text(listId.length);
        // 挂数据
        localStorage.setItem('userDate', JSON.stringify(userDate))


        // 节点删除
        $parent.remove();


    })

    // 侧边栏列表收藏事件
    $('.aside-list').on('click', '.love', function () {
        let $div = $(`.aside-nav>div[data-type="${typeLink[2]}"]`);

        let id = $(this).parents('.song-item').attr('data-id');

        if ($(this).hasClass('real-love')) {
            //有类名去类名
            $(this).removeClass('real-love');
            // 在我的收藏里面去除
            let index = userDate.collectList.listId.indexOf(id);

            delete userDate.collectList.listData[id];

            userDate.collectList.listId.splice(index, 1);
        } else {
            // 没有类名加类名
            $(this).addClass('real-love');
            // 加入我的收藏列表
            userDate.collectList.listData[id] = listData[id];

            // 保存当前列表上拥有的id
            userDate.collectList.listId.push(id);


        }
        // 改数字
        $div.find('span').text(userDate.collectList.listId.length);
        // 挂本地存储
        localStorage.setItem('userDate', JSON.stringify(userDate));

    })

    // 储存热门歌单列表
    var hotList = null;

    var startHotIndex = 0;

    // 一次生成12个
    var hotOnce = 12;

    // 格式化歌单收听者函数
    function makeNum(num) {
        if (num > 99999) {
            return Math.floor(num / 10000) + '万';
        }

        return num;
    }

    // 创建一轮歌单函数
    function creatHotList() {
        let newHotIndex = startHotIndex + hotOnce;

        if (newHotIndex > hotList.length) {
            newHotIndex = hotList.length;
        }

        for (let i = startHotIndex; i < newHotIndex; i++) {
            // 歌单数据里面需要的属性
            /*
            歌单id        obj.data[i].id
            标签的title   obj.data[i].description
            背景图片      obj.data[i].coverImgUrl
            真正的title   obj.data[i].name
            播发计数      obj.data[i].playCount

            */

            let $div = (` <div data-id="${hotList[i].id}" class="song-sheet-item">
                                <div class="song-sheet-img" style="background: url('${hotList[i].coverImgUrl}');
                                background-repeat: no-repeat;
                                background-size: cover" title="${hotList[i].description}">
                                    <div class="song-sheet-count clearfix">
                                        <i class="iconfont icon-erji fl"></i>
                                        <span class="fl">${makeNum(hotList[i].playCount)}</span>
                                    </div>
                                </div>
                                <div class="song-sheet-name">
                                        ${hotList[i].name}
                                </div>
                            </div>`);

            $('.song-sheet-list').append($div);

        }

        if (newHotIndex === hotList.length) {
            $('.song-sheet-list').append($(` <div style="clear:both">
            <p class="deadly-line">这是底线了</p>
        </div>`));
        }

        startHotIndex = newHotIndex;
    }

    // 显示加载动画
    $('.loading').show();

    // 根据请求来的热门歌单生成歌单列表
    $.ajax({
        type: 'get',
        url: 'https://v1.itooi.cn/netease/songList/highQuality',
        data: {
            cat: '全部',
            pageSize: 100
        },
        success: (data) => {
            hotList = data.data;
            // 停止加载动画
            $('.loading').hide();
            // 先执行一轮
            creatHotList(hotList);
        }


    })
    // 懒加载数据
    $('.song-sheet-list').on('scroll', throttle(function () {
        // 没有那么多数据时候直接返回去
        if (startHotIndex === hotList.length) {
            return;
        }

        let elementsOffsetTop = $(this).find('.song-sheet-item:last-child')[0].offsetTop;

        let scrollTop = $(this).scrollTop();

        let y = $(this).find('.song-sheet-item:last-child').height();

        let h = $(this).height();

        // console.log($(this).height());

        if ((scrollTop + h + 100) > (elementsOffsetTop + y)) {
            console.log('加载了');
            creatHotList();
        }


    }, 500))

    // 给歌单列表绑定点击事件
    $('.song-sheet-list').on('click', '.song-sheet-item', function () {
        // 拿到歌单id
        let id = $(this).attr('data-id');

        // 变成歌曲列表
        $('.section-nav>div').eq(1).trigger('click');

        // 情空列表
        $('.main-song-list').html('');

        // 弄加载动画
        $('.loading').show();

        // 拿到id之后
        // ajax请求;获取歌曲信息
        // 请求渲染歌单
        $.ajax({
            type: 'get',
            url: 'https://v1.itooi.cn/netease/songList',
            data: {
                id,
                format: 1
            },
            success: (data) => {
                console.log("请求回来的数据==>", data)

                allData = data.data;
                // 开始截取数据下标变为0
                startIndex = 0;

                // 停止加载动画
                $('.loading').hide();

                initList(allData);
            }
        })

    })


    //mv列表渲染展示
    $.ajax({
        type: 'get',
        url: 'https://v1.itooi.cn/netease/mv/top',
        data: {
            pageSize: 30
        },
        success(data) {

            let msg = data.data;

            for (let i = 0; i < msg.length; i++) {
                let div = `    <li class="mv-item" data-id="${msg[i].id}">
                                    <div style="background-image:url('${msg[i].cover}');background-repeat:no-repeat;background-size:cover" class="mv-img"></div>
                                    <div class=" mv-item-title">
                                    ${msg[i].name}-${msg[i].artistName}
                                    </div>
                                </li>`;

                $('.mv-list').append(div);

            }


        }
    })

    //mv列表点击事件
    $('.mv-list').on('click', '.mv-item', function () {

    })



})

