Aurora.Grid = Ext.extend(Aurora.Component,{
	bgc:'background-color',
	scor:'#d9e7ed',
	ocor:'#ffe3a8',
	cecls:'cell-editor',
	constructor: function(config){
//		this.overIndex = -1;
//		this.selectedIndex = -1;
		this.overId = null;
		this.selectedId = null;
		this.lockWidth = 0;
		Aurora.Grid.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		Aurora.Grid.superclass.initComponent.call(this, config);
		
		this.uc = this.wrap.child('div[atype=grid.uc]'); 
		this.uh = this.wrap.child('div[atype=grid.uh]'); 
    	this.ub = this.wrap.child('div[atype=grid.ub]'); 
		this.uht = this.wrap.child('table[atype=grid.uht]'); 
		
		this.lc = this.wrap.child('div[atype=grid.lc]'); 
		this.lh = this.wrap.child('div[atype=grid.lh]');
		this.lb = this.wrap.child('div[atype=grid.lb]');
		this.lht = this.wrap.child('table[atype=grid.lht]'); 

		this.sp = this.wrap.child('div[atype=grid.spliter]');
		this.fs = this.wrap.child('a[atype=grid.focus]');
		
		var lock =[],unlock = [],columns=[];
		for(var i=0,l=this.columns.length;i<l;i++){
			var c = this.columns[i];
			if(c.lock == true){
				lock.add(c);
			}else{
				unlock.add(c);
			}
		}
		this.columns = lock.concat(unlock);
    	this.initTemplate();
    	//this.onLoad();//test
	},
	initEvents:function(){
		Aurora.Grid.superclass.initEvents.call(this);   
		this.addEvents('dblclick','rowclick','keydown');
		this.wrap.on('click',this.focus,this);
		this.fs.on(Ext.isOpera ? "keypress" : "keydown", this.handleKeyDown,  this);
		this.ub.on('scroll',this.syncScroll, this);
		this.ub.on('click',this.onClick, this);
		this.ub.on('dblclick',this.onDblclick, this);
//		this.ub.on('mouseover',this.onRowMouseOver, this);
		this.uht.on('mousemove',this.onUnLockHeadMove, this);
		this.uh.on('mousedown', this.onHeadMouseDown,this);

		if(this.lb){
//			this.lb.on('mouseover',this.onRowMouseOver, this);
			this.lb.on('click',this.onClick, this);
		}
		if(this.lht) this.lht.on('mousemove',this.onLockHeadMove, this);
		if(this.lh) this.lh.on('mousedown', this.onHeadMouseDown,this);
	},
	syncScroll : function(){
		this.hideEditor();
		this.uh.dom.scrollLeft = this.ub.dom.scrollLeft;
		if(this.lb) this.lb.dom.scrollTop = this.ub.dom.scrollTop;
	},
	handleKeyDown : function(e){
		e.stopEvent();
		var key = e.getKey();
		if(key == 38 || key == 40 || key == 33 || key == 34) {
			if(this.dataset.loading == true) return;
			var row;
			switch(e.getKey()){
				case 33:
					this.dataset.prePage();
					break;
				case 34:
					this.dataset.nextPage();
					break;
				case 38:
					this.dataset.pre();
					break;
				case 40:
					this.dataset.next();
					break;
			}
		}
		this.fireEvent('keydown', this, e)
	},
	bind : function(ds){
		if(typeof(ds)==='string'){
			ds = $(ds);
			if(!ds) return;
		}
		this.dataset = ds;
		ds.on('metachange', this.onRefresh, this);
		ds.on('update', this.onUpdate, this);
    	ds.on('add', this.onAdd, this);
    	ds.on('load', this.onLoad, this);
    	ds.on('valid', this.onValid, this);
    	ds.on('remove', this.onRemove, this);
    	ds.on('clear', this.onLoad, this);
    	ds.on('refresh',this.onRefresh,this);
    	ds.on('fieldchange', this.onFieldChange, this);
    	ds.on('indexchange', this.onIndexChange, this);
    	this.onLoad();
		if(this.autoQuery == true)
		ds.query();
	},
	initTemplate : function(){
		this.cellTpl = new Ext.Template('<TD style="visibility:{visibility};text-align:{align}" dataindex="{dataindex}"><div class="grid-cell {cellcls}" id="'+this.id+'_{dataindex}_{recordid}" dataindex="{dataindex}" recordid="{recordid}">{text}</div></TD>');		
	},
	createRow : function(type, row, cols, item){
		var sb = [];
		sb.add('<TR id="'+this.id+'$'+type+'-'+item.id+'" class="'+(row % 2==0 ? '' : 'row-alt')+'">');
		for(var i=0,l=cols.length;i<l;i++){
			var c = cols[i];
			var field = item.getMeta().getField(c.dataindex);
			var cls = c.editor ? this.cecls : '';
//			if(Ext.isEmpty(item.data[c.dataindex]) && item.isNew == true && field.snap.required == true){
			if(Ext.isEmpty(item.data[c.dataindex]) && item.isNew == true && field.get('required') == true){
				cls = cls + ' item-notBlank'
			}
			var data = {
				width:c.width,
				text:this.renderText(item,c.dataindex,item.data[c.dataindex]),
				recordid:item.id,
				visibility: c.hidden == true ? 'hidden' : 'visible',
				align:c.align||'left',
				cellcls: cls,
				dataindex:c.dataindex
			}
			sb.add(this.cellTpl.applyTemplate(data));
		}
		sb.add('</TR>');
		return sb.join('');
	},
	renderText : function(record,name,value){
		var col = this.getColByDataIndex(name);
		var renderer = col.renderer
		if(renderer){
			var rder;
			if(renderer.indexOf('Aurora.') != -1){
				rder = Aurora[renderer.substr(7,renderer.length)]
			}else{
				rder = window[renderer];
			}
			if(rder == null){
				alert("未找到"+renderer+"方法!")
				return value;
			}
			value = rder.call(window,value,record, name);
			return value;
		}
//		var field = this.dataset.getField(name);
		var field = record.getMeta().getField(name);
		if(field){
//			var options = field.getOptions();
			var options = field.get('options');
			if(options){
				var val = field.get('valuefield');
				var dis = field.get('displayfield');
//				var val = field.getPropertity('valuefield');
//				var dis = field.getPropertity('displayfield');
				var r = $(options).find(val,value);
				value = r ? r.get(dis) : '';//value;
			}
		}
		return value;
	},
	createTH : function(cols){
		var sb = [];
		sb.add('<TR class="grid-hl">');
		for(var i=0,l=cols.length;i<l;i++){
			var w = cols[i].width;
			if(cols[i].hidden == true) w = 0;
			sb.add('<TH dataindex="'+cols[i].dataindex+'" style="height:0px;width:'+w+'px"></TH>');
		}
		sb.add('</TR>');
		return sb.join('');
	},
	onLoad : function(focus){
		if(this.lb)
		this.renderLockArea();
		this.renderUnLockAread();
		if(focus !== false) this.focus.defer(10,this)
	},
	focus: function(){
		this.fs.focus();
	},
	renderLockArea : function(){
		var sb = [];var cols = [];
		var v = 0;
		var columns = this.columns;
		for(var i=0,l=columns.length;i<l;i++){
			if(columns[i].lock === true){
				cols.add(columns[i]);
				if(columns[i].hidden !== true) v += columns[i].width;
			}
		}
		this.lockWidth = v;
		sb.add('<TABLE cellSpacing="0" atype="grid.lbt" cellPadding="0" border="0"  width="'+v+'"><TBODY>');
		sb.add(this.createTH(cols));
		for(var i=0,l=this.dataset.data.length;i<l;i++){
			sb.add(this.createRow('l', i, cols, this.dataset.getAt(i)));
		}
		sb.add('</TBODY></TABLE>');
		sb.add('<DIV style="height:17px"></DIV>');
		this.lb.update(sb.join(''));
		this.lbt = this.lb.child('table[atype=grid.lbt]'); 
	},
	renderUnLockAread : function(){
		var sb = [];var cols = [];
		var v = 0;
		var columns = this.columns;
		for(var i=0,l=columns.length;i<l;i++){
			if(columns[i].lock !== true){
				cols.add(columns[i]);
				if(columns[i].hidden !== true) v += columns[i].width;
			}
		}
		sb.add('<TABLE cellSpacing="0" atype="grid.ubt" cellPadding="0" border="0" width="'+v+'"><TBODY>');
		sb.add(this.createTH(cols));
		for(var i=0,l=this.dataset.data.length;i<l;i++){
			sb.add(this.createRow('u', i, cols, this.dataset.getAt(i)));
		}
		sb.add('</TBODY></TABLE>');
		this.ub.update(sb.join(''));
		this.ubt = this.ub.child('table[atype=grid.ubt]'); 
	},
    isOverSplitLine : function(x){
		var v = 0;		
		var isOver = false;
		this.overColIndex = -1;
		var columns = this.columns;
		for(var i=0,l=columns.length;i<l;i++){
			var c = columns[i];
			if(c.hidden !== true) v += c.width;
			if(x < v+3 && x > v-3){
				isOver = true;
				this.overColIndex = i;
				break;
			}
		}
		return isOver;
	},
	onRefresh : function(){
		this.onLoad(false)
	},
	onIndexChange:function(ds, r){
		var index = this.getDataIndex(r.id);
		if(index == -1)return;
		if(r != this.selectRecord){
			this.selectRow(index, false);
		}
	},
	//TODO:增加lock部分
	onAdd : function(ds,record,index){
		if(this.lb)
		var sb = [];var cols = [];
		var v = 0;
		var columns = this.columns;
		var tr = document.createElement("TR");
		var row = this.dataset.data.length-1;
		tr.id=this.id+'$u'+'-'+record.id;
		tr.className=(row % 2==0 ? '' : 'row-alt');
		for(var i=0,l=columns.length;i<l;i++){
			var col = columns[i];
			if(col.lock !== true){
				var td = document.createElement("TD");
				td.style.visibility=col.hidden == true ? 'hidden' : 'visible';
				td.style.textAlign=col.align||'left';
				td.dataindex=col.dataindex;
				var text = this.renderText(record,col.dataindex,record.data[col.dataindex]||'');
				var field = record.getMeta().getField(col.dataindex);		
//				var cell = '<div class="grid-cell'+ (field.snap.required == true ? ' item-notBlank' : '')+ (col.editor ? ' '+this.cecls : '')+'" id="'+this.id+'_'+col.dataindex+'_'+record.id+'" dataindex="'+col.dataindex+'" recordid="'+record.id+'">'+text+'</div>';
				var cell = '<div class="grid-cell'+ (field.get('required') == true ? ' item-notBlank' : '')+ (col.editor ? ' '+this.cecls : '')+'" id="'+this.id+'_'+col.dataindex+'_'+record.id+'" dataindex="'+col.dataindex+'" recordid="'+record.id+'">'+text+'</div>';
				td.innerHTML = cell;
				tr.appendChild(td);
			}
		}
		this.ubt.dom.tBodies[0].appendChild(tr);
//		this.selectRow(row,false);
	},
	onUpdate : function(ds,record, name,value){
		var div = document.getElementById(this.id+'_'+name+'_'+record.id)
		if(div){ 
			var text = this.renderText(record,name, value);
			Ext.fly(div).update(text);
		}
	},
	onValid : function(ds, record, name, valid){
		var div = document.getElementById(this.id+'_'+name+'_'+record.id);
		if(div) {
			if(valid == false){
				Ext.fly(div).addClass('item-invalid');
			}else{
				Ext.fly(div).removeClass('item-invalid');
				Ext.fly(div).removeClass('item-notBlank');
			}
		}
		//alert(record.errors[name].message)
	},
	onRemove : function(ds,record,index){
		var row = Ext.get(document.getElementById(this.id+'$u-'+record.id));
		row.remove();
	},
	onClear : function(){
		
	},
	onFieldChange : function(){
		
	},
//	onRowMouseOver : function(e){
//		if(Ext.fly(e.target).hasClass('grid-cell')){
//			var rid = Ext.fly(e.target).getAttributeNS("","recordid");
//			var row = this.getDataIndex(rid);
//			if(row == -1)return;
//			if(rid != this.overId)
//			if(this.overlockTr) this.overlockTr.setStyle(this.bgc, this.selectedId ==this.overId ? '#ffe3a8' : '');
//			if(this.overUnlockTr)  this.overUnlockTr.setStyle(this.bgc,this.selectedId ==this.overId ? '#ffe3a8' : '');
//			this.overId = rid;
//			this.overlockTr = Ext.get(document.getElementById(this.id+'$l-'+rid));
//			if(this.overlockTr)this.overlockTr.setStyle(this.bgc,'#d9e7ed');
//			this.overUnlockTr = Ext.get(document.getElementById(this.id+'$u-'+rid));
//			this.overUnlockTr.setStyle(this.bgc,'#d9e7ed');
//		}
//	},
	getDataIndex : function(rid){
		var index = -1;
		for(var i=0,l=this.dataset.data.length;i<l;i++){
			var item = this.dataset.getAt(i);
			if(item.id == rid){
				index = i;
				break;
			}
		}
		return index;
	},
	onDblclick : function(e){
		if(Ext.fly(e.target).hasClass('grid-cell')){
			var dom = e.target;
			var rid = Ext.fly(dom).getAttributeNS("","recordid");
			var record = this.dataset.findById(rid);
			var row = this.dataset.indexOf(record);
			var dataindex = Ext.fly(dom).getAttributeNS("","dataindex");
			this.fireEvent('dblclick', this, record, row, dataindex)
		}
	},
	onClick : function(e) {
		if(Ext.fly(e.target).hasClass('grid-cell')){
			var dom = e.target;
			var rid = Ext.fly(dom).getAttributeNS("","recordid");
			var record = this.dataset.findById(rid);
			var row = this.dataset.indexOf(record);
			var dataindex = Ext.fly(dom).getAttributeNS("","dataindex");
			this.showEditor(row,dataindex);
			this.fireEvent('rowclick', this, row, record)
		}
	},
	setEditor: function(dataindex,editor){
		var col = this.getColByDataIndex(dataindex);
		col.editor = editor;
		var div = document.getElementById(this.id+'_'+dataindex+'_'+this.selectRecord.id)
		if(editor == ''){
			Ext.fly(div).removeClass(this.cecls)
		}else{
			if(!Ext.fly(div).hasClass(this.cecls))Ext.fly(div).addClass(this.cecls)
		}
	},
	showEditor : function(row, dataindex){
		
//		Ext.get('console').update(Ext.get('console').dom.innerHTML + " | removeMousedown" )
//		Ext.get(document.documentElement).un("mousedown", this.onEditorBlur, this);
		if(row == -1)return;
		var col = this.getColByDataIndex(dataindex);
		if(!col)return;
		var record = this.dataset.getAt(row);
		if(!record)return;
		if(record.id != this.selectedId);
		this.selectRow(row);
		if(col.editorfunction) {
			var ef = window[col.editorfunction];
			if(ef==null) {
				alert("未找到"+col.editorfunction+"方法!") ;
				return;
			}
			var edit = ef.call(window,record)
			this.setEditor(dataindex,edit);
		}
		var editor = col.editor;			
		if(editor){
			var dom = document.getElementById(this.id+'_'+dataindex+'_'+record.id);
			var xy = Ext.fly(dom).getXY();
			var sf = this;
			setTimeout(function(){
				var v = record.get(dataindex)
				sf.currentEditor = {
					record:record,
					ov:v,
					dataindex:dataindex,
					editor:$(editor)
				};
				var ed = sf.currentEditor.editor;
				ed.setHeight(Ext.fly(dom.parentNode).getHeight()-5)
				ed.setWidth(Ext.fly(dom.parentNode).getWidth()-7);
//				ed.attachGrid = sf;
//				if(ed instanceof Aurora.Lov){
//					ed.attachGrid = sf;
//					var value = record.get(ed.valuefield);
//					var text = v;
//					ed.setValue(text, text, true);
////					ed.setValue(value, text,true);
////					if(ed.attachGridListener != true){
////						ed.on('commit', sf.onLovCommit, sf)
////						ed.attachGridListener = true;
////					}
//				}else{
//					ed.setValue(v,true);					
//				}
				ed.isFireEvent = true;
				ed.isHidden = false;
				ed.move(xy[0],xy[1])
				ed.bind(sf.dataset, dataindex);
				ed.rerender(record);
				ed.focus();
//				Ext.get('console').update(Ext.get('console').dom.innerHTML + " | addMousedown" )
				Ext.get(document.documentElement).on("mousedown", sf.onEditorBlur, sf);				
			},1)
		}			
	},
	onLovCommit: function(lov, v, t,r){
		var vf = lov.valuefield
		this.selectRecord.set(vf, v);
	},
	focusRow : function(row){
		var r = 25;
		var stop = this.ub.getScroll().top;
		if(row*r<stop){
			this.ub.scrollTo('top',row*r-1)
		}
		if((row+1)*r>(stop+this.ub.getHeight())){
			this.ub.scrollTo('top',(row+1)*r-this.ub.getHeight())
		}
		this.focus();
	},
	hideEditor : function(){
		if(this.currentEditor && this.currentEditor.editor){
			var ed = this.currentEditor.editor;
			var needHide = true;
			if(ed.canHide){
				needHide = ed.canHide();
			}
			if(needHide) { 
//				Ext.get('console').update(Ext.get('console').dom.innerHTML + " | removeMousedown" )
				Ext.get(document.documentElement).un("mousedown", this.onEditorBlur, this);
				var ed = this.currentEditor.editor;
//				ed.blur();
				ed.move(-10000,-10000);
				ed.isFireEvent = false;
				ed.isHidden = true;
			}
		}
	},
	onEditorBlur : function(e){
		if(this.currentEditor && !this.currentEditor.editor.isEventFromComponent(e.target)) {			
			this.hideEditor();
		}
	},
	onLockHeadMove : function(e){
		this.hmx = e.xy[0] - this.lht.getXY()[0];
		if(this.isOverSplitLine(this.hmx)){
			this.lh.setStyle('cursor',"w-resize");			
		}else{
			this.lh.setStyle('cursor',"default");			
		}
		//Ext.get('console').update(this.hmx)
	},
	onUnLockHeadMove : function(e){
		var lw = 0;
		if(this.uht){
			lw = this.uht.getXY()[0] + this.uht.getScroll().left;
		}
		this.hmx = e.xy[0] - lw + this.lockWidth;
		if(this.isOverSplitLine(this.hmx)){
			this.uh.setStyle('cursor',"w-resize");			
		}else{
			this.uh.setStyle('cursor',"default");
		}		
	},
	onHeadMouseDown : function(e){
		this.dragWidth = -1;
		if(this.overColIndex == -1) return;
		this.dragIndex = this.overColIndex;
		this.dragStart = e.getXY()[0];
		this.sp.setHeight(this.height);
		this.sp.setVisible(true);
		this.sp.setStyle("left", (e.xy[0] - this.wrap.getXY()[0]-1)+"px")
		Ext.get(document.documentElement).on("mousemove", this.onHeadMouseMove, this);
    	Ext.get(document.documentElement).on("mouseup", this.onHeadMouseUp, this);
	},
	onHeadMouseMove: function(e){
		e.stopEvent();
		this.dragEnd = e.getXY()[0];
		var move = this.dragEnd - this.dragStart;
		var c = this.columns[this.dragIndex];
		
		var w = c.width + move;
		
		if(w > 30 && w < this.width) {
			this.dragWidth = w;
			//Ext.get('console').update(w)
			this.sp.setStyle("left", (e.xy[0] - this.wrap.getXY()[0])+"px")
		}
	},
	onHeadMouseUp: function(e){
		Ext.get(document.documentElement).un("mousemove", this.onHeadMouseMove, this);
    	Ext.get(document.documentElement).un("mouseup", this.onHeadMouseUp, this);
		
		
		this.sp.setVisible(false);
		if(this.dragWidth != -1)
		this.setColumnSize(this.columns[this.dragIndex].dataindex, this.dragWidth);
		
	},
	getColByDataIndex : function(dataindex){
		var col;
		for(var i=0,l=this.columns.length;i<l;i++){
			var c = this.columns[i];
			if(c.dataindex.toLowerCase() === dataindex.toLowerCase()){
				col = c;
				break;
			}
		}
		return col;
	},
	/** API ���� **/
	selectRow : function(row, locate){
		var record = this.dataset.getAt(row) 
		this.selectedId = record.id;
		if(this.selectlockTr) this.selectlockTr.setStyle(this.bgc,'');
		if(this.selectUnlockTr) this.selectUnlockTr.setStyle(this.bgc,'');
		this.selectUnlockTr = Ext.get(document.getElementById(this.id+'$u-'+record.id));
		if(this.selectUnlockTr)this.selectUnlockTr.setStyle(this.bgc,this.scor);
		
		this.selectlockTr = Ext.get(document.getElementById(this.id+'$l-'+record.id));
		if(this.selectlockTr)this.selectlockTr.setStyle(this.bgc,this.scor);
		this.focusRow(row)
		
		var r = (this.dataset.currentPage-1)*this.dataset.pageSize + row+1;
		this.selectRecord = record
		if(locate!==false && r != null) {
//			this.dataset.locate(r);
			this.dataset.locate.defer(5, this.dataset,[r,false]);
		}
	},
	setColumnSize : function(dataindex, size){
		var columns = this.columns;
		var hth,bth,lw=0,uw=0;
		for(var i=0,l=columns.length;i<l;i++){
			var c = columns[i];
			if(c.dataindex === dataindex){
				if(c.hidden == true) return;
				c.width = size;
				if(c.lock !== true){					
					hth = this.uh.child('TH[dataindex='+dataindex+']');
					bth = this.ub.child('TH[dataindex='+dataindex+']');
					
				}else{							
					if(this.lh) hth = this.lh.child('TH[dataindex='+dataindex+']');
					if(this.lb) bth = this.lb.child('TH[dataindex='+dataindex+']');
					
				}
			}
			c.lock !== true ? uw += c.width : lw += c.width;
		}
		this.lockWidth = lw;
		if(hth) hth.setStyle("width", size+"px");
		if(bth) bth.setStyle("width", size+"px");
		if(this.lc)this.lc.setStyle("width",(lw-1)+"px");
		if(this.lht)this.lht.setStyle("width",lw+"px");
		if(this.lbt)this.lbt.setStyle("width",lw+"px");
		this.uc.setStyle("width", (this.width - lw)+"px");
		this.uht.setStyle("width",uw+"px");
		this.ubt.setStyle("width",uw+"px");
	},
	showColumn : function(dataindex){
		var col = this.getColByDataIndex(dataindex);
		if(col){
			if(col.hidden === true){
				delete col.hidden;
				this.setColumnSize(dataindex, col.hiddenWidth);
				delete col.hiddenWidth;
				if(!Ext.isIE){
					var tds = Ext.DomQuery.select('TD[dataindex='+dataindex+']',this.wrap.dom);
					for(var i=0,l=tds.length;i<l;i++){
						var td = tds[i];
						Ext.fly(td).show();
					}
				}
			}
		}
	},
	hideColumn : function(dataindex){
		var col = this.getColByDataIndex(dataindex);
		if(col){
			if(col.hidden !== true){
				col.hiddenWidth = col.width;
				this.setColumnSize(dataindex, 0, false);
				if(!Ext.isIE){
					var tds = Ext.DomQuery.select('TD[dataindex='+dataindex+']',this.wrap.dom);
					for(var i=0,l=tds.length;i<l;i++){
						var td = tds[i];
						Ext.fly(td).hide();
					}
				}
				col.hidden = true;
			}
			
		}
	}
});