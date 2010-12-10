/*
 * Aurora UI Library.
 * Copyright(c) 2010, Hand China Co.,Ltd.
 * 
 * http://www.hand-china.com
 */

/**
 * @class Aurora
 * Aurora UI 核心工具类.
 * @author 牛佳庆
 * @singleton
 */
$A = Aurora = {version: '1.0',revision:'$Rev$'};
//$A.firstFire = false;
$A.fireWindowResize = function(){
	$A.Cover.resizeCover();
}
Ext.EventManager.on(window, "resize", $A.fireWindowResize, this);

$A.cache = {};
$A.cmps = {};
$A.onReady = Ext.onReady;
$A.get = Ext.get;
$A.focusWindow;

$A.center = function(el){
	var ele;
	if(typeof(el)=="string"){
        var cmp = $A.CmpManager.get(el)
        if(cmp){
            if(cmp.wrap){
                ele = cmp.wrap;
            }
        }else{
             ele = Ext.get(el);
        }             
    }else{
        ele = Ext.get(el);
    }
    var screenWidth = $A.getViewportWidth();
    var screenHeight = $A.getViewportHeight();
    var x = Math.max(0,(screenWidth - ele.getWidth())/2);
    var y = Math.max(0,(screenHeight - ele.getHeight())/2);
    ele.setStyle('position','absolute');
    ele.moveTo(x,y);
}

$A.setTheme = function(theme){
	if(theme) {
		var exp  = new Date();   
	    exp.setTime(exp.getTime() + 24*3600*1000);
	    document.cookie = "app_theme="+ escape (theme) + ";expires=" + exp.toGMTString(); 
	    window.location.reload();
	}
}
$A.CmpManager = function(){
    return {
        put : function(id, cmp){
        	if($A.focusWindow) $A.focusWindow.cmps[id] = cmp;
        	if(!this.cache) this.cache = {};
        	if(this.cache[id] != null) {
	        	alert("错误: ID为' " + id +" '的组件已经存在!");
	        	return;
	        }
        	this.cache[id]=cmp;
        	cmp.on('mouseover',$A.CmpManager.onCmpOver,$A.CmpManager);
        	cmp.on('mouseout',$A.CmpManager.onCmpOut,$A.CmpManager);
        },
        onCmpOver: function(cmp, e){
        	if($A.validInfoType != 'tip') return;
        	if($A.Grid && cmp instanceof $A.Grid){
        		var ds = cmp.dataset;
        		if(!ds||ds.isValid == true)return;
        		var target = Ext.fly(e.target).findParent('td');
                if(target){
                    var atype = Ext.fly(target).getAttributeNS("","atype");
            		if(atype == 'grid-cell'){
            			var rid = Ext.fly(target).getAttributeNS("","recordid");
            			var record = ds.findById(rid);
            			if(record){
                			var name = Ext.fly(target).getAttributeNS("","dataindex");        			
        					var msg = record.valid[name];
        	        		if(Ext.isEmpty(msg))return;
        	        		$A.ToolTip.show(target, msg);
            			}
                    }
        		}
        	}else{
	        	if(cmp.binder){
	        		var ds = cmp.binder.ds;
	        		if(!ds || ds.isValid == true)return;
	        		var record = cmp.record;
	        		if(!record)return;
	        		var msg = record.valid[cmp.binder.name];
	        		if(Ext.isEmpty(msg))return;
	        		$A.ToolTip.show(cmp.id, msg);
	        	}
        	}
        },
        onCmpOut: function(cmp,e){
        	if($A.validInfoType != 'tip') return;
        	$A.ToolTip.hide();
        },
        getAll : function(){
        	return this.cache;
        },
        remove : function(id){
        	var cmp = this.cache[id];
        	cmp.un('mouseover',$A.CmpManager.onCmpOver,$A.CmpManager);
        	cmp.un('mouseout',$A.CmpManager.onCmpOut,$A.CmpManager);
        	delete this.cache[id];
        },
        get : function(id){
        	if(!this.cache) return null;
        	return this.cache[id];
        }
    };
}();
Ext.Ajax.on("requestexception", function(conn, response, options) {
	if($A.slideBarEnable)$A.SideBar.enable = $A.slideBarEnable;
	$A.manager.fireEvent('ajaxerror', $A.manager, response.status, response);
	if($A.logWindow){
		var record = $('HTTPWATCH_DATASET').getCurrentRecord();
		var st = $A['_startTime'];
		var ed = new Date();					
		record.set('spend',ed-st);
		record.set('status',response.status);
		record.set('result',response.statusText);
		record.set('response',response.statusText);
	}
	switch(response.status){
		case 404:
			$A.showErrorMessage('404错误', '未找到 "'+ response.statusText+'"',null,400,150);
			break;
		case 500:
            $A.showErrorMessage(response.status + '错误', response.responseText,null,500,300);
            break;
		default:
			$A.showErrorMessage('错误', response.statusText);
			break;
	}	
}, this);
$ = $A.getCmp = function(id){
	var cmp = $A.CmpManager.get(id)
	if(cmp == null) {
		alert('未找到组件:' + id)
	}
	return cmp;
}
$A.setCookie = function(name,value){
    document.cookie = name + "="+ escape (value);
}
$A.getCookie = function(name){
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
     if(arr != null) return unescape(arr[2]); return null;

}
$A.getViewportHeight = function(){
    if(Ext.isIE){
        return Ext.isStrict ? document.documentElement.clientHeight :
                 document.body.clientHeight;
    }else{
        return self.innerHeight;
    }
}
$A.getViewportWidth = function() {
    if(Ext.isIE){
        return Ext.isStrict ? document.documentElement.clientWidth :
                 document.body.clientWidth;
    }else{
        return self.innerWidth;
    }
}
//$A.recordSize = function(){
//    var w = $A.getViewportWidth();
//    var h = $A.getViewportHeight();
//    document.cookie = "vw="+w;
//    document.cookie = "vh="+h;
//}
//$A.recordSize();
$A.post = function(action,data){
    var form = Ext.getBody().createChild({tag:'form',method:'post',action:action});
    for(var key in data){
    	if(data[key])
        form.createChild({tag:"input",type:"hidden",name:key,value:data[key]});
    }
    form.dom.submit();
}
$A.request = function(opt){
	var url = opt.url,para = opt.para,successCall = opt.success,errorCall = opt.error,scope = opt.scope,failureCall = opt.failure;
	var opts = Ext.apply({},opt.opts);
	$A.manager.fireEvent('ajaxstart', url, para);
	if($A.logWindow){
		$A['_startTime'] = new Date();
		$('HTTPWATCH_DATASET').create({'url':url,'request':Ext.util.JSON.encode({parameter:para})})
	}
	Ext.Ajax.request({
		url: url,
		method: 'POST',
		params:{_request_data:Ext.util.JSON.encode({parameter:para})},
		opts:opts,
		success: function(response,options){
			if($A.logWindow){
				var st = $A['_startTime'];
				var ed = new Date();					
				var record = $('HTTPWATCH_DATASET').getCurrentRecord();
				record.set('spend',ed-st);
				record.set('result',response.statusText);
				record.set('status',response.status);
				record.set('response',response.responseText);
			}
			$A.manager.fireEvent('ajaxcomplete', url, para,response);
			if(response){
				var res = null;
				try {
					res = Ext.decode(response.responseText);
				}catch(e){
					$A.showErrorMessage('错误', '返回格式不正确!');
					return;
				}
				if(res && !res.success){
					$A.manager.fireEvent('ajaxfailed', $A.manager, url,para,res);
					if(res.error){
						var st = res.error.stackTrace;
						st = (st) ? st.replaceAll('\r\n','</br>') : '';
						if(res.error.message) {
							var h = (st=='') ? 150 : 250;
						    $A.showErrorMessage('错误', res.error.message+'</br>'+st,null,400,h);
						}else{
						    $A.showErrorMessage('错误', st,null,400,250);
						}
						if(errorCall)
                        errorCall.call(scope, res, options);	
					}								    						    
				} else {
					$A.manager.fireEvent('ajaxsuccess', $A.manager, url,para,res);
					if(successCall)successCall.call(scope,res, options);
				}
			}
		},
		failure : function(response, options){
            if(failureCall)failureCall.call(scope, response, options);
		},
		scope: scope
	});
}
Aurora.dateFormat = function () { 
	var masks = {  
        "default":      "ddd mmm dd yyyy HH:MM:ss",  
        shortDate:      "m/d/yy",  
        mediumDate:     "mmm d, yyyy",  
        longDate:       "mmmm d, yyyy",  
        fullDate:       "dddd, mmmm d, yyyy",  
        shortTime:      "h:MM TT",  
        mediumTime:     "h:MM:ss TT",  
        longTime:       "h:MM:ss TT Z",  
        isoDate:        "yyyy-mm-dd",  
        isoTime:        "HH:MM:ss",  
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",  
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"  
    };
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,  
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,  
        timezoneClip = /[^-+\dA-Z]/g,  
        pad = function (val, len) {  
            val = String(val);  
            len = len || 2;  
            while (val.length < len) val = "0" + val;  
            return val;  
        },
        hasTimeStamp = function(mask,token){
	    	return !!String(masks[mask] || mask || masks["default"]).match(token);
        },
        _parseDate=function(string,mask,fun){
        	for(var i=0,arr=mask.match(token),numbers=string.match(/\d+/g),value;i<arr.length;i++){
        		if(numbers.length==arr.length)value=numbers[i];
        		else value=parseInt(string.slice(index=mask.search(arr[i]),index+arr[i].length));
        		switch(arr[i]){
        			case "mm":;
        			case "m":value=value-1;break;
        		}
        		fun(arr[i],value);
        	}
        }; 
    return {
    	pad:pad,
    	parseDate:function(string,mask,utc){
    		if(typeof string!="string"||string=="")return null;
    		mask = String(masks[mask] || mask || masks["default"]); 
    		if (mask.slice(0, 4) == "UTC:") {  
	            mask = mask.slice(4);  
	            utc = true;  
	        }
    		var date=new Date(1970,1,2,0,0,0),
    			_ = utc ? "setUTC" : "set",  
	            d = date[_ + "Date"],  
	            m = date[_ + "Month"],  
	            yy = date[_ + "FullYear"], 
	            y = date[_ + "Year"], 
	            H = date[_ + "Hours"],  
	            M = date[_ + "Minutes"],  
	            s = date[_ + "Seconds"],  
	            L = date[_ + "Milliseconds"],  
	            //o = utc ? 0 : date.getTimezoneOffset();
				flags = {  
	                d:    d,  
	                dd:   d,
	                m:    m,  
	                mm:   m,  
	                yy:   y,  
	                yyyy: yy,  
	                h:    H,  
	                hh:   H,  
	                H:    H,  
	                HH:   H,  
	                M:    M,  
	                MM:   M,  
	                s:    s,  
	                ss:   s,  
	                l:    L,  
	                L:    L
	            }; 
	            try{
					_parseDate(string,mask,function($0,value){
					   	flags[$0].call(date,value);
					});
	            }catch(e){throw new SyntaxError("invalid date");}
				if (isNaN(date)) throw new SyntaxError("invalid date"); 
				return date;
    	},
	    format:function (date, mask, utc) {    
	        if (arguments.length == 1 && (typeof date == "string" || date instanceof String) && !/\d/.test(date)) {  
	            mask = date;  
	            date = undefined;  
	        }   
	        date = date ? new Date(date) : new Date();  
	        if (isNaN(date)) throw new SyntaxError("invalid date");  
	  
	        mask = String(masks[mask] || mask || masks["default"]);  
	        if (mask.slice(0, 4) == "UTC:") {  
	            mask = mask.slice(4);  
	            utc = true;  
	        }  
	  
	        var _ = utc ? "getUTC" : "get",  
	            d = date[_ + "Date"](),  
	            D = date[_ + "Day"](),  
	            m = date[_ + "Month"](),  
	            y = date[_ + "FullYear"](),  
	            H = date[_ + "Hours"](),  
	            M = date[_ + "Minutes"](),  
	            s = date[_ + "Seconds"](),  
	            L = date[_ + "Milliseconds"](),  
	            o = utc ? 0 : date.getTimezoneOffset(),  
	            flags = {  
	                d:    d,  
	                dd:   pad(d),
	                m:    m + 1,  
	                mm:   pad(m + 1),  
	                yy:   String(y).slice(2),  
	                yyyy: y,  
	                h:    H % 12 || 12,  
	                hh:   pad(H % 12 || 12),  
	                H:    H,  
	                HH:   pad(H),  
	                M:    M,  
	                MM:   pad(M),  
	                s:    s,  
	                ss:   pad(s),  
	                l:    pad(L, 3),  
	                L:    pad(L > 99 ? Math.round(L / 10) : L),  
	                t:    H < 12 ? "a"  : "p",  
	                tt:   H < 12 ? "am" : "pm",  
	                T:    H < 12 ? "A"  : "P",  
	                TT:   H < 12 ? "AM" : "PM",  
	                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),  
	                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),  
	                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]  
	            }; 
	        return mask.replace(token, function ($0) {  
	            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);  
	        });  
	    },
	    isDateTime:function(mask){
	    	return hasTimeStamp(mask,/([HhMs])\1?/);
	    }
    };  
}();

Ext.applyIf(String.prototype, {
	trim : function(){
		return this.replace(/(^\s*)|(\s*$)/g, "");
	}
});
Ext.applyIf(Date.prototype, {
    format : function(mask, utc){
        return Aurora.dateFormat.format(this, mask, utc);  
    }
});
Ext.applyIf(Array.prototype, {
	add : function(o){
		if(this.indexOf(o) == -1)
		this[this.length] = o;
	}
});
Ext.applyIf(String.prototype, {
    replaceAll : function(s1,s2){
        return this.replace(new RegExp(s1,"gm"),s2);  
    }
}); 
Ext.applyIf(String.prototype, {
    parseDate : function(mask,utc){
        return Aurora.dateFormat.parseDate(this.toString(),mask,utc);  
    }
}); 
$A.TextMetrics = function(){
    var shared;
    return {
        measure : function(el, text, fixedWidth){
            if(!shared){
                shared = $A.TextMetrics.Instance(el, fixedWidth);
            }
            shared.bind(el);
            shared.setFixedWidth(fixedWidth || 'auto');
            return shared.getSize(text);
        }
    };
}();
$A.TextMetrics.Instance = function(bindTo, fixedWidth){
    var ml = new Ext.Element(document.createElement('div'));
    document.body.appendChild(ml.dom);
    ml.position('absolute');
    ml.setLeft(-1000);
    ml.setTop(-1000);    
    ml.hide();
    if(fixedWidth){
        ml.setWidth(fixedWidth);
    }
    var instance = {      
        getSize : function(text){
            ml.update(text);            
            var s=new Object();
            s.width=ml.getWidth();
            s.height=ml.getHeight();
            ml.update('');
            return s;
        },       
        bind : function(el){
        	var a=new Array('font-size','font-style', 'font-weight', 'font-family','line-height', 'text-transform', 'letter-spacing');	
        	var len = a.length, r = {};
        	for(var i = 0; i < len; i++){
                r[a[i]] = Ext.fly(el).getStyle(a[i]);
            }
            ml.setStyle(r);           
        },       
        setFixedWidth : function(width){
            ml.setWidth(width);
        }       
    };
    instance.bind(bindTo);
    return instance;
};
$A.ToolTip = function(){
	q = {
		init: function(){
			var sf = this;
			Ext.onReady(function(){
				var qdom = Ext.DomHelper.append(
				    Ext.getBody(),
				    {
					    tag: 'div',
					    cls: 'tip-wrap',
					    children: [{tag: 'div', cls:'tip-body'}]
				    }
				);
				var sdom = Ext.DomHelper.append(Ext.getBody(),{tag:'div',cls: 'item-shadow'});
				sf.tip = Ext.get(qdom);
				sf.shadow = Ext.get(sdom);
				sf.body = sf.tip.first("div.tip-body");
			})
			
		},
		show: function(el, text){
			if(this.tip == null){
				this.init();
				//return;
			}
			this.tip.show();
			this.shadow.show();
			this.body.update(text)
			var ele;
			if(typeof(el)=="string"){
				if(this.sid==el) return;
				this.sid = el;
				var cmp = $A.CmpManager.get(el)
				if(cmp){
					if(cmp.wrap){
						ele = cmp.wrap;
					}
				}				
			}else{
				ele = Ext.get(el);
			}
			this.shadow.setWidth(this.tip.getWidth())
			this.shadow.setHeight(this.tip.getHeight())
			this.correctPosition(ele);
		},
		correctPosition: function(ele){
			var screenWidth = $A.getViewportWidth();
			var x = ele.getX()+ele.getWidth() + 5;
			var sx = ele.getX()+ele.getWidth() + 7;
			if(x+this.tip.getWidth() > screenWidth){
				x = ele.getX() - this.tip.getWidth() - 5;
				sx = ele.getX() - this.tip.getWidth() - 3;
			}
			this.tip.setX(x);
			this.tip.setY(ele.getY());
			this.shadow.setX(sx);
			this.shadow.setY(this.tip.getY()+ 2)
		},
		hide: function(){
			this.sid = null;
			if(this.tip != null) this.tip.hide();
			if(this.shadow != null) this.shadow.hide();
		}
	}
	return q
}();
$A.SideBar = function(){
    var m = {
    	enable:true,
        bar:null,
        show : function(msg){
        	if(!this.enable)return;
//            this.hide();
            var sf = this;
            if(parent.showSideBar){
                parent.showSideBar(msg)
            }else{
            	this.hide();
                var p = '<div class="item-slideBar">'+msg+'</div>';
                this.bar = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
                this.bar.setStyle('z-index', 999999);
                this.bar.animate({height: {to: 50, from: 0}},0.35,function(){
                    setTimeout(function(){
                       sf.hide();
                    }, 2000);            
                },'easeOut','run');
            }
        },
        hide : function(){
        	if(parent.hideSideBar){
                parent.hideSideBar()
            }else{
                if(this.bar) {
                    Ext.fly(this.bar).remove();
                    this.bar = null;
                }
            }
        }
    }
    return m;
}();
$A.Status = function(){
    var m = {
        bar:null,
        enable:true,
        show : function(msg){
        	if(!this.enable)return;
        	this.hide();
        	if(parent.showStatus) {
        	   parent.showStatus(msg);
        	}else{
                var p = '<div class="item-statusBar" unselectable="on">'+msg+'</div>';
                this.bar = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
                this.bar.setStyle('z-index', 999998);
        	}
        },
        hide : function(){
        	if(parent.hideStatus){
                parent.hideStatus();
        	}else{
                if(this.bar) {
                    Ext.fly(this.bar).remove();
                    this.bar = null;
                }
        	}
        }
    }
    return m;
}();
$A.Cover = function(){
	var m = {
		bodyOverflow:null,
		sw:null,
		sh:null,
		container: {},
		cover : function(el){
			$A.Cover.bodyOverflow = Ext.getBody().getStyle('overflow');			
			var scrollWidth = Ext.isStrict ? document.documentElement.scrollWidth : document.body.scrollWidth;
    		var scrollHeight = Ext.isStrict ? document.documentElement.scrollHeight : document.body.scrollHeight;
    		var screenWidth = Math.max(scrollWidth,$A.getViewportWidth());
    		var screenHeight = Math.max(scrollHeight,$A.getViewportHeight());
			var p = '<DIV class="aurora-cover" style="left:0px;top:0px;width:'+(screenWidth)+'px;height:'+(screenHeight)+'px;" unselectable="on"></DIV>';
			var cover = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
	    	cover.setStyle('z-index', Ext.fly(el).getStyle('z-index') - 1);
	    	Ext.getBody().setStyle('overflow','hidden');
	    	$A.Cover.container[el.id] = cover;
		},
		uncover : function(el){
			var cover = $A.Cover.container[el.id];
			if(cover) {
				Ext.fly(cover).remove();
				$A.Cover.container[el.id] = null;
				delete $A.Cover.container[el.id];
			}
			var reset = true;
			for(key in $A.Cover.container){
                if($A.Cover.container[key]) {
                    reset = false; 	
                    break;
                }
            }
            if(reset&&$A.Cover.bodyOverflow)Ext.getBody().setStyle('overflow',$A.Cover.bodyOverflow);
		},
		resizeCover : function(){
			var scrollWidth = Ext.isStrict ? document.documentElement.scrollWidth : document.body.scrollWidth;
    		var scrollHeight = Ext.isStrict ? document.documentElement.scrollHeight : document.body.scrollHeight;
    		var screenWidth = Math.max(scrollWidth,$A.getViewportWidth());
    		var screenHeight = Math.max(scrollHeight,$A.getViewportHeight())
    		if($A.Cover.sw == screenWidth && $A.Cover.sh == screenHeight) return;
    		$A.Cover.sw = screenWidth;
    		$A.Cover.sh = screenHeight;
			for(key in $A.Cover.container){
				var cover = $A.Cover.container[key];
				Ext.fly(cover).setWidth(screenWidth);
				Ext.fly(cover).setHeight(screenHeight);
			}		
		}
	}
	return m;
}();
$A.Masker = function(){
    var m = {
        container: {},
        mask : function(el,msg){
        	if($A.Masker.container[el.id]){
        	   return;
        	}
        	msg = msg||'正在操作...';
        	var el = Ext.get(el);
            var w = el.getWidth();
            var h = el.getHeight();//display:none;
            var p = '<div class="aurora-mask"  style="left:0px;top:0px;width:'+w+'px;height:'+h+'px;position: absolute;"><div unselectable="on"></div><span style="top:'+(h/2-11)+'px">'+msg+'</span></div>';
            var masker = Ext.get(Ext.DomHelper.append(el.parent(),p));
            var zi = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index');
            masker.setStyle('z-index', zi + 1);
            masker.setXY(el.getXY());
            var sp = masker.child('span');
            var size = $A.TextMetrics.measure(sp,msg);
            sp.setLeft((w-size.width)/2)
            $A.Masker.container[el.id] = masker;
        },
        unmask : function(el){
            var masker = $A.Masker.container[el.id];
            if(masker) {
                Ext.fly(masker).remove();
                $A.Masker.container[el.id] = null;
                delete $A.Masker.container[el.id];
            }
        }
    }
    return m;
}();
Ext.util.JSON.encodeDate = function(o){
	var pad = function(n) {
        return n < 10 ? "0" + n : n;
    };
    return '"' + o.getFullYear() + "-" +
            pad(o.getMonth() + 1) + "-" +
            pad(o.getDate()) /*+ " " +
            pad(o.getHours()) + ":" +
            pad(o.getMinutes()) + ":" +
            pad(o.getSeconds())*/ + '"';
};
Ext.Element.prototype.update = function(html, loadScripts, callback){
    if(typeof html == "undefined"){
        html = "";
    }
    if(loadScripts !== true){
        this.dom.innerHTML = html;
        if(typeof callback == "function"){
            callback();
        }
        return this;
    }
    var id = Ext.id();
    var dom = this.dom;

    html += '<span id="' + id + '"></span>';
    Ext.lib.Event.onAvailable(id, function(){
    	var links = [];
    	var scripts = [];
        var hd = document.getElementsByTagName("head")[0];
        for(var i=0;i<hd.childNodes.length;i++){
        	var he = hd.childNodes[i];
        	if(he.tagName == 'LINK') {
        		links.push(he.href);
        	}else if(he.tagName == 'SCRIPT'){
        		scripts.push(he.src);
        	}
        }
        var jsre = /(?:<script([^>]*)?>)((\n|\r|.)*?)(?:<\/script>)/ig;
        var jsSrcRe = /\ssrc=([\'\"])(.*?)\1/i;
        
        var cssre = /(?:<link([^>]*)?>)((\n|\r|.)*?)/ig;
        var cssHreRe = /\shref=([\'\"])(.*?)\1/i;
		
		var cssm;
		while(cssm = cssre.exec(html)){
			var attrs = cssm[1];
			var srcMatch = attrs ? attrs.match(cssHreRe) : false;
			if(srcMatch && srcMatch[2]){
				var included = false;
				for(var i=0;i<links.length;i++){
					var link = links[i];
					if(link.indexOf(srcMatch[2]) != -1){
						included = true;
						break;
					}
				}
				if(!included) {
                	var s = document.createElement("link");
					s.type = 'text/css';
					s.rel = 'stylesheet';
                   	s.href = srcMatch[2];
                   	hd.appendChild(s);
                }
			}
		}
        var match;
        var jslink = [];
        var jsscript = [];
        while(match = jsre.exec(html)){
            var attrs = match[1];
            var srcMatch = attrs ? attrs.match(jsSrcRe) : false;
            if(srcMatch && srcMatch[2]){
            	var included = false;
				for(var i=0;i<scripts.length;i++){
					var script = scripts[i];
					if(script.indexOf(srcMatch[2]) != -1){
						included = true;
						break;
					}
				}
               	if(!included) {
               		jslink[jslink.length] = {
               			src:srcMatch[2],
               			type:'text/javascript'
               		}
               	} 
            }else if(match[2] && match[2].length > 0){
            	jsscript[jsscript.length] = match[2];
            }
        }
        var loaded = 0;
        
        
        
        
        var onReadOnLoad = function(){
            var isready = Ext.isIE ? (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") : true;
            if(isready) {
                loaded ++;
                if(loaded==jslink.length) {
                    for(j=0,k=jsscript.length;j<k;j++){
                        var jst = jsscript[j];
                        if(window.execScript) {
                            window.execScript(jst);
                        } else {
                            window.eval(jst);
                        }
                    }
                }else{
                	var js = jslink[loaded];
                    var s = document.createElement("script");
                    s.src = js.src;
                    s.type = js.type;
                    s[Ext.isIE ? "onreadystatechange" : "onload"] = onReadOnLoad;
                    hd.appendChild(s);
                }
            }
        }
        
        if(jslink.length > 0){
            var js = jslink[0];
            var s = document.createElement("script");
            s.src = js.src;
            s.type = js.type;
            s[Ext.isIE ? "onreadystatechange" : "onload"] = onReadOnLoad;
            hd.appendChild(s);
        }
        
        
//        for(var i = 0,l=jslink.length;i<l;i++){
//        	var js = jslink[i];
//        	var s = document.createElement("script");
//            s.src = js.src;
//            s.type = js.type;
//            s[Ext.isIE ? "onreadystatechange" : "onload"] = function(){
//           	var isready = Ext.isIE ? (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") : true;
//            	if(isready) {
//            		alert(this.readyState + " " + Aurora.Tree)
//	            	loaded ++;
//	            	if(loaded==jslink.length) {
//	                    for(j=0,k=jsscript.length;j<k;j++){
//		                	var jst = jsscript[j];
//		                	if(window.execScript) {
//		                    	window.execScript(jst);
//		                    } else {
//		                    	window.eval(jst);
//		                    }
//		                }
//	            	}
//            	}
//            };
//			hd.appendChild(s);
//        }
        if(jslink.length ==0) {
        	for(j=0,k=jsscript.length;j<k;j++){
            	var jst = jsscript[j];
            	if(window.execScript) {
                   window.execScript(jst);
                } else {
                   window.eval(jst);
                }
            }
        }        
        var el = document.getElementById(id);
        if(el){Ext.removeNode(el);} 
	    Ext.fly(dom).setStyle('display', 'block');
	    if(typeof callback == "function"){
                callback();
        }
    });
    Ext.fly(dom).setStyle('display', 'none');
    dom.innerHTML = html.replace(/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig, "").replace(/(?:<link.*?>)((\n|\r|.)*?)/ig, "");
    return this;
}

Ext.EventObjectImpl.prototype['isSpecialKey'] = function(){
    var k = this.keyCode;
    return (this.type == 'keypress' && this.ctrlKey) || k==8 || k== 46 || k == 9 || k == 13  || k == 40 || k == 27 || k == 44 ||
    (k == 16) || (k == 17) ||
    (k >= 18 && k <= 20) ||
    (k >= 33 && k <= 35) ||
    (k >= 36 && k <= 39);
}
$A.parseDate = function(str){
	if(typeof str == 'string'){  
		
		//TODO:临时, 需要服务端解决
//		if(str.indexOf('.0') !=-1) str = str.substr(0,str.length-2);
		
		var results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) *$/);      
		if(results && results.length>3)      
	  		return new Date(parseInt(results[1]),parseInt(results[2],10) -1,parseInt(results[3],10));       
		results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);  
	    if(results && results.length>6)      
    	return new Date(parseInt(results[1]),parseInt(results[2],10) -1,parseInt(results[3],10),parseInt(results[4],10),parseInt(results[5],10),parseInt(results[6],10));       
	}      
  	return null;      
}
$A.getRenderer = function(renderer){
	if(!renderer) return null;
	var rder;
    if(renderer.indexOf('Aurora.') != -1){
        rder = $A[renderer.substr(7,renderer.length)]
    }else{
        rder = window[renderer];
    }
    return rder;
}

$A.formatDate = function(date){
	if(!date)return '';
	if(date.format)return date.format('isoDate');
	return date;
}
$A.formatDateTime = function(date){
	if(!date)return '';
	if(date.format)return date.format('yyyy-mm-dd HH:MM:ss');
	return date;
}
$A.formatNumber = function(value){
	if(!value)return '';
    var ps = String(value).split('.');
    var sub = (ps.length==2)?'.'+ps[1]:'';
    var whole = ps[0];
    var r = /(\d+)(\d{3})/;
    while (r.test(whole)) {
        whole = whole.replace(r, '$1' + ',' + '$2');
    }
    v = whole + sub;
    return v;   
}
$A.removeNumberFormat = function(rv){
    rv = String(rv||'');
    while (rv.indexOf(',')!=-1) {
        rv = rv.replace(',', '');
    }
    return isNaN(rv) ? parseFloat(rv) : rv;
}

$A.EventManager = Ext.extend(Ext.util.Observable,{
	constructor: function() {
		$A.EventManager.superclass.constructor.call(this);
		this.initEvents();
	},
	initEvents : function(){
    	this.addEvents(
    		'ajaxerror',
    		'ajaxsuccess',
    		'ajaxfailed',
    		'ajaxstart',
    		'ajaxcomplete',
    		'valid',
	        'timeout'
		);    	
    }
});
$A.manager = new $A.EventManager();
$A.manager.on('ajaxstart',function(){
    $A.Status.show('正在请求数据....');   
})
$A.manager.on('timeout',function(){
    $A.Status.hide();
})
$A.manager.on('ajaxerror',function(){
    $A.Status.hide();
})
$A.manager.on('ajaxcomplete',function(){
    $A.Status.hide();
})
$A.manager.on('ajaxsuccess',function(){
    $A.SideBar.show('操作成功!')
})

$A.regEvent = function(name, hanlder){
	$A.manager.on(name, hanlder);
}

$A.validInfoType = 'area';
$A.validInfoTypeObj = '';
$A.setValidInfoType = function(type, obj){
	$A.validInfoType = type;
	$A.validInfoTypeObj = obj;
}

$A.invalidRecords = {};
$A.addInValidReocrd = function(id, record){
	var rs = $A.invalidRecords[id];
	if(!rs){
		$A.invalidRecords[id] = rs = [];
	}
	var has = false;
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		if(r.id == record.id){
			has = true;
			break;
		}
	}
	if(!has) {
		rs.add(record)
	}
}
$A.removeInvalidReocrd = function(id,record){
	var rs = $A.invalidRecords[id];
	if(!rs) return;
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		if(r.id == record.id){
			rs.remove(r)
			break;
		}
	}
}
$A.getInvalidRecords = function(pageid){
	var records = [];
	for(var key in $A.invalidRecords){
		var ds = $A.CmpManager.get(key)
		if(ds.pageid == pageid){
			var rs = $A.invalidRecords[key];
			records = records.concat(rs);
		}
	}
	return records;
}
$A.isInValidReocrdEmpty = function(pageid){
	var isEmpty = true;
	for(var key in $A.invalidRecords){
		var ds = $A.CmpManager.get(key)
		if(ds.pageid == pageid){
			var rs = $A.invalidRecords[key];
			if(rs.length != 0){
				isEmpty = false;
				break;
			}
		}
	}
	return isEmpty;
}
$A.manager.on('valid',function(manager, ds, valid){
	switch($A.validInfoType){
		case 'area':
			$A.showValidTopMsg(ds);
			break;
		case 'message':
			$A.showValidWindowMsg(ds);
			break;
	}
})
$A.showValidWindowMsg = function(ds) {
	var empty = $A.isInValidReocrdEmpty(ds.pageid);
	if(empty == true){
		if($A.validWindow)$A.validWindow.close();
	}
	if(!$A.validWindow && empty == false){
		$A.validWindow = $A.showWarningMessage('校验失败','',400,200);
		$A.validWindow.on('close',function(){
			$A.validWindow = null;			
		})
	}
	var sb =[];
	var rs = $A.getInvalidRecords(ds.pageid);
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		var index = r.ds.data.indexOf(r)+1
		sb[sb.length] ='记录<a href="#" onclick="$(\''+r.ds.id+'\').locate('+index+')">('+r.id+')</a>:';

		for(var k in r.valid){
			sb[sb.length] = r.valid[k]+';'
		}
		sb[sb.length]='<br/>';
	}
	if($A.validWindow)$A.validWindow.body.child('div').update(sb.join(''))
}
$A.pageids = [];
$A.showValidTopMsg = function(ds) {
	var empty = $A.isInValidReocrdEmpty(ds.pageid);
	if(empty == true){
		var d = Ext.get(ds.pageid+'_msg');
		if(d){
			d.hide();
			d.setStyle('display','none')
			d.update('');
		}
		return;
	}
	var rs = $A.getInvalidRecords(ds.pageid);
	var sb = [];
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		var index = r.ds.data.indexOf(r)+1
		sb[sb.length] ='记录<a href="#" onclick="$(\''+r.ds.id+'\').locate('+index+')">('+r.id+')</a>:';

		for(var k in r.valid){
			sb[sb.length] = r.valid[k]+';'
		}
		sb[sb.length]='<br/>';		
	}
	var d = Ext.get(ds.pageid+'_msg');
	if(d){
		d.update(sb.join(''));
		d.show(true);
	}					
}
//Ext.get(document.documentElement).on('keydown',function(e){
//	if(e.altKey&&e.keyCode == 76){
//		if(!$A.logWindow) {
//			$A.logWindow = new $A.Window({modal:false, url:'log.screen',title:'AjaxWatch', height:550,width:530});	
//			$A.logWindow.on('close',function(){
//				delete 	$A.logWindow;		
//			})
//		}
//	}
//})
$A.setValidInfoType('tip'); 
/**
 * @class Aurora.DataSet
 * @extends Ext.util.Observable
 * <p>DataSet是一个数据源，也是一个数据集合，它封装了所有数据的操作，校验，提交等操作.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.AUTO_ID = 1000;
$A.DataSet = Ext.extend(Ext.util.Observable,{
	constructor: function(config) {//datas,fields, type
		$A.DataSet.superclass.constructor.call(this);
		config = config || {};
		if(config.listeners){
            this.on(config.listeners);
        }
		this.pageid = config.pageid;
    	this.spara = {};
    	this.selected = [];
    	this.pagesize = config.pagesize || 10;
    	this.submiturl = config.submiturl || '';
    	this.queryurl = config.queryurl || '';
    	this.fetchall = config.fetchall||false;
    	this.selectable = config.selectable||false;
    	this.selectionmodel = config.selectionmodel||'multiple';
    	this.autocount = config.autocount;
    	this.bindtarget = config.bindtarget;
    	this.bindname = config.bindname;
		this.loading = false;
    	this.qpara = {};
    	this.fields = {};
    	this.resetConfig();
		this.id = config.id || Ext.id();
        $A.CmpManager.put(this.id,this)	
        if(this.bindtarget&&this.bindname) this.bind($(this.bindtarget),this.bindname);//$(this.bindtarget).bind(this.bindname,this);
    	this.qds = Ext.isEmpty(config.querydataset) ? null :$(config.querydataset);
    	if(this.qds != null && this.qds.getCurrentRecord() == null) this.qds.create();
    	this.initEvents();
    	if(config.fields)this.initFields(config.fields)
    	if(config.datas && config.datas.length != 0) {
    		this.loadData(config.datas);
    		//this.locate(this.currentIndex); //不确定有没有影响
    	}
    	if(config.autoquery === true) {
            var sf = this;
            Ext.onReady(function(){
               sf.query(); 
            });
    	}
    	if(config.autocreate==true) {
            if(this.data.length == 0)
            this.create();
    	}
    },
    destroy : function(){
    	if(this.bindtarget&&this.bindname){
            var bd = $A.CmpManager.get(this.bindtarget)
            if(bd)bd.clearBind();
    	}
    	$A.CmpManager.remove(this.id);
    	delete $A.invalidRecords[this.id]
    },
    reConfig : function(config){
    	this.resetConfig();
    	Ext.apply(this, config);
    },
    /**
     * 取消绑定.
     */
    clearBind : function(){
    	var name = this.bindname;
        var ds = this.fields[name].pro['dataset'];
        if(ds)
        ds.processBindDataSetListener(this,'un');
        delete this.fields[name];
    },
    processBindDataSetListener : function(ds,ou){
        var bdp = this.onDataSetModify;
//        this[ou]('beforecreate', this.beforeCreate, this);//TODO:有待测试
        this[ou]('add', bdp, this);
        this[ou]('remove', bdp, this);
        this[ou]('update', bdp, this);
        this[ou]('clear', bdp, this);
        this[ou]('load', this.onDataSetLoad, this);
        this[ou]('reject', bdp, this);
        ds[ou]('indexchange',this.onDataSetIndexChange, this);
    },
    /**
     * 将组件绑定到某个DataSet的某个Field上.
     * @param {Aurora.DataSet} dataSet 绑定的DataSet.
     * @param {String} name Field的name. 
     * 
     */
    bind : function(ds, name){
        if(ds.fields[name]) {
            alert('重复绑定 ' + name);
            return;
        }
        this.processBindDataSetListener(ds,'un');
        this.processBindDataSetListener(ds,'on');
        var field = new $A.Record.Field({
            name:name,
            type:'dataset',
            dataset:this
        });
        ds.fields[name] = field;
    },
    onDataSetIndexChange : function(ds, record){
    	if(!record.get(this.bindname) && record.isNew != true){
    		this.qpara = {};
            Ext.apply(this.qpara,record.data);
            this.query(1,{record:record});
    	} 	
    },
    onDataSetModify : function(){
    	var bt = $A.CmpManager.get(this.bindtarget);
    	if(bt){
            this.refreshBindDataSet(bt.getCurrentRecord(),this.getConfig())
    	}
    },
    onDataSetLoad : function(ds,options){
    	var record;
    	if(options){
    		record = options.opts.record;
    	}else{
    		var bt = $A.CmpManager.get(this.bindtarget);
    		if(bt) record = bt.getCurrentRecord();    		
    	}
    	if(record)
    	this.refreshBindDataSet(record,ds.getConfig())
    },
   	refreshBindDataSet: function(record,config){
    	if(!record)return;
    	record.set(this.bindname,config,true)//this.getConfig()
//    	for(var k in this.fields){
//    		var field = this.fields[k];
//    		if(field.type == 'dataset'){  
//    			var ds = field.pro['dataset'];
////    			if(ds && clear==true)ds.resetConfig();
//    			record.set(field.name,ds.getConfig(),true)
//    		}
//    	}
    },
    beforeCreate: function(ds, record, index){
    	if(this.data.length == 0){
    		this.create({},false);
    	}
    },
    resetConfig : function(){
    	this.data = [];
    	this.selected = [];
    	this.gotoPage = 1;
    	this.currentPage = 1;
    	this.currentIndex = 1;
    	this.totalCount = 0;
    	this.totalPage = 0;
    	this.isValid = true;
//    	this.bindtarget = null;
//        this.bindname = null;
    },
    getConfig : function(){
    	var c = {};
//    	c.id = this.id;
    	c.xtype = 'dataset';
    	c.data = this.data;
    	c.selected = this.selected;
    	c.isValid = this.isValid;
//    	c.bindtarget = this.bindtarget;
//        c.bindname = this.bindname;
    	c.gotoPage = this.gotoPage;
    	c.currentPage = this.currentPage;
    	c.currentIndex = this.currentIndex;
    	c.totalCount = this.totalCount;
    	c.totalPage = this.totalPage;
    	return c;
    },
    initEvents : function(){
    	this.addEvents( 
            /**
             * @event ajaxfailed
             * ajax调用失败.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'ajaxfailed',
    	    /**
             * @event beforecreate
             * 数据创建前事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
    		'beforecreate',
    		/**
             * @event metachange
             * meta配置改变事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 当前的record.
             * @param {Aurora.Record.Meta} meta meta配置对象.
             * @param {String} type 类型.
             * @param {Object} value 值.
             */
	        'metachange',
	        /**
             * @event fieldchange
             * field配置改变事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 当前的record.
             * @param {Aurora.Record.Field} field Field配置对象.
             * @param {String} type 类型.
             * @param {Object} value 值.
             */
	        'fieldchange',
	        /**
             * @event add
             * 数据增加事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 增加的record.
             * @param {Number} index 指针.
             */
	        'add',
	        /**
             * @event remove
             * 数据删除事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 删除的record.
             * @param {Number} index 指针.
             */
	        'remove',
	        /**
             * @event beforeremove
             * 数据删除前.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'beforeremove',
	        /**
             * @event update
             * 数据更新事件.
             * "update", this, record, name, value
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 更新的record.
             * @param {String} name 更新的field.
             * @param {Object} value 更新的值.
             * @param {Object} oldvalue 更新前的值.
             */
	        'update',
	        /**
             * @event clear
             * 清除数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
	        'clear',
	        /**
             * @event beforeload
             * 准备加载数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */ 
	        'beforeload',
            /**
             * @event load
             * 加载数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */ 
	        'load',
	        /**
             * @event loadfailed
             * 加载数据失败.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */ 
            'loadfailed',
	        /**
             * @event refresh
             * 刷新事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */ 
	        'refresh',
	        /**
             * @event valid
             * DataSet校验事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 校验的record.
             * @param {String} name 校验的field.
             * @param {Boolean} valid 校验结果. true 校验成功  false 校验失败
             */ 
	        'valid',
	        /**
             * @event indexchange
             * DataSet当前指针改变事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 当前record.
             */ 
	        'indexchange',
	        /**
             * @event select
             * 选择数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 选择的record.
             */ 
	        'select',
	        /**
             * @event select
             * 取消选择数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 取消选择的record.
             */
	        'unselect',
	        /**
             * @event reject
             * 数据重置事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 取消选择的record.
             * @param {String} name 重置的field.
             * @param {Object} value 重置的值.
             */
	        'reject',
	        /**
             * @event submit
             * 数据提交事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
	        'submit',
	        /**
             * @event submitsuccess
             * 数据提交成功事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'submitsuccess',
	        /**
             * @event submitfailed
             * 数据提交失败事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
	        'submitfailed'
		);    	
    },
    initFields : function(fields){
    	for(var i = 0, len = fields.length; i < len; i++){
    		var field = new $A.Record.Field(fields[i]);
	        this.fields[field.name] = field;
        }
    },
    /**
     * 获取Field配置.
     * @param {String} name Field的name. 
     * @return {Aurora.Record.Field} field配置对象
     */
    getField : function(name){
    	return this.fields[name];
    },
    loadData : function(datas, num, options){
        this.data = [];
        this.selected = [];
        if(num) {
        	this.totalCount = num;
        }else{
        	this.totalCount = datas.length;
        }
    	this.totalPage = Math.ceil(this.totalCount/this.pagesize)
    	for(var i = 0, len = datas.length; i < len; i++){
    		var data = datas[i].data||datas[i];
    		for(var key in this.fields){
    			var field = this.fields[key];
    			if(field){
                    data[key] = this.processData(data[key],field)
    			}
    		}
    		var record = new $A.Record(data,datas[i].field);
            record.setDataSet(this);
	        this.data.add(record);
        }
        if(this.sortInfo) this.sort();
        
        var needFire = true;
        if(this.bindtarget && options){
           var cr = $A.CmpManager.get(this.bindtarget).getCurrentRecord();
           if(options.opts.record && cr!=options.opts.record){
               this.refreshBindDataSet(options.opts.record,this.getConfig());
               needFire = false;
           }
        }
        if(needFire)
        this.fireEvent("load", this, options);
    },
    sort : function(f, direction){
    	//TODO:grid已经实现服务端排序
    },
    create : function(data, valid){
    	this.fireEvent("beforecreate", this);
    	data = data||{}
//    	if(valid !== false) if(!this.validCurrent())return;
    	var dd = {};
    	for(var k in this.fields){
    		var field = this.fields[k];
    		var dv = field.getPropertity('defaultvalue');
    		if(dv && !data[field.name]){
    			dd[field.name] = dv;
    		}
    	}
    	var data = Ext.apply(data||{},dd);
    	var record = new $A.Record(data);
        this.add(record); 
//        var index = (this.currentPage-1)*this.pagesize + this.data.length;
//        this.locate(index, true);
        return record;
    },
    /**
     * 获取所有新创建的数据. 
     * @return {Array} 所有新创建的records
     */
    getNewRecrods: function(){
        var records = this.getAll();
        var news = [];
       	for(var k = 0,l=records.length;k<l;k++){
			var record = records[k];
			if(record.isNew == true){
				news.add(record);
			}
		}
		return news;
    },
//    validCurrent : function(){
//    	var c = this.getCurrentRecord();
//    	if(c==null)return true;
//    	return c.validateRecord();
//    },
    /**
     * 新增数据. 
     * @param {Aurora.Record} record 需要新增的Record对象. 
     */
    add : function(record){
    	record.isNew = true;
        record.setDataSet(this);
        var index = this.data.length;
        this.data.add(record);
//        for(var k in this.fields){
//    		var field = this.fields[k];
//    		if(field.type == 'dataset'){    			
//    			var ds = field.pro['dataset'];
//    			ds.resetConfig()   			
//    		}
//    	}
        var index = (this.currentPage-1)*this.pagesize + this.data.length;
        this.currentIndex = index;
        this.fireEvent("add", this, record, index);
        this.locate(index, true);
    },
    /**
     * 获取当前指针的Record. 
     * @return {Aurora.Record} 当前指针所处的Record
     */
    getCurrentRecord : function(){
    	if(this.data.length ==0) return null;
    	return this.data[this.currentIndex - (this.currentPage-1)*this.pagesize -1];
    },
    /**
     * 插入数据. 
     * @param {Number} index  指定位置. 
     * @param {Array} records 需要新增的Record对象集合.
     */
    insert : function(index, records){
        records = [].concat(records);
        var splice = this.data.splice(index,this.data.length);
        for(var i = 0, len = records.length; i < len; i++){
            records[i].setDataSet(this);
            this.data.add(records[i]);
        }
        this.data = this.data.concat(splice);
        this.fireEvent("add", this, records, index);
    },
    /**
     * 移除数据.  
     * @param {Aurora.Record} record 需要移除的Record.
     */
    remove : function(record){  
    	if(!record){
    		record = this.getCurrentRecord();
    	}
    	if(!record)return;
    	this.fireEvent("beforeremove", this);
    	var rs = [].concat(record);
    	var rrs = [];
    	for(var i=0;i<rs.length;i++){
    		var r = rs[i]
    		if(r.isNew){
                this.removeLocal(r);
    		}else{    		
                rrs[rrs.length] = r;
    		}
    	}
    	this.removeRemote(rrs);    	
    },
    removeRemote: function(rs){    	
    	if(this.submiturl == '') return;
    	var p = [];
    	for(var k=0;k<rs.length;k++){
    		var r = rs[k]
    		for(var key in this.fields){
                var f = this.fields[key];
                if(f && f.type == 'dataset') delete r.data[key];
            }
        	var d = Ext.apply({}, r.data);
    		d['_id'] = r.id;
    		d['_status'] = 'delete';
            p[k] = Ext.apply(d,this.spara)
    	}
//    	var p = [d];
//    	for(var i=0;i<p.length;i++){
//    		p[i] = Ext.apply(p[i],this.spara)
//    	}
    	if(p.length > 0) {
    		var opts;
    		if(this.bindtarget){
                var bd = $A.CmpManager.get(this.bindtarget);
                opts = {record:bd.getCurrentRecord(),dataSet:this};
    		}
	    	$A.request({url:this.submiturl, para:p, success:this.onRemoveSuccess, error:this.onSubmitError, scope:this, failure:this.onAjaxFailed,opts:opts});
    	}
    
    },
    onRemoveSuccess: function(res,options){
    	if(res.result.record){
    		var datas = [].concat(res.result.record);
    		if(this.bindtarget){
                var bd = $A.CmpManager.get(this.bindtarget);
                if(bd.getCurrentRecord()==options.opts.record){
                    for(var i=0;i<datas.length;i++){
                        var data = datas[i];
                        this.removeLocal(this.findById(data['_id']),true); 
                    }
                }else{
                    var config = options.opts.record.get(this.bindname);
                    var ds = new $A.DataSet({});
                    ds.reConfig(config);
                    for(var i=0;i<datas.length;i++){
                        var data = datas[i];
                        ds.removeLocal(ds.findById(data['_id']),true);
                    }
                    this.refreshBindDataSet(options.opts.record,ds.getConfig())
                    delete ds;
                }
            }else{
                for(var i=0;i<datas.length;i++){
                    var data = datas[i];
                    this.removeLocal(this.findById(data['_id']),true); 
                }
            }
    	}
    },
    removeLocal: function(record,count){
    	$A.removeInvalidReocrd(this.id, record)
    	var index = this.data.indexOf(record);    	
    	if(index == -1)return;
        this.data.remove(record);
        if(count) this.totalCount --;
        this.selected.remove(record);
        if(this.data.length == 0){
        	this.removeAll();
        	return;
        }
        var lindex = this.currentIndex - (this.currentPage-1)*this.pagesize;
        if(lindex<0)return;
        if(lindex<=this.data.length){
        	this.locate(this.currentIndex,true);
        }else{
        	this.pre();
        }
//        if(this.currentIndex<=this.data.length){
////        	this.next();
//        	this.locate(this.currentIndex,true);
//        }else{
////        	this.pre();
//        	var index = this.currentIndex-1;
//        	if(index>=0)
//        	this.locate(index,true);
//        }
        this.fireEvent("remove", this, record, index);    	
    },
    /**
     * 获取当前数据集下的所有数据.  
     * @return {Array} records 当前数据集的所有Record.
     */
    getAll : function(){
    	return this.data;    	
    },
    /**
     * 查找数据.  
     * @param {String} property 查找的属性.
     * @param {Object} value 查找的属性的值.
     * @return {Aurora.Record} 符合查找条件的第一个record
     */
    find : function(property, value){
    	var r = null;
    	this.each(function(record){
    		var v = record.get(property);
    		if(v ==value){
    			r = record;
    			return false;    			
    		}
    	}, this)
    	return r;
    },
    /**
     * 根据id查找数据.  
     * @param {String} id id.
     * @return {Aurora.Record} 查找的record
     */
    findById : function(id){
    	var find = null;
    	for(var i = 0,len = this.data.length; i < len; i++){
            if(this.data[i].id == id){
            	find = this.data[i]
                break;
            }
        }
        return find;
    },
    /**
     * 删除所有数据.
     */
    removeAll : function(){
    	this.currentIndex = 1;
        this.data = [];
        this.selected = [];
        this.fireEvent("clear", this);
    },
    /**
     * 返回指定record的位置
     * @return {Number} record所在的位置
     */
    indexOf : function(record){
        return this.data.indexOf(record);
    },
    /**
     * 获取指定位置的record
     * @param {Number} 位置
     */
    getAt : function(index){
        return this.data[index];
    },
    each : function(fn, scope){
        var items = [].concat(this.data); // each safe for removal
        for(var i = 0, len = items.length; i < len; i++){
            if(fn.call(scope || items[i], items[i], i, len) === false){
                break;
            }
        }
    },
    processCurrentRow : function(){
    	var r = this.getCurrentRecord();
    	for(var k in this.fields){
    		var field = this.fields[k];
    		if(field.type == 'dataset'){
    			var ds = field.pro['dataset'];
    			if(r && r.data[field.name]){
    				ds.reConfig(r.data[field.name]);
    			}else{
    				ds.resetConfig();
    			}
    			ds.fireEvent('refresh',ds)
    			ds.processCurrentRow();
    		}
    	}
    	if(r) this.fireEvent("indexchange", this, r);
    },
    /**
     * 获取所有选择的数据.
     * @return {Array} 所有选择数据.
     */
    getSelected : function(){
    	return this.selected;
    },
    /**
     * 选择所有数据.
     */
    selectAll : function(){
    	for(var i=0,l=this.data.length;i<l;i++){
    		this.select(this.data[i]);
    	}
    },
    /**
     * 取消所有选择.
     */
    unSelectAll : function(){
    	for(var i=0,l=this.data.length;i<l;i++){
    		this.unSelect(this.data[i]);
    	}
    },
    /**
     * 选择某个record.
     * @param {Aurora.Record} record 需要选择的record.
     */
    select : function(r){
    	if(typeof(r) == 'string') r = this.findById(r);
    	if(this.selectable && this.selectionmodel == 'multiple'){
    		if(this.selected.indexOf(r) == -1) {
    			this.selected.add(r);
    			this.fireEvent('select', this, r);
    		}
       	}else{
       		if(this.selected.indexOf(r) == -1) {
	       		var or = this.selected[0];
	       		this.unSelect(or);
	       		this.selected = []
	       		this.selected.add(r);
	       		this.fireEvent('select', this, r);
       		}
       	}
    },
    /**
     * 取消选择某个record.
     * @param {Aurora.Record} record 需要取消选择的record.
     */
    unSelect : function(r){
    	if(typeof(r) == 'string') r = this.findById(r);
    	if(this.selectable){
    		if(this.selected.indexOf(r) != -1) {
    			this.selected.remove(r);
    			this.fireEvent('unselect', this, r);
    		}
    	}
    },
    /**
     * 定位到某个指针位置.
     * @param {Number} index 指针位置.
     */
    locate : function(index, force){
    	if(this.currentIndex == index && force !== true) return;
//    	if(valid !== false) if(!this.validCurrent())return;
    	if(index <=0 || (index > this.totalCount + this.getNewRecrods().length))return;
    	var lindex = index - (this.currentPage-1)*this.pagesize;
    	if(this.data[lindex - 1]){
	    	this.currentIndex = index;
    	}else{
    		if(this.isModified()){
    			$A.showInfoMessage('提示', '有未保存数据!')
    		}else{
				this.currentIndex = index;
				this.currentPage =  Math.ceil(index/this.pagesize);
				this.query(this.currentPage);
				return;
    		}
    	}
    	this.processCurrentRow();
    },
    /**
     * 定位到某页.
     * @param {Number} page 页数.
     */
    goPage : function(page){
    	if(page >0) {
    		this.gotoPage = page;
	    	var go = (page-1)*this.pagesize + this.getNewRecrods().length +1;
//	    	var go = Math.max(0,page-2)*this.pagesize + this.data.length + 1;
	    	this.locate(go);
    	}
    },
    /**
     * 定位到所有数据的第一条位置.
     */
    first : function(){
    	this.locate(1);
    },
    /**
     * 向前移动一个指针位置.
     */
    pre : function(){
    	this.locate(this.currentIndex-1);    	
    },
    /**
     * 向后移动一个指针位置.
     */
    next : function(){
    	this.locate(this.currentIndex+1);
    },
    /**
     * 定位到第一页.
     */
    firstPage : function(){
    	this.goPage(1);
    },
    /**
     * 向前移动一页.
     */
    prePage : function(){
    	this.goPage(this.currentPage -1);
    },
    /**
     * 向后移动一页.
     */
    nextPage : function(){
    	this.goPage(this.currentPage +1);
    },
    /**
     * 定位到最后一页.
     */
    lastPage : function(){
    	this.goPage(this.totalPage);
    },
    /**
     * 对当前数据集进行校验.
     * @return {Boolean} valid 校验结果.
     */
    validate : function(fire){
    	this.isValid = true;
    	var current = this.getCurrentRecord();
    	var records = this.getAll();
		var dmap = {};
		var hassub = false;
		var unvalidRecord = null;
					
    	for(var k in this.fields){
    		var field = this.fields[k];
    		if(field.type == 'dataset'){
    			hassub = true;
    			var d = field.pro['dataset'];
    			dmap[field.name] = d;
    		}
    	}
    	for(var k = 0,l=records.length;k<l;k++){
			var record = records[k];
			//有些项目是虚拟的字段,例如密码修改
//			if(record.dirty == true || record.isNew == true) {
				if(!record.validateRecord()){
					this.isValid = false;
					unvalidRecord = record;
					$A.addInValidReocrd(this.id, record);
				}else{
					$A.removeInvalidReocrd(this.id, record);
				}
				if(this.isValid == false) {
					if(hassub)break;
				}else {
					for(key in dmap){
						var ds = dmap[key];
						if(record.data[key]){
    						ds.reConfig(record.data[key]);
    						if(!ds.validate(false)) {
    							this.isValid = false;
    							unvalidRecord = record;
    						}
    						ds.reConfig(current.data[key]);//循环校验完毕后,重新定位到当前行
						}
					}
					
					if(this.isValid == false) {
						break;
					}
									
//				}
			}
		}
		
		if(unvalidRecord != null){
			var r = this.indexOf(unvalidRecord);
			if(r!=-1)this.locate(r+1);
		}
		if(fire !== false) {
			$A.manager.fireEvent('valid', $A.manager, this, this.isValid);
		}
		if(!this.isValid) $A.showInfoMessage('提示', '验证不通过!');
		return this.isValid;
    },
    /**
     * 设置查询的Url.
     * @param {String} url 查询的Url.
     */
    setQueryUrl : function(url){
    	this.queryurl = url;
    },
    /**
     * 设置查询的参数.
     * @param {String} para 参数名.
     * @param {Object} value 参数值.
     */
    setQueryParameter : function(para, value){
        this.qpara[para] = value;
    },
    /**
     * 设置查询的DataSet.
     * @param {Aurora.DataSet} ds DataSet.
     */
    setQueryDataSet : function(ds){ 
    	this.qds = ds;
    	if(this.qds.getCurrentRecord() == null) this.qds.create();
    },
    /**
     * 设置提交的Url.
     * @param {String} url 提交的Url.
     */
    setSubmitUrl : function(url){
    	this.submiturl = url;
    },
    /**
     * 设置提交的参数.
     * @param {String} para 参数名.
     * @param {Object} value 参数值.
     */
    setSubmitParameter : function(para, value){
        this.spara[para] = value;
    },
    /**
     * 查询数据.
     * @param {Number} page(可选) 查询的页数.
     */
    query : function(page,opts){
    	$A.slideBarEnable = $A.SideBar.enable;
    	$A.SideBar.enable = false;
    	var r;
    	if(this.qds) {
    		if(this.qds.getCurrentRecord() == null) this.qds.create();
    		if(!this.qds.validate()) return;
    		r = this.qds.getCurrentRecord();
    	}
    	if(!this.queryurl) return;
    	if(!page) this.currentIndex = 1;
    	this.currentPage = page || 1;
    	
    	var q = {};
    	if(r != null) Ext.apply(q, r.data);
    	Ext.apply(q, this.qpara);
    	for(var k in q){
    	   var v = q[k];
    	   if(Ext.isEmpty(v,false)) delete q[k];
    	}
    	var para = 'pagesize='+this.pagesize + 
    				  '&pagenum='+this.currentPage+
    				  '&_fetchall='+this.fetchall+
    				  '&_autocount='+this.autocount
//    				  + '&_rootpath=list'
    	var url = '';
    	if(this.queryurl.indexOf('?') == -1){
    		url = this.queryurl + '?' + para;
    	}else{
    		url = this.queryurl + '&' + para;
    	}
    	this.loading = true;
    	this.fireEvent("beforeload", this);
//    	this.fireBindDataSetEvent("beforeload", this);//主dataset无数据,子dataset一直loading
    	$A.request({url:url, para:q, success:this.onLoadSuccess, error:this.onLoadError, scope:this,failure:this.onAjaxFailed,opts:opts});
    },
    /**
     * 判断当前数据集是否发生改变.
     * @return {Boolean} modified 是否发生改变.
     */
    isModified : function(){
    	var modified = false;
    	var records = this.getAll();
		for(var k = 0,l=records.length;k<l;k++){
			var record = records[k];
			if(record.dirty == true || record.isNew == true) {
				modified = true;
				break;
			}else{
                for(var key in this.fields){
                    var field = this.fields[key];
                    if(field.type == 'dataset'){                
                        var ds = field.pro['dataset'];
                        ds.reConfig(record.data[field.name]);
                        if(ds.isModified()){
                            modified = true;
                            break;
                        }
                    }
                }
			}
		}
		return modified;
    },
//    isDataModified : function(){
//    	var modified = false;
//    	for(var i=0,l=this.data.length;i<l;i++){
//    		var r = this.data[i];    		
//    		if(r.dirty || r.isNew){
//    			modified = true;
//    			break;
//    		}
//    	}
//    	return modified;
//    },
    /**
     * 以json格式返回当前数据集.
     * @return {Object} json 返回的json对象.
     */
    getJsonData : function(selected){
    	var datas = [];
    	var items = this.data;
    	if(selected) items = this.getSelected();
    	for(var i=0,l=items.length;i<l;i++){
    		var r = items[i];
    		var isAdd = r.dirty || r.isNew
			var d = Ext.apply({}, r.data);
			d['_id'] = r.id;
			d['_status'] = r.isNew ? 'insert' : 'update';
			for(var k in r.data){
				var item = d[k]; 
				if(item && item.xtype == 'dataset'){
					var ds = new $A.DataSet({});//$(item.id);
					ds.reConfig(item)
					isAdd = isAdd == false ? ds.isModified() :isAdd;
					d[k] = ds.getJsonData();
				}
			}
    		if(isAdd||selected){
	    		datas.push(d);    			
			}
    	}
    	
    	return datas;
    },
    doSubmit : function(url, items){
        if(!this.validate()){           
            return;
        }
        this.submiturl = url||this.submiturl;
        if(this.submiturl == '') return;
        var p = items;//this.getJsonData();
        this.fireBindDataSetEvent("submit");
        for(var i=0;i<p.length;i++){
            var data = p[i]
            for(var key in data){
                var f = this.fields[key];
                if(f && f.type != 'dataset' && data[key]==='')data[key]=null;
            }
            p[i] = Ext.apply(p[i],this.spara)
        }
        
        //if(p.length > 0) {
//            this.fireEvent("submit", this);
            $A.request({url:this.submiturl, para:p, success:this.onSubmitSuccess, error:this.onSubmitError, scope:this,failure:this.onAjaxFailed});
        //}
    },
    /**
     * 提交选中数据.
     * @return {String} url(可选) 提交的url.
     */
    submitSelected : function(url){
        this.doSubmit(url,this.getJsonData(true));
    },
    /**
     * 提交数据.
     * @return {String} url(可选) 提交的url.
     */
    submit : function(url){
    	this.doSubmit(url,this.getJsonData());
    },
    fireBindDataSetEvent : function(event){
    	this.fireEvent(event,this);
        for(var k in this.fields){
            var field = this.fields[k];
            if(field.type == 'dataset'){  
                var ds = field.pro['dataset'];
                if(ds) {
                    ds.fireBindDataSetEvent(event)
                }
            }
        }
    },
    afterEdit : function(record, name, value,oldvalue) {
        this.fireEvent("update", this, record, name, value,oldvalue);
    },
    afterReject : function(record, name, value) {
    	this.fireEvent("reject", this, record, name, value);
    },
    onSubmitSuccess : function(res){
    	var datas = []
    	if(res.result.record){
    		datas = [].concat(res.result.record);
    		this.commitRecords(datas,true)
    	}
    	this.fireBindDataSetEvent('submitsuccess');
    },
    commitRecords : function(datas,fire){
    	//this.resetConfig();
    	for(var i=0,l=datas.length;i<l;i++){
    		var data = datas[i];
	    	var r = this.findById(data['_id']);
	    	if(r.isNew) this.totalCount ++;
	    	if(!r) return;
	    	r.commit();
	    	for(var k in data){
	    		var field = k;
				var f = this.fields[field];
				if(f && f.type == 'dataset'){
					var ds = f.pro['dataset'];
					ds.reConfig(r.data[f.name]);
	    			if(data[k].record) {
                        ds.commitRecords([].concat(data[k].record), this.getCurrentRecord() == r);                     
	    			}
				}else{
					var ov = r.get(field);
					var nv = data[k]
					if(field == '_id' || field == '_status'||field=='__parameter_parsed__') continue;
					if(f){
					   nv = this.processData(nv,f);
					}
					if(ov != nv) {
						if(fire){
							//由于commit放到上面,这个时候不改变状态,防止重复提交
                            r.set(field,nv, true);
						}else{
                            r.data[field] = nv;
						}
					}
				}
	       	}
//	       	r.commit();//挪到上面了,record.set的时候会触发update事件,重新渲染.有可能去判断isNew的状态
    	}
    },
    processData: function(value,field){
        var dt = field.getPropertity('datatype');
        dt = dt ? dt.toLowerCase() : '';
        var v = value;
        switch(dt){
            case 'date':
                v = $A.parseDate(v);
                break;
            case 'java.util.date':
                v = $A.parseDate(v);
                break;
            case 'java.sql.date':
                v = $A.parseDate(v);
                break;
            case 'int':
                v = parseInt(v);
                break;
        }
        return v;
    },    
    onSubmitError : function(res){
//    	$A.showErrorMessage('错误', res.error.message||res.error.stackTrace,null,400,200);
    	this.fireBindDataSetEvent('submitfailed');
    },
    onLoadSuccess : function(res, options){
    	if(res == null) return;
    	if(!res.result.record) res.result.record = [];
    	var records = [].concat(res.result.record);
    	var total = res.result.totalCount;
    	var datas = [];
    	if(records.length > 0){
    		for(var i=0,l=records.length;i<l;i++){
	    		var item = {
	    			data:records[i]	    		
	    		}
    			datas.push(item);
    		}
    	}else if(records.length == 0){
    		this.currentIndex  = 1
    	}
    	this.loading = false;
    	this.loadData(datas, total, options);
    	this.locate(this.currentIndex,true);
    	
        $A.SideBar.enable = $A.slideBarEnable;
	    
    },
    onAjaxFailed : function(res,opt){
    	this.fireBindDataSetEvent('ajaxfailed');
    },
    onLoadError : function(res,opt){
    	this.fireBindDataSetEvent('loadfailed', this);
//    	$A.showWarningMessage('错误', res.error.message||res.error.stackTrace,null,350,150);
    	this.loading = false;
    	$A.SideBar.enable = $A.slideBarEnable;
    },
    onFieldChange : function(record,field,type,value) {
    	this.fireEvent('fieldchange', this, record, field, type, value)
    },
    onMetaChange : function(record,meta,type,value) {
    	this.fireEvent('metachange', this, record, meta, type, value)
    },
    onRecordValid : function(record, name, valid){
    	if(valid==false && this.isValid !== false) this.isValid = false;
    	this.fireEvent('valid', this, record, name, valid)
    }
});

/**
 * @class Aurora.Record
 * <p>Record是一个数据对象.
 * @constructor
 * @param {Object} data 数据对象. 
 * @param {Array} fields 配置对象. 
 */
$A.Record = function(data, fields){
	/**
     * Record的id. (只读).
     * @type Number
     * @property
     */
    this.id = ++$A.AUTO_ID;
    /**
     * Record的数据 (只读).
     * @type Object
     * @property
     */
    this.data = data;
    /**
     * Record的Fields (只读).
     * @type Object
     * @property
     */
    this.fields = {};
    /**
     * Record的验证信息 (只读).
     * @type Object
     * @property
     */
    this.valid = {};
    /**
     * Record的验证结果 (只读).
     * @type Boolean
     * @property
     */
    this.isValid = true; 
    /**
     * 是否是新数据 (只读).
     * @type Boolean
     * @property
     */
    this.isNew = false;
    /**
     * 是否发生改变 (只读).
     * @type Boolean
     * @property
     */
	this.dirty = false;	
	/**
     * 编辑状态 (只读).
     * @type Boolean
     * @property
     */
	this.editing = false;
	/**
     * 编辑信息对象 (只读).
     * @type Object
     * @property
     */
	this.modified= null;
    this.meta = new $A.Record.Meta(this);
    if(fields)this.initFields(fields);
};
$A.Record.prototype = {
	commit : function() {
		this.editing = false;
		this.valid = {};
		this.isValid = true;
		this.isNew = false;
		this.dirty = false;
		this.modified = null;
	},
	initFields : function(fields){
		for(var i=0,l=fields.length;i<l;i++){
			var f = new $A.Record.Field(fields[i]);
			f.record = this;
			this.fields[f.name] = f;
		}
	},
	validateRecord : function() {
		this.isValid = true;
		this.valid = {};
		var df = this.ds.fields;
		var rf = this.fields;
		var names = [];
		for(var k in df){
			if(df[k].type !='dataset')
			names.add(k);
		}
		
		for(var k in rf){
			if(names.indexOf(k) == -1){
				if(rf[k].type !='dataset')
				names.add(k);
			}
		}
		for(var i=0,l=names.length;i<l;i++){
			if(this.isValid == true) {
				this.isValid = this.validate(names[i]);
			} else {
				this.validate(names[i]);
			}
		}
		return this.isValid;
	},
	validate : function(name){
		var valid = true;
		var v = this.get(name);
		var field = this.getMeta().getField(name)
        var validator = field.get('validator');
		if(Ext.isEmpty(v) && field.get('required') == true){
			this.valid[name] = '当前字段不能为空!';
			valid =  false;
		}else{
			var isvalid = true;
			if(validator){
				validator = window[validator];
				isvalid = validator.call(window,this, name, v);
				if(isvalid !== true){
					valid =	false;	
					this.valid[name] = isvalid;
				}
			}
		}
		if(valid==true) delete this.valid[name];
		this.ds.onRecordValid(this,name,valid);
		return valid;
	},
    setDataSet : function(ds){
        this.ds = ds;
    },
    getField : function(name){
    	return this.getMeta().getField(name);
    },
    getMeta : function(){
    	return this.meta;
    },
    copy : function(record){
    	if(record == this){
    		alert('不能copy自身!');
    		return;
    	}
    	if(record.dirty){
        	for(var n in record.modified){
        		this.set(n,record.get(n))
            }
    	}
    },
    /**
     * 设置值.
     * @param {String} name 设定值的名字.
     * @param {Object} value 设定的值.
     * @param {Boolean} notDirty true 不改变record的dirty状态.
     */
	set : function(name, value, notDirty){
        if(this.data[name] != value){
            if(!notDirty){
                this.dirty = true;
                if(!this.modified){
                    this.modified = {};
                }
                if(typeof this.modified[name] == 'undefined'){
                    this.modified[name] = this.data[name];
                }
            }
            var old = this.data[name];
            this.data[name] = value;
            if(!this.editing && this.ds) {
                this.ds.afterEdit(this, name, value, old);
            }
        }
        this.validate(name)
    },
    /**
     * 设置值.
     * @param {String} name 名字.
     * @return {Object} value 值.
     */
    get : function(name){
        return this.data[name];
    },
    reject : function(silent){
        var m = this.modified;
        for(var n in m){
            if(typeof m[n] != "function"){
                this.data[n] = m[n];
                this.ds.afterReject(this,n,m[n]);
            }
        }
        delete this.modified;
        this.editing = false;
        this.dirty = false;
    },
//    beginEdit : function(){
//        this.editing = true;
//        this.modified = {};
//    },
//    cancelEdit : function(){
//        this.editing = false;
//        delete this.modified;
//    },
//    endEdit : function(){
//        delete this.modified;
//        this.editing = false;
//        if(this.dirty && this.ds){
//            this.ds.afterEdit(this);//name,value怎么处理?
//        }        
//    },
    onFieldChange : function(name, type, value){
    	var field = this.getMeta().getField(name);
    	this.ds.onFieldChange(this, field, type, value);
    },
    onFieldClear : function(name){
    	var field = this.getMeta().getField(name);
    	this.ds.onFieldChange(this, field);
    },
    onMetaChange : function(meta, type, value){
    	this.ds.onMetaChange(this,meta, type, value);
    },
    onMetaClear : function(meta){
    	this.ds.onMetaChange(this,meta);
    }
}
$A.Record.Meta = function(r){
	this.record = r;
	this.pro = {};
}
$A.Record.Meta.prototype = {
	clear : function(){
		this.pro = {};
		this.record.onMetaClear(this);
	},
	getField : function(name){
		if(!name)return null;
    	var f = this.record.fields[name];
		var df = this.record.ds.fields[name];
		var rf;
    	if(!f){
    		if(df){
    			f = new $A.Record.Field({name:df.name,type:df.type||'string'});
    		}else{
    			f = new $A.Record.Field({name:name,type:'string'});//
    		}
			f.record = this.record;
			this.record.fields[f.name]=f;
    	}
    	
    	var pro = {};
    	if(df) pro = Ext.apply(pro, df.pro);
    	pro = Ext.apply(pro, this.pro);
    	pro = Ext.apply(pro, f.pro);
    	delete pro.name;
		delete pro.type;
    	f.snap = pro;
    	return f;
    },
	setRequired : function(r){
		var op = this.pro['required'];
		if(op !== r){
			this.pro['required'] = r;
			this.record.onMetaChange(this, 'required', r);
		}
	},
	setReadOnly : function(r){
		var op = this.pro['readonly'];
		if(op !== r){
			this.pro['readonly'] = r;
			this.record.onMetaChange(this,'readonly', r);
		}
	}
}
/**
 * @class Aurora.Record.Field
 * <p>Field是一个配置对象，主要配置指定列的一些附加属性，例如非空，只读，值列表等信息.
 * @constructor
 * @param {Object} data 数据对象. 
 */
$A.Record.Field = function(c){
    this.name = c.name;
    this.type = c.type;
    this.pro = c||{};
    this.record;
};
$A.Record.Field.prototype = {
	/**
	 * 清除所有配置信息.
	 */
	clear : function(){
		this.pro = {};
		this.record.onFieldClear(this.name);
	},
	setPropertity : function(type,value) {
		var op = this.pro[type];
		if(op !== value){
			this.pro[type] = value;
			this.record.onFieldChange(this.name, type, value);
		}
	},
	/**
	 * 获取配置信息
	 * @param {String} name 配置名
	 * @return {Object} value 配置值
	 */
	get : function(name){
		var v = null;
		if(this.snap){
			v = this.snap[name];
		}
		return v;
	},
	getPropertity : function(name){
		return this.pro[name]
	},
	/**
	 * 设置当前Field是否必输
	 * @param {Boolean} required  是否必输.
	 */
	setRequired : function(r){
		this.setPropertity('required',r);
	},
	/**
	 * 当前Field是否必输.
	 * @return {Boolean} required  是否必输.
	 */
    isRequired : function(){
        return this.getPropertity('required');
    },
	/**
	 * 设置当前Field是否只读.
	 * @param {Boolean} readonly 是否只读
	 */
	setReadOnly : function(r){	
		this.setPropertity('readonly',r);
	},
	/**
	 * 当前Field是否只读.
	 * @return {Boolean} readonly 是否只读
	 */
	isReadOnly : function(){
        return this.getPropertity('readonly');
	},
	/**
	 * 设置当前Field的数据集.
	 * @param {Object} r 数据集
	 */
	setOptions : function(r){
		this.setPropertity('options',r);
	},
	/**
     * 获取当前的数据集.
     * @return {Object} r 数据集
     */
	getOptions : function(){
		return this.getPropertity('options');
	},
	/**
     * 设置当前Field的映射.
     * 例如：<p>
       var mapping = [{from:'name', to: 'code'},{from:'service', to: 'name'}];</p>
       field.setMapping(mapping);
     * @return {Array} mapping 映射列表.
     * 
     */
	setMapping : function(m){
		this.setPropertity('mapping',m);
	},
	/**
     * 获取当前的映射.
     * @return {Array} array 映射集合
     */
	getMapping : function(){
        return this.getPropertity('mapping');
	},
	/**
     * 设置Lov弹出窗口的Title.
     * @param {String} title lov弹出窗口的Tile
     */
	setTitle : function(t){
		this.setPropertity('title',t);
	},
	/**
     * 设置Lov弹出窗口的宽度.
     * @param {Number} width lov弹出窗口的Width
     */
	setLovWidth : function(w){
        this.setPropertity('lovwidth',w);
	},
	/**
     * 设置Lov弹出窗口的高度.
     * @param {Number} height lov弹出窗口的Height
     */
	setLovHeight : function(h){
		this.setPropertity('lovheight',h);
	},
	/**
     * 设置Lov弹出窗口中grid的高度.
     * 配置这个主要是由于查询条件可能存在多个，导致查询的form过高.
     * @param {Number} height lov弹出窗口的grid组件的Height
     */
	setLovGridHeight : function(gh){
        this.setPropertity("lovgridheight",gh)
	},
	/**
     * 设置Lov的Model对象.
     * Lov的配置可以通过三种方式.(1)model (2)service (3)url.
     * @param {String} model lov配置的model.
     */
	setLovModel : function(m){
        this.setPropertity("lovmodel",m) 
	},
	/**
     * 设置Lov的Service对象.
     * Lov的配置可以通过三种方式.(1)model (2)service (3)url.
     * @param {String} service lov配置的service.
     */
	setLovService : function(m){
        this.setPropertity("lovservice",m) 
    },
    /**
     * 设置Lov的Url地址.
     * Lov的配置可以通过三种方式.(1)model (2)service (3)url.
     * 通过url打开的lov，可以不用调用setLovGridHeight
     * @param {String} url lov打开的url.
     */
    setLovUrl : function(m){
    	this.setPropertity("lovurl",m) 
    },
    setLovPara : function(name,value){
        var p = this.getPropertity('lovpara');
        if(!p){
            p = {};
            this.setPropertity("lovpara",p) 
        }
        if(value==null){
        	delete p[name]
        }else{
            p[name] = value;
        }
    }
	
}
/**
 * @class Aurora.Component
 * @extends Ext.util.Observable
 * <p>所有组件对象的父类.
 * <p>所有的子类将自动继承Component的所有属性和方法.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Component = Ext.extend(Ext.util.Observable,{
	constructor: function(config) {
        $A.Component.superclass.constructor.call(this);
        this.id = config.id || Ext.id();
        $A.CmpManager.put(this.id,this)
		this.initConfig=config;
		this.isHidden = false;
		this.isFireEvent = false;
		this.initComponent(config);
        this.initEvents();
    },
    initComponent : function(config){ 
		config = config || {};
        Ext.apply(this, config);
        this.wrap = Ext.get(this.id);
        if(this.listeners){
            this.on(this.listeners);
        }
    },
    processListener: function(ou){
    	this.processMouseOverOut(ou)
        if(this.marginwidth||this.marginheight) {
            Ext.EventManager[ou](window, "resize", this.windowResizeListener,this);
        }
    },
    processMouseOverOut : function(ou){
        this.wrap[ou]("mouseover", this.onMouseOver, this);
        this.wrap[ou]("mouseout", this.onMouseOut, this);
    },
    initEvents : function(){
    	this.addEvents(
    	'focus',
    	'blur',
    	/**
         * @event change
         * 组件值改变事件.
         * @param {Component} this 当前组件.
         * @param {Object} value 新的值.
         * @param {Object} oldValue 旧的值.
         */
    	'change',
    	/**
         * @event valid
         * 组件验证事件.
         * @param {Component} this 当前组件.
         * @param {Aurora.Record} record record对象.
         * @param {String} name 对象绑定的Name.
         * @param {Boolean} isValid 验证是否通过.
         */
    	'valid',
    	/**
         * @event mouseover
         * 鼠标经过组件事件.
         * @param {Component} this 当前组件.
         * @param {EventObject} e 鼠标事件对象.
         */
    	'mouseover',
    	/**
         * @event mouseout
         * 鼠标离开组件事件.
         * @param {Component} this 当前组件.
         * @param {EventObject} e 鼠标事件对象.
         */
    	'mouseout');
    	this.processListener('on');
    },
    windowResizeListener : function(){
        if(this.marginwidth){
            var wd = Aurora.getViewportWidth();
            this.setWidth(wd-this.marginwidth);
        }
        if(this.marginheight){
            var ht = Aurora.getViewportHeight();
            this.setHeight(ht-this.marginheight);           
        }
    },
    isEventFromComponent:function(el){
    	return this.wrap.contains(el)
    },
    move: function(x,y){
		this.wrap.setX(x);
		this.wrap.setY(y);
	},
	getBindName: function(){
		return this.binder ? this.binder.name : null;
	},
	getBindDataSet: function(){
		return this.binder ? this.binder.ds : null;
	},
	/**
     * 将组件绑定到某个DataSet的某个Field上.
     * @param {String/Aurora.DataSet} dataSet 绑定的DataSet. 可以是具体某个DataSet对象，也可以是某个DataSet的id.
     * @param {String} name Field的name. 
     */
    bind : function(ds, name){
    	this.clearBind();
    	if(typeof(ds) == 'string'){
    		ds = $(ds);
    	}
    	if(!ds)return;
    	this.binder = {
    		ds: ds,
    		name:name
    	}
    	this.record = ds.getCurrentRecord();
    	var field =  ds.fields[this.binder.name];
    	if(field) {
			var config={};
			Ext.apply(config,this.initConfig);
			Ext.apply(config, field.pro);
			delete config.name;
			delete config.type;
			this.initComponent(config);
			
    	}
    	ds.on('metachange', this.onRefresh, this);
    	ds.on('valid', this.onValid, this);
    	ds.on('remove', this.onRemove, this);
    	ds.on('clear', this.onClear, this);
    	ds.on('update', this.onUpdate, this);
    	ds.on('reject', this.onUpdate, this);
    	ds.on('fieldchange', this.onFieldChange, this);
    	ds.on('indexchange', this.onRefresh, this);
    	this.onRefresh(ds)
    },
    /**
     * 清除组件的绑定信息.
     * <p>删除所有绑定的事件信息.
     */
    clearBind : function(){
    	if(this.binder) {
    		var bds = this.binder.ds;
    		bds.un('metachange', this.onRefresh, this);
	    	bds.un('valid', this.onValid, this);
	    	bds.un('remove', this.onRemove, this);
	    	bds.un('clear', this.onClear, this);
	    	bds.un('update', this.onUpdate, this);
	    	bds.un('reject', this.onUpdate, this);
	    	bds.un('fieldchange', this.onFieldChange, this);
	    	bds.un('indexchange', this.onRefresh, this);
    	} 
		this.binder = null; 
		this.record = null;
    },
    /**
     * <p>销毁组件对象.</p>
     * <p>1.删除所有绑定的事件.</p>
     * <p>2.从对象管理器中删除注册信息.</p>
     * <p>3.删除dom节点.</p>
     */
    destroy : function(){
    	this.processListener('un');
    	$A.CmpManager.remove(this.id);
    	this.clearBind();
    	delete this.wrap;
    },
    onMouseOver : function(e){
    	this.fireEvent('mouseover', this, e);
    },
    onMouseOut : function(e){
    	this.fireEvent('mouseout', this, e);
    },
    onRemove : function(ds, record){
    	if(this.binder.ds == ds && this.record == record){
    		this.clearValue();
    	}
    },
    onCreate : function(ds, record){
    	this.clearInvalid();
    	this.record = ds.getCurrentRecord();
		this.setValue('',true);	
    },
    onRefresh : function(ds){
    	if(this.isFireEvent == true || this.isHidden == true) return;
    	this.clearInvalid();
		this.render(ds.getCurrentRecord());
    },
    render : function(record){
    	this.record = record;
    	if(this.record) {
			var value = this.record.get(this.binder.name);
			var field = this.record.getMeta().getField(this.binder.name);		
			var config={};
			Ext.apply(config,this.initConfig);
			Ext.apply(config, field.snap);
			this.initComponent(config);
			if(this.record.valid[this.binder.name]){
				this.markInvalid();
			}
			//TODO:和lov的设值有问题
//			if(this.value == value) return;
			if(!Ext.isEmpty(value,true)) {
                this.setValue(value,true);
			}else{
                this.clearValue();
			}
		} else {
			this.setValue('',true);
		}
    },
    onValid : function(ds, record, name, valid){
    	if(this.binder.ds == ds && this.binder.name == name && this.record == record){
	    	if(valid){
	    		this.fireEvent('valid', this, this.record, this.binder.name, true)
    			this.clearInvalid();
	    	}else{
	    		this.fireEvent('valid', this, this.record, this.binder.name, false);
	    		this.markInvalid();
	    	}
    	}    	
    },
    onUpdate : function(ds, record, name, value){
    	if(this.binder.ds == ds && this.record == record && this.binder.name == name && this.getValue() != value){
	    	this.setValue(value, true);
    	}
    },
    onFieldChange : function(ds, record, field){
    	if(this.binder.ds == ds && this.record == record && this.binder.name == field.name){
	    	this.onRefresh(ds);   	
    	}
    },
    onClear : function(ds){
    	this.clearValue();    
    },
    /**
     * 设置当前的值.
     * @param {Object} value 值对象
     * @param {Boolean} silent 是否更新到dataSet中
     */
    setValue : function(v, silent){
    	var ov = this.value;
    	this.value = v;
    	if(silent === true)return;
    	if(this.binder){
    		this.record = this.binder.ds.getCurrentRecord();
    		if(this.record == null){
                this.record = this.binder.ds.create({},false);                
            }
            this.record.set(this.binder.name,v);
            if(Ext.isEmpty(v,true)) delete this.record.data[this.binder.name];
    	}
    	if(ov!=v){
            this.fireEvent('change', this, v, ov);
    	}
    },
    /**
     * 返回当前值
     * @return {Object} value 返回值.
     */
    getValue : function(){
        var v= this.value;
        v=(v === null || v === undefined ? '' : v);
        return v;
    },
    setWidth: function(w){
    	this.width = w;
    	this.wrap.setWidth(w);
    },
    setHeight: function(h){
    	this.height = h;
    	this.wrap.setHeight(h);
    },
    clearInvalid : function(){},
    markInvalid : function(){},
    clearValue : function(){},
    initMeta : function(){},
    setDefault : function(){},
    setRequired : function(){},
    onDataChange : function(){},
    setWidth : function(w){
    	this.wrap.setStyle('width',w+'px');
    },
    setHeight : function(h){
    	this.wrap.setStyle('height',h+'px');
    }
});
/**
 * @class Aurora.Field
 * @extends Aurora.Component
 * <p>带有input标记的输入类的组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Field = Ext.extend($A.Component,{	
	validators: [],
	requiredCss:'item-notBlank',
	focusCss:'item-focus',
	readOnlyCss:'item-readOnly',
	emptyTextCss:'item-emptyText',
	invalidCss:'item-invalid',
	constructor: function(config) {
		config.required = config.required || false;
		config.readonly = config.readonly || false;
        $A.Field.superclass.constructor.call(this, config);
    },
    initElements : function(){
    	this.el = this.wrap.child('input[atype=field.input]'); 
    },
    initComponent : function(config){
    	$A.Field.superclass.initComponent.call(this, config);
    	this.initElements();
    	this.originalValue = this.getValue();
    	this.applyEmptyText();
    	this.initStatus();
    	if(this.hidden == true){
    		this.setVisible(false)
    	}
    },
    processListener: function(ou){
    	$A.Field.superclass.processListener.call(this, ou);
//    	this.el[ou](Ext.isIE || Ext.isSafari3 ? "keydown" : "keypress", this.fireKey,  this);
    	this.el[ou]("focus", this.onFocus,  this);
    	this.el[ou]("blur", this.onBlur,  this);
    	this.el[ou]("change", this.onChange, this);
    	this.el[ou]("keyup", this.onKeyUp, this);
        this.el[ou]("keydown", this.onKeyDown, this);
        this.el[ou]("keypress", this.onKeyPress, this);
//        this.el[ou]("mouseover", this.onMouseOver, this);
//        this.el[ou]("mouseout", this.onMouseOut, this);
    },
    processMouseOverOut : function(ou){
        this.el[ou]("mouseover", this.onMouseOver, this);
        this.el[ou]("mouseout", this.onMouseOut, this);
    },
    initEvents : function(){
    	$A.Field.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event keydown
         * 键盘按下事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'keydown',
        /**
         * @event keyup
         * 键盘抬起事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'keyup',
        /**
         * @event keypress
         * 键盘敲击事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'keypress',
        /**
         * @event enterdown
         * 回车键事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'enterdown');
    },
    destroy : function(){
    	$A.Field.superclass.destroy.call(this);
    	delete this.el;
    },
	setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",w+"px");
	},
	setHeight: function(h){
		this.wrap.setStyle("height",h+"px");
		this.el.setStyle("height",(h-2)+"px");
	},
	setVisible: function(v){
		if(v==true)
			this.wrap.show();
		else
			this.wrap.hide();
	},
    initStatus : function(){
    	this.clearInvalid();
    	this.initRequired(this.required);
    	this.initReadOnly(this.readonly);
    },
//    onMouseOver : function(e){
//    	$A.ToolTip.show(this.id, "测试");
//    },
//    onMouseOut : function(e){
//    	$A.ToolTip.hide();
//    },
    onChange : function(e){},
    onKeyUp : function(e){
        this.fireEvent('keyup', this, e);
    },
    onKeyDown : function(e){
        this.fireEvent('keydown', this, e);
        var keyCode = e.keyCode;
        if(keyCode == 13 || keyCode == 27) {
        	this.blur();
        	if(keyCode == 13) {
        		var sf = this;
        		setTimeout(function(){
        			sf.fireEvent('enterdown', sf, e)
        		},5);
        	}
        }
    },
    onKeyPress : function(e){
        this.fireEvent('keypress', this, e);
    },
//    fireKey : function(e){
//      this.fireEvent("keydown", this, e);
//    },
    onFocus : function(e){
        (Ext.isGecko||Ext.isGecko2||Ext.isGecko3) ? this.select() : this.select.defer(10,this);
    	if(this.readonly) return;
        if(!this.hasFocus){
            this.hasFocus = true;
            this.startValue = this.getValue();
            if(this.emptytext){
	            if(this.el.dom.value == this.emptytext){
	                this.setRawValue('');
	            }
	            this.wrap.removeClass(this.emptyTextCss);
	        }
	        this.wrap.addClass(this.focusCss);
            this.fireEvent("focus", this);
        }
    },
    processValue : function(v){
    	return v;
    },
    onBlur : function(e){
    	if(this.readonly) return;
    	if(this.hasFocus){
	        this.hasFocus = false;
	        var rv = this.getRawValue();
	        rv = this.processValue(rv);
//	        if(String(rv) !== String(this.startValue)){
//	            this.fireEvent('change', this, rv, this.startValue);
//	        } 
	        this.setValue(rv);
	        this.wrap.removeClass(this.focusCss);
	        this.fireEvent("blur", this);
    	}
    },
    setValue : function(v, silent){
    	$A.Field.superclass.setValue.call(this,v, silent);
    	if(this.emptytext && this.el && v !== undefined && v !== null && v !== ''){
            this.wrap.removeClass(this.emptyTextCss);
        }
        this.setRawValue(this.formatValue((v === null || v === undefined ? '' : v)));
        this.applyEmptyText();
    },
    formatValue : function(v){
    	return v;
    },
    getRawValue : function(){
        var v = this.el.getValue();
        if(v === this.emptytext || v === undefined){
            v = '';
        }
        return v;
    },   
//    getValue : function(){
//    	var v= this.value;
//		v=(v === null || v === undefined ? '' : v);
//		return v;
//    },
    initRequired : function(required){
    	if(this.crrentRequired == required)return;
		this.clearInvalid();    	
    	this.crrentRequired = required;
    	if(required){
    		this.wrap.addClass(this.requiredCss);
    	}else{
    		this.wrap.removeClass(this.requiredCss);
    	}
    },
    initReadOnly : function(readonly){
    	if(this.currentReadOnly == readonly)return;
    	this.currentReadOnly = readonly;
    	this.el.dom.readOnly = readonly;
    	if(readonly){
    		this.wrap.addClass(this.readOnlyCss);
    	}else{
    		this.wrap.removeClass(this.readOnlyCss);
    	}
    },
    applyEmptyText : function(){
        if(this.emptytext && this.getRawValue().length < 1){
            this.setRawValue(this.emptytext);
            this.wrap.addClass(this.emptyTextCss);
        }
    },
//    validate : function(){
//        if(this.readonly || this.validateValue(this.getValue())){
//            this.clearInvalid();
//            return true;
//        }
//        return false;
//    },
    clearInvalid : function(){
    	this.invalidMsg = null;
    	this.wrap.removeClass(this.invalidCss);
//    	this.fireEvent('valid', this);
    },
    markInvalid : function(msg){
    	this.invalidMsg = msg;
    	this.wrap.addClass(this.invalidCss);
    },
//    validateValue : function(value){    
//    	if(value.length < 1 || value === this.emptyText){ // if it's blank
//        	if(!this.required){
//                this.clearInvalid();
//                return true;
//        	}else{
//                this.markInvalid('字段费控');//TODO:测试
//        		return false;
//        	}
//        }
//    	Ext.each(this.validators.each, function(validator){
//    		var vr = validator.validate(value)
//    		if(vr !== true){
//    			//TODO:
//    			return false;
//    		}    		
//    	})
//        return true;
//    },
    select : function(start, end){
    	var v = this.getRawValue();
        if(v.length > 0){
            start = start === undefined ? 0 : start;
            end = end === undefined ? v.length : end;
            var d = this.el.dom;
            if(d.setSelectionRange){  
                d.setSelectionRange(start, end);
            }else if(d.createTextRange){
                var range = d.createTextRange();
                range.moveStart("character", start);
                range.moveEnd("character", end-v.length);
                range.select();
            }
        }
    },
    setRawValue : function(v){
        return this.el.dom.value = (v === null || v === undefined ? '' : v);
    },
    reset : function(){
    	this.setValue(this.originalValue);
        this.clearInvalid();
        this.applyEmptyText();
    },
    focus : function(){
    	if(this.readonly) return;
    	this.el.dom.focus();
    	this.fireEvent('focus', this);
    },
    blur : function(){
    	if(this.readonly) return;
    	this.el.blur();
    	this.fireEvent('blur', this);
    },
    clearValue : function(){
    	this.setValue('', true);
    	this.clearInvalid();
        this.applyEmptyText();
    }
})
/**
 * @class Aurora.Box
 * @extends Aurora.Component
 * <p>Box组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Box = Ext.extend($A.Component,{
	constructor: function(config) {
        this.errors = [];
        $A.Box.superclass.constructor.call(this,config);
    },
//    initComponent : function(config){ 
//		config = config || {};
//        Ext.apply(this, config); 
        //TODO:所有的组件?
//        for(var i=0;i<this.cmps.length;i++){
//    		var cmp = $(this.cmps[i]);
//    		if(cmp){
//	    		cmp.on('valid', this.onValid, this)
//	    		cmp.on('invalid', this.onInvalid,this)
//    		}
//    	}
//    },
    initEvents : function(){
//    	this.addEvents('focus','blur','change','invalid','valid');    	
    },
    onValid : function(cmp, record, name, isvalid){
    	if(isvalid){
    	   this.clearError(cmp.id);
    	}else{
            var error = record.errors[name];
            if(error){
                this.showError(cmp.id,error.message)
            }    		
    	}
    },
    showError : function(id, msg){
    	Ext.fly(id+'_vmsg').update(msg)
    },
    clearError : function(id){
    	Ext.fly(id+'_vmsg').update('')
    },
    clearAllError : function(){
    	for(var i=0;i<this.errors.length;i++){
    		this.clearError(this.errors[i])
    	}
    }
});
/**
 * @class Aurora.ImageCode
 * @extends Aurora.Component
 * <p>图片验证码组件.
 * @author njq.niu@hand-china.com
 * @constructor 
 */
$A.ImageCode = Ext.extend($A.Component,{
    processListener: function(ou){
        $A.ImageCode.superclass.processListener.call(this,ou);
        this.wrap[ou]("click", this.onClick,  this);
    },
    onClick : function(){
    	this.refresh();
    },
    /**
     * 重新加载验证码
     * 
     */
    refresh : function(){
        this.wrap.dom.src = "imagecode?r="+Math.random();
    }
});
/**
 * @class Aurora.Label
 * @extends Aurora.Component
 * <p>Label组件.
 * @author njq.niu@hand-china.com
 * @constructor 
 */
$A.Label = Ext.extend($A.Component,{
    onUpdate : function(ds, record, name, value){
    	if(this.binder.ds == ds && this.binder.name == name){
	    	this.updateLabel(record,name,value);
    	}
    },
    /**
     * 绘制Label
     * @param {Aurora.Record} record record对象
     */
    render : function(record){
    	this.record = record;
    	if(this.record) {
			var value = this.record.get(this.binder.name);
			this.updateLabel(this.record,this.binder.name,value);
    	}
    },
    updateLabel: function(record,name,value){
        var rder = $A.getRenderer(this.renderer);
	    if(rder!=null){
    		value = rder.call(window,value,record, name);
	    }
	    this.wrap.update(value);
    }
});
/**
 * @class Aurora.Button
 * @extends Aurora.Component
 * <p>按钮组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Button = Ext.extend($A.Component,{
	disableCss:'item-btn-disabled',
	overCss:'item-btn-over',
	pressCss:'item-btn-pressed',
	disabled:false,
	constructor: function(config) {
        $A.Button.superclass.constructor.call(this, config);
    },
	initComponent : function(config){
    	$A.Button.superclass.initComponent.call(this, config);
    	this.el = this.wrap.child('button[atype=btn]');
    	if(this.hidden == true)this.setVisible(false)
    	if(this.disabled == true)this.disable();
    },
    processListener: function(ou){
    	$A.Button.superclass.processListener.call(this,ou);
    	this.wrap[ou]("click", this.onClick,  this);
        this.wrap[ou]("mousedown", this.onMouseDown,  this);
    },
    initEvents : function(){
    	$A.Button.superclass.initEvents.call(this);
    	this.addEvents(
    	/**
         * @event click
         * 鼠标点击事件.
         * @param {Aurora.Button} button 按钮对象.
         * @param {EventObject} e 键盘事件对象.
         */
    	'click');
    },    
    destroy : function(){
		$A.Button.superclass.destroy.call(this);
    	delete this.el;
    },
    /**
     * 设置按钮是否可见.
     * @param {Boolean} visiable  是否可见.
     */
    setVisible: function(v){
		if(v==true)
			this.wrap.show();
		else
			this.wrap.hide();
	},
//    destroy : function(){
//    	$A.Button.superclass.destroy.call(this);
//    	this.el.un("click", this.onClick,  this);
//    	delete this.el;
//    },
	/**
	 * 获取焦点
	 */
	focus: function(){
		if(this.disabled)return;
		this.el.dom.focus();
	},
	/**
	 * 失去焦点
	 */	
	blur : function(){
    	if(this.disabled) return;
    	this.el.dom.blur();
    },
    /**
     * 设置不可用状态
     */
    disable: function(){
    	this.disabled = true;
    	this.wrap.addClass(this.disableCss);
    	this.el.dom.disabled = true;
    },
    /**
     * 设置可用状态
     */
    enable: function(){
    	this.disabled = false;
    	this.wrap.removeClass(this.disableCss);
    	this.el.dom.disabled = false;
    },
    onMouseDown: function(e){
    	if(!this.disabled){
        	this.wrap.addClass(this.pressCss);
        	Ext.get(document.documentElement).on("mouseup", this.onMouseUp, this);
    	}
    },
    onMouseUp: function(e){
    	if(!this.disabled){
        	Ext.get(document.documentElement).un("mouseup", this.onMouseUp, this);
        	this.wrap.removeClass(this.pressCss);
    	}
    },
    onClick: function(e){
    	if(!this.disabled){
        	e.stopEvent();
        	this.fireEvent("click", this, e);
    	}
    },
    onMouseOver: function(e){
    	if(!this.disabled)
    	this.wrap.addClass(this.overCss);
    },
    onMouseOut: function(e){
    	if(!this.disabled)
    	this.wrap.removeClass(this.overCss);
    }
});
$A.Button.getTemplate = function(id,text,width){
    return '<TABLE class="item-btn " id="'+id+'" style="WIDTH: '+(width||60)+'px" cellSpacing="0"><TBODY><TR><TD class="item-btn-tl"><I></I></TD><TD class="item-btn-tc"></TD><TD class="item-btn-tr"><I></I></TD></TR><TR><TD class="item-btn-ml"><I></I></TD><TD class="item-btn-mc"><BUTTON hideFocus style="HEIGHT: 17px" atype="btn">'+text+'</BUTTON></TD><TD class="item-btn-mr"><I></I></TD></TR><TR><TD class="item-btn-bl"><I></I></TD><TD class="item-btn-bc"></TD><TD class="item-btn-br"><I></I></TD></TR></TBODY></TABLE><script>new Aurora.Button({"id":"'+id+'"});</script>';
}
/**
 * @class Aurora.CheckBox
 * @extends Aurora.Component
 * <p>可选组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.CheckBox = Ext.extend($A.Component,{
	checkedCss:'item-ckb-c',
	uncheckedCss:'item-ckb-u',
	readonyCheckedCss:'item-ckb-readonly-c',
	readonlyUncheckedCss:'item-ckb-readonly-u',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		$A.CheckBox.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		this.checkedvalue = 'Y';
		this.uncheckedvalue = 'N';
		$A.CheckBox.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);
		this.el=this.wrap.child('div[atype=checkbox]');
	},
	processListener: function(ou){
    	this.wrap[ou]('click',this.onClick,this);
    },
	initEvents:function(){
		$A.CheckBox.superclass.initEvents.call(this);  	
		this.addEvents(
		/**
         * @event click
         * 鼠标点击事件.
         * @param {Aurora.CheckBox} checkBox 可选组件.
         * @param {Boolean} checked 选择状态.
         */
		'click');    
	},
	destroy : function(){
    	$A.CheckBox.superclass.destroy.call(this);
    	delete this.el;
    },
	onClick: function(event){
		if(!this.readonly){
			this.checked = this.checked ? false : true;				
			this.setValue(this.checked);
			this.fireEvent('click', this, this.checked);
		}
	},
	setValue:function(v, silent){
		if(typeof(v)==='boolean'){
			this.checked=v?true:false;			
		}else{
			this.checked = (''+v == ''+this.checkedvalue)
//			this.checked = v === this.checkedvalue ? true : false;
		}
		this.initStatus();
		var value = this.checked==true ? this.checkedvalue : this.uncheckedvalue;		
		$A.CheckBox.superclass.setValue.call(this,value, silent);
	},
	getValue : function(){
    	var v= this.value;
		v=(v === null || v === undefined ? '' : v);
		return v;
    },
//	setReadOnly:function(b){
//		if(typeof(b)==='boolean'){
//			this.readonly=b?true:false;	
//			this.initStatus();		
//		}		
//	},
	initStatus:function(){
		this.el.removeClass(this.checkedCss);
		this.el.removeClass(this.uncheckedCss);
		this.el.removeClass(this.readonyCheckedCss);
		this.el.removeClass(this.readonlyUncheckedCss);
		if (this.readonly) {				
			this.el.addClass(this.checked ? this.readonyCheckedCss : this.readonlyUncheckedCss);			
		}else{
			this.el.addClass(this.checked ? this.checkedCss : this.uncheckedCss);
		}		
	}			
});
/**
 * @class Aurora.Radio
 * @extends Aurora.Component
 * <p>单选框组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Radio = Ext.extend($A.Component, {
	ccs:'item-radio-img-c',
	ucs:'item-radio-img-u',
	rcc:'item-radio-img-readonly-c',
	ruc:'item-radio-img-readonly-u',
//	optionCss:'item-radio-option',
	imgCss:'item-radio-img',
	valueField:'value',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		$A.Radio.superclass.constructor.call(this,config);		
	},
	initComponent:function(config){
		$A.Radio.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);	
		this.nodes = Ext.DomQuery.select('.item-radio-option',this.wrap.dom);
		this.initStatus();
//		this.select(this.selectIndex);
	},	
	processListener: function(ou){
    	this.wrap[ou]('click',this.onClick,this);
    	this.wrap[ou]("keydown", this.onKeyDown, this);
    },
    focus : function(){
    	this.wrap.focus();
    },
    onKeyDown:function(e){
        this.fireEvent('keydown', this, e);
        var keyCode = e.keyCode;
        if(keyCode == 13)  {
            var sf = this;
            setTimeout(function(){
                sf.fireEvent('enterdown', sf, e)
            },5);
        }else if(keyCode==40){
            var vi = this.getValueItem();
            var i = this.options.indexOf(vi);
            if(i+1 < this.options.length){
                var v = this.options[i+1][this.valueField];
                this.setValue(v)
            }
        }else if(keyCode==38){
            var vi = this.getValueItem();
            var i = this.options.indexOf(vi);
            if(i-1 >=0){
                var v = this.options[i-1][this.valueField];
                this.setValue(v)
            }
        }
    },
	initEvents:function(){
		$A.Radio.superclass.initEvents.call(this); 	
		this.addEvents('click','keydown','enterdown');    
	},
	setValue:function(value,silent){
		if(value=='')return;
		$A.Radio.superclass.setValue.call(this,value, silent);
		this.initStatus();
		this.focus();
	},
	getItem: function(){
		var item = this.getValueItem();
		if(item!=null){
            item = new $A.Record(item);
		}
		return item;
	},
	getValueItem: function(){
	   var v = this.getValue();
	   var l = this.options.length;
	   var r = null;
	   for(var i=0;i<l;i++){
	       var o = this.options[i];
	       if(o[this.valueField]==v){
	           r = o;
	           break;
	       }
	   }	   
	   return r;
	},
	select : function(i){
		var v = this.getItemValue(i);
		if(v){
			this.setValue(v);
		}
	},
	getValue : function(){
    	var v = this.value;
		v=(v === null || v === undefined ? '' : v);
		return v;
    },
//	setReadOnly:function(b){
//		if(typeof(b)==='boolean'){
//			this.readonly=b?true:false;	
//			this.initStatus();		
//		}
//	},
	initStatus:function(){
		var l=this.nodes.length;
		for (var i = 0; i < l; i++) {
			var node=Ext.fly(this.nodes[i]).child('.'+this.imgCss);		
			node.removeClass(this.ccs);
			node.removeClass(this.ucs);
			node.removeClass(this.rcc);
			node.removeClass(this.ruc);
			var value = Ext.fly(this.nodes[i]).getAttributeNS("","itemvalue");
			if((i==0 && !this.value) || value === this.value){
				this.readonly?node.addClass(this.rcc):node.addClass(this.ccs);				
			}else{
				this.readonly?node.addClass(this.ruc):node.addClass(this.ucs);		
			}
		}
	},
	getItemValue:function(i){
	   var node = Ext.fly(this.nodes[i]);
	   if(!node)return null;
	   var v = node.getAttributeNS("","itemvalue");
	   return v;
	},
	onClick:function(e) {
		if(!this.readonly){
			var l=this.nodes.length;
			for (var i = 0; i < l; i++) {
				var node = Ext.fly(this.nodes[i]);
				if(node.contains(e.target)){
					var v = node.getAttributeNS("","itemvalue");
					this.setValue(v);
					this.fireEvent('click',this,v);
					break;
				}
			}
			
		}		
	}	
});
/**
 * @class Aurora.TextField
 * @extends Aurora.Field
 * <p>文本输入组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TextField = Ext.extend($A.Field,{
	constructor: function(config) {
        $A.TextField.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.TextField.superclass.initComponent.call(this, config);    	
    },
    initEvents : function(){
    	$A.TextField.superclass.initEvents.call(this);   
    	if(this.typecase){
    		this.el.on("paste", this.onPaste, this);
    	}
    },
    onPaste : function(e){	
    	if(window.clipboardData){
            var t = window.clipboardData.getData('text');
            if(this.typecase == 'upper'){
                window.clipboardData.setData('text',t.toUpperCase());
            }else if(this.typecase == 'lower') {
            	window.clipboardData.setData('text',t.toLowerCase());
            }
    	}else{
            e.stopEvent();
    	}
    },
    destroy : function(){
    	if(this.typecase){
            this.el.un("paste", this.onPaste, this);
        }
        $A.TextField.superclass.destroy.call(this);
    },
    isCapsLock: function(e){
        var keyCode  =  e.getKey();
        var isShift  =  e.shiftKey;
        if (((keyCode >= 65&&keyCode<=90)&&!isShift)||((keyCode>=97&&keyCode<=122)&&isShift)){
        	if(this.dcl!=true)
            $A.showWarningMessage('警告', '大些锁定打开!');
        	this.dcl = true;
        }else{
            this.dcl = false;
        }
    }, 
    onKeyPress : function(e){
    	$A.TextField.superclass.onKeyPress.call(this,e);
    	if(this.detectCapsLock) this.isCapsLock(e);
		var keyCode = e.getKey();
		var code = keyCode;
		if(this.typecase){
        	if(this.typecase == 'upper'){
                if(keyCode>=97 && keyCode<=122) code = keyCode - 32;
            }else if(this.typecase == 'lower') {
            	if(keyCode>=65 && keyCode<=90) code = keyCode + 32;
            }
            if(Ext.isIE) {
                e.browserEvent.keyCode = code;
            }else if((keyCode>=97 && keyCode<=122)||(keyCode>=65 && keyCode<=90)){
                var v = String.fromCharCode(code);
                e.stopEvent();
                var d = this.el.dom
                var rv = this.getRawValue();
                var s = d.selectionStart;
                var e = d.selectionEnd
                rv = rv.substring(0,s) + v + rv.substring(e,rv.length);
                this.setRawValue(rv)
                d.selectionStart=s+1;
                d.selectionEnd=d.selectionStart;
            }
    	}
    }
})
/**
 * @class Aurora.NumberField
 * @extends Aurora.TextField
 * <p>数字输入组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.NumberField = Ext.extend($A.TextField,{
	allowdecimals : true,
    allownegative : true,
    allowformat : true,
	baseChars : "0123456789",
    decimalSeparator : ".",
    decimalprecision : 2,
	constructor: function(config) {
        $A.NumberField.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	$A.NumberField.superclass.initComponent.call(this, config); 
    	this.allowed = this.baseChars+'';
        if(this.allowdecimals){
            this.allowed += this.decimalSeparator;
        }
        if(this.allownegative){
            this.allowed += "-";
        }
    },
    initEvents : function(){
    	$A.NumberField.superclass.initEvents.call(this);    	
    },
    onKeyPress : function(e){
        var k = e.getKey();
        //!Ext.isIE && (e.isSpecialKey() ||
        if(e.isSpecialKey()){
            return;
        }
        var c = e.getCharCode();
        if(this.allowed.indexOf(String.fromCharCode(c)) === -1){
            e.stopEvent();
            return;
        }
        $A.NumberField.superclass.onKeyPress.call(this, e); 
    },
    formatValue : function(v){
    	var rv = this.fixPrecision(this.parseValue(v))        
        if(this.allowformat)rv = $A.formatNumber(rv);
        return rv;
    },
    processValue : function(v){
    	return this.fixPrecision(this.parseValue(v));
    },
    onFocus : function(e) {
    	if(this.allowformat) {
            this.setRawValue($A.removeNumberFormat(this.getRawValue()));
        }
    	$A.NumberField.superclass.onFocus.call(this,e);
    },
    parseValue : function(value){
    	value = String(value) 
    	if(!this.allownegative)value = value.replace('-','');
    	if(!this.allowdecimals)value = value.indexOf(".")==-1?value:value.substring(0,value.indexOf("."));
        value = parseFloat(value.replace(this.decimalSeparator, "."));
        return isNaN(value) ? '' : value;
    },
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowdecimals || this.decimalprecision == -1 || nan || !value){
           return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.decimalprecision));
    }
})
/**
 * @class Aurora.TriggerField
 * @extends Aurora.TextField
 * <p>触发类组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TriggerField = Ext.extend($A.TextField,{
	constructor: function(config) {
        $A.TriggerField.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	$A.TriggerField.superclass.initComponent.call(this, config);
    	this.trigger = this.wrap.child('div[atype=triggerfield.trigger]'); 
    	this.initPopup();
    },
    initPopup: function(){
    	if(this.initpopuped == true) return;
    	this.popup = this.wrap.child('div[atype=triggerfield.popup]');
    	this.shadow = this.wrap.child('div[atype=triggerfield.shadow]');
    	Ext.getBody().insertFirst(this.popup);
    	Ext.getBody().insertFirst(this.shadow);
    	this.initpopuped = true
    },
    initEvents : function(){
    	$A.TriggerField.superclass.initEvents.call(this);    
    	this.trigger.on('click',this.onTriggerClick, this, {preventDefault:true})
    },
    /**
     * 判断当时弹出面板是否展开
     * @return {Boolean} isexpanded 是否展开
     */
    isExpanded : function(){ 
    	var xy = this.popup.getXY();
    	return !(xy[0]==-1000||xy[1]==-1000)
    },
    setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",(w-20)+"px");
	},
    onFocus : function(){
    	if(this.readonly) return;
        $A.TriggerField.superclass.onFocus.call(this);
        if(!this.isExpanded())this.expand();
    },
    onBlur : function(e){
//        if(this.isEventFromComponent(e.target)) return;
//    	if(!this.isExpanded()){
	    	this.hasFocus = false;
	        this.wrap.removeClass(this.focusCss);
	        this.fireEvent("blur", this);
//    	}
    },
    onKeyDown: function(e){
    	if(e.keyCode == 9 || e.keyCode == 27||e.keyCode == 13) {
        	if(this.isExpanded()){
	    		this.collapse();
	    	}
        }
    	$A.TriggerField.superclass.onKeyDown.call(this,e);
    },
    isEventFromComponent:function(el){
    	var isfrom = $A.TriggerField.superclass.isEventFromComponent.call(this,el);
    	return isfrom || this.popup.contains(el);
    },
	destroy : function(){
		if(this.isExpanded()){
    		this.collapse();
    	}
    	this.trigger.un('click',this.onTriggerClick, this)
    	this.shadow.remove();
    	this.popup.remove();
    	delete this.trigger;
    	delete this.popup;
    	$A.TriggerField.superclass.destroy.call(this);
	},
    triggerBlur : function(e){
    	if(!this.popup.contains(e.target) && !this.wrap.contains(e.target)){    		
            if(this.isExpanded()){
	    		this.collapse();
	    	}	    	
        }
    },
    setVisible : function(v){
    	$A.TriggerField.superclass.setVisible.call(this,v);
    	if(v == false && this.isExpanded()){
    		this.collapse();
    	}
    },
    /**
     * 折叠弹出面板
     */
    collapse : function(){
    	Ext.get(document.documentElement).un("mousedown", this.triggerBlur, this);
    	this.popup.moveTo(-1000,-1000);
    	this.shadow.moveTo(-1000,-1000);
    },
    /**
     * 展开弹出面板
     */
    expand : function(){
//    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this, {delay: 10});
    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this);
    	var xy = this.wrap.getXY();
    	this.popup.moveTo(xy[0],xy[1]+23);
    	this.shadow.moveTo(xy[0]+3,xy[1]+26);
    },
    onTriggerClick : function(){
    	if(this.readonly) return;
    	if(this.isExpanded()){
    		this.collapse();
    	}else{
    		this.expand();
	    	this.el.focus();
    	}
    }
});
/**
 * @class Aurora.ComboBox
 * @extends Aurora.TriggerField
 * <p>Combo组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.ComboBox = Ext.extend($A.TriggerField, {	
	maxHeight:200,
	blankOption:true,
	rendered:false,
	selectedClass:'item-comboBox-selected',	
	currentNodeClass:'item-comboBox-current',
	constructor : function(config) {
		$A.ComboBox.superclass.constructor.call(this, config);		
	},
	initComponent:function(config){
		$A.ComboBox.superclass.initComponent.call(this, config);
		if(config.options) {
            this.setOptions(config.options);
		}else{
            this.clearOptions();
		}
	},
	initEvents:function(){
		$A.ComboBox.superclass.initEvents.call(this);
		this.addEvents(
		/**
         * @event select
         * 选择事件.
         * @param {Aurora.Combobox} combo combo对象.
         * @param {Object} value valueField的值.
         * @param {String} display displayField的值.
         * @param {Aurora.Record} record 选中的Record对象
         */
		'select');
	},
	onTriggerClick : function() {
		this.doQuery('',true);
		$A.ComboBox.superclass.onTriggerClick.call(this);		
	},
	onBlur : function(e){
		$A.ComboBox.superclass.onBlur.call(this,e);
		if(!this.isExpanded()) {
			var raw = this.getRawValue();
			var record = this.getRecordByDisplay(raw);
			if(record != null){
				this.setValue(record.get(this.displayfield));				
			}else{
				this.setValue('');
			}
		}
    },
    getRecordByDisplay: function(name){
    	if(!this.optionDataSet)return null;
    	var datas = this.optionDataSet.getAll();
		var l=datas.length;
		var record = null;
		for(var i=0;i<l;i++){
			var r = datas[i];
			var d = r.get(this.displayfield);
			if(d == name){
				record = r;
				break;
			}
		}
		return record;
    },
    /**
     * 展开下拉菜单.
     */
	expand:function(){
		if(!this.optionDataSet)return;
		if(this.rendered===false)this.initQuery();
		this.correctViewSize();
		$A.ComboBox.superclass.expand.call(this);
		var v = this.getValue();
		this.currentIndex = this.getIndex(v);
		if(!this.currentIndex) return;
		if (!Ext.isEmpty(v)) {				
			if(this.selectedIndex)Ext.fly(this.getNode(this.selectedIndex)).removeClass(this.selectedClass);
			var node = this.getNode(this.currentIndex);
			if(node)Ext.fly(node).addClass(this.currentNodeClass);
			this.selectedIndex = this.currentIndex;
		}		
	},
	/**
	 * 收起下拉菜单.
	 */
	collapse:function(){
		$A.ComboBox.superclass.collapse.call(this);
		if(this.currentIndex!==undefined)
		Ext.fly(this.getNode(this.currentIndex)).removeClass(this.currentNodeClass);		
	},
	clearOptions : function(){
	   this.processDataSet('un');
	   this.optionDataSet = null;
	},
	setOptions : function(name){
		var ds = name
		if(typeof(name)==='string'){
			ds = $(name);
		}
		if(this.optionDataSet != ds){
			this.optionDataSet = ds;
			this.processDataSet('un');
			this.processDataSet('on');
			this.rendered = false;
			if(!Ext.isEmpty(this.value)) this.setValue(this.value, true)
		}
	},
	processDataSet: function(ou){
		if(this.optionDataSet){
            this.optionDataSet[ou]('load', this.onDataSetLoad, this);
            this.optionDataSet[ou]('add', this.onDataSetLoad, this);
            this.optionDataSet[ou]('update', this.onDataSetLoad, this);
            this.optionDataSet[ou]('remove', this.onDataSetLoad, this);
            this.optionDataSet[ou]('clear', this.onDataSetLoad, this);
            this.optionDataSet[ou]('reject', this.onDataSetLoad, this);
		}
	},	
	onDataSetLoad: function(){
		this.rendered=false
		this.expand();
	},
	onRender:function(){	
        if(!this.view){
        	this.popup.update('<ul></ul>');
			this.view=this.popup.child('ul');
			this.view.on('click', this.onViewClick,this);
			this.view.on('mousemove',this.onViewMove,this);
        }
        
        if(this.optionDataSet){
			this.initList();
			this.rendered = true;
		}       
	},
	correctViewSize: function(){
		var widthArray = [];
		var mw = this.wrap.getWidth();
		for(var i=0;i<this.view.dom.childNodes.length;i++){
			var li=this.view.dom.childNodes[i];
			var width=$A.TextMetrics.measure(li,li.innerHTML).width;
			mw = Math.max(mw,width)||mw;
		}
		this.popup.setWidth(mw);
		var lh = Math.min(this.popup.child('ul').getHeight()+2,this.maxHeight); 
		this.popup.setHeight(lh<20?20:lh);
    	this.shadow.setWidth(mw);
    	this.shadow.setHeight(lh<20?20:lh);
	},
	onViewClick:function(e,t){
		if(t.tagName!='LI'){
		    return;
		}		
		this.onSelect(t);
		this.collapse();		
	},	
	onViewOver:function(e,t){
		this.inKeyMode = false;
	},
	onViewMove:function(e,t){
		if(this.inKeyMode){ // prevent key nav and mouse over conflicts
            return;
        }
        var index = t.tabIndex;
        this.selectItem(index);        
	},
	onSelect:function(target){
		var index = target.tabIndex;
		if(index==-1)return;
		var record = this.optionDataSet.getAt(index);
		var value = record.get(this.valuefield);
		var display = this.getRenderText(record);//record.get(this.displayfield);
		this.setValue(display);
		this.fireEvent('select',this, value, display, record);
	},
	initQuery: function(){//事件定义中调用
		this.doQuery(this.getText());
	},
	doQuery : function(q,forceAll) {		
		if(q === undefined || q === null){
			q = '';
	    }		
//		if(forceAll){
//            this.store.clearFilter();
//        }else{
//            this.store.filter(this.displayField, q);
//        }
        
		//值过滤先不添加
		this.onRender();	
	},
	initList: function(){
		this.refresh();
//		this.litp=new Ext.Template('<li tabIndex="{index}">{'+this.displayfield+'}&#160;</li>');
		if(this.optionDataSet.loading == true){
			this.view.update('<li tabIndex="-1">正在加载...</li>');
		}else{
			var datas = this.optionDataSet.getAll();
			var l=datas.length;
			var sb = [];
			for(var i=0;i<l;i++){
//				var d = Ext.apply(datas[i].data, {index:i})
				var rder = $A.getRenderer(this.renderer);
				var text = this.getRenderText(datas[i]);
				sb.add('<li tabIndex="'+i+'">'+text+'</li>');	//this.litp.applyTemplate(d)等数据源明确以后再修改		
			}
			if(l!=0){
				this.view.update(sb.join(''));			
			}
		}
	},
	getRenderText : function(record){
        var rder = $A.getRenderer(this.renderer);
        var text = '&#160;';
        if(rder){
            text = rder.call(window,this,record);
        }else{
            text = record.get(this.displayfield);
        }
		return text;
	},
	refresh:function(){
		this.view.update('');
		this.selectedIndex = null;
	},
	selectItem:function(index){
		if(Ext.isEmpty(index)){
			return;
		}	
		var node = this.getNode(index);			
		if(node && node.tabIndex!=this.selectedIndex){
			if(!Ext.isEmpty(this.selectedIndex)){							
				Ext.fly(this.getNode(this.selectedIndex)).removeClass(this.selectedClass);
			}
			this.selectedIndex=node.tabIndex;			
			Ext.fly(node).addClass(this.selectedClass);					
		}			
	},
	getNode:function(index){		
		return this.view.dom.childNodes[index];
	},	
	destroy : function(){
		if(this.view){
			this.view.un('click', this.onViewClick,this);
//			this.view.un('mouseover',this.onViewOver,this);
			this.view.un('mousemove',this.onViewMove,this);
		}
		delete this.view;
    	$A.ComboBox.superclass.destroy.call(this);
	},
	getText : function() {		
		return this.text;
	},
//	processValue : function(rv){
//		var r = this.optionDataSet == null ? null : this.optionDataSet.find(this.displayfield, rv);
//		if(r != null){
//			return r.get(this.valuefield);
//		}else{
//			return this.value;
//		}
//	},
//	formatValue : function(){
//		var v = this.getValue();
//		var r = this.optionDataSet == null ? null : this.optionDataSet.find(this.valuefield, v);
//		this.text = '';
//		if(r != null){
//			this.text = r.get(this.displayfield);
//		}else{
////			this.text = v;
//		}
//		return this.text;
//	},
	setValue: function(v, silent){
        $A.ComboBox.superclass.setValue.call(this, v, silent);
        if(this.record){
			var field = this.record.getMeta().getField(this.binder.name);
			if(field){
				var mapping = field.get('mapping');
				var raw = this.getRawValue();
				var record = this.getRecordByDisplay(raw);
//				if(mapping&&record){
				if(mapping){//TODO: v是空的时候?
					for(var i=0;i<mapping.length;i++){
						var map = mapping[i];
    					var vl = record ? record.get(map.from) : '';
//    					var vl = record ? (record.get(map.from)||'') : '';
//    					if(vl!=''){
    					if(!Ext.isEmpty(vl,true)){
    						//避免render的时候发生update事件
    						if(silent){
                                this.record.data[map.to] = vl;
    						}else{
    						    this.record.set(map.to,vl);						
    						}
    					}else{
    						delete this.record.data[map.to];
    					}
						
					}
				}
			}
		}
	},
	getIndex:function(v){
		var datas = this.optionDataSet.getAll();		
		var l=datas.length;
		for(var i=0;i<l;i++){
			if(datas[i].data[this.displayfield]==v){				
				return i;
			}
		}
	}
});
/**
 * @class Aurora.DateField
 * @extends Aurora.Component
 * <p>日期组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DateField = Ext.extend($A.Component, {
	constructor: function(config) {
        $A.DateField.superclass.constructor.call(this,config);
    },
    initComponent : function(config){
    	$A.DateField.superclass.initComponent.call(this, config);
    	this.isDateTime=$A.dateFormat.isDateTime(this.format);
    	this.wrap = typeof(config.container) == "string" ? Ext.get(config.container) : config.container;
        this.body = this.wrap.child("table.item-dateField-body");
        this.tables=[];
    	this.preMonthBtn = this.wrap.child("div.item-dateField-pre");
    	this.nextMonthBtn = this.wrap.child("div.item-dateField-next");
    	this.preYearBtn = this.wrap.child("div.item-dateField-preYear");
    	this.nextYearBtn = this.wrap.child("div.item-dateField-nextYear");
    	this.yearSpan = this.wrap.child("input[atype=field.year]");
    	this.monthSpan = this.wrap.child("input[atype=field.month]");
    	if(this.isDateTime){
	    	this.hourSpan = this.wrap.child("input[atype=field.hour]");
	    	this.minuteSpan = this.wrap.child("input[atype=field.minute]");
	    	this.secondSpan = this.wrap.child("input[atype=field.second]");
    	}else{
    		this.now=this.wrap.child("div[atype=field.current]");
	    	this.now.dom.title=new Date().format(this.format);
	    	this.now.set({"_date":new Date().getTime()});
    	}
        var tableTpl=this.body.dom.rows[0].cells[0];
		for(var i=0;i<this.viewsize;i++){
			var clone=i==0?tableTpl:tableTpl.cloneNode(true);
        	this.tables[i]=Ext.fly(clone).child("table").dom;
        	var tr=Ext.fly(this.tables[i]).child("tr.item-dateField-head").dom;
        	this.tables[i].head=tr.cells[0];
        	if(i!=0){
        		this.tables[i].head.text=document.createElement('span');
        		this.tables[i].head.appendChild(this.tables[i].head.text);
        	}
        	clone.style.cssText=(i!=this.viewsize-1)?"border-right:1px solid #BABABA":"";
        	this.body.dom.rows[0].appendChild(clone);
        }
        this.tables[0].head.appendChild(this.preYearBtn.dom);
        this.tables[0].head.appendChild(this.preMonthBtn.dom);
        this.tables[this.viewsize-1].head.appendChild(this.nextYearBtn.dom);
        this.tables[this.viewsize-1].head.appendChild(this.nextMonthBtn.dom);
        this.tables[0].head.appendChild(this.monthSpan.dom.parentNode);
    },
    processListener: function(ou){
    	$A.DateField.superclass.processListener.call(this,ou);
    	this.preMonthBtn[ou]("click", this.preMonth, this);
    	this.nextMonthBtn[ou]("click", this.nextMonth, this);
    	this.preYearBtn[ou]("click", this.preYear, this);
		this.nextYearBtn[ou]("click", this.nextYear, this);
		this.yearSpan[ou]("focus", this.onDateFocus, this);
		this.yearSpan[ou]("blur", this.onDateBlur, this);
		this.yearSpan[ou]("keydown", this.onKeyDown, this);
		this.monthSpan[ou]("focus", this.onDateFocus, this);
		this.monthSpan[ou]("blur", this.onDateBlur, this);
		this.monthSpan[ou]("keydown", this.onKeyDown, this);
		if(this.isDateTime){
			this.hourSpan[ou]("focus", this.onDateFocus, this);
			this.hourSpan[ou]("blur", this.onDateBlur, this);
			this.hourSpan[ou]("keydown", this.onKeyDown, this);
			this.minuteSpan[ou]("focus", this.onDateFocus, this);
			this.minuteSpan[ou]("blur", this.onDateBlur, this);
			this.minuteSpan[ou]("keydown", this.onKeyDown, this);
			this.secondSpan[ou]("focus", this.onDateFocus, this);
			this.secondSpan[ou]("blur", this.onDateBlur, this);
			this.secondSpan[ou]("keydown", this.onKeyDown, this);
		}
    	else this.now[ou]("mouseup", this.onSelect, this);
    	this.body[ou]("mouseup", this.onSelect, this);
    	this.body[ou]("mouseover", this.mouseOver, this);
    },
    initEvents : function(){
    	$A.DateField.superclass.initEvents.call(this);   	
    	this.addEvents(
    	/**
         * @event select
         * 选择事件.
         * @param {Aurora.DateField} dateField 日期组件.
         * @param {Date} date 选择的日期.
         */
    	'select',
    	/**
         * @event draw
         * 绘制事件.
         * @param {Aurora.DateField} dateField 日期组件.
         */
    	'draw');
    },
    destroy : function(){
    	$A.DateField.superclass.destroy.call(this);
		delete this.preYearBtn;
		delete this.nextYearBtn;
		delete this.preMonthBtn;
    	delete this.nextMonthBtn;
    	delete this.yearSpan;
    	delete this.monthSpan; 
    	if(this.isDateTime){
	    	delete this.hourSpan; 
	    	delete this.minuteSpan; 
	    	delete this.secondSpan;
    	}else delete this.now;
    	delete this.body;        
        delete this.tables;
        delete this.isDateTime;
	},
    mouseOver: function(e){
    	if(this.overTd) Ext.fly(this.overTd).removeClass('dateover');
    	if((Ext.fly(e.target).hasClass('item-day')||Ext.fly(e.target).hasClass('onToday')) && Ext.fly(e.target).getAttribute('_date') != '0'){
    		this.overTd = e.target; 
    		Ext.fly(this.overTd).addClass('dateover');
    	}
    	
    },
    onSelect: function(e){
    	if(this.singleSelect !== false){
    		if(this.selectedDay) Ext.fly(this.selectedDay).removeClass('onSelect');
    		if((Ext.fly(e.target).hasClass('item-day')||Ext.fly(e.target).hasClass('onToday')) && Ext.fly(e.target).getAttribute('_date') != '0'){
	    		this.selectedDay = e.target; 
	    		this.onSelectDay(this.selectedDay);
	    		this.fireEvent('select', this, new Date(parseInt(Ext.fly(e.target).getAttribute('_date'))));
	    	}
    	}
    },
	onSelectDay: function(o){
		if(!Ext.fly(o).hasClass('onSelect'))Ext.fly(o).addClass('onSelect');
	},
	onToday: function(o){
		o.className = "onToday";
	},
	onKeyDown : function(e) {
		var c = e.keyCode, el = e.target;
		if (c == 13) {
			el.blur();
		} else if (c == 27) {
			el.value = el.oldValue || "";
			el.blur();
		} else if (c != 8 && c!=9 && c!=37 && c!=39 && c != 46 && (c < 48 || c > 57 || e.shiftKey)) {
			e.stopEvent();
			return;
		}
	},
	onDateFocus : function(e) {
		Ext.fly(e.target.parentNode).addClass("item-dateField-input-focus");
		e.target.select();
	},
	onDateBlur : function(e) {
		var el=e.target;
		Ext.fly(el.parentNode).removeClass("item-dateField-input-focus");
		if(!el.value.match(/^[0-9]*$/))el.value=el.oldValue||"";
		else if(this.isDateTime)this.predraw(new Date(this.yearSpan.dom.value,this.monthSpan.dom.value - 1, 1,this.hourSpan.dom.value,this.minuteSpan.dom.value,this.secondSpan.dom.value));
		else this.predraw(new Date(this.yearSpan.dom.value,this.monthSpan.dom.value - 1, 1,0,0,0));
	},
    /**
     * 当前月
     */
	nowMonth: function() {
		this.predraw(new Date());
	},
	/**
	 * 上一月
	 */
	preMonth: function() {
		this.predraw(new Date(this.year, this.month - 2, 1,this.hours,this.minutes,this.seconds));
	},
	/**
	 * 下一月
	 */
	nextMonth: function() {
		this.predraw(new Date(this.year, this.month, 1,this.hours,this.minutes,this.seconds));
	},
	/**
	 * 上一年
	 */
	preYear: function() {
		this.predraw(new Date(this.year - 1, this.month - 1, 1,this.hours,this.minutes,this.seconds));
	},
	/**
	 * 下一年
	 */
	nextYear: function() {
		this.predraw(new Date(this.year + 1, this.month - 1, 1,this.hours,this.minutes,this.seconds));
	},
  	/**
  	 * 根据日期画日历
  	 * @param {Date} date 当前日期
  	 */
  	predraw: function(date) {
  		this.hours=0;this.minutes=0;this.seconds=0;
  		if(date=='' || !date.getFullYear)date = new Date();
  		else{
  			this.hours=date.getHours();this.minutes=date.getMinutes();this.seconds=date.getSeconds();
  		}
		this.year = date.getFullYear(); this.month = date.getMonth() + 1;
  		for(var i=0;i<this.viewsize;i++){
			this.draw(new Date(this.year,this.month+i-1,1,this.hours,this.minutes,this.seconds),i);
        }
        this.yearSpan.dom.oldValue = this.yearSpan.dom.value = this.year;
		this.monthSpan.dom.oldValue = this.monthSpan.dom.value = this.month;
		if(this.isDateTime){
			this.hourSpan.dom.oldValue = this.hourSpan.dom.value = $A.dateFormat.pad(this.hours);
			this.minuteSpan.dom.oldValue = this.minuteSpan.dom.value = $A.dateFormat.pad(this.minutes);
			this.secondSpan.dom.oldValue = this.secondSpan.dom.value = $A.dateFormat.pad(this.seconds);
		}
		this.fireEvent("draw",this);
  	},
  	/**
  	 * 渲染日历
  	 */
	draw: function(date,index) {
		//用来保存日期列表
		var arr = [],year=date.getFullYear(),month=date.getMonth()+1,hour=date.getHours(),minute=date.getMinutes(),second=date.getSeconds();
		if(index!=0)this.tables[index].head.text.innerHTML=year+"年"+month+"月";
		//用当月第一天在一周中的日期值作为当月离第一天的天数,用上个月的最后天数补齐
		for(var i = 1, firstDay = new Date(year, month - 1, 1).getDay(),lastDay = new Date(year, month - 1, 0).getDate(); i <= firstDay; i++){ 
			if(index==0)arr.push([n=lastDay-firstDay+i,new Date(year, month - 2, n,hour,minute,second),"item-day item-day-besides"]);
			else arr.push([null,null,null]);
		}
		//用当月最后一天在一个月中的日期值作为当月的天数
		for(var i = 1, monthDay = new Date(year, month, 0).getDate(); i <= monthDay; i++){ 
			arr.push([i,new Date(year, month - 1, i,hour,minute,second),"item-day"]); 
		}
		//用下个月的前几天补齐
		for(var i=1, monthDay = new Date(year, month, 0).getDay();i<7-monthDay;i++){
			if(index==this.viewsize-1)arr.push([i,new Date(year, month, i,hour,minute,second),"item-day item-day-besides"]);
			else arr.push([null,null,null]); 
		}
		//先清空内容再插入(ie的table不能用innerHTML)
		while(this.tables[index].tBodies[0].hasChildNodes()){ 
			this.tables[index].tBodies[0].removeChild(this.tables[index].tBodies[0].firstChild); 
		}
		
		//插入日期
		var k=0;
		while(arr.length){
			//每个星期插入一个tr
			var row = document.createElement("tr");
			if(k%2!=0)row.className='week-alt';
			k++;
			//每个星期有7天
			for(var i = 1; i <= 7; i++){
				if(arr.length){
					var d = arr.shift();
					if(d){
						var cell = document.createElement("td"); 
						if(d[1]){
							cell.innerHTML = d[0];
							cell.className = d[2];
							cell.title=d[1].format(this.format);
							this.renderCell(cell,d[1]);
							Ext.fly(cell).set({'_date':cell.disabled?'0':''+d[1].getTime()});
							//判断是否今日
							if(this.isSame(d[1], new Date())) this.onToday(cell);
							//判断是否选择日期
							if(this.selectDay && this.isSame(d[1], this.selectDay))this.onSelectDay(cell);
						}
					}
				}
				row.appendChild(cell);
			}
			this.tables[index].tBodies[0].appendChild(row);
		}
	},
	renderCell:function(cell,date){
		if(this.dayrenderer)$A.getRenderer(this.dayrenderer).call(this,cell,date);
	},
	/**
	 * 判断是否同一日
	 * @param {Date} d1 日期1
	 * @param {Date} d2 日期2
	 * @return {Boolean} 是否同一天
	 */
	isSame: function(d1, d2) {
		if(!d2.getFullYear||!d1.getFullYear)return false;
		return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
	}
});
/**
 * @class Aurora.DatePicker
 * @extends Aurora.TriggerField
 * <p>DatePicker组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DatePicker = Ext.extend($A.TriggerField,{
	initComponent : function(config){ 
		$A.DatePicker.superclass.initComponent.call(this,config);
    	this.initDateField();
	},
    initDateField:function(){
    	this.format=this.format||"isoDate";
    	this.viewsize=(!this.viewsize||this.viewsize<1)?1:(this.viewsize>4?4:this.viewsize);
    	this.popup.setStyle({'width':150*this.viewsize+"px"})
    	if(!this.dateField){
    		var cfg = {id:this.id+'_df',container:this.popup,dayrenderer:this.dayrenderer,format:this.format,viewsize:this.viewsize,datestart:this.datestart,dateend:this.dateend,listeners:{"select": this.onSelect.createDelegate(this),"draw":this.onDraw.createDelegate(this)}}
	    	this.dateField = new $A.DateField(cfg);
    	}
    },
    initEvents : function(){
    	$A.DatePicker.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event select
         * 选择事件.
         * @param {Aurora.DatePicker} datePicker 日期选择组件.
         * @param {Date} date 选择的日期.
         */
        'select');
    },
    onKeyUp: function(e){
    	$A.DatePicker.superclass.onKeyUp.call(this,e);
    	try{
    		this.dateField.selectDay=this.getRawValue().parseDate(this.format);
    		$A.Component.prototype.setValue.call(this,this.dateField.selectDay);
    		this.dateField.predraw(this.dateField.selectDay);
    	}catch(e){
    	}
    },
    onDraw : function(){
    	this.shadow.setWidth(this.popup.getWidth());
    	this.shadow.setHeight(this.popup.getHeight());
    },
    onSelect : function(dateField, date){
    	this.collapse();
    	this.setValue(date);
    	this.fireEvent('select',this, date);
    },
    onBlur : function(e){
		$A.DatePicker.superclass.onBlur.call(this,e);
		if(!this.isExpanded()){
			try{
				this.setValue(this.getRawValue().parseDate(this.format));
			}catch(e){alert(e.message);
				this.setValue(null);
			}
		}
    },
    formatValue : function(date){
    	if(date instanceof Date)return date.format(this.format);
    	return date;
    },
    expand : function(){
    	$A.DatePicker.superclass.expand.call(this);
    	if(this.dateField.selectDay != this.getValue()) {
    		this.dateField.selectDay = this.getValue();
    		this.dateField.predraw(this.dateField.selectDay);
    	}
    	var xy=this.wrap.getXY(),
			W=this.popup.getWidth(),H=this.popup.getHeight(),
			PH=this.wrap.getHeight(),PW=this.wrap.getWidth(),
			BH=$A.getViewportHeight()-3,BW=$A.getViewportWidth()-3,
			x=(xy[0]+W)>BW?((BW-W)<0?xy[0]:(BW-W)):xy[0];
			y=(xy[1]+PH+H)>BH?((xy[1]-H)<0?(xy[1]+PH):(xy[1]-H)):(xy[1]+PH);
    	this.popup.moveTo(x,y);
    	this.shadow.moveTo(x+3,y+3);
    },
    destroy : function(){
    	$A.DatePicker.superclass.destroy.call(this);
    	delete this.format;
    	delete this.viewsize;
	}
});
/**
 * @class Aurora.DatePicker
 * @extends Aurora.TriggerField
 * <p>DatePicker组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DateTimePicker = Ext.extend($A.DatePicker,{
    initDateField:function(){
    	this.format=this.format||"yyyy-mm-dd HH:MM:ss";
    	this.viewsize=1;
    	this.popup.setStyle({'width':"150px"})
    	if(!this.dateField){
    		var cfg = {id:this.id+'_df',container:this.popup,dayrenderer:this.dayrenderer,format:this.format,viewsize:this.viewsize,datestart:this.datestart,dateend:this.dateend,listeners:{"select": this.onSelect.createDelegate(this),"draw":this.onDraw.createDelegate(this)}}
	    	this.dateField = new $A.DateField(cfg);
    	}
    },collapse : function(){
    	$A.DateTimePicker.superclass.collapse.call(this);
    	if(this.getRawValue()){
    		if(this.dateField.selectDay){
	    		this.dateField.selectDay.setHours((el=this.dateField.hourSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
	    		this.dateField.selectDay.setMinutes((el=this.dateField.minuteSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
	    		this.dateField.selectDay.setSeconds((el=this.dateField.secondSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
    		}
    		this.setValue(this.dateField.selectDay);
    	}
    }
});
$A.ToolBar = Ext.extend($A.Component,{
	constructor: function(config) {
        $A.ToolBar.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.ToolBar.superclass.initComponent.call(this, config);    	
    },
    initEvents : function(){
    	$A.ToolBar.superclass.initEvents.call(this); 
    }
})
$A.NavBar = Ext.extend($A.ToolBar,{
	constructor: function(config) {
        $A.NavBar.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.NavBar.superclass.initComponent.call(this, config);
    	this.dataSet = $(this.dataSet);
    	this.pageInput = $(this.inputId);
    	this.pageInfo = Ext.get(this.pageId);
    	this.navInfo = Ext.get(this.infoId);
    	this.pageInput.setValue(1)
    },
    processListener: function(ou){
    	$A.NavBar.superclass.processListener.call(this,ou);
    	this.dataSet[ou]('load', this.onLoad,this);
    	this.pageInput[ou]('keydown', this.onInputKeyPress, this);
    },
    initEvents : function(){
    	$A.NavBar.superclass.initEvents.call(this);    	
    },
    onLoad : function(){
    	this.pageInput.setValue(this.dataSet.currentPage);
    	this.pageInfo.update('共' + this.dataSet.totalPage + '页');
    	this.navInfo.update(this.creatNavInfo());
    },
    creatNavInfo : function(){
    	var from = ((this.dataSet.currentPage-1)*this.dataSet.pagesize+1);
    	var to = this.dataSet.currentPage*this.dataSet.pagesize;
    	if(to>this.dataSet.totalCount) to = this.dataSet.totalCount;
    	if(to==0) from =0;
    	return '显示 ' + from + ' - ' + to + ',共 ' + this.dataSet.totalCount + ' 条';
    },
    onInputKeyPress : function(input, e){
    	if(e.keyCode == 13){
    		var page = parseInt(input.getRawValue());
    		if(isNaN(page)){
    			input.setValue(this.dataSet.currentPage);
    		}else{
    			if(page>0 && page<=this.dataSet.totalPage) {
    				this.dataSet.goPage(page);
    			}else{
    				input.setValue(this.dataSet.currentPage);
    			}
    		}
    	}    	
    }
})
$A.WindowManager = function(){
    return {
        put : function(win){
        	if(!this.cache) this.cache = [];
        	this.cache.add(win)
        },
        getAll : function(){
        	return this.cache;
        },
        remove : function(win){
        	this.cache.remove(win);
        },
        get : function(id){
        	if(!this.cache) return null;
        	var win = null;
        	for(var i = 0;i<this.cache.length;i++){
    			if(this.cache[i].id == id) {
	        		win = this.cache[i];
    				break;      			
        		}
        	}
        	return win;
        },
        getZindex: function(){
        	var zindex = 40;
        	var all = this.getAll();
        	for(var i = 0;i<all.length;i++){
        		var win = all[i];
        		var zd = win.wrap.getStyle('z-index');
        		if(zd =='auto') zd = 0;
        		if(zd > zindex) zindex = zd;       		
        	}
        	return zindex;
        }
    };
}();
/**
 * @class Aurora.Window
 * @extends Aurora.Component
 * <p>窗口组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Window = Ext.extend($A.Component,{
	constructor: function(config) { 
		if($A.WindowManager.get(config.id))return;
        this.draggable = true;
        this.closeable = true;
        this.modal = config.modal||true;
        this.cmps = {};
        $A.focusWindow = null;
        $A.Window.superclass.constructor.call(this,config);
    },
    initComponent : function(config){
    	$A.Window.superclass.initComponent.call(this, config);
    	var sf = this; 
    	$A.WindowManager.put(sf);
    	var windowTpl = new Ext.Template(sf.getTemplate());
    	var shadowTpl = new Ext.Template(sf.getShadowTemplate());
    	sf.width = 1*(sf.width||350);
    	sf.height= 1*(sf.height||400);
        sf.wrap = windowTpl.append(document.body, {title:sf.title,width:sf.width,bodywidth:sf.width-2,height:sf.height,display:Ext.isIE6 ? '' : 'none'}, true);
        sf.shadow = shadowTpl.append(document.body, {display:Ext.isIE6 ? '' : 'none'}, true);
        sf.focusEl = sf.wrap.child('a[atype=win.focus]')
    	sf.title = sf.wrap.child('div[atype=window.title]');
    	sf.head = sf.wrap.child('td[atype=window.head]');
    	sf.body = sf.wrap.child('div[atype=window.body]');
        sf.closeBtn = sf.wrap.child('div[atype=window.close]');
        if(sf.draggable) sf.initDraggable();
        if(!sf.closeable)sf.closeBtn.hide();
        sf.center();
        if(sf.url){
        	sf.showLoading();       
        	sf.load(sf.url,sf.params)
        }
    },
    processListener: function(ou){
    	$A.Window.superclass.processListener.call(this,ou);
    	if(this.closeable) {
    	   this.closeBtn[ou]("click", this.onCloseClick,  this); 
    	   this.closeBtn[ou]("mouseover", this.onCloseOver,  this);
    	   this.closeBtn[ou]("mouseout", this.onCloseOut,  this);
    	   this.closeBtn[ou]("mousedown", this.onCloseDown,  this);
    	}
    	this.wrap[ou]("click", this.toFront, this);
    	this.focusEl[ou]("keydown", this.handleKeyDown,  this);
    	if(this.draggable)this.head[ou]('mousedown', this.onMouseDown,this);
    },
    initEvents : function(){
    	$A.Window.superclass.initEvents.call(this);
    	this.addEvents(
    	/**
         * @event close
         * 窗口关闭事件.
         * @param {Window} this 当前窗口.         * 
         */
    	'close',
    	/**
         * @event load
         * 窗口加载完毕.
         * @param {Window} this 当前窗口.
         */
    	'load');    	
    },
    handleKeyDown : function(e){
		e.stopEvent();
		var key = e.getKey();
		if(key == 27){
			this.close();
		}
    },
    initDraggable: function(){
    	this.head.addClass('item-draggable');
    },
    /**
     * 窗口获得焦点.
     * 
     */
    focus: function(){
		this.focusEl.focus();
	},
	/**
     * 窗口居中.
     * 
     */
    center: function(){
    	var screenWidth = $A.getViewportWidth();
    	var screenHeight = $A.getViewportHeight();
    	var x = Math.max((screenWidth - this.width)/2,0);
    	var y = Math.max((screenHeight - this.height-23)/2,0);
        this.wrap.moveTo(x,y);
        this.wrap.show();
        this.shadow.setWidth(this.wrap.getWidth())
        this.shadow.setHeight(this.wrap.getHeight())
        this.shadow.moveTo(x+3,y+3)
        this.shadow.show();
        this.toFront();
        var sf = this;
        setTimeout(function(){
        	sf.focusEl.focus();
        },10)
    },
    getShadowTemplate: function(){
    	return ['<DIV class="item-shadow" style="display:{display};"></DIV>']
    },
    getTemplate : function() {
        return [
            '<TABLE class="win-wrap" style="width:{width}px;display:{display};" cellSpacing="0" cellPadding="0" border="0">',
			'<TBODY>',
			'<TR style="height:23px;" >',
				'<TD class="win-caption">',
					'<TABLE cellSpacing="0" unselectable="on"  onselectstart="return false;" style="height:23px;-moz-user-select:none;"  cellPadding="0" width="100%" border="0" unselectable="on">',
						'<TBODY>',
						'<TR>',
							'<TD unselectable="on" class="win-caption-label" atype="window.head" width="99%">',
								'<A atype="win.focus" href="#" class="win-fs" tabIndex="-1">&#160;</A><DIV unselectable="on" atype="window.title" unselectable="on">{title}</DIV>',
							'</TD>',
							'<TD unselectable="on" class="win-caption-button" noWrap>',
								'<DIV class="win-close" atype="window.close" unselectable="on"></DIV>',
							'</TD>',
							'<TD><DIV style="width:5px;"/></TD>',
						'</TR>',
						'</TBODY>',
					'</TABLE>',
				'</TD>',
			'</TR>',
			'<TR style="height:{height}px">',
				'<TD class="win-body" vAlign="top" unselectable="on">',
					'<DIV class="win-content" atype="window.body" style="position:relatvie;width:{bodywidth}px;height:{height}px;" unselectable="on"></DIV>',
				'</TD>',
			'</TR>',
			'</TBODY>',
		'</TABLE>'
        ];
    },
    /**
     * 窗口定位到最上层.
     * 
     */
    toFront : function(){ 
    	var myzindex = this.wrap.getStyle('z-index');
    	var zindex = $A.WindowManager.getZindex();
    	if(myzindex =='auto') myzindex = 0;
    	if(myzindex < zindex) {
	    	this.wrap.setStyle('z-index', zindex+5);
	    	this.shadow.setStyle('z-index', zindex+4);
	    	if(this.modal) $A.Cover.cover(this.wrap);
    	}
    	$A.focusWindow = this;
    },
    onMouseDown : function(e){
    	var sf = this; 
    	//e.stopEvent();
    	sf.toFront();
    	var xy = sf.wrap.getXY();
    	sf.relativeX=xy[0]-e.getPageX();
		sf.relativeY=xy[1]-e.getPageY();
		sf.screenWidth = $A.getViewportWidth();
        sf.screenHeight = $A.getViewportHeight();
        if(!this.proxy) this.initProxy();
        this.proxy.show();
    	Ext.get(document.documentElement).on("mousemove", sf.onMouseMove, sf);
    	Ext.get(document.documentElement).on("mouseup", sf.onMouseUp, sf);
    },
    onMouseUp : function(e){
    	var sf = this; 
    	Ext.get(document.documentElement).un("mousemove", sf.onMouseMove, sf);
    	Ext.get(document.documentElement).un("mouseup", sf.onMouseUp, sf);
    	if(sf.proxy){
    		sf.wrap.moveTo(sf.proxy.getX(),sf.proxy.getY());
    		sf.shadow.moveTo(sf.proxy.getX()+3,sf.proxy.getY()+3);
	    	sf.proxy.hide();
    	}
    },
    onMouseMove : function(e){
    	e.stopEvent();
    	var sw = this.screenWidth;
    	var sh = this.screenHeight;
    	var tx = e.getPageX()+this.relativeX;
    	var ty = e.getPageY()+this.relativeY;
    	if(tx<=0) tx =0;
    	if((tx+this.width)>= (sw-3)) tx = sw - this.width - 3;
    	if(ty<=0) ty =0;
    	if((ty+this.height)>= (sh-30)) ty = Math.max(sh - this.height - 30,0);
    	this.proxy.moveTo(tx,ty);
    },
    showLoading : function(){
    	this.body.update('正在加载...');
    	this.body.setStyle('text-align','center');
    	this.body.setStyle('line-height',5);
    },
    clearLoading : function(){
    	this.body.update('');
    	this.body.setStyle('text-align','');
    	this.body.setStyle('line-height','');
    },
    initProxy : function(){
    	var sf = this; 
    	var p = '<DIV style="display:none;border:1px dashed black;Z-INDEX: 10000; LEFT: 0px; WIDTH: 100%; CURSOR: default; POSITION: absolute; TOP: 0px; HEIGHT: 621px;" unselectable="on"></DIV>'
    	sf.proxy = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
//    	sf.proxy.hide();
    	var xy = sf.wrap.getXY();
    	sf.proxy.setWidth(sf.wrap.getWidth());
    	sf.proxy.setHeight(sf.wrap.getHeight());
    	sf.proxy.setLocation(xy[0], xy[1]);
    },
    onCloseClick : function(e){
        e.stopEvent();
    	this.close(); 	
    },
    onCloseOver : function(e){
        this.closeBtn.addClass("win-btn-over");
    },
    onCloseOut : function(e){
    	this.closeBtn.removeClass("win-btn-over");
    },
    onCloseDown : function(e){
    	this.closeBtn.removeClass("win-btn-over");
    	this.closeBtn.addClass("win-btn-down");
        Ext.get(document.documentElement).on("mouseup", this.onCloseUp, this);
    },
    onCloseUp : function(e){
    	this.closeBtn.removeClass("win-btn-down");
    	Ext.get(document.documentElement).un("mouseup", this.onCloseUp, this);
    },
    close : function(){
    	$A.WindowManager.remove(this);
    	this.destroy(); 
    	this.fireEvent('close', this)
    },
    destroy : function(){
    	$A.focusWindow = null;
    	var wrap = this.wrap;
    	if(!wrap)return;
    	if(this.proxy) this.proxy.remove();
    	if(this.modal) $A.Cover.uncover(this.wrap);
    	$A.Window.superclass.destroy.call(this);
    	delete this.title;
    	delete this.head;
    	delete this.body;
        delete this.closeBtn;
        delete this.proxy;
        wrap.remove();
        this.shadow.remove();
        var sf = this;
        setTimeout(function(){
        	for(var key in sf.cmps){
        		var cmp = sf.cmps[key];
        		if(cmp.destroy){
        			try{
        				cmp.destroy();
        			}catch(e){
        				alert('销毁window出错: ' + e)
        			}
        		}
        	}
        },10)
    },
    /**
     * 窗口加载.
     * 
     * @param {String} url  加载的url
     * @param {Object} params  加载的参数
     */
    load : function(url,params){
//    	var cmps = $A.CmpManager.getAll();
//    	for(var key in cmps){
//    		this.oldcmps[key] = cmps[key];
//    	}
    	Ext.Ajax.request({
			url: url,
			params:params||{},
		   	success: this.onLoad.createDelegate(this)
		});		
    },
    setChildzindex : function(z){
    	for(var key in this.cmps){
    		var c = this.cmps[key];
    		c.setZindex(z)
    	}
    },
    onLoad : function(response, options){
    	if(!this.body) return;
    	this.clearLoading();
    	var html = response.responseText;
    	var res
    	try {
            res = Ext.decode(response.responseText);
        }catch(e){}
        if(res && res.success == false){
        	if(res.error){
                var st = res.error.stackTrace;
                st = (st) ? st.replaceAll('\r\n','</br>') : '';
                if(res.error.message) {
                    var h = (st=='') ? 150 : 250;
                    $A.showErrorMessage('错误', res.error.message+'</br>'+st,null,400,h);
                }else{
                    $A.showErrorMessage('错误', st,null,400,250);
                }   
            }
            return;
        }
    	var sf = this
    	this.body.update(html,true,function(){
//	    	var cmps = $A.CmpManager.getAll();
//	    	for(var key in cmps){
//	    		if(sf.oldcmps[key]==null){	    			
//	    			sf.cmps[key] = cmps[key];
//	    		}
//	    	}
	    	sf.fireEvent('load',sf)
    	});
    }
});
/**
 * 
 * 显示提示信息窗口
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} callback 回调函数
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showMessage = function(title, msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-info',callback);
}
/**
 * 显示带警告图标的窗口
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} callback 回调函数
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showWarningMessage = function(title, msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-warning',callback);
}
/**
 * 显示带信息图标的窗口
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} callback 回调函数
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showInfoMessage = function(title, msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-info',callback);
}
/**
 * 显示带错误图标的窗口
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} callback 回调函数
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showErrorMessage = function(title,msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-error',callback);
}

$A.showTypeMessage = function(title, msg,width,height,css,callback){
	var msg = '<div class="win-icon '+css+'"><div class="win-type" style="width:'+(width-60)+'px;height:'+(height-58)+'px;">'+msg+'</div></div>';
	return $A.showOkWindow(title, msg, width, height,callback);	
} 
/**
 * 带图标的确定窗口.
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} okfun 确定的callback
 * @param {Function} cancelfun 取消的callback
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showComfirm = function(title, msg, okfun,cancelfun, width, height){
	width = width||300;
	height = height||100;
    var msg = '<div class="win-icon win-question"><div class="win-type" style="width:'+(width-60)+'px;height:'+(height-58)+'px;">'+msg+'</div></div>';
    return $A.showOkCancelWindow(title, msg, okfun,cancelfun, width, height);  	
}
//$A.hideWindow = function(){
//	var cmp = $A.CmpManager.get('aurora-msg')
//	if(cmp) cmp.close();
//}
//$A.showWindow = function(title, msg, width, height, cls){
//	cls = cls ||'';
//	var cmp = $A.CmpManager.get('aurora-msg')
//	if(cmp == null) {
//		cmp = new $A.Window({id:'aurora-msg',title:title, height:height,width:width});
//		if(msg){
//			cmp.body.update('<div class="'+cls+'" style="height:'+(height-68)+'px;">'+msg+'</div>');
//		}
//	}
//	return cmp;
//}
/**
 * 带确定取消按钮的窗口.
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} okfun 确定的callback
 * @param {Function} cancelfun 取消的callback
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showOkCancelWindow = function(title, msg, okfun,cancelfun,width, height){
    var cmp = $A.CmpManager.get('aurora-msg-ok-cancel')
    if(cmp == null) {
        var okbtnhtml = $A.Button.getTemplate('aurora-msg-ok','确定');
        var cancelbtnhtml = $A.Button.getTemplate('aurora-msg-cancel','取消');
        cmp = new $A.Window({id:'aurora-msg-ok-cancel',title:title, height:height||100,width:width||300});
        if(msg){
            cmp.body.update(msg+ '<center><table cellspacing="5"><tr><td>'+okbtnhtml+'</td><td>'+cancelbtnhtml+'</td><tr></table></center>',true,function(){
                var okbtn = $("aurora-msg-ok");
                var cancelbtn = $("aurora-msg-cancel");
                cmp.cmps['aurora-msg-ok'] = okbtn;
                cmp.cmps['aurora-msg-cancel'] = cancelbtn;
                okbtn.on('click',function(){
                	if(okfun)okfun.call(this,cmp);
                });
                cancelbtn.on('click',function(){
                    cmp.close()
                	if(cancelfun)cancelfun.call(this,cmp)
                });
            });
        }
    }
    return cmp;
}
/**
 * 带确定按钮的窗口.
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} okfun 确定的callback
 * @param {Function} cancelfun 取消的callback
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showOkWindow = function(title, msg, width, height,callback){
	var cmp = $A.CmpManager.get('aurora-msg-ok');
	if(cmp == null) {
		var btnhtml = $A.Button.getTemplate('aurora-msg-yes','确定');
		cmp = new $A.Window({id:'aurora-msg-ok',title:title, height:height,width:width});
		if(msg){
			cmp.body.update(msg+ '<center>'+btnhtml+'</center>',true,function(){
    			var btn = $("aurora-msg-yes");
                cmp.cmps['aurora-msg-yes'] = btn;
                btn.on('click',function(){
                    if(callback)callback.call(this,cmp);
                    cmp.close()
                });
                btn.focus();
			});
		}
	}
	return cmp;
}
/**
 * @class Aurora.Lov
 * @extends Aurora.TextField
 * <p>Lov 值列表组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Lov = Ext.extend($A.TextField,{
	constructor: function(config) {
		this.isWinOpen = false;
		this.fetching = false;
		this.context = config.context||'';
        $A.Lov.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.Lov.superclass.initComponent.call(this,config);
    	this.para = {};
    	var li = this.lovservice.indexOf('?')
    	if(li!=-1){
    		this.para = Ext.urlDecode(this.lovservice.substring(li+1,this.lovservice.length));
            this.lovservice = this.lovservice.substring(0,li);
    	}
    	this.trigger = this.wrap.child('div[atype=triggerfield.trigger]'); 
    },
    processListener: function(ou){
    	$A.Lov.superclass.processListener.call(this,ou);
    	this.trigger[ou]('click',this.showLovWindow, this, {preventDefault:true})
    },
    initEvents : function(){
    	$A.Lov.superclass.initEvents.call(this);
    	this.addEvents(
    	/**
         * @event commit
         * commit事件.
         * @param {Aurora.Lov} lov 当前Lov组件.
         * @param {Aurora.Record} r1 当前lov绑定的Record
         * @param {Aurora.Record} r2 选中的Record. 
         */
    	'commit');
    },
    destroy : function(){
    	$A.Lov.superclass.destroy.call(this);
	},
	setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",(w-20)+"px");
	},
	onChange : function(e){
        this.fetchRecord();
	},
//	onKeyDown : function(e){
//        if(e.getKey() == 13) {
//        	this.showLovWindow();
//        }else {
//        	$A.TriggerField.superclass.onKeyDown.call(this,e);
//        }
//    },
    canHide : function(){
    	return this.isWinOpen == false
    },
    commit:function(r,lr){
		if(this.win) this.win.close();
//        this.setRawValue('')
        var record = lr ? lr : this.record;
        if(record){
            var mapping = this.getMapping();
            for(var i=0;i<mapping.length;i++){
                var map = mapping[i];
                record.set(map.to,r.get(map.from)||'');
            }
        }
//        else{
//        	this.setValue()
//        }
        this.fireEvent('commit', this, record, r)
	},
	getMapping: function(){
		var mapping
		if(this.record){
			var field = this.record.getMeta().getField(this.binder.name);
			if(field){
				mapping = field.get('mapping');
			}
		}
		return mapping ? mapping : [{from:this.binder.name,to:this.binder.name}];
	},
//	setValue: function(v, silent){
//		$A.Lov.superclass.setValue.call(this, v, silent);
//		if(this.record && this.dataRecord && silent !== true){
//			var mapping = this.getMapping();
//			for(var i=0;i<mapping.length;i++){
//				var map = mapping[i];
//				this.record.set(map.to,this.dataRecord.get(map.from));
//			}		
//		}
//	},
	onWinClose: function(){
		this.isWinOpen = false;
		this.win = null;
		this.focus();
	},
	getLovPara : function(){
		var para = Ext.apply({},this.para);
		var field;
		if(this.record) field = this.record.getMeta().getField(this.binder.name);
        if(field){
        	var lovpara = field.get('lovpara'); 
            if(lovpara)Ext.apply(para,lovpara);
        }
        return para;
	},
	fetchRecord : function(){
		if(this.readonly == true) return;
		if(!Ext.isEmpty(this.lovurl)){
			this.showLovWindow();
			return;
		}
		this.fetching = true;
		var v = this.getRawValue();
		
		if(!Ext.isEmpty(this.lovservice)){
			url = this.context + 'sys_lov.svc?svc='+this.lovservice+'&pagesize=1&pagenum=1&_fetchall=false&_autocount=false&'+ Ext.urlEncode(this.getLovPara());
		}else if(!Ext.isEmpty(this.lovmodel)){
			url = this.context + 'autocrud/'+this.lovmodel+'/query?pagesize=1&pagenum=1&_fetchall=false&_autocount=false&'+ Ext.urlEncode(this.getLovPara());
		}
		var record = this.record;
		var p = {};
		var mapping = this.getMapping();
		for(var i=0;i<mapping.length;i++){
			var map = mapping[i];			
			if(this.binder.name == map.to){
				p[map.from]=v;
			}
			record.set(map.to,'');			
		}
		$A.slideBarEnable = $A.SideBar.enable;
        $A.SideBar.enable = false;
        this.setRawValue('正在查询...')
		$A.request({url:url, para:p, success:function(res){
			var r = new $A.Record({});
			if(res.result.record){
	    		var datas = [].concat(res.result.record);
	    		if(datas.length>0){
	    			var data = datas[0];
	    			r = new $A.Record(data);
	    		}
	    	}
	    	this.fetching = false;
			this.commit(r,record);
			$A.SideBar.enable = $A.slideBarEnable;
		}, error:this.onFetchFailed, scope:this});
	},
	onFetchFailed: function(res){
		this.fetching = false;
		$A.SideBar.enable = $A.slideBarEnable;
//		$A.showErrorMessage('错误', res.error.message);
	},
//	onBlur : function(e){
////        if(this.isEventFromComponent(e.target)) return;
////        var sf = this;
////        setTimeout(function(){
////            if(!this.isWinOpen){
////            }
////        })
//		if(!this.fetching)
//        $A.Lov.superclass.onBlur.call(this,e);
//    },
	showLovWindow : function(e){
		e.stopEvent();
		if(this.fetching||this.isWinOpen||this.readonly) return;
		this.isWinOpen = true;
		
		var v = this.getRawValue();
		this.blur();
		var url;
		if(!Ext.isEmpty(this.lovurl)){
			url = this.lovurl+'?';
		}else if(!Ext.isEmpty(this.lovservice)){
			url = this.context + 'sys_lov.screen?url='+encodeURIComponent(this.context + 'sys_lov.svc?svc='+this.lovservice + '&'+ Ext.urlEncode(this.getLovPara()))+'&service='+this.lovservice+'&';			
		}else if(!Ext.isEmpty(this.lovmodel)){
			url = this.context + 'sys_lov.screen?url='+encodeURIComponent(this.context + 'autocrud/'+this.lovmodel+'/query?'+ Ext.urlEncode(this.getLovPara()))+'&service='+this.lovmodel+'&';
		}
		if(url) {
        	this.win = new $A.Window({title:this.title||'Lov', url:url+"lovid="+this.id+"&key="+encodeURIComponent(v)+"&gridheight="+(this.lovgridheight||350)+"&innerwidth="+((this.lovwidth||400)-30), height:this.lovheight||400,width:this.lovwidth||400});
        	this.win.on('close',this.onWinClose,this);
		}
    }
});
/**
 * @class Aurora.TextArea
 * @extends Aurora.Field
 * <p>TextArea组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TextArea = Ext.extend($A.Field,{
	constructor: function(config) {
        $A.TextArea.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.TextArea.superclass.initComponent.call(this, config); 		
    },
    initEvents : function(){
    	$A.TextArea.superclass.initEvents.call(this);    	
    },
    initElements : function(){
    	this.el= this.wrap;
    },
    setRawValue : function(v){
        this.el.update(v === null || v === undefined ? '' : v);
    }
//    ,getRawValue : function(){
//        var v = this.el.dom.innerHTML;
//        if(v === this.emptytext || v === undefined){
//            v = '';
//        }
//        return v;
//    }
})
