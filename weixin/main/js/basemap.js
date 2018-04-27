//定义全局map变量
var map;
var esmapID=90002
var navi;//导航对象
var buildingId=getQueryString('bid');
//判断url中是否传bid参数
if(buildingId)
    esmapID=buildingId;
var modeHeight;//所点击的模型高度
var surDistance=0; //记录上次导航   还剩多少距离
var backcount=0;
var markheight=0.1;
//地图操作
function mapDowork(){
	bingingEvents();//绑定按钮点击事件
    map = new esmap.ESMap({
        container : document.getElementById('map-container'),     //渲染dom
        mapDataSrc:'../../../plug-in/esmap/data/10001/',      //地图数据位置
        mapThemeSrc : '../../../plug-in/esmap/theme',        //主题数据位置
        focusAlphaMode: false,              //对不可见图层启用透明设置 默认为true
        focusAnimateMode: true,            //开启聚焦层切换的动画显示
        focusAlpha:0.3,                     //对不聚焦图层启用透明设置，当focusAlphaMode = true时有效
        viewModeAnimateMode:true,         //开启2维，3维切换的动画显示
        token:'escopesubwayproject',
        compassOffset:[20, 100],           //指南针 位置
        //visibleFloors: 'all',          //显示所有楼层
        moveToAnimateMode:true         //开启moveTo动画效果
       
    });
    //打开地图数据
    map.openMapById(esmapID);      //sceneId
    map.showCompass = true;  
    //地图加载完成事件
    map.on('loadComplete', function() {
		//加载导航对象
		createNavi();
    	 //创建楼层，放大、缩小控件              
        floorControl = new esmap.ESScrollFloorsControl(map, ctlOpt);
        //创建楼层，放大、缩小控件              
    	map.viewMode = esmap.ESViewMode.MODE_3D;//2维模式   
        //判断是否为移动终端调用页面
        //if(browser.versions.mobile||browser.versions.android||browser.versions.ios)
            //window.AndroidWebView.onMapInitSuccess(floorsObj);
    	initSearchFloor();
    	map.on("focusFloorNumChanged",function(e){
	       	 floorControl.changeFocusFloor(e);
    	})
    });
    var curfnum = null;
    var name;
    var isDB=false;//是否点击了地板
    var isClickMap=false;//是否 点在地图里面
    var mapCoord={x:0,y:0};
    map.on('mapClickNode', function(event) {
    	if(event.name){
    		name=event.name;
    	}else{
    		name="位置点";
    	}
    	if(event.nodeType==0){//是否点在地图外
    		isClickMap=false;
    	}else{
    		isClickMap=true;
    	}
    	if(event.nodeType == 5){
    		markheight = event.data_.RoomHigh;
        }
   	    if (event.nodeType == 4) {
   	    	isDB=true;
            curfnum = event.floor;
            markheight=1;
        }
   	    if(event.hitCoord){//获取点击的地图坐标
   	    	mapCoord.x=event.hitCoord.x||0;
    	    mapCoord.y=event.hitCoord.y||0;
   	    }
   	    if(event.data_){
   	    	modeHeight=event.data_.RoomHigh;
   	    }
    });
    //为模型填充div添加移动端点击结束事件
    $('#map-container')[0].ontouchend=function(event){
        var fnum = curfnum;
		if (!fnum) return;
        if(isClickMap && !$state.USER_NAVING){
        	 drawPoint(mapCoord.x,mapCoord.y,fnum);
    		 //获取地图视图的边框
            var poiInfo={};
            poiInfo.x=mapCoord.x;
            poiInfo.y=mapCoord.y;
            poiInfo.FloorNum=fnum;
            var floorName=map.getFloor(fnum).data_.NameEn;
            poiInfo.FloorName=floorName
            poiInfo.name=name;
            if(isDB){
            	isDB=false;
            	showNavDiv(poiInfo);
            }
            curfnum = null;
            mapCoord={x:0,y:0};
        }
//        if(navi && navi.navidata && $state.USER_NAVING){
//        	naviTip(mapCoord.x,mapCoord.y,curfnum);
//    	}
    };
    $('#map-container').on("touchstart",function(event){
    	if(event.originalEvent.touches.length>1){//多个手指触摸
    		navi.followAngle=false;
    	}
    });
    //为模型填充div添加点击事件
	$('#map-container')[0].onclick = function(event) {
		var fnum = curfnum;
		if (!fnum) return;
		if(isClickMap && !$state.USER_NAVING){
		   drawPoint(mapCoord.x,mapCoord.y,fnum);
   		   //获取地图视图的边框
           var poiInfo={};
           poiInfo.x=mapCoord.x;
           poiInfo.y=mapCoord.y;
           poiInfo.FloorNum=fnum;
           var floorName=map.getFloor(fnum).data_.NameEn;
           poiInfo.FloorName=floorName
           poiInfo.name=name;
           if(isDB){
           	isDB=false;
           	showNavDiv(poiInfo);
           }
           curfnum = null;
           mapCoord={x:0,y:0};
       }
	};
    //楼层控制控件配置参数
    var ctlOpt = new esmap.ESControlOptions({
        position: esmap.ESControlPositon.RIGHT_TOP,
        imgURL: "../../../plug-in/esmap/resource/style/wedgets/img/",
        //size:"normal",
        offset: {
            x: 0,
            y: 113
        },
        allLayer: map.options.visibleFloors?false:true
    });
}
//清除所有图标
function removeAllList(){
	var fnums = map.floorNums;
	for(var i=0;i<fnums.length;i++){
		var floor = map.getFloor(fnums[i]);
		floor.removeLayersByNames(['car','carName','carcount']);
	}
}
//楼层切换方法
function changeFloor(fid){
    map.visibleFloorNums=[Number(fid)];
    map.focusFloorNum=Number(fid);
}
//经纬度坐标转地图坐标
function lonLat2Mercator(lon,lat) {
    var xy = [];
    var x = lon * 20037508.342789 / 180;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = y * 20037508.34789 / 180;
    xy.push(x);
    xy.push(y);
    return xy;
}
//地图坐标转经纬度坐标
function Mercator2lonLat(mercatorX,mercatorY){
	 var xy = [];
     var x = mercatorX / 20037508.34 * 180;
     var y = mercatorY / 20037508.34 * 180;
     y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
     xy.push(x);
     xy.push(y);
     return xy;
}
//事件绑定
function bingingEvents(){
    //2维显示事件
    document.getElementById('btn2D').addEventListener('click', function(event){
    	document.getElementById("btn2D").style.display="none";
    	document.getElementById("btn3D").style.display="block";
        map.viewMode = esmap.ESViewMode.MODE_3D;//2维模式     
    },false);
    //3维显示事件
    document.getElementById('btn3D').addEventListener('click', function(event){
      document.getElementById("btn2D").style.display="block";
      document.getElementById("btn3D").style.display="none";
      map.viewMode = esmap.ESViewMode.MODE_2D;; //3维模式   
    },false);
}
//点击地图显示设置起始点的按钮
function showNavDiv(poiInfo){
	$index.$poiInfo.data('poiInfo',poiInfo).showControl(function(){
		var _nameHtml =poiInfo.name + " " + poiInfo.FloorName + "层";
		$index.$poiInfo.find('.info-box').find('.p1').text(_nameHtml);
        $index.$poiInfo.find('.info-box').find('.p3').hide();
        $index.$poiInfo.find('.info-box').find('.p2').text('');
	});
}

//画单个点
function drawPoint(x,y,fnum){
	if(!fnum) return;
    var fnums = map.floorNums;
	for ( var i = 0; i < fnums.length; i++) {
		var floorLayer=map.getFloor(fnums[i]);
		floorLayer.removeLayersByNames('point');   //删除一个或者多个name的图层。
	}
	if(map.focusFloorNum!=Number(fnum)){
		changeFloor(fnum);
	}
//	if(modeHeight){
//		height=modeHeight;
//	}
	var floor = map.getFloor(Number(fnum));
    var dyMarkerLayer=floor.getOrCreateLayerByName("point" , esmap.ESLayerType.IMAGE_MARKER);
    var url = "../../../images/user-icons/user.png";
    var im = new esmap.ESImageMarker({
            x: Number(x),
            y: Number(y),
            height:markheight,
            url:url,
            size:64
    });
    dyMarkerLayer.addMarker(im);
    floor.addLayer(dyMarkerLayer);
}
//sdk地图重复画点方法.
function drawPoints(x,y,fnum,type){
	var floor = map.getFloor(fnum);
	var layer=floor.getOrCreateLayerByName(type+"Point" , esmap.ESLayerType.IMAGE_MARKER);
	var  url = 'images/start.png';
    if(type == 'end')
        url = 'images/end.png';
    var im = new esmap.ESImageMarker({
        x: Number(x),
        y: Number(y),
        height:markheight,
        url:url,
        size:64
    });
    layer.addMarker(im);
    floor.addLayer(layer);
}
//清除点 eg: clearName=['point','points','navPoints']
function clearPoints(clearName){
	pointNode=[];
	var fnums = map.floorNums;
	for ( var i = 0; i < fnums.length; i++) {
		var floorLayer=map.getFloor(fnums[i]);
		floorLayer.removeLayersByNames(clearName);   //删除一个或者多个name的图层。
	}
}
//创建导航
function createNavi() {
    if (!map.mapService.sourceData.navs || !map.mapService.sourceData.navs[0]|| map.mapService.sourceData.navs[0].Nodes.length == 0) {
      console.log("地图导航数据信息不存在！");
      return;
    }
    if (!navi) {
      //初始化导航对象
      navi = new esmap.ESNavigation({
        map: map,
        locationMarkerUrl: 'images/loc.png',
        locationMarkerSize: 150,
        speed: 15,
        followAngle: false,
        offsetHeight:5,
        followPosition:false,
        tiltAngle: 40,
        scaleLevel: 0,
        mode:1,//1：人行  2：车行
        // 设置导航线的样式
        lineStyle: {
          color: '#33cc61',
          lineWidth: 6,
          //设置边线的颜色   
          godEdgeColor: '#920000',
          //设置箭头颜色
          godArrowColor: "#ff0000",
          //设置线为导航线样式
    	  lineType: esmap.ESLineType.ESARROW,
    	  alpha: 0.8,
          offsetHeight: 1,
          noAnimate: false  //控制箭头动画
        },
        autoStart:false
      });
    }
  }
//清除导航
function clearNavi() {
    if (navi)
      navi.clearAll();
}
//模拟导航
function startNavi() {
    //导航开始
    navi.simulate();
//    navi.on("walking", function () {
//      console.log("导航进行中")
//    })
}
function walkTo(coord){
    //coord =eval("("+coord+")");
    if(navi){
        navi.walkTo(coord);
    }else{
    	alert("请先初始化navi对象~")
  }
}
//获取url参数
function getQueryString(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  decodeURI(r[2]); return null;
}

var locMarker=null;
//添加定位标注方法,x、y为墨卡托坐标, fnum为楼层floornum(第几楼),
function addLocMarker(x,y,fnum) {
	if(map.focusFloorNum!=Number(fnum)){
		changeFloor(fnum);
	}
    var floorLayer = map.getFloor(Number(fnum));  
    var url = "images/loc.png";
    var size = 100;
    if (!locMarker) {
         locMarker = new esmap.ESLocationMarker({
            id: "location", 
            url: url,
            size: size
        });
    }
    //设置定位标注显示的位置和高度
    locMarker.setPosition(Number(x), Number(y), Number(fnum), 3);
    locMarker.alwaysShow = null;
    map.addLocationMarker(locMarker);
    locMarker.o3d_.visible = true;
}
function clearLocMarker(){
	map.removeLocationMarker(locMarker);
}
function changeFloor(fnum){
	//if(map.visibleFloorNums.length==1){
	map.visibleFloorNums=[Number(fnum)];
	//}
	map.focusFloorNum=Number(fnum);
}
function changeModelColor(id,color,fnum,name){
	map.changeModelColor({
        name:name,
        id:id,
        color:color,
        fnum:fnum
    })
}
function initSearchFloor(){
	var _html = "<li floor-id='0' class='active'>全部</li>";
	var floors=map.floorNames;
	for(var i = 0; i < floors.length; i++){
		var floor=floors[i];
		_html += "<li floor-id='"+(i+1)+"'>"+floors[i]+"</li>";
	}
	window.$search.$container.find('#floorlist').append(_html);
}

//更新定位标注的方法,angle为旋转角度
function undateLocAngle(angle){
    if(!locMarker)
        return;
    locMarker.direction = Number(angle);  //改变定位标注的方向
}