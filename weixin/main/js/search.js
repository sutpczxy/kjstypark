/*
 * init search function
 */
function _init_search_container(){
	// head
	$search.$head
		/*返回首页*/
		.on('click','.back-button',function(){
			history.back();
		})
		/*显示搜索楼层选择*/
		.on('click','.floor-box',function(){
			$(this).find('.ul').toggleClass('show');
		})
		/*搜索楼层选择*/
		.on('click','.floor-box .ul li',function(){
			
			$(this).addClass('active').siblings().removeClass('active');
			
			$(this).parent().siblings().attr('floor-id',$(this).attr('floor-id')).text($(this).text());
			
			$variable.$queryFloorID = $(this).attr('floor-id');
			
			if($variable.$queryKeyName != ''){
				$extend.fn_keyQueryParser($variable.$queryKeyName);
			}
			
		})
		/*input改变*/
		.on('input propertychange','.input-box input',function(){
			
			var value = $(this).val();
			
			if(value.trim() == ''){
				$extend.fn_resetDefaultSearch();
			}
			else{
				$extend.fn_keyQueryParser(value);
			}
		})
		/*清除*/
		.on('click','.input-box .close',function(){
			$extend.fn_resetDefaultSearch();
		})
		/*搜索按钮*/
		.on('click','.input-box .submit',function(){
			$extend.fn_resultParser();
		});
	//历史记录
	$search.$history
		/*列表点击*/
		.on('click','li',function(){
			var value = $(this).text();
			$search.$head.find('.input-box').find('input').val(value);
			$extend.fn_keyQueryParser(value, function(){
				if(!$state.IS_NAV_SEARCH_SHOW){
					$extend.fn_resultParser();
				}
			});
		})
		/*清空列表*/
		.on('click','.empty-btn.on',function(){
			
			AlertLayer({
				content:"<p style='color:#fd3d3c'>确认清空搜索历史吗？</p>",
				button:[
					{
						name:"取消",
						callback:function(){}
					},
					{
						name:"确认清空",
						callback:function(){
							$extend.removeHistory();
							$extend.resetHistory();
						}
					}
				]
			});
			
		});
	//搜索结果   wwj
	$search.$result
		/*列表点击*/
		.on('click','li',function(){
			//处于搜索状态
			$state.IS_SEARCH_ING = true;
			var poiInfo = null, poiID = $(this).attr('poi-id');
			if($state.IS_NAV_SEARCH_SHOW){
				poiInfo = $variable.$POI_Cache2[poiID];
				$extend.fn_setNavStartAndEndPoint(poiInfo,$variable.$navSelectPointType);
			}
			else{
				poiInfo = $variable.$POI_Cache[poiID];
				drawPoint(poiInfo.x,poiInfo.y,poiInfo.FloorNum);
				map.moveTo({
			        x: Number(poiInfo.x),
			        y: Number(poiInfo.y),
			        FloorNum:poiInfo.FloorNum,
			        time: 0.5
			    });
				showNavDiv(poiInfo);
				//$extend.fn_showPOIInfoControl(poiInfo);
				//$index.$poiInfo.find('.close').hide().siblings('.btn-box').find('.btn-back').show();
//				$variable.$POI_FID_Cache = [];
//				$extend.fn_removePoiMarker();
			}
			$search.$head.find('.input-box').find('input').val(poiInfo.name);
			$extend.fn_keyQueryParser(poiInfo.name);
			$extend.resetHistory(poiInfo.name);
			$index.$search.find('input').val(poiInfo.name).siblings('.close').show();
			history.back();
		});
	//多楼层分布结果
	$search.$selectResultFloor
		/*关闭*/
		.on('click','.head-box .close',function(){
			MaskLayer.hide();
			$search.$selectResultFloor.removeClass('show');
		})
		/*选择楼层数据*/
		.on('click','.content-box li',function(){
			
			var _floorID = $(this).attr('floor-id');
			
//			if(_floorID != $map._targetFloorID){
//				
//				$extend.fn_setFloor(_floorID,function(){
//					$extend.fn_showFloorAllMarker(_floorID);
//				});
//			}
//			else{
//				$extend.fn_showFloorAllMarker(_floorID);
//			}
			MaskLayer.hide();
			$search.$selectResultFloor.removeClass('show');
			//更新历史记录
			$extend.resetHistory($variable.$queryKeyName);
			$index.$search.find('input').val($variable.$queryKeyName).siblings('.close').show();
			//搜索模式
			$state.IS_SEARCH_ING = true;
			history.back();
		});
	//我的位置、地图选点
	$search.$locPoint
		/*我的位置*/
		.on('click','.myPoint',function(){
			function _callee(){
				var poiInfo = $extend.getLocationPOI();
					poiInfo.name = '我的位置';
				$extend.fn_setNavStartAndEndPoint(poiInfo,$variable.$navSelectPointType);
			}
			if($state.USER_LOCATION){
				_callee();
			}
			else{
				$extend.fn_locationTips();
				$variable.$selectPointCallee = _callee;
			}
			history.back();
		})
		/*地图选点*/
		.on('click','.mapPoint',function(){
			//开启地图选点模式
//			$state.MAP_SELECT_POINT = true;
//			$index.$startEndPoint.removeClass('show');
//			$index.$search.hide();
//            $index.$queryEndFloor.hide();
//            $index.$queryStartFloor.hide();
//			$index.$selectPointList.showControl();
//			$('#map-select-point-tips').show();
			history.back();
		});
	
	
	//公共设施
	$search.$facility
		/*更多*/
		.on('click','.moveBtn',function(){
			if($(this).hasClass('show')){
				$(this).removeClass('show').siblings().removeClass('show');
			}else{
				$(this).addClass('show').siblings().addClass('show');
			}
		})
		/*box   wwj*/
		.on('click','.itemBtn',function(){
			//var cid = $(this).attr('data-cid');
			var title=$(this).find('span').text();
			$search.$head.find('.input-box').find('input').val(title);
			$extend.fn_keyQueryParser(title);
//			var cid = $(this).attr('data-cid');
//			var data = JSON.parse($variable.$POI_Facility_Cache[cid].points);
//		    if(data.length >= 1){
//		        var _array = [];
//		        for(var i=0;i<data.length;i++){
//		            var _info = data[i];
//		            _array[_info.POI_ID] = _info;
//		        }
//				$variable.$POI_Cache = _array;
//				$marker.selectedIcon.empty();
//				$extend.fn_resultParser();
//		    }
		    //$extend.fn_resultParser();
		});
	
	
}

//执行 search function
_init_search_container();



/*
 * extend function
 */

function _search_extend(){
	//查询回调自增索引
	var _query_callback_index = 1;
	//关键字查询结果分布  wwj
	$extend.fn_keyQueryParser = function(value, callback){
		//暂存搜索key
		$variable.$queryKeyName = value;
		//导航搜索模式
		if($state.IS_NAV_SEARCH_SHOW){
			$search.$head.find('.input-box').removeClass('showSearch').addClass('showSearch2');
		}else{
			$search.$head.find('.input-box').removeClass('showSearch2').addClass('showSearch');
		}
		$search.$facility.hide();
		$search.$history.hide();
		$search.$result.show().find('.tips').text('搜索中...');
        var param = {
            types:["facility","model"],
            keyword: value
        };
        var fnum=$("#floorNum").attr('floor-id');
        if(!fnum){
        	fnum="all";
        }else{
        	fnum=Number(fnum);
        }
        //模糊查询poi信息 根据名字
        esmap.ESMapUtil.search(map, fnum,param, function (mapdatas) {
        	$search.$result.find('ul').empty();
        	if(mapdatas.length >= 1){
				var html = '', reg = new RegExp(value,'gi');
				for(var i = 0; i < mapdatas.length; i++){
					var item = mapdatas[i];
					var floorName=map.getFloor(item.FloorNum).data_.NameEn;
					var id = item.ID;
					var poiInfo={};
					poiInfo.x=item.mapCoord.x;
			        poiInfo.y=item.mapCoord.y;
			        poiInfo.FloorNum=item.FloorNum;
			        poiInfo.FloorName=floorName;
			        poiInfo.name=item.name;
					$variable.$POI_Cache[id]=poiInfo;
					var _name = item.name.replace(reg,function (key) {
						return "<font>"+key+"</font>";
			        });
					var _nameHtml = floorName+"层  "+_name;
					html += "<li poi-id='" +id + "'>"+ _nameHtml + "<a class='btn "+$variable.$navSelectPointType+"'>"+$variable.$navSelectPointText+"</a></li>";
				}
				$search.$result.find('ul').append(html);
				$search.$result.find('.tips').hide();
        	}else{
        		$search.$result.find('.tips').show().text('暂未搜索到任何相关信息');
        	}
        });
	};
	//搜索按钮 结果处理   wwj
	$extend.fn_resultParser = function(){
		var _sResultIndexLen = 0;
		$variable.$POI_FID_Cache = [];
		for(var key in $variable.$POI_Cache){
			var item = $variable.$POI_Cache[key];
			if(!$variable.$POI_FID_Cache[item.FLOOR_ID]){
				$variable.$POI_FID_Cache[item.FLOOR_ID] = {
					floorID:item.FLOOR_ID,
					floorName:item.FLOOR_NAME,
					data:[]
				};
				++_sResultIndexLen;
			}
			$variable.$POI_FID_Cache[item.FLOOR_ID].data.push(item);
		}
		
		//查询结果 只有一个楼层
		if(_sResultIndexLen == 1){
			var floorID;
			for(var id in $variable.$POI_FID_Cache){
				floorID = id;
			}
//			if(floorID != $map._targetFloorID){
//				
//				$extend.fn_setFloor(floorID,function(){
//					$extend.fn_showFloorAllMarker(floorID);
//				});
//				
//			}else{
//				$extend.fn_showFloorAllMarker(floorID);
//			}
			
			$index.$floor.find('.box').addClass('marker').siblings('.ul').find('li[floor-id="'+floorID+'"]').addClass('marker');
			
			$extend.resetHistory($variable.$queryKeyName);
			
			$index.$search.find('input').val($variable.$queryKeyName).siblings('.close').show();
			
			//搜索模式
			$state.IS_SEARCH_ING = true;
			
		}
		//查询结果 有多个楼层
		else if(_sResultIndexLen > 1){
			
			var html = '';
			
			for(var floorID in $variable.$POI_FID_Cache){
				
				var _floorID = $variable.$POI_FID_Cache[floorID].floorID,
					_floorName = $variable.$POI_FID_Cache[floorID].floorName,
					_dataLength = $variable.$POI_FID_Cache[floorID].data.length;
				
				html += "<li floor-id='"+_floorID+"'>"+_floorName+"层 <b>("+_dataLength+")</b></li>";
				
				$index.$floor.find('.box').addClass('marker').siblings('.ul').find('li[floor-id="'+floorID+'"]').addClass('marker');
				
			}
			
			$search.$selectResultFloor.addClass('show').find('.content-box').find('ul').empty().append(html);
			
			MaskLayer.show($search.$container[0]);
			
			return;
			
		}
		//没有查询到信息
		else{
			return;
		}
		history.back();
		
	};
	//恢复搜索页初始状态
	$extend.fn_resetDefaultSearch = function(){
		
		$variable.$queryKeyName = '';
		
		$search.$result.hide().find('ul').empty();
		
		$search.$head.find('.input-box').removeClass('showSearch').removeClass('showSearch2').find('input').val('');
		
		$search.$history.show();
		
		if($state.IS_NAV_SEARCH_SHOW){
			
			return;
		}
		
		$search.$facility.show();
		
		$search.$locPoint.hide();
		
	};
	
	
	
	//存入key历史记录
	$extend.addHistory = function(keyName){
		
		var _history = localStorage.getItem("brt_history");
		var _strArr = [];
		if(_history){
			_strArr = JSON.parse(_history);
		}
		
		var isTrue = false;
		_strArr.forEach(function(key){
			if(keyName == key){
				isTrue = true;
			}
		});
		
		if(!isTrue){
			_strArr.push(keyName);
			localStorage.setItem("brt_history",JSON.stringify(_strArr));
		}
		
	};
	
	//get历史记录
	$extend.getHistory = function(){
		var _strArr = localStorage.getItem("brt_history");
		return JSON.parse(_strArr);
	};
	
	//删除历史记录
	$extend.removeHistory = function(){
		localStorage.removeItem("brt_history");
	};
	
	//更新历史记录
	$extend.resetHistory = function(value){
		value && $extend.addHistory(value);
		if($extend.getHistory()){
			
			var list = $extend.getHistory(), html = '';
			
			for(var i = list.length - 1; i >= 0; i--){
				html += "<li>"+list[i]+"</li>";
			}
			
			$search.$history.find('.list').empty().append(html);
			$search.$history.find(".empty-btn").addClass("on").text("清空搜索历史");
		}
		else{
			$search.$history.find('.list').empty();
			$search.$history.find(".empty-btn").removeClass("on").text("您暂未搜索任何记录!");
		}
		
	};
	$extend.resetHistory();
}
// 执行extend
_search_extend();