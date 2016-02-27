var toolboxService = 
{
	/*
	 * Ping the toolbox service. 
	 */
	ping: function(callback)
	{
		var process = function(data)
		{
			callback(data);
		};

		getText("/rest/toolbox/ping", process);
	},

	/*
	 * Call the echo function on the toolbox service.
	 * The echo service demonstrates the use of path
	 * parameters versus query string arguments, and
	 * an HTML return type.   
	 */
	echo: function(message, callback)
	{
		var process = function(data)
		{
			callback(data);
		};

		getHTML("/rest/toolbox/echo/" + message, process);
	},

	/*	
	 * Get Restricted Character.
	 */
	getRestrictedChars: function(callback)
	{
		var process = function(data)
		{
			callback(data);
		};
		
		getText("/rest/toolbox/getRestrictedChars", process);
	},

	/*
	 * Format the pre-validated date string on the server.  
	 */
	formatDate: function(date, callback)
	{
		var process = function(data)
		{
			callback(data);
		};
	
		getText("/rest/toolbox/format/date", process, { date: date });
	},


	eoo: true
};