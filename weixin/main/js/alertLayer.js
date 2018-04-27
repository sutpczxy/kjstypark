!function(window,document){
	function setOptions(opts1,opts2){
		for(var i in opts2){
			opts1[i] = opts2[i];
		}
		return opts1;
	}
	window.LoadingLayer = {
		_layer:null,
		show:function(content,element){
            element = element || document.body;
			if(LoadingLayer2._layer){
				LoadingLayer2._layer.parentNode.removeChild(LoadingLayer2._layer);
				LoadingLayer2._layer = null;
			}
			if(LoadingLayer._layer){
				LoadingLayer._layer.parentNode.removeChild(LoadingLayer._layer);
			}
			LoadingLayer._layer = document.createElement("div");
			LoadingLayer._layer.className = "loading-layer-container";
            LoadingLayer._layer.innerHTML = "<div class='box'><div class='spinner'></div><div class='content'>"+ ( content ? content : '请稍等...') +"</div></div>";
            element.appendChild(LoadingLayer._layer);
			window.setTimeout(function(){
				LoadingLayer._layer.className = LoadingLayer._layer.className + " show";
			},10);
		},
		hide:function(){
			if(!LoadingLayer._layer) return;
			LoadingLayer._layer.className = LoadingLayer._layer.className.replace(/show/g,"");
			window.setTimeout(function(){
				if(!LoadingLayer._layer) return;
				LoadingLayer._layer.parentNode.removeChild(LoadingLayer._layer);
				LoadingLayer._layer = null;
			},200);
		}
	};
	window.LoadingLayer2 = {
		_layer:null,
		_closeCallee:null,
		show:function(content,element, callback){
            element = element || document.body;
			LoadingLayer2._closeCallee = callback || function(){};
			if(LoadingLayer._layer){
				LoadingLayer._layer.parentNode.removeChild(LoadingLayer._layer);
				LoadingLayer._layer = null;
			}
			if(LoadingLayer2._layer){
				LoadingLayer2._layer.parentNode.removeChild(LoadingLayer2._layer);
			}
			LoadingLayer2._layer = document.createElement("div");
			LoadingLayer2._layer.className = "loading-layer-container loading-layer-container2";
            LoadingLayer2._layer.innerHTML = "<div class='box'><div class='spinner'></div><div class='content'>"+ ( content ? content : '请稍等...') +"</div><div class='close' onclick='LoadingLayer2._close()'></div></div>";
            element.appendChild(LoadingLayer2._layer);
			window.setTimeout(function(){
				LoadingLayer2._layer.className = LoadingLayer2._layer.className + " show";
			},10);
		},
		hide:function(){
			if(!LoadingLayer2._layer) return;
			LoadingLayer2._layer.className = LoadingLayer2._layer.className.replace(/show/g,"");
			window.setTimeout(function(){
				if(!LoadingLayer2._layer) return;
				LoadingLayer2._layer.parentNode.removeChild(LoadingLayer2._layer);
				LoadingLayer2._layer = null;
			},200);
			
		},
		_close:function(){
			LoadingLayer2.hide();
			LoadingLayer2._closeCallee();
		}
	};
	
	
	window.MaskLayer = {
		_layer:null,
		show:function(element){
			element = element || document.body;
			if(MaskLayer._layer){
				MaskLayer._layer.parentNode.removeChild(MaskLayer._layer);
			}
			MaskLayer._layer = document.createElement("div");
			MaskLayer._layer.className = "mask-layer-container";
			element.appendChild(MaskLayer._layer);
			window.setTimeout(function(){
				MaskLayer._layer.className = MaskLayer._layer.className + " show";
			},10);
		},
		hide:function(){
			if(!MaskLayer._layer) return;
			MaskLayer._layer.className = MaskLayer._layer.className.replace(/show/g,"");
			window.setTimeout(function(){
				if(!MaskLayer._layer) return;
				MaskLayer._layer.parentNode.removeChild(MaskLayer._layer);
				MaskLayer._layer = null;
			},200);
		}
	};
	window.AlertLayer = function(options,element){
        element = element || document.body;
		var _options = {
			showMaskLayer:true,
			content:"hello!",
			button:[
				{
					name:"取消",
					color:'#333333',
					callback:function(){}
				},
				{
					name:"确认",
					color:'#333333',
					callback:function(){}
				}
			]
		}
		var _opts = setOptions(_options, options);
		var $mask = document.createElement("div");
			$mask.className = "mask-layer-container";
		
		var $layer = document.createElement("div");
			$layer.className = "alert-layer-container";
		
		var $content = document.createElement("div");
			$content.className = "alert-content";
			$content.innerHTML = _opts.content;
			
		var $button = document.createElement("div");
			$button.className = "alert-button";
		for(var i = 0; i < _opts.button.length; i++){
			var _btn = _opts.button[i];
			var $btn = document.createElement("a");
			$btn.style.color = _btn.color;		
			$btn.innerHTML = _btn.name;
			$btn._callback = _btn.callback || function(){};
			$btn.addEventListener("click",function(e){
				e.preventDefault();
				
				_close();
				this._callback.apply($btn);
				
			},false);
			$button.appendChild($btn);
		}
		$layer.appendChild($content);
		$layer.appendChild($button);
		if(_opts.showMaskLayer)
            element.appendChild($mask);
        element.appendChild($layer);
		window.setTimeout(function(){
			$mask.className = $mask.className + " show";
			$layer.className = $layer.className + " show";
		},10);
		
		//close
		function _close(){
			$layer.className = $layer.className.replace(/show/g,"");
			$mask.className = $mask.className.replace(/show/g,"");
			window.setTimeout(function(){
				if($layer.parentNode){
					 $layer.parentNode.removeChild($layer);
				}
				if(_opts.showMaskLayer && $mask.parentNode){
					$mask.parentNode.removeChild($mask);
				}
			},200);
		}
		return {
			close:function(){
                _close();
			}
		}
	};
}(window,document);