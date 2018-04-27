var $map = null;
var $marker = {
	arrayIcon:[],
	selectedIcon:null,
	startIcon:null,
	endIcon:null,
	navEndIcon:null,
	locationIcon:null,
	poiArrIcon:[]
};
//执行 index function
_init_index_container();
function _init_index_container(){
	//首页搜索框点击
	$index.$search.on('click',function(){
		location.hash = 'search';
	})
	/*close*/
	.on('click','.close',function(e){
		e.stopPropagation();
		$extend.fn_resetInitMap();
	});
	//我的位置
	$index.$location
		.on('click',function(){
			//alert($state.USER_LOCATION);
			//if($state.USER_LOCATION){
				clearPoints('point');
				$index.$poiInfo.hideControl();
				if($index.$startEndPoint.hasClass('show')){
					$index.$startNav.showControl();
				}
				function _callee(){
						var poiInfo = $extend.getLocationPOI();
						$index.$locationPOI.showControl().find('.right').find('p').find('span').text(poiInfo.name + " " + poiInfo.FloorName);
						if(!$state.USER_NAVING){
							addLocMarker(poiInfo.x,poiInfo.y,poiInfo.FloorNum);
						}else{
							//alert(Number(poiInfo.x)+"--"+Number(poiInfo.y));
							map.moveTo({
						        x: Number(poiInfo.x),
						        y: Number(poiInfo.y),
						       FloorNum:poiInfo.FloorNum,
						       time: 0.5
						    });
							changeFloor(poiInfo.FloorNum);
						}
						//drawPoint(poiInfo.x,poiInfo.y,poiInfo.FloorNum);
						//alert(JSON.stringify(poiInfo));
						//showNavDiv(poiInfo);
				}
				_callee();
			//}else{
				//$extend.fn_locationTips();
			//}
		})
		.on('touchstart',function(){
			$index.$location.css("backgroundImage",'url(images/location_icon2.png)');
		})
		.on('touchend',function(){
			$index.$location.css("backgroundImage",'url(images/location_icon.png)');
		});
	//我的位置POI
	$index.$locationPOI
		/*关闭*/
		.on('click','.close',function(){
			$index.$locationPOI.hideControl();
		})
	//poi详情
	$index.$poiInfo
		/*关闭*/
		.on('click','.close',function(){
			$index.$poiInfo.hideControl(function(){
				if($index.$startEndPoint.hasClass('show')){
					$index.$startNav.showControl();
				}
				if($state.USER_NAVING){//如果是 导航中状态
					$index.$navingBomButton.showControl();
				}
			});
		})
		/*返回*/
		.on('click','.btn-back',function(){
			if($index.$allPoiList.hasClass('view')){
				$index.$allPoiList.showControl();
			}
			else{
				location.hash = 'search';
			}
		})
		/*到这去*/
		.on('click','.goBtn',function(){
			var poiInfo = $index.$poiInfo.data('poiInfo');
			$extend.fn_setNavStartAndEndPoint(poiInfo,'end');
		})
		/*设为起点*/
		.on('click','.btn-start',function(){
			var poiInfo = $index.$poiInfo.data('poiInfo');
			$extend.fn_setNavStartAndEndPoint(poiInfo,'start');
		})
		/*设为终点*/
		.on('click','.btn-end',function(){
			var poiInfo = $index.$poiInfo.data('poiInfo');
			$extend.fn_setNavStartAndEndPoint(poiInfo,'end');
		})
	//顶部 选择起点终点模块  wwj
	$index.$startEndPoint
		/*返回*/
		.on('click','.btn-back .btn',function(){
			navi.clearAll();
			$index.$startEndPoint.removeClass('show');
			var poiInfo = $index.$poiInfo.data('poiInfo');
			if(poiInfo && ($variable.$startPOI || $variable.$endPOI)){
				$extend.fn_showPOIInfoControl(poiInfo);
			}
			else{
				$index.$poiInfo.hideControl();
				$index.$startNav.hideControl();
			}
			$variable.$startPOI = null;
			$variable.$endPOI = null;
			$index.$startEndPoint.find('.show-box').find('.start-box').find('input').val('');
			$index.$startEndPoint.find('.show-box').find('.end-box').find('input').val('');
			$index.$startNav.find('.slide-button').css("display","none");
		})
		/*切换*/
		.on('click','.btn-change .btn',function(){
			$extend.fn_changeStartEndPoint();
		})
		/*选择起点*/
		.on('click','.show-box .start-box',function(){
			$extend.fn_navSelectPoint('start');
		})
		/*选择终点*/
		.on('click','.show-box .end-box',function(){
			$extend.fn_navSelectPoint('end');
		});
	
	//wwj  daohang 
	function setOptions(opts1,opts2){
		for(var i in opts2){
			opts1[i] = opts2[i];
		}
		return opts1;
	}
	//开始导航 wwj
	$index.$startNav
		.on('click','.start-btn',function(){//人行导航
			setNaviStart();
		})
		.find('input').change(function(){
			if($index.$startNav.find('input').is(':checked')){//人行
				navi.mode=1;
				$("#car1").css("background","#48c42c");
				$("#ren1").css("background","#48c42c");
				$(".slide-button").css("background","#48c42c");
			}else{//车行
				navi.mode=2;
				$("#car1").css("background","#1a8bfd");
				$("#ren1").css("background","#1a8bfd");
				$(".slide-button").css("background","#1a8bfd");
			}
			$extend.fn_requestRoute();
		});
//		.on('click','.slide-button',function(){//车行导航
//			if(!navi){
//				navi.mode=2;
//			}
//			setNaviStart();
//		});
	//导航中，底部 操作按钮
	$index.$navingBomButton
		/*关闭*/
		.on('click','.close',function(){
			$extend.fn_stopNavResetRoute();
		})
		/*全览路线*/
		.on('click','.btn-box .b-overview',function(){
				$extend.fn_overviewRoute();
		})
		/*返回地图*/
		.on('click','.btn-box .b-backmap',function(){
			$index.$navOverTopTips.removeClass('show');
			$index.$navingBomButton.hideControl();
			$index.$startEndPoint.find('.item-box').find('input').val('');
			$extend.fn_resetInitMap();
		})
	//导航中，顶部方向提示
	$index.$navingTopTips
		/*收缩*/
		.on('click','.bom-box',function(){
			$index.$navingTopTips.toggleClass('hideTop');
		})
		/*方向校准*/
		.on('click','.top-box .btn',function(){
			console.log('方向校准')
		});
	//地图选点
	$index.$selectPointList
		/*返回*/
		.on('click','.head-box .back',function(){
			//开启地图搜索模式
			$state.IS_NAV_SEARCH_SHOW = true;
			$index.$startEndPoint.addClass('show');
			$index.$startNav.showControl();
			$index.$search.show();
			$('#map-select-point-tips').hide();
			location.hash = 'search';
		})
		/*标题头*/
		.on('click','.head-box .title',function(){
			$index.$selectPointList.find('.content-box').toggleClass('hide');
		})
		/*列表 li*/
		.on('click','.content-box li',function(){
			var _poiID = $(this).attr('poi-id');
			var _poiInfo = $variable.$POI_Cache3[_poiID];
			$extend.fn_setNavStartAndEndPoint(_poiInfo,$variable.$navSelectPointType);
			$index.$search.show();
			$('#map-select-point-tips').hide();
			//关闭地图选点模式
			$state.MAP_SELECT_POINT = false;
		});
	
}

//设为起点、终点的公共方法 wwj
$extend.fn_setNavStartAndEndPoint = function(poiInfo, type){
	var _$start = $index.$startEndPoint.find('.show-box').find('.start-box'),
		_$end = $index.$startEndPoint.find('.show-box').find('.end-box');
	//设为起点
	function _setStartCallee(poi){
		_$start.find('input').val(poi.name + " " + poi.FloorName);
		$variable.$startPOI = poi;
		$variable.$startPoint = {
			x:poi.x,
			y:poi.y,
			floor:poi.FloorNum
		};
		clearPoints(['point','startPoint']);
		drawPoints(poi.x,poi.y,poi.FloorNum,type);
	}
	//设为终点
	function _setEndCallee(poi){
		_$end.find('input').val(poi.name + " " + poi.FloorName);
		$variable.$endPOI = poi;
		$variable.$endPoint = {
			x:poi.x,
			y:poi.y,
			floor:poi.FloorNum
		};
		clearPoints(['point','endPoint']);
		drawPoints(poi.x,poi.y,poi.FloorNum,type);
	}
	//设置起点
	if(type == 'start'){
		_setStartCallee(poiInfo);
	}
	//设置终点
	else if(type == 'end'){
		if($state.USER_LOCATION && !$variable.$startPOI){
			var _poiInfo = $extend.getLocationPOI();
				_poiInfo.name = '我的位置';
			_setStartCallee(_poiInfo);
			
		}
		_setEndCallee(poiInfo);
	}
	//显示开始导航按钮
	$index.$startNav.showControl();
	//显示
	$index.$startEndPoint.addClass('show');
	//选择起点终点的时候 关闭导航中自动切换楼层
	$state.AUTO_CHANGE_FLOOR = false;
	//规划路径
	$extend.fn_requestRoute();
};

//执行extend
_index_extend();
function _index_extend(){
	// 展示poi详情
	$extend.fn_showPOIInfoControl = function(poiInfo){
		if(!poiInfo || Math.ceil(poiInfo.CATEGORY_ID) <= 800 || poiInfo.name == '') return;
		$index.$poiInfo.data('poiInfo',poiInfo).showControl(function(){
			var _nameHtml = (poiInfo.CARSPACES == 'YES' ? '车位' : '') +  poiInfo.name + " " + poiInfo.FloorNum + "层";
			$index.$poiInfo.find('.info-box').find('.p1').text(_nameHtml);
			if(poiInfo.CARNO){
                $index.$poiInfo.find('.info-box').find('.p3').show().attr('car-no',poiInfo.CARNO).find('span').text(poiInfo.CARNO_NAME);
            }else{
                $index.$poiInfo.find('.info-box').find('.p3').hide();
            }
		});
		//已定位
		if($state.USER_LOCATION){
			
			var _endPoint = {
				x:poiInfo.x,
				y:poiInfo.y,
				floor:poiInfo.FloorNum
			};
		}else{
			$index.$poiInfo.find('.info-box')
					.find('.p2').text('');
		}
		
	};
	//获取定位点的poi详情
	$extend.getLocationPOI = function(){
		var xy=lonLat2Mercator($variable.$locationPoint.x, $variable.$locationPoint.y);
		var poi = null;
		//alert(xy[0]+","+xy[1]);
		if(!poi){
			var floorName=map.getFloor($variable.$locationPoint.floor).data_.NameEn;
			poi = {
				name:'',
				id:'location',
				FloorName:floorName,
				FloorNum:$variable.$locationPoint.floor
			};
		}
		poi.name = poi.name == '' ? '我的位置' : poi.name;
		poi.x =xy[0];
		poi.y =xy[1];
		return poi;
	};
	// 根据楼层索引查询楼层信息
	$extend.queryFloorInfo = function(index){
		
//		for(var i = 0; i < $map.mapInfoArray.length; i++){
//			
//			if($map.mapInfoArray[i].floorNumber == index){
//				return $map.mapInfoArray[i];
//			}
//			
//		}
		
		return null;
		
	};
	// 切换起点终点
	$extend.fn_changeStartEndPoint = function(){
		var _startPOI = $variable.$startPOI,
			_endPOI = $variable.$endPOI,
			_startPoint = $variable.$startPoint,
			_endPoint = $variable.$endPoint;
		var _$start = $index.$startEndPoint.find('.show-box').find('.start-box'),
			_$end = $index.$startEndPoint.find('.show-box').find('.end-box');
		$variable.$startPOI = _endPOI;
		$variable.$endPOI = _startPOI;
		$variable.$startPoint = _endPoint;
		$variable.$endPoint = _startPoint;
		if($variable.$startPOI){
			_$start.find('input').val($variable.$startPOI.name + " " + $variable.$startPOI.FloorNum);
		}else{
			_$start.find('input').val('');
		}
		if($variable.$endPOI){
			_$end.find('input').val($variable.$endPOI.name + " " + $variable.$endPOI.FloorNum);
		}else{
			_$end.find('input').val('');
		}
		//规划路径
		$extend.fn_requestRoute();
	};
	// 规划路径 wwj
	$extend.fn_requestRoute = function(){
		//已设置起点终点
		if($variable.$startPOI && $variable.$endPOI){
			navi.stop();
			navi.clearAll();
			clearPoints(['point','endPoint','startPoint']);
			navi.setStartPoint({
				  x: $variable.$startPoint.x,
	              y: $variable.$startPoint.y,
	              fnum: $variable.$startPoint.floor,
	              height:markheight,
	              url: 'images/start.png',
	              size: 64
			});
			navi.setEndPoint({
				  x: $variable.$endPoint.x,
	              y: $variable.$endPoint.y,
	              fnum: $variable.$endPoint.floor,
	              height:markheight,
	              url: navi.mode==2?'images/end2.png':'images/end.png',
	              size: 64
			});
			navi.drawNaviLine();
			console.log(navi.navidata);
			//切换开始导航按钮ui
			$index.$startNav.removeClass('off').find('.info-box')
				.find('.p1').text($variable.$endPOI.name + " " + $variable.$endPOI.FloorName + '层');
			//经纬度转换坐标
			var _startPoint =lonLat2Mercator($variable.$startPoint.x, $variable.$startPoint.y),
				_endPoint =lonLat2Mercator($variable.$endPoint.x, $variable.$endPoint.y);
				_startPoint.floor = $variable.$startPoint.floor;
				_endPoint.floor = $variable.$endPoint.floor;
			//规划路径
			var _distance = Math.floor(navi.navidistance), str = "";
			if(_startPoint.floor < _endPoint.floor){
				str = "需上行至"+$variable.$endPOI.FloorName+"层";
			}
			else if(_startPoint.floor > _endPoint.floor){
				str = "需下行至"+$variable.$endPOI.FloorName+"层";
			}
			//已定位
			if($state.USER_LOCATION){
				var text = "距您"+_distance+"米" + ( str == '' ? '' : ', ' + str );
				if(_distance < 5){
					text = '您在终点附近！';
				}
				$index.$startNav.find('.info-box').find('.p2').text(text);
			}else{
				$index.$startNav.find('.info-box').find('.p2').text("全长"+_distance+"米" + ( str == '' ? '' : ', ' + str ));
			}
			if(navi.mode==1){//人行
				$index.$startNav.find('.slide-button').find('input').prop("checked",true);
			}else{//车行
				$index.$startNav.find('.slide-button').find('input').prop("checked",false);
			}
			$index.$startNav.find('.slide-button').css("display","block");
		}else{
//			//切换开始导航按钮ui
			$index.$startNav.addClass('off');
		}
		
	};
	//导航选点
	$extend.fn_navSelectPoint = function(type){
		if(type == 'start'){
			$variable.$navSelectPointType = 'start';
			$variable.$navSelectPointText = '选为起点';
		}
		else{
			$variable.$navSelectPointType = 'end';
			$variable.$navSelectPointText = '选为终点';
		}
		//开启导航搜索模式
		$state.IS_NAV_SEARCH_SHOW = true;
		location.hash = 'search';
	};
	//全览路线  现改为 结束导航
	$extend.fn_overviewRoute = function(queryFloorID){
		$extend.fn_stopNavResetRoute();
		//alert("敬请期待！");
	};
	//中途终止导航 恢复状态
	$extend.fn_stopNavResetRoute = function(){
		AlertLayer({
			content:"<p class='alertLayer-tips-box'>是否结束导航？</p>",
			button:[
				{
					name:"否",
					callback:function(){}
				},
				{
					name:"是",
					callback:function(){
						$index.$navingTopTips.removeClass('show');
						$index.$startEndPoint.addClass('show');
						$index.$startNav.showControl();
						$index.$floor.show();
						$index.$search.show();
						//关闭导航模式
						$state.USER_NAVING = false;
						//关闭自动导航
						$state.AUTO_NAV = false;
						//允许地图点击
						$state.MAP_CLICK = true;
				        //关闭自动切换楼层
				        $state.AUTO_CHANGE_FLOOR = false;
				        window.clearInterval(window.clearStartNav);
					}
				}
			]
		});
	};
	//导航完成之后 恢复初始状态
	$extend.fn_navOverResetMap = function(){
		$variable.$startPOI = null;
		$variable.$endPOI = null;
		$variable.$startPoint = {};
		$variable.$endPoint = {};
		$variable.$routeResult = null;
		//清除路径
		$index.$floor.show();
		$index.$search.show();
        //允许地图点击
        $state.MAP_CLICK = true;
        //恢复地图自动切换
		$state.AUTO_CHANGE_FLOOR = true;
	}
	//恢复初始地图状态
	$extend.fn_resetInitMap = function(){
		$extend.fn_navOverResetMap();
		//隐藏首页 底部模板
		$index.$change.removeClass('show').find('.change-control').hide();
		$index.$floor.find('.box').removeClass('marker').siblings('.ul').find('li').removeClass('marker');
		$index.$search.find('input').val('').siblings('.close').hide();
		$variable.$POI_Cache = [];
		$variable.$POI_Cache2 = [];
		$variable.$POI_Cache3 = [];
		$variable.$POI_FID_Cache = [];
		//搜索页恢复
		$extend.fn_resetDefaultSearch();
};
/************************************
 * jquery 扩展
 ***********************************/

var _showOut = null,
	_hideOut = null;
//显示下方  设置起点 终点 div
$.fn.showControl = function(callback){
	var that = this;
	function _callee(){
		$(that).show().siblings().hide();
		$index.$change.addClass('show');
		$index.$location.css("display","block");
		callback && callback.apply(that);
	}
	if($index.$change.hasClass('show')){
		$index.$change.removeClass('show');
		_showOut = window.setTimeout(function(){
			_callee();
		},200);
	}
	else{
		_callee();
	}
	return $(that);
	
};
//隐藏下方  设置起点 终点 div  wwj
$.fn.hideControl = function(callback){
	var that = this;
	if(!$(that).is(':hidden')){
		//$index.$change.removeClass('show');
		_hideOut = window.setTimeout(function(){
			$(that).hide();
			callback && callback.apply(that);
		},200);
	}
	return $(that);
}
}
//点击按钮   导航开始    
function setNaviStart(){
	if(!$variable.$startPOI){
		AlertLayer({
			content:"<p class='alertLayer-tips-box'><img src='images/start_marker.png' />请选择起点位置</p>",
			button:[
				{
					name:"取消",
					callback:function(){
						
					}
				},
				{
					name:"去选择",
					callback:function(){
						$extend.fn_navSelectPoint('start');
					}
				}
			]
		});
	}
	else if(!$variable.$endPOI){
		AlertLayer({
			content:"<p class='alertLayer-tips-box'><img src='images/end_marker.png' />请选择终点位置</p>",
			button:[
				{
					name:"取消",
					callback:function(){}
				},
				{
					name:"去选择",
					callback:function(){
						$extend.fn_navSelectPoint('end');
					}
				}
			]
		});
	}
	else{
        //$state.USER_LOCATION = true;
//		if(!$state.USER_LOCATION){
//            AlertLayer({
//                content:"<p>您未到达该建筑现场，请先前往该建筑内!</p>",
//                button:[
//                    {
//                        name:"知道了",
//                        callback:function(){}
//                    }
//                ]
//            });
//            return;
//		}
		clearLocMarker();
		clearPoints('point');
		startNavi();
		window.clearStartNav=window.setInterval(function(){
			//navi.locationMarker.direction=$variable.$locationPoint.angle;
			if(navi && navi.navidata){
				var xy=lonLat2Mercator($variable.$locationPoint.x, $variable.$locationPoint.y);
	   		    naviTip(xy[0],xy[1],$variable.$locationPoint.floor);	
			}
		},1000);
		$index.$startEndPoint.removeClass('show');
		$index.$navingTopTips.addClass('show');
		$index.$navingBomButton.showControl();
		$index.$navingBomButton.find('.close').show();
		$index.$navingBomButton.find('.btn-box').find('.b-overview').show().siblings().hide();
		$index.$search.hide();
		$state.USER_NAVING = true;//导航中  状态
	}
}
function naviTip(lon,lat,floornum){
	var wpoint=getNavNearPoint({x:lon,y:lat,fnum:floornum});
	if(wpoint.minDistance>10)//记录连续偏离导航的路线
		$nav.$deviateCount++;
	else
		$nav.$deviateCount=0;
	if($nav.$deviateCount>3){//连续偏离导航3次以上重新规划路径
		$variable.$startPoint = {
				x:lon,
				y:lat,
				floor:floornum
			};
		$extend.fn_requestRoute();//重新规划路径
		alert('偏离导航，已重新规划路径');
		$nav.$deviateCount=0;
		startNavi();
		return;
	}
	var results=getPastRoute(wpoint);
	if(surDistance!=0 && surDistance<results.surDistCount)//记录往回走的次数
		backcount++;
	else
		backcount=0;
	if(backcount==0 || backcount>3){
		walkTo(wpoint.point);
		surDistance=results.surDistCount;
		if(results.surDistCount<6)//记录连续到达终点附近的次数
			$nav.$arrivalCount++;
		else
			$nav.$arrivalCount=0;
		if($nav.$arrivalCount>3){//连续到达终点附近的次数3次以上  结束导航
			alert('到达终点附近,本次导航已结束');
			$nav.$arrivalCount=0;
			$extend.fn_stopNavResetRoute();
		}
	}
}
