/*
 * TODO: The "smooth" menu object is a third-party add-on, so needless to say it should
 * not have been cut-and-pasted in to our global script file but kept as a maintainable
 * include. The same goes for the smooth menu style sheet. 
 * 
 * TODO: The "smooth" menu object was not integrated with our style mechanism. Moreover,
 * since it does horizontal and vertical. We should use it for both so that we have one
 * menu system. 
 */

/*
 * Some string extensions. 
 */

//AHB-23893:Security Token
var securityToken = "";

String.prototype.startsWith = function(prefix) { return (this.match("^" + prefix) == prefix); };
String.prototype.endsWith = function(suffix) { return (this.match(suffix + "$") == suffix); };
String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ""); };

/*
 * Return true if text is undefined, null or equal to the empty string 
 */ 
function isBlank(text)
{
	return !text || text == null || text == ""; 
}

/*
 * The eat function can be used for debugging or to ignore
 * service call results. Marking a resource as deleted and
 * saving it will not return anything new or useful. 
 */
 var eat = function() { /* eat */ };
 
 /*
  * A safe console debug that's easy to remember and quick to type
  */
 function tweet(item)
 {
 	if(window.console === undefined) 
 		return;

 	console.log(item);
 }
 
 /*
  * The assert constructor.  
  */
 function AssertException(message) 
 { 
	 this.message = message; 
 }
 
 /*
  * Bind a toString operator to the assert object. 
  */
 AssertException.prototype.toString = function() 
 {
   return 'AssertException: ' + this.message;
 };
  
 /*
  * Throw an assert exception if the expression is false. 
  */
 function assert(expression, message) 
 {
   if(expression == false) 
   {
     throw new AssertException(message);
   }
 };

 
 /*
  * More Diagnostics
  */

function popUpDiagnosticWindow(url)
{
	diagnosticWindow = window.open(url,'diagnosticWindow','width=350,height=250');
}

/* ===== Pop up window =====*/
var newwindow = '';

function popitup(url, windowwidth, windowheight)
{
	if (!newwindow.closed && newwindow.location)
	{
		newwindow.location.href = url;
	}
	else
	{
		if (windowwidth == "" && windowheight == "")
		{
			newwindow=window.open(url,'windowName','toolbar=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
		}
		else
		{
			newwindow=window.open(url,'windowName','width='+windowwidth+',height='+windowheight+',left=600,top=200,toolbar=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
		}
		if (!newwindow.opener) newwindow.opener = self;
	}
	if (window.focus) {
		newwindow.focus();
	}
	return false;
}
	
/* ===== Action Confirmation =====*/

function executeWithConfirmation(message,action,rowNumber)
{
	if(confirm(message))
	{
		appendCSRFToken("IspectrumForm");
		document.IspectrumForm.action.value = action;
		document.IspectrumForm.rowNumber.value = rowNumber;
		document.IspectrumForm.submit();			
	}
}
function executeWithoutConfirmation(action,rowNumber)
{
	appendCSRFToken("IspectrumForm");
	document.IspectrumForm.action.value = action;
	document.IspectrumForm.rowNumber.value = rowNumber;
	document.IspectrumForm.submit();	
}

/* ===== Upload Action =====*/
function BeginAttach()
{
	try
	{
		appendCSRFToken("UploadForm");
		document.UploadForm.submit();
	}
	catch ( e ) 
	{
		alert( "Invalid file specified . Please try again." );
		return;
	}     
}

//AHB-17647 
//TODO turn these variables into a configurable items
var datePattern1 = /(\d{2})(\d{2})(\d{4})/;		//03172001
var datePattern2 = /(\d{2})-(\d{2})-(\d{4})/;	//03-17-2001
var formattedDateRegex = '$1/$2/$3';			//03/17/2001
function changeDateFormat(event)
{
	var val = $(this).val();
	if(val.length == 8 && val.match(datePattern1))
	{
		//03172001 => 03/17/2001
		$(this).val(val.replace(datePattern1, formattedDateRegex));
	}
	else if(val.length == 10 && val.match(datePattern2))
	{
		//03-17-2001 => 03/17/2001
		$(this).val(val.replace(datePattern2, formattedDateRegex));
	}
}

/***********************************************
* Fixed ToolTip script- © Dynamic Drive (www.dynamicdrive.com)
* This notice MUST stay intact for legal use
* Visit http://www.dynamicdrive.com/ for full source code
***********************************************/
		
var tipwidth=''; //default tooltip width
var tipbgcolor='';  //tooltip bgcolor
var disappeardelay=250;  //tooltip disappear speed onMouseout (in miliseconds)
var vertical_offset="0px"; //horizontal offset of tooltip from anchor link
var horizontal_offset="-3px"; //horizontal offset of tooltip from anchor link

/////No further editting needed

var ie4=document.all;
var ns6=document.getElementById&&!document.all;

if (ie4||ns6)
document.write('<div id="tooltip" style="visibility:hidden;width:'+tipwidth+';background-color:'+tipbgcolor+'" ></div>');

function getposOffset(what, offsettype){
var totaloffset=(offsettype=="left")? what.offsetLeft : what.offsetTop;
var parentEl=what.offsetParent;
while (parentEl!=null){
totaloffset=(offsettype=="left")? totaloffset+parentEl.offsetLeft : totaloffset+parentEl.offsetTop;
parentEl=parentEl.offsetParent;
}
return totaloffset;
}


function showhide(obj, e, visible, hidden, tipwidth){
if (ie4||ns6)
dropmenuobj.style.left=dropmenuobj.style.top=-500
if (tipwidth!=""){
dropmenuobj.widthobj=dropmenuobj.style
dropmenuobj.widthobj.width=tipwidth
}
if (e.type=="click" && obj.visibility==hidden || e.type=="mouseover")
obj.visibility=visible
else if (e.type=="click")
obj.visibility=hidden
}

function iecompattest(){
return (document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
}

function clearbrowseredge(obj, whichedge){
var edgeoffset=(whichedge=="rightedge")? parseInt(horizontal_offset)*-1 : parseInt(vertical_offset)*-1
if (whichedge=="rightedge"){
var windowedge=ie4 && !window.opera? iecompattest().scrollLeft+iecompattest().clientWidth-15 : window.pageXOffset+window.innerWidth-15
dropmenuobj.contentmeasure=dropmenuobj.offsetWidth
if (windowedge-dropmenuobj.x < dropmenuobj.contentmeasure)
edgeoffset=dropmenuobj.contentmeasure-obj.offsetWidth
}
else{
var windowedge=ie4 && !window.opera? iecompattest().scrollTop+iecompattest().clientHeight-15 : window.pageYOffset+window.innerHeight-18
dropmenuobj.contentmeasure=dropmenuobj.offsetHeight
if (windowedge-dropmenuobj.y < dropmenuobj.contentmeasure)
edgeoffset=dropmenuobj.contentmeasure+obj.offsetHeight
}
return edgeoffset
}

function showtooltip(menucontents, obj, e, tipwidth){
if (window.event) event.cancelBubble=true
else if (e.stopPropagation) e.stopPropagation()
clearhidetip()
dropmenuobj=document.getElementById? document.getElementById("tooltip") : tooltip
dropmenuobj.innerHTML=menucontents

if (ie4||ns6){
showhide(dropmenuobj.style, e, "visible", "hidden", tipwidth)
dropmenuobj.x=getposOffset(obj, "left")
dropmenuobj.y=getposOffset(obj, "top")
dropmenuobj.style.left=dropmenuobj.x-clearbrowseredge(obj, "rightedge")+"px"
dropmenuobj.style.top=dropmenuobj.y-clearbrowseredge(obj, "bottomedge")+obj.offsetHeight+"px"
}
}

function hidetip(e){
if (typeof dropmenuobj!="undefined"){
if (ie4||ns6)
dropmenuobj.style.visibility="hidden"
}
}

function hidetooltip(){
if (ie4||ns6)
delayhide=setTimeout("hidetip()",disappeardelay)
}

function clearhidetip(){
if (typeof delayhide!="undefined")
clearTimeout(delayhide)
}

/* ===== Diagnostic window ===== */
//** Smooth Navigational Menu- By Dynamic Drive DHTML code library: http://www.dynamicdrive.com
//** Script Download/ instructions page: http://www.dynamicdrive.com/dynamicindex1/ddlevelsmenu/
//** Menu created: Nov 12, 2008

//** Dec 12th, 08" (v1.01): Fixed Shadow issue when multiple LIs within the same UL (level) contain sub menus: http://www.dynamicdrive.com/forums/showthread.php?t=39177&highlight=smooth

//** Feb 11th, 09" (v1.02): The currently active main menu item (LI A) now gets a CSS class of ".selected", including sub menu items.

//** May 1st, 09" (v1.3):
//** 1) Now supports vertical (side bar) menu mode- set "orientation" to 'v'
//** 2) In IE6, shadows are now always disabled


var ddsmoothmenu={

//Specify full URL to down and right arrow images (23 is padding-right added to top level LIs with drop downs):
arrowimages: {down:['downarrowclass', '/Images/Down.gif', 23], right:['rightarrowclass', '/Images/Right.gif']},


transition: {overtime:1, outtime:1}, //duration of slide in/ out animation, in milliseconds
shadow: {enabled:true, offsetx:0, offsety:0},

///////Stop configuring beyond here///////////////////////////

detectwebkit: navigator.userAgent.toLowerCase().indexOf("applewebkit")!=-1, //detect WebKit browsers (Safari, Chrome etc)
detectie6: document.all && !window.XMLHttpRequest,

getajaxmenu:function($, setting){ //function to fetch external page containing the panel DIVs
	var $menucontainer=$('#'+setting.contentsource[0]) //reference empty div on page that will hold menu
	$menucontainer.html("Loading Menu...")
	$.ajax({
		url: setting.contentsource[1], //path to external menu file
		async: true,
		error:function(ajaxrequest){
			$menucontainer.html('Error fetching content. Server Response: '+ajaxrequest.responseText)
		},
		success:function(content){
			$menucontainer.html(content)
			ddsmoothmenu.buildmenu($, setting)
		}
	})
},


buildmenu:function($, setting){
	var smoothmenu=ddsmoothmenu
	var $mainmenu=$("#"+setting.mainmenuid+">ul") //reference main menu UL
	$mainmenu.parent().get(0).className=setting.classname || "ddsmoothmenu"
	var $headers=$mainmenu.find("ul").parent()
	$headers.hover(
		function(e){
			$(this).children('a:eq(0)').addClass('selected')
		},
		function(e){
			$(this).children('a:eq(0)').removeClass('selected')
		}
	)
	$headers.each(function(i){ //loop through each LI header
		var $curobj=$(this).css({zIndex: 100-i}) //reference current LI header
		var $subul=$(this).find('ul:eq(0)').css({display:'block'})
		this._dimensions={w:this.offsetWidth, h:this.offsetHeight, subulw:$subul.outerWidth(), subulh:$subul.outerHeight()}
		this.istopheader=$curobj.parents("ul").length==1? true : false //is top level header?
		$subul.css({top:this.istopheader && setting.orientation!='v'? this._dimensions.h+"px" : 0})
		$curobj.children("a:eq(0)").css(this.istopheader? {paddingRight: smoothmenu.arrowimages.down[2]} : {}).append( //add arrow images
			'<img src="'+ (this.istopheader && setting.orientation!='v'? smoothmenu.arrowimages.down[1] : smoothmenu.arrowimages.right[1])
			+'" class="' + (this.istopheader && setting.orientation!='v'? smoothmenu.arrowimages.down[0] : smoothmenu.arrowimages.right[0])
			+ '" style="border:0;" />'
		)
		if (smoothmenu.shadow.enabled){
			this._shadowoffset={x:(this.istopheader?$subul.offset().left+smoothmenu.shadow.offsetx : this._dimensions.w), y:(this.istopheader? $subul.offset().top+smoothmenu.shadow.offsety : $curobj.position().top)} //store this shadow's offsets
			if (this.istopheader)
				$parentshadow=$(document.body)
			else{
				var $parentLi=$curobj.parents("li:eq(0)")
				$parentshadow=$parentLi.get(0).$shadow
			}
			this.$shadow=$('<div class="ddshadow'+(this.istopheader? ' toplevelshadow' : '')+'"></div>').prependTo($parentshadow).css({left:this._shadowoffset.x+'px', top:this._shadowoffset.y+'px'})  //insert shadow DIV and set it to parent node for the next shadow div
		}
		$curobj.hover(
			function(e){
				var $targetul=$(this).children("ul:eq(0)")
				this._offsets={left:$(this).offset().left, top:$(this).offset().top}
				var menuleft=this.istopheader && setting.orientation!='v'? 0 : this._dimensions.w
				menuleft=(this._offsets.left+menuleft+this._dimensions.subulw>$(window).width())? (this.istopheader && setting.orientation!='v'? -this._dimensions.subulw+this._dimensions.w : -this._dimensions.w) : menuleft //calculate this sub menu's offsets from its parent
				if ($targetul.queue().length<=1){ //if 1 or less queued animations
					$targetul.css({left:menuleft+"px", width:this._dimensions.subulw+'px'}).animate({height:'show',opacity:'show'}, ddsmoothmenu.transition.overtime)
					if (smoothmenu.shadow.enabled){
						var shadowleft=this.istopheader? $targetul.offset().left+ddsmoothmenu.shadow.offsetx : menuleft
						var shadowtop=this.istopheader?$targetul.offset().top+smoothmenu.shadow.offsety : this._shadowoffset.y
						if (!this.istopheader && ddsmoothmenu.detectwebkit){ //in WebKit browsers, restore shadow's opacity to full
							this.$shadow.css({opacity:1})
						}
						this.$shadow.css({overflow:'', width:this._dimensions.subulw+'px', left:shadowleft+'px', top:shadowtop+'px'}).animate({height:this._dimensions.subulh+'px'}, ddsmoothmenu.transition.overtime)
					}
				}
			},
			function(e){
				var $targetul=$(this).children("ul:eq(0)")
				$targetul.animate({height:'hide', opacity:'hide'}, ddsmoothmenu.transition.outtime)
				if (smoothmenu.shadow.enabled){
					if (ddsmoothmenu.detectwebkit){ //in WebKit browsers, set first child shadow's opacity to 0, as "overflow:hidden" doesn't work in them
						this.$shadow.children('div:eq(0)').css({opacity:0})
					}
					this.$shadow.css({overflow:'hidden'}).animate({height:0}, ddsmoothmenu.transition.outtime)
				}
			}
		) //end hover
	}) //end $headers.each()
	$mainmenu.find("ul").css({display:'none', visibility:'visible'})
},


init:function(setting){
	if (typeof setting.customtheme=="object" && setting.customtheme.length==2){ //override default menu colors (default/hover) with custom set?
		var mainmenuid='#'+setting.mainmenuid
		var mainselector=(setting.orientation=="v")? mainmenuid : mainmenuid+', '+mainmenuid
		document.write('<style type="text/css">\n'
			+mainselector+' ul li a {background:'+setting.customtheme[0]+';}\n'
			+mainmenuid+' ul li a:hover {background:'+setting.customtheme[1]+';}\n'
		+'</style>')
	}
	this.shadow.enabled=(document.all && !window.XMLHttpRequest)? false : true //in IE6, always disable shadow
	jQuery(document).ready(function($){ //ajax menu?
		if (typeof setting.contentsource=="object"){ //if external ajax menu
			ddsmoothmenu.getajaxmenu($, setting)
		}
		else{ //else if markup menu
			ddsmoothmenu.buildmenu($, setting)
		}
	})
}

} //end ddsmoothmenu variable

//Initialize Menu instance(s):

