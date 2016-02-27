/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *
 * Restful member search service wrappers.
 *
 * ping(callback)
 * 
 * logon(username, password, callback)
 */

// Internal variables.  Not part of the Service interface.
var pbsInternals =
{
	pbsURIPrefix: "/rest/memberSearch/",
	// Utility function to return a function that calls the callback, passing in a single arg.
	genSingleArgCallbackFn: function(callback) { return function(data) { callback(data); }; },
	ignoreFn : function(ignore) {},
	logWarnings : true,
	debugMode : false
};
 
var memberSearchService = 
{
	 /****************************************************************************
	     ******************* 		CORE SERVICES			*****************
	 ****************************************************************************/
	 
	//Find members. 
	findMembers: function(filter, callback)
	{
		var process = function(data)
		{
			callback(data);
		};
			
		getJSON("/rest/memberSearch/findMembers/filter", process, false, filter);
	},
	
	//Find members 2. Added for the enhancement AHB-18200
	findMembers2: function(filter, callback)
	{
		var process = function(data)
		{
			callback(data);
		};
			
		getJSON("/rest/memberSearch/findMembers2/filter", process, false, filter);
	},
	
	//Find members Interventions. Added for the enhancement AHB-25855
	getMemberInterventions: function(filter, callback)
	{
		var process = function(data)
		{
			callback(data);
		};
			
		getJSON("/rest/memberSearch/getMemberInterventions/filter", process, false, filter);
	},

	/****************************************************************************
	 	******************* 		ANCILLARY SERVICES		*******************
	 ****************************************************************************/
	ping: function(callback)
	{
		getText(pbsInternals.pbsURIPrefix + "ping", pbsInternals.genSingleArgCallbackFn(callback));
	},

	debug: function(msg)
	{
		getText(pbsInternals.pbsURIPrefix + "log/debug", pbsInternals.ignoreFn, { msg : msg });
	},

	info: function(msg)
	{
		getText(pbsInternals.pbsURIPrefix + "log/info", pbsInternals.ignoreFn, { msg : msg });
	},

	warn: function(msg)
	{
		getText(pbsInternals.pbsURIPrefix + "log/warn", pbsInternals.ignoreFn, { msg : msg });
	},

	error: function(msg)
	{
		getText(pbsInternals.pbsURIPrefix + "log/error", pbsInternals.ignoreFn, { msg: msg });
	},

	/*
	 * Logon for test purposes. This file should not be deployed to production, 
	 * nevertheless it requires an additional secret before login is permitted. 
	 */
	logon: function(username, password, secret, callback)
	{
		var credentials = // Form variables for post
		{ 
				username: username,
				password: password,
				secret: secret
		};
		
		getJSON(pbsInternals.pbsURIPrefix + "logon", pbsInternals.genSingleArgCallbackFn(callback), true, credentials);
	}
};
