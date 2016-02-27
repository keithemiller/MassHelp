var service_request_counter = 0;

/** 
 * Increment the in-flight request counter, check that it's within reason.   
 */
function incrementRequestCounter() 
{
	service_request_counter++;
	
	if(service_request_counter > 32) // arbitrary
	{
		service_request_counter = 0; // it's invalid, give it a value value
	} 
}

/**
 * Decrement the in-flight request counter, check that it's never negative. 
 */ 
function decrementRequestCounter() 
{ 
	service_request_counter--;
	
	if(service_request_counter < 0)
	{
		service_request_counter = 0;
	}
}

/**
 * Reset the in-flight counter to zero in the event of a problem. 
 */ 
function resetServiceRequestCounter()
{
	service_request_counter = 0;
}

/**
 * Return true if there is an outstanding in-flight request. 
 */
function isServiceRequestPending()
{
	return service_request_counter > 0;
}

/* 
 * Return a text string from the given end-point. 
 * Name value pairs for the query string, if any,
 * should be passed in the data parameter:
 * 
 *  getText("/home/phone", receiver, { foo: "bar" } );
 *  
 *  Results in: /home/phone?foo=bar
 * type (optional) is the datatype.  'text' is the default value
 */
function getText(uri, callback, data, type)
{
	incrementRequestCounter();
	
	var process = function(result)
	{	
		decrementRequestCounter();
		
		callback(result); 
	};
		
 	$.ajax( 
 	{ 
		type:			"GET",
		beforeSend: function (request) {
			request.setRequestHeader('csrfToken', securityToken);
		},
		cache:			false,
		async:			true,
 		success: 		process,
		dataType: 		type ? type : "text",
		
 		data:			data,
 		url: 			uri
 		//AHB-25538 : Avoiding the content type to set here, which was making to fail the rest calls.
 		//contentType:	"application/x-www-form-urlencoded"
	});      	
}

/*
 * Calls getText with an explicit return type of HTML.  
 */
function getHTML(uri, callback, data)
{
	incrementRequestCounter();
	
	var process = function(result)
	{
		decrementRequestCounter();
			
		callback(result); 
	};

	getText(uri, process, data, "html");
}

/* 
 * Return an object from the given end-point. The incoming
 * data is in JSON form but the callback receives an object
 * (the ajax method will "eval" the incoming response). 
 */
function getJSON(uri, callback, post, data, sync)
{
	incrementRequestCounter();
	
	var process = function(result)
	{
		decrementRequestCounter();
			
		callback(result); 
	};

 	$.ajax( 
 	{ 
		type:			post ? "POST" : "GET",
		beforeSend: function (request) {
			request.setRequestHeader('csrfToken', securityToken);
		},
		cache:			false,
		async:			sync?false:true,
 		success: 		process,
		dataType: 		"json",
		
 		data:			data,
 		url: 			uri
 		//AHB-25538 : Avoiding the content type to set here, which was making to fail the rest calls.
 		//contentType:	"application/x-www-form-urlencoded"
	});      	
}

/*
 * Post the object to the given end-point in JSON format. 
 * The target must be setup to handle a POST and consume
 * JSON. We get back the same object representation with
 * any server-side updates applied. 
 */
function saveJSON(uri, callback, object, sync)
{
	incrementRequestCounter();
	
	var process = function(result)
	{
		decrementRequestCounter();
		
		callback(result); 
	};

	var json = JSON.stringify(object ? object : {warning: "no payload provided"} );

 	$.ajax( 
 	{ 
		type:			"POST",
		beforeSend: function (request) {
			request.setRequestHeader('csrfToken', securityToken);
		},
		cache:			false,
		async:			sync?false:true,
 		success: 		process,
		dataType: 		"json",
		
		url: 			uri,
 		data:			json,
 		
 		contentType:	"application/json; charset=utf-8"
	});           	
}


