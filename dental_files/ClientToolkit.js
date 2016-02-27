/*
 * Script that is specifically designed to work with a given page structure
 * should be "included" at the top of that page. These "page scripts" might
 * contain re-usable constructs that should be harvested and moved here. 
 *
 * Re-usable scripts that are related to GUI presentation or behavior should
 * be housed here. The ToolboxService script, by contrast, houses code which
 * is directly related to JSON/XML communications (service interaction). The
 * shared client support functions are fenced off in an object.
 * 
 *  
 * TODO:	Partition this in to functional groups. I have started with the
 * 			array object that houses object array manipulation, but the date
 * 			functions, ID indexing functions, and others, should have there
 * 			own container: toolbox.date, toolbox.idx and so on.  
 *  
 */

var toolkit = 
{
	/*
	 * Scoot over to the given target if the event is a tab key press.  
	 */
	scoot: function(event, target)
	{
		if(event.keyCode == 9) 
		{
			event.preventDefault();
			target.focus();
 		}
	},
	
	/*
	 * Enables the given element. 
	 */
	enableElement: function(element)
	{
		element.removeAttr("disabled");
	},
	
	/*
	 * Disables the given element. 
	 */
	disableElement: function(element)
	{
		element.attr("disabled", true);
	},
	
	/*
	 * Whether the element is enabled. 
	 */
	isDisabled: function(element)
	{
		return element.prop("disabled") == true;  //AHB-25538 : .attr('disabled') deprecated in jquery1.11.1 version
	},
	
	/*
	 * Enable tab-stop on this element: removing tab index ensures natural tab order. 
	 */
	enableTabStop: function(element)
	{
		element.removeAttr("tabindex");
	},
	
	/*
	 * Disable tab-stop on this element: set negative tab index. 
	 */
	disableTabStop: function(element)
	{
		element.attr("tabindex", -1);
	},
	
	/*
	 * Set the state of a checkbox. 
	 */
	setCheckBoxState: function(checkbox, checked)
	{
		if(checked)
		{
			checkbox.attr("checked", "checked");
		}
		else
		{
			checkbox.removeAttr("checked");
		}
	},
	
	/* 
	 * Create a date based on incoming epoch value.  
	 */
	ticksToDateString: function(ticks)
	{
		return this.getDateString(new Date(ticks));
	},

	/*
	 * Return today's date. 
	 */
	getCurrentDateString: function()
	{
		return this.getDateString(new Date());
	},
	
	/*
	 * Convert the incoming date to a string value. 
	 */
	getDateString: function(date)
	{
		var dd = date.getDate();
		if (dd < 10) { dd = '0' + dd; }
		var mm = date.getMonth() + 1;
		if (mm < 10) { mm = '0' + mm; }
		var yyyy = date.getFullYear();
		return mm + "/" + dd + "/" + yyyy;
	},

	/*
	 * Convert the incoming date to a string value that is parse-able by Jackson JSON ("yyyy-MM-dd"). 
	 * 
	 */
	getJSONDateString: function(date)
	{
		return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
	},
	
	toEpoch: function(date)
	{
		return Math.round(new Date(date).getTime() / 1000.0);
	},
	
	togglit: function(target)
	{	
		/* 
		 * 1.3.2 has a bug where trying to hide blocks with floating content 
		 * fails (they pop back up again). Manually hide and show until they 
		 * release 1.3.3 (they have fixed it). 
		 */ 
		if(target.css("display") == "block")
		{
			target.css("display", "none");
		}
		else
		{
			target.css("display", "block");
		}
	},

	/**
	 * Returns whether or not the element is visible.
	 * @param jElement jQuery element
	 *
	 * AHB-17801 - 3.40 method added
	 */
	isVisible: function(jElement)
	{
		return jElement.css("display") == "block";
	},

	/**
	 * Utility method to show/hide an element
	 * @param elem - DOM element (not jQuery obj) Element to hide/show
	 * @param visibility - either true or false.  If true, show element, otherwise hide it.
	 *
	 * AHB-17801 - 3.40 method added
	 */
	setElementVisibility: function (elem, visibility)
	{
		// It's only a one-line function, but it's useful to consolidate here so that we consistently
		// use the same visibility style ... e.g. 'none' instead of 'hidden'
		$(elem).css("display", visibility ? 'block' : 'none');
	},


	/**
 	 * Utility method to show/hide an element
 	 * @param - id - Element id to hide/show
	 * @param - visibility - either true or false.  If true, show element, otherwise hide it.
	 *
	 * AHB-17801 - 3.40 method added
 	 */
	setElementVisibilityById: function (id, visibility)
	{
		var elem = document.getElementById(id);
		if (elem != null) {
			toolkit.setElementVisibility(elem, visibility);
		} else
		{
			tweet('setElementVisibilityById: Unknown document id: ' + id);
		}
	},

	/*
	 * Split the segmented ID value and return the number at the given index. 
	 *
	 * Example IDs: FIRST_NAME_idx_3_42, invoice_total_idx_4
	 */ 
	parseIDX: function(i, id)
	{
		var key = id.split("_idx_")[1];

		return parseInt(key.split("_")[i]);
	},

	/*
	 * Convenience wrapper to fetch primary index.
	 */	
	parsePrimaryIndex: function(id) 
	{ 
		return this.parseIDX(0, id); 
	},
	
	/* 
	 * Convenience wrapper to fetch secondary index. 
	 */
	parseSecondaryIndex: function(id) 
	{ 
		return this.parseIDX(1, id); 
	},
		
	/*
	 * Split the ID (using underscore as the delimiter) and return 
	 * the digit at the given segment offset.
	 */ 
	parseIndex: function(segment, id)
	{
		return parseInt(id.split("_")[segment]);
	},		
	
	/* 
	 * Move the Index in the ID (or Name) of the given Widget element by the given offset.
	 * For example,
	 * widget.id = "ROOT_idx_1" and offset=1 => widget.id = "ROOT_idx_2"
	 * However,
	 * widget.id=null; but widget.name = "NAME_idx_3" and offset=-1 => widget.name = "NAME_idx_2"
	 *
	 * AHB-17801 - 3.40 method added
	 */ 
	modifyIndex: function(widget, offset)
	{
		// Determine the current value that appears within the _idx_X labels
		var attrStr = widget.id ? widget.id : widget.name;
		var idxIntMatch = attrStr.match("_idx_[0-9]*")[0].match("[0-9]*$");
		var idxVal = parseInt(idxIntMatch[0]);
		
		// Now update all of the occurrences of the _idx_X
		var re = new RegExp("_idx_[0-9]*", "g");
		var replaceStr = "_idx_" + (idxVal+offset);
		var modifiedStr = attrStr.replace(re, replaceStr);
		
		// Replace the proper attribute
		if (widget.id) {
			widget.id = modifiedStr;
		} else {
			widget.name = modifiedStr;
		}
	}, 
		
	/*
	 * Offset the nth (usually one or two) index number in the id string.
	 */ 
	offsetIndex: function(slot, widget, offset)
	{
		var halves = widget.id.split("_idx_");
		var segments = halves[1].split("_");
		var result = halves[0] + "_idx";
		
		for(var i in segments)
		{
			if(i == slot)
			{
				result += "_" + (parseInt(segments[i]) + offset);
			}
			else
			{				
				result += "_" + segments[i];
			}
		}

		widget.id = result;		
	}, 


	/*
	 * Nearly identical to offsetIndex except that we substitute a 
	 * specific value. This has the added benefit of being able to
	 * replace non-numeric index place-holders in templates. 
	 */ 
	replaceIndex: function(slot, widget, value)
	{
		var halves = widget.id.split("_idx_");
		var segments = halves[1].split("_");
		var result = halves[0] + "_idx";
		
		for(var i in segments)
		{
			if(i == slot)
			{
				result += "_" + value;
			}
			else
			{				
				result += "_" + segments[i];
			}
		}
		
		widget.id = result;
	}, 

	
	/*
	 * Convenience wrapper to bump the index value in the id (or name) of the given element.
	 */
	incrementIndex: function(widget)
	{
		this.modifyIndex(widget, 1);
	}, 
	
	/*
	 * Convenience wrapper to decrement the index value in the id (or name) of the given element.
	 */
	decrementIndex: function(widget)
	{
		this.modifyIndex(widget, -1);
	}, 
	
	/*
	 * Convenience wrapper to bump primary index. 
	 */
	incrementPrimaryIndex: function(widget)
	{
		this.offsetIndex(0, widget, 1);
	}, 

	/*
	 * Convenience wrapper to bump secondary index. 
	 */
	incrementSecondaryIndex: function(widget)
	{
		this.offsetIndex(1, widget, 1);
	},
	
	/*
	 * Convenience wrapper to decrement primary index. 
	 */
	decrementPrimaryIndex: function(widget)
	{
		this.offsetIndex(0, widget, -1);
	}, 
	
	/*
	 * Convenience wrapper to decrement secondary index.. 
	 */
	decrementSecondaryIndex: function(widget)
	{
		this.offsetIndex(1, widget, -1);
	},

	/*
	 * Set the cursor and busy flag (TBD)
	 */
	wait: function()
	{
	}, 
	
	/*
	 * Restore the cursor and reset the busy flag (TBD)
	 */
	release: function()
	{
	},

	/*
	 * Object array manipulation routines. 
	 */
	array:
	{
		/*
		 * Determine whether the target object exists in 
		 * the given list. The "key" is the property name
		 * we are using in the comparison.  
		 */
		contains: function(list, key, target)
		{
			return this.indexOf(list, key, target) >= 0;
		},
		
		/*
		 * Return the index of the given key within the list
		 * using a simple binary search, or -1 if not found.
		 *  
		 *  We are given a list of objects and we're trying to 
		 *  find the index of the target object within it. The
		 *  key is the name of the property being compared.
		 *  
		 *    list   -- array of objects
		 *    key    -- property name to use in comparison
		 *    target -- object we are looking for
		 *    
		 *   A D F H K O Q R V		 
		 *           ^--------	Compare center of range first.
		 *           			If equal the search is complete.
		 *       				If less than target, make this the left boundary and repeat.
		 *       				If more than target, make this the right boundary and repeat.
		 */
		indexOf: function(list, key, target)
		{ 
			var left = 0;
			var right = list.length - 1;

			while(left <= right)
			{
				var center = parseInt((left + right) / 2);

				if(list[center][key] == target[key])
				{
					return center;
				}
				else if(list[center][key] < target[key])
				{
					left = center + 1;
				}
				else
				{
					right = center - 1;
				}
			}
			
			return -1; // not found
		},
		
		/*
		 * Sort an array of objects based on the given key property. 
		 */
		sort: function(list, key)
		{
			list.sort(function(a, b) /* comparator */
			{ 
				return a[key] == b[key] ? 0 : (a[key] > b[key] ? 1 : -1); 
			});
			
			return list;
		},
		
		/*
		 * Return all of the elements in "a" that are not in "b".
		 * That is to say, return this difference: a - b, where 
		 * both arguments are object lists. The key is the name
		 * of the property being compared. 
		 */
		subtract: function(a, b, key)
		{
			var difference = [];
			
			for(var i in a) 
			{
				if(this.contains(b, key, a[i]) == false)
				{
					difference.push(a[i]); 
				}
			}
			
			return difference;
		}
	},

	/**
	 * Truncates a string if necessary and adds ellipsis.  Ensures that the ellipsis itself is not truncated.
	 * @param str
	 * @param maxlength
	 */
	truncate: function(str, maxlength)
	{
		if (str == null) return "";
	    if (str.length < maxlength || maxlength < 4) return str;
		return str.substring(0, maxlength -3) + "...";
	},
	
	/**
	 * JQuery method This function will check the date format for the enter input 
	 * date field and defaults it to MM/DD/YYYY format.
	 * @param field - date field 
	 */
	checkDateFormat2: function(field)
	{		
		var checkstr = "0123456789";
		var DateField = field;
		var Datevalue = "";
		var DateTemp = "";
		var seperator = "/";
		var day;
		var month;
		var year;
		var leap = 0;
		var err = 0;
		var i;
		err = 0;
		var tempMonth,tempDay,tempYear,pos1,pos2;		
		DateValue = DateField.val();

		if(DateValue!=null && DateValue!=undefined && DateField.val().length!=0){
		
			/* Delete all chars except 0..9 */
			for (i = 0; i < DateField.val().length; i++) {
				if (checkstr.indexOf(DateValue.substr(i, 1)) >= 0) {
					DateTemp = DateTemp + DateValue.substr(i, 1);
				}			
			}			
			
			DateValue = DateTemp;
			
			if(DateValue == '0')
			{
				err = 1;
			}
			
			pos1=DateField.val().indexOf(seperator)
			pos2=DateField.val().indexOf(seperator,pos1+1)
			
			//alert("pos1 == " + pos1 + " pos2 ==== "+ pos2);
			
			if (pos1==-1 || pos2==-1){
				//This would be in 01/01/11 or 01/01/2011 format.
				if (DateValue.length == 8 ) {
					tempMonth = DateValue.substr(0, 2);
					month = parseInt(tempMonth, 10);
					if(month<0 || month>12){
						err = 2;
					}
					tempDay = DateValue.substr(2, 2);	
					day = parseInt(tempDay, 10);
					if(day<0 || day>31){
						err = 3;
					}
					if (DateValue.length == 6){
						tempYear = DateValue.substr(4, 6);
						//Derive the year 
						if(tempYear!=0){
							year = '20'+tempYear;
							year = parseInt(year);
						}else{
							err = 4;
						}				
					}else if (DateValue.length == 8){
						tempYear = DateValue.substr(4, 8);
						year = parseInt(tempYear);
					}			
				}else{
					err = 5;
				}
			}else{
				tempMonth=DateField.val().substring(0,pos1);
				tempDay=DateField.val().substring(pos1+1,pos2);
				tempYear=DateField.val().substring(pos2+1);
				var strYr=tempYear;
				if (tempDay.charAt(0)=="0" && tempDay.length>1) tempDay=tempDay.substring(1);
				if (tempMonth.charAt(0)=="0" && tempMonth.length>1) tempMonth=tempMonth.substring(1);
				for (var i = 1; i <= 3; i++) {
					if (strYr.charAt(0)=="0" && strYr.length>1) strYr=strYr.substring(1)
				}
				month=parseInt(tempMonth);
				day=parseInt(tempDay);
				year=parseInt(strYr);	
			}
			//Basic month validation
			if (month<1 || month>12){
				err = 6;
			}
			//Basic day validation
			if (day<1 || day>31){
				err = 7;
			}			
			/* Validation of other months */
			if ((day > 31)
					&& ((month == 1) || (month == 3) || (month == 5)
							|| (month == 7) || (month == 8)
							|| (month == 10) || (month == 12))) {
				err = 8;
			}
			if ((day > 30)
					&& ((month == "04") || (month == "06") || (month == "09") || (month == "11"))) {
				err = 9;
			}
			//Basic year validation
			if (year==0){
				err = 10;
			}		
			
			/* if 00 is entered, no error, deleting the entry */
			if ((day == 0) && (month == 0) && (year == 00)) {
				err = 0;
				day = "";
				month = "";
				year = "";
				seperator = "";
			}
			
			/* Validation leap-year / february / day */
			/* Note that this logic for leap year is incorrect. E.g., it would incorrectly identify 2100
			 * as a leap year. However, as 2100 would be the first year for which this bug would matter,
			 * I'm not going to correct it now. 
			 */
			if ((year % 4 == 0) || (year % 100 == 0) || (year % 400 == 0)) {
				leap = 1;
			}
			if ((month == 2) && (leap == 1) && (day > 29)) {
				err = 11;
			}
			if ((month == 2) && (leap != 1) && (day > 28)) {
				err = 12;
			}			
			
			/* if no error, write the completed date to Input-Field (e.g. 13.12.2001) */
			if (err == 0) {
				var displayMonthStr,displayDayStr,displayYearStr;				
				if (tempMonth.length > 1 && month < 9){
					displayMonthStr = tempMonth;
				}
				else if (tempMonth.length > 1 && month >= 9){
					displayMonthStr = tempMonth;
				} 
				else {
					displayMonthStr = "0"+tempMonth;
				}
				
				if (tempDay.length > 1 && day < 9){
					displayDayStr = tempDay;
				}
				else if (tempDay.length > 1 && day >= 9){
					displayDayStr = tempDay;
				}
				else{
					displayDayStr = "0"+tempDay;
				}	
				if (tempYear.length==2){
				// Expand to 4 digit year, while preserving server-side behavior to treat "32" - "99" as 20th century years.
					if (year < 31)
					{
						displayYearStr = "20"+ tempYear;	
					}
					else
					{
						displayYearStr = "19"+ tempYear;						
					}
				}else{
					displayYearStr = tempYear;
				}
				
				DateField.val(displayMonthStr + seperator + displayDayStr + seperator + displayYearStr);
			}
			/* Error-message if err != 0 */
			/*else {				
				field.value = DateField.value;
				field.select();
				field.focus();
				alert("Please enter a valid MM/DD/YYYY date.");
			}*/		
	   }
	},

	/*****************************************************************
	* AHB 19207 - when entering a date, globally, it needs to be consistent. 
	* 
	* This function will check the date format for the enter input 
	* date field and defaults it to MM/DD/YYYY format. 
	*****************************************************************/
	checkDateFormat: function(field) {		
		var checkstr = "0123456789";
		var DateField = field;
		var Datevalue = "";
		var DateTemp = "";
		var seperator = "/";
		var day;
		var month;
		var year;
		var leap = 0;
		var err = 0;
		var i;
		err = 0;
		DateValue = DateField.value;
		/* Delete all chars except 0..9 */
		for (i = 0; i < DateValue.length; i++) {
			if (checkstr.indexOf(DateValue.substr(i, 1)) >= 0) {
				DateTemp = DateTemp + DateValue.substr(i, 1);
			}
		}
		DateValue = DateTemp;
		/* Always change date to 8 digits - string*/
		/* if year is entered as 2-digit / always assume 20xx */
		if (DateValue.length == 6) {
			DateValue = DateValue.substr(0, 4) + '20' + DateValue.substr(4, 2);
		}
		if (DateValue.length != 8) {
			err = 19;
		}
		/* year is wrong if year = 0000 */
		year = DateValue.substr(4, 4);
		if (year == 0) {
			err = 20;
		}
		/* Validation of month*/
		month = DateValue.substr(0, 2);
		if ((month < 1) || (month > 12)) {
			err = 21;
		}
		/* Validation of day*/
		day = DateValue.substr(2, 2);
		if (day < 1) {
			err = 22;
		}
		/* Validation leap-year / february / day */
		if ((year % 4 == 0) || (year % 100 == 0) || (year % 400 == 0)) {
			leap = 1;
		}
		if ((month == 2) && (leap == 1) && (day > 29)) {
			err = 23;
		}
		if ((month == 2) && (leap != 1) && (day > 28)) {
			err = 24;
		}
		/* Validation of other months */
		if ((day > 31)
				&& ((month == "01") || (month == "03") || (month == "05")
						|| (month == "07") || (month == "08")
						|| (month == "10") || (month == "12"))) {
			err = 25;
		}
		if ((day > 30)
				&& ((month == "04") || (month == "06") || (month == "09") || (month == "11"))) {
			err = 26;
		}
		/* if 00 is entered, no error, deleting the entry */
		if ((day == 0) && (month == 0) && (year == 00)) {
			err = 0;
			day = "";
			month = "";
			year = "";
			seperator = "";
		}
		/* if no error, write the completed date to Input-Field (e.g. 13.12.2001) */
		if (err == 0) {
			DateField.value = month + seperator + day + seperator + year;
		}
		/* Error-message if err != 0 */
		else {
			alert("Please enter a valid MM/DD/YYYY date.");
			DateField.select();
			DateField.focus();
		}
	},
	
	/**
	 * Function to validate phone number and reformat to (XXX)XXX-XXXX
	 * 
	 * @param field - phone field 
	 */
	formatPhone : function(field)
	{
		//Regular expression to validate phone of format (213)123-1231
		var phoneNumberPattern = /^\([1-9]\d{2}\)\s?\d{3}\-\d{4}$/; 			
		var phoneField = field;
		var phoneValue = phoneField.val();
		
		if(phoneValue!='' && phoneValue!=null && phoneValue!=undefined)
		{
			if(phoneValue.length < 10)
			{   
				return false;
			}
			else if(phoneValue.length > 10)
			{
				if(!phoneNumberPattern.test(phoneField.val()))
				{
					return false;
				}
				else
				{
					return true;
				}
			}
			else if(phoneValue.length == 10)
			{
				phoneField.val("(" + phoneValue.substring(0,3) + ")" + phoneValue.substring(3,6) + "-" + phoneValue.substring(6,10));
				return true;
			}
		}
		else
		{
			return true;
		}
	},

	/**
	 * Function to reformat SSN to XXX-XX-XXXX
	 * 
	 * @param field - SSN field 
	 */
	formatSSN : function(field)
	{
		var ssnValue = field.val();
		
		if(ssnValue.length == 9)
		{
			field.val(ssnValue.substring(0,3) + "-" + ssnValue.substring(3,5) + "-" + ssnValue.substring(5,9));
		}
		else if(ssnValue.length == 10)
		{
			if(ssnValue.charAt(3) == "-")
			{
				field.val(ssnValue.substring(0,6) + "-" + ssnValue.substring(6,10));
			}
			else
			{
				field.val(ssnValue.substring(0,3) + "-" + ssnValue.substring(3,10));
			}
		}
	}
};
