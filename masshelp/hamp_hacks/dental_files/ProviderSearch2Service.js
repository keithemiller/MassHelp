/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *
 * Restful Provider Search 2 service wrappers.
 *
 * ping(callback)
 * 
 * logon(username, password, callback)
 * 	
 * findProviders(providerType, providerId, callback)
 *
 * reset
 */

// Internal variables.  Not part of the Service interface.
//noinspection JSUnusedLocalSymbols
var ps2sInternals =
{
	ps2sURIPrefix: "/rest/providersearch2/",
	// Utility function to return a function that calls the callback, passing in a single arg.
	genSingleArgCallbackFn: function(callback) { return function(data) { callback(data); }; },
	ignoreFn : function(ignore) {},
	logWarnings : true,
	debugMode : false
};
 
var providerSearch2Service = 
{
        // Acquire the settings that were used during the previous search. 
        acquireCurrentSettings: function(filter, callback)
        {
            var process = function(data)
            {
                callback(data);
            };
                
            getJSON(ps2sInternals.ps2sURIPrefix + "getSearchSettings", process, false, filter);
        },

        // Pass the current user entries in the Member Search panel to the server.
        // These will later be used to restore the values into the entry fields if the user returns to this page.
        saveCurrentMemberEntries: function(filter, callback)
        {
            var process = function(data)
            {
                callback(data);
            };
                
            getJSON(ps2sInternals.ps2sURIPrefix + "setSearchSettings", process, false, filter);
        },

    /*
	 * Service availability test.
	 */
	ping: function(callback)
	{
		getText(ps2sInternals.ps2sURIPrefix + "ping", ps2sURIPrefix.genSingleArgCallbackFn(callback));
	},

	debug: function(msg)
	{
		getText(ps2sInternals.ps2sURIPrefix + "log/debug", ps2sURIPrefix.ignoreFn, { msg : msg });
	},

	info: function(msg)
	{
		getText(ps2sInternals.ps2sURIPrefix + "log/info", ps2sURIPrefix.ignoreFn, { msg : msg });
	},

	warn: function(msg)
	{
		getText(ps2sInternals.ps2sURIPrefix + "log/warn", ps2sURIPrefix.ignoreFn, { msg : msg });
	},

	error: function(msg)
	{
		getText(ps2sInternals.ps2sURIPrefix + "log/error", ps2sURIPrefix.ignoreFn, { msg: msg });
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
		
		getJSON(ps2sInternals.ps2sURIPrefix + "logon", ps2sInternals.genSingleArgCallbackFn(callback), true, credentials);
	},
	
	/*
	 * Find counties
	 * Filter should be of form { state: state }
	 */
	findCounties: function(filter, callback)
	{
		getJSON(ps2sInternals.ps2sURIPrefix + "counties", ps2sInternals.genSingleArgCallbackFn(callback), false, filter);
	}
}
