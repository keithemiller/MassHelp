/*
 *  Utility javascript to pop up a calendar.
 * A window is created and its source is completely generated dynamically.
 *  show_calendar() is the main entry point.
 */
function doNull() {}

var fontface = "Verdana, Geneva, Arial, Helvetica, sans-serif"; //"Arial, sans-serif";
var headerfontface = "Verdana";//"Arial";

var gNow = new Date();
var ggWinCal;

// These really shouldn't be global variables.  They should be attributes of the Calendar object.
var gDefaultDay;
var gDefaultMonth;
var gDefaultYear;
var gObject;
var gCallback;
var gCurrentMonth;
var gCurrentYear;
var gStr;
var gStr2;


var isNav = (navigator.appName.indexOf("Netscape") != -1);
var isIE = (navigator.appName.indexOf("Microsoft") != -1);

function Calendar(p_item, p_WinCal, p_month, p_year, p_format, p_callback)
{
	if ((p_month == null) && (p_year == null))	return;

	if (p_WinCal == null)
		this.gWinCal = ggWinCal;
	else
		this.gWinCal = p_WinCal;
	
	if (p_month == null) {
		this.gMonthName = null;
		this.gMonth = null;
		this.gYearly = true;
	} else {
		this.gMonthName = get_month(p_month);
		this.gMonth = new Number(p_month);
		this.gYearly = false;
	}

	this.gYear = p_year;
	this.gFormat = p_format;
	this.gBGColor = "white";
	this.gFGColor = "black";
	this.gTextColor = "black";
	this.gHeaderColor = "black";
	this.gReturnItem = p_item;
	gCallback = p_callback;
	
	gCurrentMonth = this.gMonth;
	gCurrentYear = this.gYear;
}

function get_month(monthNo) {
	var months = new Array("January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December");
	return months[monthNo];
}

function get_daysofmonth(monthNo, p_year) {
	var doMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	if (monthNo != 1) return doMonth[monthNo];
	if ((p_year % 400) == 0) return 29;
	if ((p_year % 100) == 0 ) return 28;
	if ((p_year % 4) == 0) return 29;
	return 28;
}

function calc_month_year(p_Month, p_Year, incr) {
	/* 
	Will return an 1-D array with 1st element being the calculated month 
	and second being the calculated year 
	*/
	var ret_arr = new Array();
	var mm;
	var yy;
	mm = parseInt(p_Month) + incr;
	yy = parseInt(p_Year);
  	if (mm<0) {
      	mm=mm+12;yy=yy-1;
   	} else {
      	if (mm>11) {
         	mm=mm-12;yy=yy+1;
       	}
   	}
	ret_arr[0] = mm;
	ret_arr[1] = yy;

	return ret_arr;
}

// This is for compatibility with Navigator 3.  We have to create and discard one object before the prototype object exists.
new Calendar();


Calendar.prototype.getMonthlyCalendarCode = function() {
	
	this.wwrite(  "<TABLE width=\"100%\" BORDER=1 BGCOLOR=\"" + this.gBGColor + "\">"
		+ this.cal_header() 
		+ this.cal_data() 
		+ "</TABLE><DIV style=\"margin:4px;\" align=\"center\"><A HREF=\"javascript:void(0);\" onclick=\"javascript:window.close()\" style=\"font-size:11px; color: blue; font-family: Verdana, Lucida, Geneva, Helvetica, Arial, sans-serif;\">Close Window</A></DIV>");
};

Calendar.prototype.show = function() {
	// open() clears out the existing document if there is one.
	this.gWinCal.document.open();

	// Setup the page...
	this.wwrite("<html><head><title>Select Date</title></head>");

	this.wwrite("<body  " + 
		"text=\"" + this.gTextColor + 
		"\">");
		
	// Get navigation..
	this.cal_navigation();

	// Get the calendar code for the month..
	this.getMonthlyCalendarCode();
//	this.wwrite(vCode);

	this.wwrite("</font></body></html>");
	this.gWinCal.document.close();

};

Calendar.prototype.wwrite = function(wtext) {
	this.gWinCal.document.writeln(wtext);
};

Calendar.prototype.cal_navigation = function() {
	// Show navigation buttons
	var prevMMYYYY = calc_month_year(this.gMonth, this.gYear, -1);
	var prevMM = prevMMYYYY[0];
	var prevYYYY = prevMMYYYY[1];

	var nextMMYYYY = calc_month_year(this.gMonth, this.gYear, 1);
	var nextMM = nextMMYYYY[0];
	var nextYYYY = nextMMYYYY[1];

	var s;
	var ylim = parseInt(this.gYear) + 5;
	s =
	" <div id='yearLayer' style=\"position:absolute; left:165px; top:16px;"
	 + "width:10px; height:10px; z-index:96; " 
	 + " border: 21px none #000000; "
	 + "visibility: hidden\"> "

	 +"<form name='yearform' method=\"post\" action=\"\">"
	+ "<FONT SIZE='1' FACE='san-serif'>"
	+ "<select size = 10 name='year' " +
		"onClick=\"document.getElementById('yearLayer').style.visibility = 'hidden';\" " +
		"onBlur=\"document.getElementById('yearLayer').style.visibility = 'hidden';\" " +
		"onChange=\"javascript:window.opener.yearChanged(this.value);\">";
	for (var i=1900;i<ylim;i++){
		if (i == this.gYear) {s = s+ "<option value="+i+" selected>" + i +"</option>";}
		else {s = s+ "<option value="+i+">" + i +"</option>";}
	}
 	s = s + "</select>"	+ "</FONT>"+"</form></div>"	;
	//alert(s);
	this.wwrite(s);
	s =
	" <div id='monthLayer' style=\"font-family:Verdana, Geneva, Arial, Helvetica, sans-serif;position:absolute; left:30px; top:16px;"
	 + "width:10px; height:10px; z-index:96; " 
	 + " border: 21px none #000000; "
	 + "visibility: hidden\"> "

	 +"<form name='monthform' method=\"post\" action=\"\">"
	+ "<select size = 10 name='month' " +
		"onClick=\"document.getElementById('monthLayer').style.visibility = 'hidden';\" " +
		"onBlur=\"document.getElementById('monthLayer').style.visibility = 'hidden';\" " +
		"onChange=\"javascript:window.opener.monthChanged(this.value);\">";
	for (i=0;i<12;i++){
		if (i == this.gMonth) {s = s+ "<option value="+i+" selected>" + get_month(i) +"</option>";}
		else {s = s+ "<option value="+i+">" + get_month(i) +"</option>";}
	}
 	s = s + "</select>"	+ "</form></div>"	;

	this.wwrite(s);

	this.wwrite("<TABLE WIDTH='100%' BORDER=0 CELLSPACING=0 CELLPADDING=0 COLOR='white' BGCOLOR='#CCCCCC'><TR>");
	this.wwrite("<TD ALIGN=center WIDTH='16'><A HREF=\"" +
		"javascript:window.opener.BuildCalendar(" +
		"'" + this.gReturnItem + "', '" + prevMM + "', '" + prevYYYY + "', '" + this.gFormat + "'" + ", '" + gCallback + "'" +
		");" +
		"\"><img width=16 height=16 border=0 src='/Images/calendar_prev.gif' alt='Previous Month'></\/A></TD>");
	this.wwrite("<TD ALIGN=center width='90' ><B><A HREF=\"javascript:void(0);\" onclick=\"document.getElementById('monthLayer').style.visibility = 'visible';\" style=\"font-size:12px; color: blue; font-family: Verdana, Lucida, Geneva, Helvetica, Arial, sans-serif;\">" + this.gMonthName + "</A></B></TD>");
	this.wwrite("<TD ALIGN=center WIDTH='16'><A HREF=\"" +
		"javascript:window.opener.BuildCalendar(" +
		"'" + this.gReturnItem + "', '" + nextMM + "', '" + nextYYYY + "', '" + this.gFormat + "'" + ", '" + gCallback + "'" +
		");" +
		"\"><img width=16 height=16 border=0 src='/Images/calendar_next.gif' alt='Next Month'></\/A></TD>");
this.wwrite("<TD>&nbsp;</TD>");
	this.wwrite("<TD ALIGN=center  WIDTH='16'><A HREF=\"" +
		"javascript:window.opener.BuildCalendar(" +
		"'" + this.gReturnItem + "', '" + this.gMonth + "', '" + (parseInt(this.gYear)-1) + "', '" + this.gFormat + "'" + ", '" + gCallback + "'" +
		");" +
		"\"><img width=16 height=16 border=0 src='/Images/calendar_prev.gif' alt='Previous Year'></\/A></TD>");
	this.wwrite("<TD ALIGN=center width='50'><B><A HREF=\"javascript:void(0);\" onclick=\"document.getElementById('yearLayer').style.visibility = 'visible';\" style=\"font-size:12px; color: blue; font-family: Verdana, Lucida, Geneva, Helvetica, Arial, sans-serif;\">" + this.gYear + "</A></B></TD>");
	this.wwrite("<TD ALIGN=center  WIDTH='16'><A HREF=\"" +
		"javascript:window.opener.BuildCalendar(" +
		"'" + this.gReturnItem + "', '" + this.gMonth + "', '" + (parseInt(this.gYear)+1) + "', '" + this.gFormat + "'" + ", '" + gCallback + "'" +
		");" +
		"\"><img width=16 height=16 border=0 src='/Images/calendar_next.gif' alt='Next Year'></\/A></TD>");
	this.wwrite("</TR></TABLE>");

};

Calendar.prototype.cal_header = function() {
	var vCode = " ";
	var weekDays = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
	var s = "<TD WIDTH='14%'><FONT SIZE='1' FACE='" + headerfontface + "' COLOR='" + this.gHeaderColor + "'><B>";
	for (var i=0;i<7;i++){
		vCode = vCode + s + weekDays[i] + "</B></FONT></TD>";
	}
	vCode = "<TR>" + vCode + "</TR>";
	return vCode;
};

Calendar.prototype.cal_data = function() {
	var vDate = new Date();
	vDate.setDate(1);
	vDate.setMonth(this.gMonth);
	vDate.setFullYear(this.gYear);

	var vFirstDay=vDate.getDay();
	var vDay=1;
	var vLastDay=get_daysofmonth(this.gMonth, this.gYear);
	var vOnLastDay=0;
	var vCode = "";

	/*
	Get day for the 1st of the requested month/year..
	Place as many blank cells before the 1st day of the month as necessary. 
	*/

	vCode = vCode + "<TR>";
	// vtb
	var prevMonth=this.gMonth - 1;
	var prevYear=this.gYear;
	if (prevMonth<0){
		prevMonth = 11;
		prevYear = prevYear - 1; 
	}
	var vLastDayPrevMonth=get_daysofmonth(prevMonth, prevYear);
	var iii; 
	for (var i=0; i<vFirstDay; i++) {
		iii = vLastDayPrevMonth - vFirstDay +1 + i;
		vCode = vCode + "<TD align='center' WIDTH='14%'" + 
			"><FONT SIZE='1' FACE='" + fontface + "' COLOR='gray'>" + 
			iii + 
			"</FONT>" + 
			"</TD>";
	}

	// Write rest of the 1st week
	for (var j=vFirstDay; j<7; j++) {
		vCode = vCode + "<TD align='center' WIDTH='14%'" + ">"+
		"<FONT FACE='" + fontface + "'>" + 
			"<A HREF=\"javascript:void(0);\" style=\"font-size:10px; font-weight:bold; color: blue; text-decoration: none\" " + 
				"onClick=\"" + this.buildCalendarSetter(vDay) + "\">" +
				this.format_day(vDay) +
			"</A>" + 
			"</FONT>"+
			"</TD>";
	
		vDay=vDay + 1;
	}
	vCode = vCode + "</TR>";

	// Write the rest of the weeks
	for (var k=2; k<7; k++) {
		vCode = vCode + "<TR>";

		for (j=0; j<7; j++) {
			vCode = vCode + "<TD align='center' WIDTH='14%'" + "><FONT FACE='" + fontface + "'>" + 
				"<A HREF=\"javascript:void(0);\" style=\"font-size:10px; font-weight:bold; color: blue; text-decoration: none\" " + 
					"onClick=\"" + this.buildCalendarSetter(vDay) + "\">" +
				this.format_day(vDay) +
				"</A>" + 
				"</FONT></TD>";
			vDay=vDay + 1;

			if (vDay > vLastDay) {
				vOnLastDay = 1;
				break;
			}
		}

		if (j == 6)
			vCode = vCode + "</TR>";
		if (vOnLastDay == 1)
			break;
	}
	
	// Fill up the rest of last week with proper blanks, so that we get proper square blocks
	for (var m=1; m<(7-j); m++) {
		vCode = vCode + "<TD align='center' WIDTH='14%'" + 
		"><FONT SIZE='1' FACE='" + fontface + "' COLOR='gray'>" + m + "</FONT></TD>";
	}
	
	return vCode;
};

Calendar.prototype.format_day = function(vday) {
	if (vday == gDefaultDay && this.gMonth == gDefaultMonth && this.gYear == gDefaultYear)
		return ("<FONT COLOR=\"RED\"><B>" + vday + "</B></FONT>");
	else
//		return ("<FONT COLOR=\"BLUE\"><B>" + vday + "</B></FONT>");
		return ( vday );
//		return (vday);
};

// Generate the onclick javascript.  If a callback is specified, generate code to call it and close the window.
// Otherwise generate code to set the element value in the parent and close this window.
Calendar.prototype.buildCalendarSetter = function(vday) {
	var formatted_data = "'" + this.format_data(vday) + "'";
	if (gCallback && gCallback != null && gCallback != '' && gCallback != 'undefined')
	{
		return "try { self.opener." + gCallback + "('" + gObject + "'," + formatted_data + "); } finally { window.close(); }";
	}
	else
	{
		return "self.opener.document." + gObject + ".value=" + formatted_data + "; window.close(); ";
	}
};

Calendar.prototype.format_data = function(p_day) {
	var vData;
	var vMonth = 1 + this.gMonth;
	vMonth = (vMonth.toString().length < 2) ? "0" + vMonth : vMonth;
	//var vMon = get_month(this.gMonth).substr(0,3).toUpperCase();
	//var vFMon = get_month(this.gMonth).toUpperCase();
	var vY4 = new String(this.gYear);
	//var vY2 = new String(this.gYear.substr(2,2));
	var vDD = (p_day.toString().length < 2) ? "0" + p_day : p_day;
			vData = vMonth + "\/" + vDD + "\/" + vY4;

	return vData;
};

// This is called from the parent window.   The popup window also calls this
// to rebuild the entire popup window to shift to a different month or year.
function BuildCalendar(p_item, p_month, p_year, p_format, p_callback) {
	var p_WinCal = ggWinCal;
	var cal = new Calendar(p_item, p_WinCal, p_month, p_year, p_format, p_callback);

	// Customize your Calendar here..
	cal.gBGColor="white";
	cal.gLinkColor="#336699";//
	cal.gTextColor="black";
	cal.gHeaderColor="black";

	cal.show();
}

/**
 * Entry function to show a popup calendar.
 * Args:
 *  0 - date.  Optional date if set shows as initially selected date
 *  1 - returnObjRef (required).
 *      If callbackFn is not specified, returnObjRef should hold a partially namespaced name, e.g. 'formname.objname'.
 *      To be safe, id and name should be the same for both form and object.
 *      the value will be inserted into this name automatically unless callbackFn is specified.
 *  2 - callbackFn (optional) function called in caller window.  If specified, it is responsible for setting the value.
 * The callback function receives two args -- the returnObjRef and the updated value.  In this case, the returnObjRef
 * is simply passed through from show_calendar to the callback, so its value may be anything (excluding semicolons, braces, quotation marks, etc.).
 */
function show_calendar() {

	/* 
		0 -what; 1 -object
	*/
	if (arguments[1] != null ){
		gObject = arguments[1];
	}	

	var p_month;
	var p_year;
	var p_format = "MM/DD/YYYY";
	var p_item = arguments[1];
	var p_callback = arguments[2] || '';

	if (arguments[0] == null || arguments[0] == ""){
		gDefaultDay = gNow.getDate();
		gDefaultMonth = gNow.getMonth();
		gDefaultYear = gNow.getFullYear();
		p_month = new String(gNow.getMonth());
		p_year = new String(gNow.getFullYear().toString());
	}
	else {
		gDefaultDay = parseInt(arguments[0].substring(3,5));
		if (gDefaultDay == null || gDefaultDay == "NaN" || gDefaultDay=="" ) {
			gDefaultDay = gNow.getDate();
		}
		
		gStr = new String(arguments[0].substring(0,2));
		gStr2 = (gStr.substring(0,1)=="0"? parseInt(gStr.substring(1,2)):parseInt(gStr)) - 1;
		p_month = new String(gStr2.toString());
		if (p_month == null || p_month == "NaN" || p_month=="" || p_month > 11 || p_month < 0) {
			p_month = new String(gNow.getMonth());
		}		
		gDefaultMonth = parseInt(p_month);
		
		p_year = new String(arguments[0].substring(6,10));
		if (p_year == null || p_year == "NaN" || p_year == "") {
			p_year = new String(gNow.getFullYear().toString());
		}
		gDefaultYear = parseInt(p_year);
	}

    if (!window.ggWinCal) {
        // has not yet been defined
		//to Fix Jira AHB-759 the resizable is changed from "no"to "yes"
		ggWinCal = window.open("", "Calendar", 
			"width=360,height=190,status=no,resizable=yes,top=200,left=200");
		ggWinCal.opener = self;
		//	ggWinCal = vWinCal;

    }
    else {
        // has been defined
        if (!ggWinCal.closed) {
            // still open
            ggWinCal.focus();
        }
        else {
			//to Fix Jira AHB-759 the resizable is changed from "no"to "yes"
			ggWinCal = window.open("", "Calendar", 
			"width=360,height=190,status=no,resizable=yes,top=200,left=200");
			ggWinCal.opener = self;
        }
    }

	if( isNaN(p_month) )
	{
		p_month = new String(gNow.getMonth());
	}
	if( isNaN(p_year) || p_year.length < 4 )
	{
		p_year = new String(gNow.getFullYear().toString());
	}

	BuildCalendar(p_item, p_month, p_year, p_format, p_callback);
}

function yearChanged(){
	BuildCalendar(gObject,gCurrentMonth,arguments[0],this.gFormat,gCallback);
//	document.getElementById('yearLayer').style.visibility = 'hidden';
//	return;
}
function monthChanged(){
	BuildCalendar(gObject,arguments[0],gCurrentYear,this.gFormat,gCallback);
//	document.getElementById('monthLayer').style.visibility = 'hidden';
//	return;
}

function CalendarClose(){
      if (ggWinCal != null)
	  	if (!ggWinCal.closed) ggWinCal.close();
//	return ;
}

