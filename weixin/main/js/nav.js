//----------------------------wwj----------------------------
var _beaconDict=[];
var timestamp;//当前时间戳
var nonceStr;//用于生成签名的随机数
var signature;//签名
var appid;
var wxid=getQueryString("wxid");
if(!wxid){
	wxid=1;
}
//获取签名
function getConfigParam(){
	    var signUrl=window.location.href;
	    if(signUrl && signUrl.length>0){
	    	signUrl=signUrl.split("#")[0];
	    	if(signUrl.indexOf("&")>-1){
	    		signUrl=signUrl.replace(/&/g, '%26');
	    	}
	    }
	    var url="../../../weixin/weixin!getConfigParam.action?bid="+esmapID+"&wxid="+wxid+"&signUrl="+signUrl;
	    ajax("../../../plug-in/esmap/data/10001/90002","",false,function(result){
	    	if(result){
				  timestamp=result.timestamp;
				  nonceStr=result.nonceStr;
				  signature=result.signature;
				  appid=result.appid;
				  if(result.name){
					  $("title").html(result.name);
				  }
			}
		});
}

//获取站点beacon列表   
function getBeaconFileName(bid) {
	var url="../../../beacon/beacon!getBeaconList.action?bid="+bid;
	ajax2(url,"",true,function(data){
		 var datas = new Uint8Array(data);
		 var restult = beacon.BeaconSet.decode(datas);
		 var beaconlist=restult.beaconlist;
		 for (var key in beaconlist) {
			 var b=beaconlist[key];
			 var k = {
                     beacon: {
                         uuid: b.uuid,
                         major: b.major,
                         minor: b.minor
                     },
                     location: {
                         x: b.x,
                         y: b.y,
                         floor: b.floornum,
                         dbbase:b.dbbase
                     }
              };
			 _beaconDict[b.major + "_" + b.minor + ""] = k;
		 }
//		 var j=null;
//		 $location.SearchBeacons(null, j);
//		 alert(JSON.stringify($location._location_pos));
	});
}
function ajax2(url,data,flag,func){
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp=new XMLHttpRequest();
	}
	//兼容IE
	else if(window.ActiveXObject){
		xmlhttp=new ActiveXObject('Microsoft.XMLHTTP');
	}else{
		return;
	}
	xmlhttp.onreadystatechange=function(){
		//成功返回数据
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			func(xmlhttp.response);
		}
	};
	xmlhttp.open('GET',url,flag);
	xmlhttp.responseType="arraybuffer";
	xmlhttp.setRequestHeader("Content-Type","application/octet-stream");
	if(data){
		xmlhttp.send("data="+JSON.stringify(data));
	}else{
		xmlhttp.send();
	}
}
//原生ajax
function ajax(url,data,flag,func){
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp=new XMLHttpRequest();
	}
	//兼容IE
	else if(window.ActiveXObject){
		xmlhttp=new ActiveXObject('Microsoft.XMLHTTP');
	}else{
		return;
	}
	xmlhttp.onreadystatechange=function(){
		//成功返回数据
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			func(JSON.parse(xmlhttp.responseText));
		}
	};
	xmlhttp.open('POST',url,flag);
	xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	if(data){
		xmlhttp.send("data="+data);
	}else{
		xmlhttp.send();
	}
	
}
//获取离导航路径最近点
function getNavNearPoint(point){
	var routepoints={};
	if(navi && navi.navidata){
		routepoints=navi.navidata;
	}
	//路径楼层索引
	var _floorIndex = -100000;
	//最小距离
	var _minDistance = 100000000;
	//最小距离点索引
	var _minDistIndex = -100000;
	//路径线路最近的一个点
	var _currentPoint = {};
	//获取交叉点
	function _getClosePoint(point, point1, point2){
		var cross = (point2.x - point1.x) * (point.x - point1.x) + (point2.y - point1.y) * (point.y - point1.y);
		if(cross <= 0) return point1;
		var d2 = (point2.x - point1.x) * (point2.x - point1.x) + (point2.y - point1.y) * (point2.y - point1.y);
		if(cross >= d2) return point2;
		var r = cross / d2;
		var px = point1.x + (point2.x - point1.x) * r;
		var py = point1.y + (point2.y - point1.y) * r;
		return {x:px, y:py};
	}
	//先获取定位点与路径点 最小距离的点索引
	for(var i = 0; i < routepoints.length; i++){
		//定位点相同路径楼层
		if(point.fnum == routepoints[i].fnum){
			var _points = routepoints[i].pointList;
			for(var k = 0, len = _points.length; k < len; k++){
				var	_point1 = null,
					_point2 = null;
				if(k == len - 1){
					 _point1={x:_points[k].x,y:_points[k].y};
					 _point2=_point1;
				}
				else{
					_point1={x:_points[k].x,y:_points[k].y};
					_point2={x:_points[k+1].x,y:_points[k+1].y};
				}
				var _point = _getClosePoint(point, _point1, _point2);
				var _d = Math.sqrt((point.x - _point.x) * (point.x - _point.x) + (point.y - _point.y) * (point.y - _point.y));
				if(_d <= _minDistance){
					_minDistance = _d;
					_minDistIndex = k;
					_floorIndex = i;
					_currentPoint = _point;
				}
			}
		}
	}
	_currentPoint.fnum=point.fnum;
	var result={
			point:_currentPoint,
			minDistance:_minDistance,
			routeFloorIndex:_floorIndex,
			pointIndex:_minDistIndex
		};
	return result;
	//return _currentPoint;
}

//获取已经过路径
function getPastRoute(nearPoint){
	var _routeResult={};
	if(navi && navi.navidata){
		_routeResult=navi.navidata;
	}
	//返回结果
	var _backResult = {
		sumDistCount:0,		//总距离
		pastDistCount:0,	//已路过距离
		surDistCount:0,		//剩余距离
		points:[],			//各路段集合
		currentPoint:null	//当前路段
	};
	for(var i = 0; i < _routeResult.length; i++){
		var _points = _routeResult[i].pointList;
		for(var k = 0, len = _points.length; k < len; k++){
			var	_point1 = null,
				_point2 = null;
			if(k == len - 1){
				 _point1={x:_points[k].x,y:_points[k].y};
				 _point2=_point1;
			}
			else{
				_point1={x:_points[k].x,y:_points[k].y};
				_point2={x:_points[k+1].x,y:_points[k+1].y};
			}
			var _distance = Math.sqrt((_point1.x - _point2.x) * (_point1.x - _point2.x) + (_point1.y - _point2.y) * (_point1.y - _point2.y));
			var _object = {
				//angle:_angle,
				distance:_distance
			}
			//当前点路段
			if(nearPoint.routeFloorIndex == i && nearPoint.pointIndex == k){
				_backResult.currentPoint = _object;
				//_isNextPoint = true;
				var _d = Math.sqrt((_point1.x - nearPoint.point.x) * (_point1.x - nearPoint.point.x) + (_point1.y - nearPoint.point.y) * (_point1.y - nearPoint.point.y));
				//全线段已经过的距离
				_backResult.pastDistCount = _backResult.sumDistCount + _d;
				//当前段剩余距离
				_backResult.currentPoint.surDistance = _object.distance - _d;
			}
			_backResult.points.push(_object);
			//全程线段距离
			_backResult.sumDistCount += _distance;
		}
	}
	_backResult.surDistCount = _backResult.sumDistCount - _backResult.pastDistCount;
	return _backResult;
}
//----------------------------wwj----------------------------
//定位
var $location = null;
var initLoc=0;
/*
 * init nav_location
 */
function _init_nav_location(){
	// 定位
	$location = new WXLocation();
}
//执行 nav_function
_init_nav_location();
_init_wx_ready();
getBeaconFileName(esmapID);
/*
 * init wx_ready
 */
function _init_wx_ready(){
	getConfigParam();
	//微信 参数配置
	wx.config({
		debug: false,
		appId: appid,					//必填
		timestamp:timestamp,			//必填
		nonceStr: nonceStr,			//必填
		signature:signature,			//必填
		jsApiList: [
			'checkJsApi',				//必填
			'startSearchBeacons',		//必填
			'stopSearchBeacons',		//必填
			'onSearchBeacons',			//必填
			'onMenuShareAppMessage',
			'onMenuShareTimeline'
		]
	});
	wx.ready(function(){
		//开启beacon扫描
		$extend.fn_startSearchBeacons();
		var _locTimeOut = window.setTimeout(function(){},10);
		//监控扫描beacon
		wx.onSearchBeacons({
			complete: function(argv) {
				//window.setTimeout(function(){alert(JSON.stringify(argv));},2000);
				window.clearTimeout($nav.$bthTimeOut);
				$nav.$bthTimeOut = window.setTimeout(function(){
					window.clearTimeout(_locTimeOut);
					//未检查到定位
					$state.USER_LOCATION = false;
					$extend.fn_startSearchBeacons();
				},10000);
				//关闭蓝牙提示
				$nav.$BluetoothAlert.close();
				//计算定位
				$location.SearchBeacons(argv, function(point){
					point=$location._location_pos;
					//window.setTimeout(function(){alert(JSON.stringify(point));},2000);
					if(point){
						window.clearTimeout($nav.$locTimeOut);
						LoadingLayer2.hide();
						$nav.$LocationAlert.close();
						window.clearTimeout(_locTimeOut);
						_locTimeOut = window.setTimeout(function(){
							//未检查到定位
							$state.USER_LOCATION = false;
							$extend.fn_locationTips();
						},20000);
						//手机保持静止状态
						if($state.USER_MOVEMENT_TIME && (new Date().getTime()) - $state.USER_MOVEMENT_TIME >= 5000){
		                    return;
		                }
						//用户已定位
						$state.USER_LOCATION = true;
						//定位点坐标
						$variable.$locationPoint = point;
						if(initLoc==0){
							var xy=lonLat2Mercator($variable.$locationPoint.x,$variable.$locationPoint.y)
					        addLocMarker(xy[0],xy[1],$variable.$locationPoint.floor);
							initLoc=1;
						}
						//判断iPhone|iPad|iPod|iOS
                        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
                            window.addEventListener('deviceorientation', function(e){
                                $extend.fn_RotateMarker(e.webkitCompassHeading);
                                window.removeEventListener('deviceorientation',arguments.callee,false);
                            });
                        }
                        //android
                        else{
                            if(argv.beacons[0].heading){
                                $extend.fn_RotateMarker(argv.beacons[0].heading);
                            }
                        }
					}
				});
			}
		});
        wx.onMenuShareAppMessage({
            title: $shareInfo.title, // 分享标题
            desc: $shareInfo.desc, // 分享描述
            link: $shareInfo.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: '../images/icon_default.png', // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        wx.onMenuShareTimeline({
            title: $shareInfo.title, // 分享标题
            link: $shareInfo.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: '../images/icon_default.png', // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
	});
}
/*
 * extend function
 */
function _nav_extend(){
	//监控手机运动
	window.addEventListener('devicemotion',function (event) {
	    if(event.acceleration.y >= 0.6 || event.acceleration.y <= -0.6){
			$state.USER_MOVEMENT_TIME = new Date().getTime();
		}
	
	},false);
	//开启beacon扫描
	$extend.fn_startSearchBeacons = function(){
		//关闭蓝牙提示
		$nav.$BluetoothAlert.close();
		//关闭定位提示
		$nav.$LocationAlert.close();
		//停止扫描beacon功能
		wx.stopSearchBeacons({
			complete: function(res){}
		});
		//开启扫描beacon功能
		wx.startSearchBeacons({
			ticket: "",
			complete: function(res){
				//window.setTimeout(function(){alert(JSON.stringify(res));},2000);
				//未开启蓝牙
				if(res.errMsg.indexOf('bluetooth power off') > -1){
					$nav.$BluetoothAlert = AlertLayer({
		                content:"<p class='bluetooth-tips-p1'>检测到您蓝牙已关闭</p><p class='bluetooth-tips-p2'>请开启蓝牙后再试.</p>",
		                button:[
							{
								name:'我知道了',
								callback:function(){}
							}
		                ]
		            });
				}else if(res.errMsg.indexOf('location service disable') > -1){
                    $nav.$BluetoothAlert = AlertLayer({
                        content:"<p class='bluetooth-tips-p1'>定位服务未打开</p><p class='bluetooth-tips-p2'>请前往设置打开定位服务.</p>",
                        button:[
                            {
                                name:'我知道了',
                                callback:function(){}
                            }
                        ]
                    });
                }
				else{
					$extend.fn_locationTips();
				}
			}
		});
	};
	//定位提示
	$extend.fn_locationTips = function(){
		//正在定位提示
		LoadingLayer2.show('正在定位...',$index.$container[0], function(){
			window.clearTimeout($nav.$locTimeOut);
		});
		$nav.$locTimeOut = window.setTimeout(function(){
			LoadingLayer2.hide();
			$nav.$LocationAlert = AlertLayer({
                content:"<p style='color:#ff3333'>未检查到您的位置</p><p style='color:#999999; font-size:0.8rem; margin-top:0.5rem;'>请确保网络流畅且处于场景内.</p>",
                button:[
					{
						name:'取消',
						callback:function(){}
					},
					{
						name:'再搜一次',
						callback:function(){
							$extend.fn_locationTips();
						}
					}
                ]
            });
		}, 10000);
	};
	//设置定位图标旋转
	$extend.fn_RotateMarker = function(angle){
		var _angle =360- angle-15;
		undateLocAngle(_angle);
		$variable.$locationPoint.angle=_angle;
	};
}
// 执行extend
_nav_extend();