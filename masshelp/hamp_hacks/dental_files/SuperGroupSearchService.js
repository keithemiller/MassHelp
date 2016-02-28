/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *
 * Restful SuperGroup search service wrappers.
 *
 * ping(callback)
 * 
 * logon(username, password, callback)
 */

// Internal variables.  Not part of the Service interface.
var sgInternals =
{
	sgURIPrefix: "/rest/superGroupSearch/",
	// Utility function to return a function that calls the callback, passing in a single arg.
	genSingleArgCallbackFn: function(callback) { return function(data) { callback(data); }; },
	ignoreFn : function(ignore) {},
	logWarnings : true,
	debugMode : false
};
 
var superGroupSearchService = 
{
	 /****************************************************************************
	     ******************* 		CORE SERVICES			*****************
	 ****************************************************************************/
		 
		// Find States. 
		findStates: function(filter, callback)
		{
			var process = function(data)
			{
				callback(data);
			};
				
			getJSON(sgInternals.sgURIPrefix + "list/states", process, false, filter);
		},
		 
		// Find SuperGroups. 
		findSuperGroups: function(filter, callback)
		{
			var process = function(data)
			{
				callback(data);
			};
				
			getJSON(sgInternals.sgURIPrefix + "findSuperGroups", process, false, filter);
		},
		 
		// Find the State and SuperGroup that correspond to the given Policy Benefit ID. 
		findStateAndSuperGroup: function(filter, callback)
		{
			var process = function(data)
			{
				callback(data);
			};
				
			getJSON(sgInternals.sgURIPrefix + "findStateAndSuperGroup", process, false, filter);
		},
		
	/****************************************************************************
	 	******************* 		ANCILLARY SERVICES		*******************
	 ****************************************************************************/
	ping: function(callback)
	{
		getText(sgInternals.sgURIPrefix + "ping", sgInternals.genSingleArgCallbackFn(callback));
	},

	debug: function(msg)
	{
		getText(sgInternals.sgURIPrefix + "log/debug", sgInternals.ignoreFn, { msg : msg });
	},

	info: function(msg)
	{
		getText(sgInternals.sgURIPrefix + "log/info", sgInternals.ignoreFn, { msg : msg });
	},

	warn: function(msg)
	{
		getText(sgInternals.sgURIPrefix + "log/warn", sgInternals.ignoreFn, { msg : msg });
	},

	error: function(msg)
	{
		getText(sgInternals.sgURIPrefix + "log/error", sgInternals.ignoreFn, { msg: msg });
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
		
		getJSON(sgInternals.sgURIPrefix + "logon", sgInternals.genSingleArgCallbackFn(callback), true, credentials);
	}
};


