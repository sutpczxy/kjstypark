(function(d, a) {
    d.WXLocation = function(e) {
        this._beaconPool = [];
        this._currentPoint = null;
        this._location_pos = null;
        this._selectedFloor = null;
        this._MIN_DISTANCE_THRESHOLD = 0.8;
        this._init.apply(this)
    }
    ;
    WXLocation.prototype = {
        _init: function() {
        },
        _getTwoPoint: function(h, g) {
            var f = parseFloat(h.accuracy) + parseFloat(g.accuracy);
            var e = parseFloat(h.location.x * g.accuracy + g.location.x * h.accuracy) / f
              , i = parseFloat(h.location.y * g.accuracy + g.location.y * h.accuracy) / f;
            return {
                location: {
                    x: e,
                    y: i
                },
                accuracy: g.accuracy
            }
        },
        _getThreePoint: function(j, i, h) {
            var g = this._getTwoPoint(j, i);
            var f = this._getTwoPoint(j, h);
            var e = this._getTwoPoint(g, f);
            return e
        },
        _tripleTriangulation: function(k, j, h) {
            var g = this._getThreePoint(k, j, h);
            var f = this._getThreePoint(j, h, k);
            var i = this._getThreePoint(h, k, j);
            var e = (g.location.x + f.location.x + i.location.x) / 3;
            var l = (g.location.y + f.location.y + i.location.y) / 3;
            return {
                x: e,
                y: l
            }
        },
        _getLocation: function(f) {
            var q = new Date().getTime()
              , z = []
              , I = []
              , u = []
              , y = null;
            //检查beacon池，如果超过3秒就不保留
            for (var F in this._beaconPool) {
                if (Math.abs(this._beaconPool[F]["time"] - q) > 3000) {
                    delete this._beaconPool[F]
                }
            }
            //将新的beacon队列导入beacon池
            for (var F = 0; F < f.length; F++) {
                var v = f[F];
                this._beaconPool[v.major + "_" + v.minor + ""] = v;
                this._beaconPool[v.major + "_" + v.minor + ""]["time"] = q
            }
            //解析beacon信息压入数组z
            for (var B in this._beaconPool) {
                var x = this._beaconPool[B];
                var t = _beaconDict[x.major + "_" + x.minor + ""];
                if (typeof t === "undefined") {
                    continue
                }
                var Distance_test=getDistance1(x.rssi,t.location.dbbase);
               // alert(accuracy);              
                var l = {
                    beacon: t.beacon,
                    rssi: x.rssi,
                    //accuracy:x.accuracy,
                    accuracy: Distance_test,
                    heading: x.heading,
                    location: t.location
                };
                alert(l.accuracy);          //测试accuracy值
                l.location.floor = t.location.floor == 0 ? this._selectedFloor : t.location.floor;
                z.push(l)
            }
            //将z根据距离值从小到大进行排序
            z.sort(prop_min_compare("accuracy"))           
            //取最多6个beacon信息，对1个点，2个点，3个以上点做处理，返回坐标
            var w = Math.min(6, z.length);
            //只有一个点则定位到当前点
            if (w == 1) {
                y = {
                    x: z[0].location.x,
                    y: z[0].location.y,
                    floor: z[0].location.floor,
                    heading: z[0].heading
                }
            } 
            else {
                //最近点的距离小于阈值，直接定位到该点
                if(z[0].accuracy<=this._MIN_DISTANCE_THRESHOLD){
                    y = {
                        x: z[0].location.x,
                        y: z[0].location.y,
                        floor: z[0].location.floor,
                        heading: z[0].heading
                    }
                }
                //只有两个点的处理
                else if (w == 2) {
                    var o = z[0]
                      , h = z[1];
                    var A = this._getTwoPoint(o, h);
                    y = {
                        x: A.location.x,
                        y: A.location.y,
                        floor: o.location.floor == 0 ? h.location.floor : o.location.floor,
                        heading: o.heading
                    }
                } 
                //大于等于三个点
                else {
                    if (w >= 3) {
                        var F, D, C, n = 0, g = 0, E = [];
                        for (F = 0; F < 1; F++) {
                            for (D = F + 1; D < w; D++) {
                                for (C = D + 1; C < w; C++) {
                                    var o = z[F]
                                      , h = z[D]
                                      , e = z[C];
                                    var s = this._tripleTriangulation(o, h, e);
                                    E.push({
                                        x: s.x,
                                        y: s.y,
                                        floor: o.location.floor
                                    })
                                }
                            }
                        }
                        for (F = 0; F < E.length; F++) {
                            n += E[F].x;
                            g += E[F].y
                        }
                        var v = z[0];
                        if ((z[0].location.floor != z[1].location.floor) && (z[1].location.floor == z[2].location.floor)) {
                            v = z[1]
                        }
                        if (v.location.floor == 0) {
                            v = z[0]
                        }
                        if (v.location.floor == 0) {
                            v = z[1]
                        }
                        if (v.location.floor == 0) {
                            v = z[2]
                        }
                        var r = v.location.floor;
                        if (v.rssi < -70 && this._selectedFloor) {
                            r = this._selectedFloor
                        }
                        y = {
                            x: n / E.length,
                            y: g / E.length,
                            floor: r,
                            heading: z[0].heading
                        }
                    } else {
                        y = null
                    }
                }
            }
            if (y && y.floor != 0) {
                if (this._currentPoint) {
                    var H = y
                      , G = this._currentPoint;
                    y = {
                        x: (H.x + G.x) / 2,
                        y: (H.y + G.y) / 2,
                        floor: H.floor,
                        heading: H.heading
                    }
                }
                this._currentPoint = {
                    x: y.x,
                    y: y.y
                };
                this._selectedFloor = y.floor
            } else {
                y = null
            }
            return y
        }
    };
    WXLocation.prototype.SearchBeacons = function(e, j) {
        var h = [];
        e.beacons.sort(function(k, i) {
            return i.rssi - k.rssi
        });
        for (var g = 0; g < e.beacons.length && h.length <= 6; g++) {
            var f = e.beacons[g];
           // window.setTimeout(function(){alert(JSON.stringify(_beaconDict));},2000);
            if (_beaconDict[f.major + "_" + f.minor + ""] && f.rssi < -15 && f.rssi > -100) {
                h.push(f)
            }
            //window.setTimeout(function(){alert(JSON.stringify(h));},2000);
        }
        this._location_pos = this._getLocation(h);
        j.apply(null, this._location_pos);
    }
})(window, document);


// d = A * (rssi / txPower) ^ B + C
function getDistance1(rssi,dbbase) {
	var A=0.8;
	var B=7.3;
	var C=0.3;
    var ratio = rssi / dbbase;
    if (ratio < 1.0) {
        return Math.pow(ratio, 10);
    }
    return A * Math.pow(ratio, B) + C;
}
function getDistance2(rssi,dbbase) {
	rssi =Math.abs(rssi);  
	dbbase =Math.abs(dbbase);  
    var power = (rssi-dbbase)/(10*2.0);  
	rssi= Math.pow(10, power);
	return rssi;
}
function getDistance3(rssi,dbbase) {
	 var ratio =Math.abs(rssi/ dbbase);
	 var rssiCorrection = 0.96 + Math. pow(Math.abs(rssi),3.0)% 10.0/150.0;
     if (ratio <= 1.0) {
         return (Math.pow(ratio, 9.98) *rssiCorrection);
     }
     return ((0.103 + 0.89978 *Math.pow(ratio, 7.71)) * rssiCorrection);
}
//属性比较，用于从小到大排序
function prop_min_compare(prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
        }
        if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }            
    } 
}
