/**
 * Place to put all global jQuery event type and event handler bindings.
 * This is included in Header.jspinc so that these bindings are bound
 * before any other custom page specific bindings occur.
 * 
 * Assumption:
 * "If there are multiple handlers registered, they will always execute in the order in which they were bound."
 * @see http://api.jquery.com/bind/
 */
$(document).ready(function()
{
	//date formatter
	$('.date').change(changeDateFormat);
	
	$('form[name=IspectrumForm]').submit(function()
	{
		appendCSRFToken("IspectrumForm");
	});
	
	$('form[name=form1]').submit(function()
	{
		appendCSRFToken("form1");
	});
	
	$('form[name=form]').submit(function()
	{
		appendCSRFToken("form");
	});
	
	//AHB-26186:Appending CSRF token incase of forms having form name as 'UploadForm'
	$('form[name=UploadForm]').submit(function()
	{
		appendCSRFToken("UploadForm");
	});
	
	//AHB-26106:Appending CSRF token incase of forms having form name as 'mapdisplayform'
	$('form[name=mapdisplayform]').submit(function()
	{
		appendCSRFToken("mapdisplayform");
	});
	
	
	//AHB-17902 : Added the below code to make Application work on Enter key
	$(document).keypress(function(event){
		//AHB-26251: Modified the approach to get form name to suppress issues caused by elements having name as name.
		var formName = document.forms[0].getAttribute("name");
		var type=$(':focus').prop('tagName');
		
		if(event.keyCode == 13){
			var component = $('input[name="component"]').prop('value');
			//AHB-26168: TO suppress default submission of form on press of EnterKey.
			if (type != 'INPUT' && type != 'A' && component != 'Claim837D' && component != 'ClaimPreAuth837D' ) {
				event.preventDefault();
			} else if (type == 'INPUT') {
				if ($(':focus').prop("type") != "submit" && $(':focus').prop("type") != "button" && $(':focus').prop("type") != "image") {
					event.preventDefault();
				}
			}
			
			var submitButtonNameArray =[];
			var ButtonNameArray = [];

			$('input[type="submit"]').each(function(){   
				submitButtonNameArray.push($(this).attr('name'));
			});
			
			$('input[type="button"]').each(function(){   
				ButtonNameArray.push($(this).attr('value'));
			});
			
			//AHB-26759
			if(component != undefined && (component == 'Claim837D' || component == 'ClaimPreAuth837D')){
				submitButtonNameArray =[];
				ButtonNameArray = [];
			}
			appendCSRFToken(formName);
			$.each(submitButtonNameArray, function(i, val){
				if(val=="Submit" && $('input[value="Submit"]').is(':visible') && $('#pre_claimprocess').is(':visible')== false ){
					$('input[name="Submit"]').click();
					return false;
				}else if(val == "Search"){
					$('input[name="Search"]').click();
					return false;
				}else if(val == "Next"){
					$('input[name="Next"]').click();
					return false;
				}else if(val == "Search Again"){
					$('input[name = "Search Again"]').click();
					return false;
				}else if(val == "SearchAgain"){                   //AHB-26159
					$('input[name="SearchAgain"]').click();
					return false;
				}else if(val == "Lock"){
					$('input[name="Lock"]').click();
					return false;
				}else if(val == "Done"){
					$('input[name="Done"]').click();
					return false;
				}else if(val == "Update"){
					$('input[name="Update"]').click();
					return false;
				}else if(val == "Back"){
					$('input[name="Back"]').click();
					return false;
				}else if(val == "AddNewFolder"){           //AHB-26167
					$('input[name="AddNewFolder"]').click();
					return false;
				}
			});	
			
			
			$.each(ButtonNameArray, function(i, val)
			{
				if(val=="Submit" && $('input[value="Submit"]').is(':visible') && $("#save_auth").is(':visible')== false && $('#pre_claimprocess').is(':visible')== false){
					$('input[value="Submit"]').click();
					return false;
				}else if(val == "Search" && !($(".error_message").length > 0) && $('#pre_claimprocess').is(':visible')== false){
					$('input[value="Search"]').click();
					return false;
				}else if(val == "Next"){
					$('input[value="Next"]').click();
					return false;
				}else if(val == "Done"){
					$('input[value="Done"]').click();
					return false;
				}
			});
			
			//AHB-25869 :Added the below code to invoke the Modal window function. As modal window was not focused in IE 8& 9 browsers
			if($(document.activeElement).attr("id") == "TB_iframeContent" ){
				$('#TB_iframeContent').contents().find('input[value="Search"]').focus();
			}
		}
	});
});

function appendCSRFToken(formName)
{
	//AHB-23893:If form is multipart then we cannot get request using, req.getParameter in filter. So add the csrf token as action parameter	
	if(formName == "UploadForm")
	{
		var action = $('form[name='+formName+']').attr("action");
		if(action.indexOf('?') > -1)
		{
			$('form[name='+formName+']').attr("action",action+"&csrfToken="+securityToken);
		}
		else
		{
			$('form[name='+formName+']').attr("action",action+"?csrfToken="+securityToken);
		}
	}
	else
	{
		$('<input>').attr({
			type: 'hidden',
		    id: 'csrfToken',
		    name: 'csrfToken',
		    value: securityToken
		}).appendTo('form[name='+formName+']');
	}

}