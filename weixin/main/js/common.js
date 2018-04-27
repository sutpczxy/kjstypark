
/*
 * index container
 */

window.$index = {
	$container:$('div.index-container'),			//index 框架
	$helpContainer:$('#help-container'),			//help 框架
	$floor:$('#floorSwitch-module'),				//floor 切换
	$search:$('#searchButton-module'),				//search 搜索框
	$location:$('#location-button'),				//location 定位自己
	$help:$('#help-button'),						//help 帮助按钮
	$zoom:$('#zoom-control'),						//zoom 放大缩小按钮
	$change:$('#change-module'),					//change 底部模块集合
	$locationPOI:$('#locationPOI-control'),			//locationPOI 我的位置详情
	$poiInfo:$('#poiInfo-control'),					//poi poi详情展示
	$startEndPoint:$('#startEndPoint-module'),		//start_end 选择起点终点
	$startNav:$('#startNav-control'),				//start_nav 开始导航按钮
	$queryStartFloor:$('#query-start-floor'),		//query_start 查看起点层
	$queryEndFloor:$('#query-end-floor'),			//query_end 查看终点层
	$navingBomButton:$('#navingBomButton-control'),	//navingBomButton 导航中底部操作按钮
	$navingTopTips:$('#naviingTips-module'),		//navingTips 导航中，提示模板
	$navOverTopTips:$('#navOverTips-module'),		//navOverTips 导航结束提示
	$allPoiList:$('#allPoiList-control'),			//allPoiList poi列表
	$selectPointList:$('#selectPointList-control'),	//selectPointList 地图选点模板
	$toThisPlace:$('#toThisPlace-control'),			//toThisPlace 分享的poi 去这里按钮
	$appDownloadTips:$('#app-download-tips'),		//app-tips app下载提示
	
};



/*
 * search container
 */

window.$search = {
	$container:$('div.search-container'),			//search 框架
	$head:$('#head-module'),						//head 顶部搜索模块
	$result:$('#sResult-control'),					//result 搜索结果
	$history:$('#sHistory-control'),				//history 历史记录
	$facility:$('#facility-control'),				//facility 公共设施
	$locPoint:$('#locationPoint-control'),			//地图选点与我的位置
	$selectResultFloor:$('#select-floor-module'),	//选择结果分布楼层
	
};



/*
 * search container
 */
window.$nav = {
	$LocationAlert:{close:function(){}},			//定位点提示
	$BluetoothAlert:{close:function(){}},			//蓝牙开启提示
	$locTimeOut:window.setTimeout(function(){},10),	//定位延迟
	$bthTimeOut:window.setTimeout(function(){},10), //蓝牙延迟
	$Audio:document.getElementById('brtAudio'),		//音频对象
	$audioPlayState:false,							//音频播放状态
	$arrivalCount:0,                                //记录  导航位置连续  在导航终点6米内的次数
	$deviateCount:0                                 //记录 导航是连续偏离导航路线10米外的次数
};



/*
 * variable 常用变量
 */

window.$variable = {
	$startPOI:null,									//起点  poi信息
	$endPOI:null,									//终点  poi信息
	$startPoint:{},									//起点  坐标/楼层索引
	$endPoint:{},									//终点  坐标/楼层索引
	$locationPoint:{},								//定位点 坐标/楼层索引
	$navSelectPointType:'',							//导航选点类型
	$navSelectPointText:'',							//导航选点文本
	$selectPointCallee:null,				//导航选点模式 我的位置回调
	
	$routeResult:null,								//路径规划结果
	
	$ajaxQueryCallback:[],							//异步 搜索key回调
	$queryFloorID:'',								//搜索楼层ID
	$queryKeyName:'',								//查询key
	$POI_Cache:[],									//搜索结果 poiID为key值
	$POI_Cache2:[],									//导航模式搜索结果
	$POI_Cache3:[],									//地图选点POI列表
	$POI_FID_Cache:[],								//搜索结果楼层分类 floorID 为key值
	$POI_Facility_Cache:[],							//公共设施数据缓存
	
};



/*
 * nav state 导航状态
 */
window.$state = {
	MAP_READY:false,								//地图是否已加载
	IS_SEARCH_ING:false,							//是否搜索中
	IS_NAV_SEARCH_SHOW:false,						//是否导航搜索模式
	MAP_SELECT_POINT:false,							//是否导航选点模式
	MAP_CLICK:true,									//地图是否可以点击查询poi信息
	
	USER_LOCATION:false,							//用户是否已定位
	USER_LOCATION_FLOOR:null,						//定位点楼层
	USER_NAVING:false,								//导航中 状态
	AUTO_NAV:false,									//自动导航
	AUTO_CHANGE_FLOOR:true,							//导航是否自动切换楼层 默认true
	
	USER_MOVEMENT_TIME:null,						//监控手机细微动作
};



window._ESDATA = {};

_ESDATA.version = 'ZH-3D';

_ESDATA.deviceId = localStorage.getItem('deviceId');
if(!_ESDATA.deviceId || _ESDATA.deviceId == 'undefined'){
    var _id = new Date().getTime();
    localStorage.setItem('deviceId',_id);
    _ESDATA.deviceId = _id;
}


_ESDATA.peopleId = sessionStorage.getItem('peopleId');
if(!_ESDATA.peopleId || _ESDATA.peopleId == 'undefined'){
    var _id = new Date().getTime();
    sessionStorage.setItem('peopleId',_id);
    _ESDATA.peopleId = _id;
}

_ESDATA.getAgent = function() {
    if(/(Android)/i.test(navigator.userAgent)){
        return 1; // android
    }
    else if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
        return 2; // ios
    }
    else{
        return 3; // pc
    }
};

_ESDATA.post = function(url, data, callback){

    callback = callback || function(){};

    var httpRequest = new XMLHttpRequest();

    httpRequest.open("POST", url, true);
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

    var str = '';
    for(var d in data){
        str += d + '=' + data[d] + '&';
    }

    httpRequest.onreadystatechange = function(){
        if (httpRequest.readyState === 4 && httpRequest.status !== 404) {
            callback(JSON.parse(httpRequest.responseText));
        }
    };

    httpRequest.send(str);
};

/*
 * extend object
 */
window.$extend = {
	setOptions:function(opt1, opt2){
		for(var i in opt2) opt1[i] = opt2[i];
		return opt1;
	},
};

/*
 * document event
 */

//document click
document.addEventListener("click",function(){
	//floor list hide
	$(".clickRemoveShow").removeClass("show");
},false);

//兼容css :active
document.addEventListener("touchstart",function(){$("input").blur()},false);

//hash change
function hashChange(){
	switch(location.hash){
		case "#search":
			
			$search.$container.addClass('show');
			
			//进入搜索页，取消搜索状态 (用户操作搜索结果之后再开启搜索状态)
			$state.IS_SEARCH_ING = false;
			
			$index.$allPoiList.removeClass('view');
			
			
			//导航搜索模式
			if($state.IS_NAV_SEARCH_SHOW){
				
				$search.$locPoint.show();
				$search.$facility.hide();
				
				$search.$result.find('ul').addClass('showBtn').find('li')
					.find('.btn').removeClass('start').removeClass('end').addClass($variable.$navSelectPointType).text($variable.$navSelectPointText);
				
				if($variable.$queryKeyName != ''){
					$search.$head.find('.input-box').removeClass('showSearch').addClass('showSearch2');
				}
				
				$variable.$POI_Cache2 = $variable.$POI_Cache;
				
				//进入搜索页取消选点模式
				$state.MAP_SELECT_POINT = false;
				
			}
			else{
				
				$search.$facility.show();
				$search.$locPoint.hide();
				
				$search.$result.find('ul').removeClass('showBtn').find('li')
					.find('.btn').removeClass('start').removeClass('end');
				
				if($variable.$queryKeyName != ''){
					$search.$head.find('.input-box').removeClass('showSearch2').addClass('showSearch');
					$search.$facility.hide();
				}
				
				$variable.$POI_FID_Cache = [];
				
			}
			
		break;
		
		default:
		
			$search.$container.removeClass('show');
			
			//地图选点模式
			if($state.MAP_SELECT_POINT){
				$state.IS_NAV_SEARCH_SHOW = false;
				return;
			}
			
			if($state.MAP_READY && !$state.IS_SEARCH_ING){
				
				if($state.IS_NAV_SEARCH_SHOW){
					
					console.log('导航模式搜索 返回首页处理');
				}
				else{
					$extend.fn_resetInitMap();
				}
			}
			
			
			//取消导航搜索模式
			$state.IS_NAV_SEARCH_SHOW = false;
			
			
		break;
	}
}

hashChange();
window.onhashchange=function(e){
	hashChange();
};


// 微信JS SDK 调用
window.JsApi = function (opts) {

    // 默认配置
    var _defaults = {
        debug: false,
        jsApiList: [
            'hideMenuItems',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'showMenuItems',
            'checkJsApi',              //必填
            'startMonitoringBeacons',  //必填
            'stopMonitoringBeacons',   //必填
            'onBeaconsInRange',        //必填
            'startSearchBeacons'       //必填
        ]
    };

    var promise = $.when(function (opts) {
        var dtd = $.Deferred();
        // 配置
        wx.config($.extend(true, {}, _defaults, opts));
        wx.ready(function () {
            dtd.resolve();
        });
        return dtd.promise();
    }(opts));

    promise["forbid"] = function (menus) {
        // 隐藏菜单 列表
        var _menus = [
            'menuItem:copyUrl', // 复制链接
            'menuItem:share:qq', // 分享到QQ
            'menuItem:favorite', // 收藏
            'menuItem:share:weiboApp', // 分享到Weibo
            'menuItem:share:facebook', //分享到FB
            'menuItem:openWithSafari', //在Safari中打开
            'menuItem:openWithQQBrowser', //在QQ浏览器中打开
            'menuItem:readMode', //阅读模式
            'menuItem:share:email', //邮件
            'menuItem:share:QZone', // 分享到 QQ 空间
            'menuItem:share:timeline',//分享到朋友圈
            'menuItem:share:appMessage'//发送给朋友
        ];
        menus = menus || _menus;
        this.done(function () {
            // 隐藏菜单
            wx.hideMenuItems({
                menuList: menus,
                success: function (res) {
                },
                fail: function (res) {
                }
            });
        });
        return this;
    };

    promise["share"] = function (opts) {

        this.done(function () {


            // 展示菜单
            wx.showMenuItems({
                menuList: ['menuItem:share:timeline', 'menuItem:share:appMessage'] // 要显示的菜单项，所有menu项见附录3
            });

            // 分享到朋友圈
            wx.onMenuShareTimeline({
                title: opts['title'], // 分享标题
                link: opts['link'], // 分享链接
                imgUrl: opts['imgUrl'], // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数 增加抽奖机会
                    if (typeof opts['success'] == 'function') {
                        opts['success'].call(this, 'Moment');
                    }
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                    if (typeof opts['cancel'] == 'function') {
                        opts['cancel'].call(this, 'Moment');
                    }
                }
            });
            // 分享给朋友
            wx.onMenuShareAppMessage({
                title: opts['title'], // 分享标题
                desc: opts['desc'], // 分享描述
                link: opts['link'], // 分享链接
                imgUrl: opts['imgUrl'], // 分享图标
                type: opts['type'] || 'link', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    // 用户确认分享后执行的回调函数 增加抽奖机会
                    if (typeof opts['success'] == 'function') {
                        opts['success'].call(this, 'Friend');
                    }
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                    if (typeof opts['cancel'] == 'function') {
                        opts['cancel'].call(this, 'Friend');
                    }
                }
            });
            // APP 分享设置
            opts['link'].indexOf('poiId') > -1 && typeof wx.share == 'function' && wx.share(JSON.stringify(opts));
        });

        return this;
    };

    promise['beacon'] = function (complete) {
        this.done(function () {
            //开启扫描beacon功能
            wx.startSearchBeacons({
                ticket: "",
                complete: function (data) {
                }
            });
            //监控扫描beacon
            wx.onSearchBeacons({
                complete: complete
            });
        });

        return this;
    };

    return promise;
};



// 扩展请求
window.asyncJSON = function (url, data, type) {
    var options = {
        url: url,
        type: 'get',
        dataType: 'json',
        beforeSend: function () {
            // LoadingLayer.show();
        },
        timeout: 10000 // 10s
    };

    if (typeof data == 'object') {
        options['data'] = data;
        options['type'] = 'post';
    }

    if (typeof data == 'string') {
        options['type'] = data;
    }

    // 类型指定
    if (typeof type == 'string') {
        options['type'] = type;
    }

    return $.ajax(options);

};