/*
 * ProviderSearch 2.0 AssocSearch/AssocAdd Page Event Handlers and Fields.
 * 
 * @TODO	Document server calls as a cross-reference in this comment block.
 * 			List each function and which service calls that function makes.   
 */ 
var selectedLocation = null;
var selectedProvider = null;
 
 var ps2Vars = {
	selectedCounty: ""
}

function isPolicyBenefitOnlyMode()
{
  	return true;
}

function parentMemberProcess(member)
{
	updateBasedOnPolicyBenefitId(member);
}

function cameFromMemberDetail()
{
	var memDetailLink = $('a[href*="component=MemberDetail"]');
	return memDetailLink != null && memDetailLink.length > 0
} 

//noinspection JSUnresolvedFunction
$(document).ready(function()
{
    initializeComponentSearchFields();
	
	if(cameFromMemberDetail()) {
		$("#member_eligibility_panel").hide();
		$("#memberPanelHelpText").hide();
	}
	else {
		OnReadyMemberSearch();
	}

	$(".toggle_container").show(); // hide() - DQ wants all sections to show initially

	$(".searchtitle_expand").click(function()
	{
		if($(this).attr("id") == "member_eligibility_legend")
		{
			clearMember();
		}
		else if($(this).attr("id") == "geoSection")
		{
			clearGeographicArea()
		}
		else if($(this).attr("id") == "addtlProvSection")
		{
			clearAdditionalProvInfo()
		}
		$(this).toggleClass("searchtitle_collapse").next(".toggle_container").toggle();
	});
	  
	/*
	 * Before the search kicks off, send the current MemberSearch entries to be saved in the basket 
	 */
	$("#Search").click(function(event) 
	{
		var selections = getCurrentMemberEntries();
		var sgSelections = getCurrentSGSelections();
		selections.acceptingPatientId = sgSelections.acceptingPatientId
		          
		// Now send the member search entries to be saved on the server
		providerSearch2Service.saveCurrentMemberEntries(selections, null);
	});
	  
	/*
	 * Update County drop down list if state selected
	 */
	$("#LOCATIONXSTATE").change(function()
	{
	    refreshError($(this));
	    var state = $("#LOCATIONXSTATE").val();
	    findCounties(state);
	});
	
	
	//AHB- 22286 :Clear the State and City on Change of ZIP Code.
	$("#LOCATIONXZIP_CODE").change(function()
	{
		$("#LOCATIONXSTATE").val('');
		$("#LOCATIONXCITY").val('');
	});
	
	/*
	 * Display the red arrow (error) if DOB not selected 
	 */
    $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").blur(function()
	{
      refreshError($(this));
    });
    
	/*
	 * Execute a server-side search to retreive counties based on selected state
	 */
	function findCounties(givenState)
	{
		var filter = {
			state : givenState
		};
	
		providerSearch2Service.findCounties(filter, refreshCountyList);
	
		return false;
	}
    
	/* callback function */
	function refreshCountyList(countyViews)
	{
		if(countyViews.length > 0)
		{
			var markup = '<option value="">--Select a County--</option>';
			for (var i in countyViews) {
	
				markup += buildCountyOption(countyViews[i]);
			}
			// Replace the list
			$("#LOCATIONXCOUNTY").empty();
			$("#LOCATIONXCOUNTY").append(markup);		
		}
		else
		{
			initCountyList();
		}
	}

	function buildCountyOption(countyView)
	{
		//noinspection JSUnresolvedVariable
		var county = countyView.county == null ? "" : countyView.county;
		var selected = (county == ps2Vars.selectedCounty) ? " selected" : "";
		return '<option value="' + county + '"' + selected + ">" + county + "</option>";
	}
	
	function initializeComponentSearchFields()
	{
		var filter = '';
	
		providerSearch2Service.acquireCurrentSettings(filter, initComponentsWithSettings);
	
		return false;
	}

    /*
     * Set the active selection in both the State and SuperGroup lists to the values contained in the first row of the
     * given list.
     */
    function initComponentsWithSettings(currentSettings)
    {
        sgInit(currentSettings[0]);
        populateMemberSearchFields(currentSettings[1]);
        initCountyList(currentSettings[2]);
    }
	
	function initCountyList(countyView)
	{
		//AHB-24058: Handled undefined condition.
		var county = "";
		if(countyView != undefined)
		{
			ps2Vars.selectedCounty = countyView.county;
		
			county = countyView.county;
		}
		if (county != "" && countyView != undefined)
		{
		    var state = $("#LOCATIONXSTATE").val();
		    if (state != "")
		    {
		    	findCounties(state);
		    }
		}
	    else
	    {
	    	var markup = '<option value="">--Select a State to Populate--</option>';
	    	$("#LOCATIONXCOUNTY").empty();
	    	$("#LOCATIONXCOUNTY").append(markup);
	    }
	}
	
	function clearProviderSearch2()
	{
		clearMember();
		clearGeographicArea()
		clearAdditionalProvInfo();
	}
	
	function clearGeographicArea()
	{
		$("#LOCATIONXADDRESS").val('');
		$("#LOCATIONXCITY").val('');
		$("#LOCATIONXSTATE").val('');
		$("#LOCATIONXCOUNTY").val('');
		$("#LOCATIONXZIP_CODE").val('');
		$("#PROVIDERXDISTANCE").val('');
	}
	
	function clearAdditionalProvInfo()
	{
		$("#LOCATIONXSERVICES").val('');
		$("#PROVIDERXLAST_NAME").val('');
		$("#PROVIDERXFIRST_NAME").val('');
		$("#PROVIDERXPROVIDER_NO").val('');
		$("#PROVIDERXGENDER").val('');
		$("#PROVIDER_SPECIALTYXPROVIDER_TAXONOMY").val('');
		$("#PROVIDER_LANGUAGEXLANGUAGE_CODE").val('');
		$("#PROVIDERXSPECIAL_NEEDS_YESNO").val('');
		$("#LOCATIONXHANDICAP_SUPPORT").val('');
		$("#PROVIDERXLOCATIONXCONTACT_PHONE").val('');
	}
});