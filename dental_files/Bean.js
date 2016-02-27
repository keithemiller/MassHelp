/*****************************************************************
 * 
 * Client Bean
 * Beans are helper objects that are usually attached to elements via jQuery using the 'bean' attribute.
 * They are designed to hold validation information and assist with formatting in some cases.
 *
 * Beans assume a single object argument whose property values are
 * transferred to the bean property with the same name (independent
 * of the order in which they appear).
 * 
 * Examples:
 *
 * var foo = new Bean( { tab: true, min: 1 } );
 *
 * var bar = new Bean( { type: "date", value: "10/31/2010" } );
 * 
 * The Invalidate Flag
 * 
 * A bean can be forced in to an invalid state using the invalidate flag. 
 * This is used to impose dynamic rules that are impossible to implement
 * using range or pattern checks. For example, the server can decide the
 * color "orange" is invalid because it's Tuesday and an e-mail from Bob
 * was received. The client calls the server, asking whether a value is
 * invalid, and sets the invalidate flag accordingly.
 *
 * the isValid() call will in some cases reformat the elements value.
 *
 * valid values for the type attr are: text, number, integer, date, email, money, phone, zip.   
 */

function Bean(properties)
{
	this.name = "";				// Diagnostic value
	this.valid = false;			// Set by validation
	this.invalidate = false; 	// see header comments
	this.required = false;		// False if not required
	this.critical = true;		// Whether validity is critical
	this.tooltip = "";			// The ALT text
	this.message = "";			// What to display if there's an error
	this.enabled = true;		// False to gray out the field
	this.type = "text";			// Default data type
	this.arrow = 0;				// Signed time arrow for validation. negative means today or before, 0 means any date, positive means future only
	this.tab = true;			// True for tabstop
	this.min = 0;				// For "integer"s: Minimum value; otherwise: Minimum characters
	this.max = 0;				// For "integer"s: Maximum value; otherwise: Maximum characters 
	this.restrictedChar = "";	// The restricted characters set by application properties.			
	
	this.element = null;		// Reference to owning element
	
	for(var i in properties) 
	{ 
		this[i] = properties[i]; // transfer matching property value
	}
}

MAX_DOLLAR_AMOUNT = 1000000; 	// A practical maximum for money values

/*
 * Create an exact copy of the bean, bound to the incoming element.
 * Client beans are cloned for the sole purpose of assigning it to 
 * another element.  
 */
Bean.prototype.clone = function(element)
{
	var clone = new Bean();

	clone.element = element; // new element attachment

	clone.name = this.name;

	clone.valid = this.valid;
	clone.critical = this.critical;
	clone.required = this.required;
	clone.invalidate = this.invalidate;
	
	clone.tooltip = this.tooltip;
	clone.message = this.message;
	clone.enabled = this.enabled;
	clone.arrow = this.arrow;
	clone.type = this.type;
	clone.tab = this.tab;
	clone.min = this.min;
	clone.max = this.max;
	clone.restrictedChar = this.restrictedChar;

	return clone;
};

/*
 * Whether the associated element is a tab stop. 
 */
Bean.prototype.isTab = function() 
{	
	return this.tab;
};

/* 
 * Whether the associated element is valid with respect to its type.
 * Clients can force an invalid state independent of its value. The
 * "invalidate" flag.
  * Note: Validation may cause value formatting in some cases (e.g. money)
 */
Bean.prototype.isValid = function() 
{
	if(this.invalidate)
	{
		this.valid = false; // force an invalid state
	}
	else
	{
		if(this.element == null) 
		{
			this.valid = true; // valid if no binding
			tweet(this.name + " has no binding"); // leave this for now
		}
		else
		{
			var value = $.trim(this.element.val());//AHB-21130
					
			// Required fields must have 
			// non-zero value length for non-SELECT fields or 
			// not equal to "none" for SELECT fields (Dropdowns)			
			
			this.valid = this.isClean(value);
			
			if(this.required && this.valid)
			{
				var tagName = this.element.prop('tagName');	//AHB-25538: changed from attr to prop		
				this.valid = (value != null) &&
							 (tagName == "SELECT" ? (value.length > 0 && value != "none") : value.length > 0);
			}
			
			if(this.valid)
			{
				if(value.length > 0)
				{
					//type validation
					switch(this.type)
					{
						case "quantity": //AHB-22933
							this.valid = this.isQuantity(value); 
							break;
						case "idCard": //AHB-20960
							this.valid = this.isIdCard(value); 
							break;
						case "number":
							this.valid = this.isNumber(value); 
							break;
						case "integer":
							this.valid = this.isInteger(value);
							break;				
						case "date":
							this.valid = this.isDate(value, this.arrow); 
							break;				
						case "email":
							this.valid = this.isEmail(value);
							break;				
						case "money":
							this.valid = this.isMoney(value, false, false);
							break;				
						case "phone":
							this.valid = this.isPhone(value);
							break;
						case "ssn":
							this.valid = this.isSSN(value);
							break;
						case "zip":
							this.valid = this.isZip(value);
							break;
						case "text":
							break;
						default:
							tweet('Unknown bean type specified: ' + this.type);
					}

					//if the bean passes type validation
					//perform a range check (if a range was provided)
					if (this.valid && !(this.min == 0 && this.max == 0))
					{
						if (this.type == "integer")
						{
							// Validate that the integer value is within the specified range
							this.valid = ((+value) >= this.min) && ((+value) <= this.max);
						}
						else
						{
							// Validate the number of characters are within the specified range
							this.valid = (value.length >= this.min && value.length <= this.max);
						}
					}
				}
			}
		}
	}
	
	return this.valid;
};

/* 
 * Check if contain the restricted characters.
 */
Bean.prototype.isClean = function(value)
{
	var restrChars = this.restrictedChar;

	var clean = true;
	
	if(restrChars.length == 0)
	{
		clean = true;
	}
	else
	{
		for(var i = 0; i < value.length; i++)
	    {
			var valueChar = value.charAt(i);
			for(var j = 0; j < restrChars.length; j++)
			{
				if(valueChar == restrChars.charAt(j))
				{
					clean = false;
					this.message = "Field contains restricted characters";
				}
			}
	    }
	 }
	 
	return clean;
};

//AHB-22933
/* 
 * Check for a valid Quantity. 
 */
Bean.prototype.isQuantity = function(value)
{
	var expression  = /^[1-9]\d*$/;
	return expression.test(value);
};

//AHB-20960
/* 
 * Check for a valid Card Count. 
 */
Bean.prototype.isIdCard = function(value)
{
	var expression  = /^[1-9][0-9]{0,2}(?:\.[0-9]{3}){0,2}$/;
	return expression.test(value);
};

/* 
 * Check for a valid e-mail address. 
 */
Bean.prototype.isEmail = function(value)
{
	var expression  = /(^[a-z]([a-z_\.]*)@([a-z_\.]*)([.][a-z]{3})$)|(^[a-z]([a-z_\.]*)@ ([a-z_\.]*)(\.[a-z]{3})(\.[a-z]{2})*$)/i;
	return expression.test(value);
};

/*
 * Test for a valid phone number. 
 */
Bean.prototype.isPhone = function(value)
{
	var expression  = /^\([1-9]\d{2}\)\s?\d{3}\-\d{4}$/;
	return expression.test(value);
};

/*
 * Test for a valid SSN. 
 */
Bean.prototype.isSSN = function(value)
{
	var expression  = /^[0-9]{3}[\- ]?[0-9]{2}[\- ]?[0-9]{4}$/; 
	return expression.test(value);
};

/*
 * Numeric value test:  
 */
Bean.prototype.isNumber = function(value)
{
	var expression  = /(^-?\d\d*\.\d\d*$)|(^-?\d\d*$)/;
	return expression.test(value);
};

/*
 * Money test: optional rounding and negative values.
 * Note: Reformats value if parse is successful (really shouldn't do this)
 */
Bean.prototype.isMoney = function(value, negative, round)
{
	var valid = false;

	var expression = /^\$?[0-9]*(,[0-9]{3})*(\.[0-9]{0,2})?$/;

	if(expression.test(value))
	{
		var decimal = value.indexOf(".");
		
		// count the number of places after the decimal point 
		var pennies = decimal < 0 ? 0 : value.substr(decimal).length - 1;
		
		if(pennies < 3 || round)
		{
			// Remove the dollar sign
			var tempValue = value.indexOf("$") >= 0 ? value.substr(value.indexOf("$") + 1) : value;
			
			// AHB-18060 - Remove commas so parseFloat doesn't truncate when it encounters one
			var tempValue2 = tempValue.replace(/,/g, "");
			var amount = parseFloat(tempValue2).toFixed(2);
			
			if(amount >= 0 || negative)
			{
				if(Math.abs(amount) < MAX_DOLLAR_AMOUNT)
				{
					// AHB-18060 - Use tempValue so commas stay
					this.element.val("$"+tempValue); //("$"+amount);
					valid = true;
				}
			}
		}
	}
	
	return valid;
};

/*
 * Natural number test. 
 */
Bean.prototype.isInteger = function(value)
{
	var expression  = /(^-?\d\d*$)/;
	return expression.test(value);
};

/*
 * A value containing whitespace is considered empty. 
 */
Bean.prototype.isEmpty = function(value)
{
	var temp = this.value + "";
	
	return temp.trim().length > 0;
};

/* 
 * Full zip code validator.
 */
Bean.prototype.isZip = function(value)
{
	var expression  = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
	return expression.test(value);
};

/*
 * Whether the target date string is in the past (assumes today is past).
 */
Bean.prototype.isHistoric = function(target)
{
	var historic = false; // prove me right

	var now = new Date();
	var then = new Date(target);

	if(now.getFullYear() > then.getFullYear())			// check year
	{
		historic = true; 								// target year older
	}
	else if(now.getFullYear() == then.getFullYear())	// target year same
	{
		if(now.getMonth() > then.getMonth())			// check month
		{
			historic = true; 							// target month older
		}
		else if(now.getMonth() == then.getMonth())		// target month same
		{
			if(now.getDate() >= then.getDate())			// check day
			{
				historic = true; 						// target day equal or older
			}
		}
	}
	
	return historic;
};

/*
 * Whether the target date string is in the past (does not include today).
 */
Bean.prototype.isBeforeDate = function(target)
{
	this.valid = false; // prove me right

    //assumes both of these have already passed date validation
    var testedDate = new Date(this.element.val());
	var referenceDate = new Date(target);

	if(referenceDate.getFullYear() > testedDate.getFullYear())			// check year
	{
		this.valid = true; 								// target year older
	}
	else if(referenceDate.getFullYear() == testedDate.getFullYear())	// target year same
	{
		if(referenceDate.getMonth() > testedDate.getMonth())			// check month
		{
			this.valid = true; 							// target month older
		}
		else if(referenceDate.getMonth() == testedDate.getMonth())		// target month same
		{
			if(referenceDate.getDate() > testedDate.getDate())			// check day
			{
				this.valid = true; 						// target day older
			}
		}
	}

	return this.valid;
};

/*
 * Test for a valid slash separated date.
 */
Bean.prototype.isDate = function(value, arrow)
{
	var valid = false; 
	
	var expression  = /^\d{1,2}(\/)\d{1,2}\1(\d{1}|\d{2}|\d{4})$/

	if(expression.test(value)) // well formed date test
	{
	    var segments = value.split('/'); 
	    
		var month = parseInt(segments[0], 10); 
    	var day = parseInt(segments[1], 10); 
		var year = parseInt(segments[2], 10);

		var maxDay = 31; 
				
		if(month == 4 || month == 6 || month == 9 || month == 11)
		{
			maxDay = 30;
		}
		else if(month == 2)
		{
			maxDay = 28;
		}
		
  		if(day <= maxDay && day > 0)
  		{
  			valid = true; // day is valid for the given month
    	}
    	else if(day == 29) // this can only fail in Februrary
    	{
     		if((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) 
     		{
     			valid = true; // February 29th is valid in leap years
     		}   
    	}
  		if(month > 12 || month == 0)//AHB-21650
    	{
    		valid = false;
    	}
   		//AHB-22263:SQL Server does not accept date lesser than Jan 1 1753, hence validating the year against 1753. 
  		//We are restricting the User to enter dates lesser than this date.
  		// TPG modified this further to still support entry of 2 digits years which are expanded to 4 digit in the server round trip.
  		else if(year > 99 && year < 1753) 
  		{
  			valid = false;
  		}
  	}  

	if(valid)
	{
		if(arrow != 0) // if there is a time arrow, check it
		{
			valid = arrow < 0 ? this.isHistoric(value) : !this.isHistoric(value);
		}
	}

  	return valid;
};

