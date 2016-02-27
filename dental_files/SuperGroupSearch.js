/***********************************************************************************************************************
 * Overview: This re-usable AJAX component lets the user: a) Select a State b) asynchronously fetches associated
 * SuperGroups c) lets the user select a SuperGroup, d) passes JavaScript object of the selected State & SuperGroup to
 * the parent component.
 * 
 * Interface methods: 1) Parent's ready() function calls OnReadySuperGroupSearch() method. So, this child component is
 * expected to provide this method. 2) This component calls parentSuperGroupProcess() on the parent. So, parent is
 * expected to provide this method.
 * 
 * Note: This AJAX-component is meant for DentaQuest.
 * 
 * Author : Tim Paulson
 **********************************************************************************************************************/

var sgSearchCurrentSettings = {};

function sgInit(currentSettings)
{
    sgSearchCurrentSettings = currentSettings;
    
    $("#PB_GROUPXLOCATION").data("bean", new Bean({
        element : $("#PB_GROUPXLOCATION"),
        name : "SuperGroup State",
        type : "text",
        arrow : -1,
        message : "A valid state is mandatory"
    }));

    $("#PB_GROUPXPB_GROUP_ID").data("bean", new Bean({
        element : $("#PB_GROUPXPB_GROUP_ID"),
        name : "SuperGroup Name",
        type : "text",
        arrow : -1,
        message : "A valid name is mandatory"
    }));

    // Start off by asking the server for the list of active States. Then populate the States pulldown.
    findStates();
    updateAcceptingPatients();
    
	/*
     * Show error icon upon not selection of Service Category
     */
	$("#PB_GROUPXLOCATION").change(function()
	{
	    refreshError($(this));
	    var state = $("#PB_GROUPXLOCATION").val();
	    findSuperGroups(state);
	});
}

/**
 * Update the State and SuperGroup selectors based on the given Policy Benefit ID.
 */
function updateBasedOnPolicyBenefitId(member) {
    var filter = {
        pb_id : member.policyBenefitId
    };

    superGroupSearchService.findStateAndSuperGroup(filter, populateStateAndPbGroup);
}

/**
 * Allow the Parent page to acquire the current selections.
 */
function getCurrentSGSelections() {
    var selections = {
        state : $("#PB_GROUPXLOCATION").val(),
        pbGroupId : $("#PB_GROUPXPB_GROUP_ID").val(),
        acceptingPatientId : $("#PROV_ACCEPTING_PATIENTXACCEPTING_PATIENT").val()
    };

    return selections;
}

/**
 * The current selections need to be cleared.
 */
function sgClear() {
    var markup = '<option value="none" selected="true">&nbsp;</option>';
    
    $("#PB_GROUPXLOCATION").find("option:first").attr("selected", "selected");
    $('#PB_GROUPXPB_GROUP_ID').empty();
    $('#PB_GROUPXPB_GROUP_ID').append(markup);
    $("#PROV_ACCEPTING_PATIENTXACCEPTING_PATIENT").find("option:first").attr("selected", "selected");
    return false;
}

// *************************************************************
// Internal support functions
//
// The following functions are used to maintain the state of the component JSP.
// *************************************************************

/*
 * Execute a server-side search.
 */
function findStates()
{
    var filter = '';

    superGroupSearchService.findStates(filter, populateStates);

    return false;
}

/*
 * Populate SuperGroup information, presenting a list if there are several results.
 */
function populateStates(list)
{
    resetError($("#PB_GROUPXLOCATION"));
    $("#PB_GROUPXLOCATION").data("bean").invalidate = false;

    stateList = list;

    updateStates(stateList);
}

/*
 * Populate State names into the State list.
 */
function updateStates(stateList)
{
    var currentSettings = sgSearchCurrentSettings;

    var emptyMarkup = '<option value="none" selected="true">&nbsp;</option>';

    $("#PB_GROUPXLOCATION").empty();
    $("#PB_GROUPXLOCATION").append(emptyMarkup);

    // Re-populate the names of the States into the list
    var optionListStr = "";
    for (var i in stateList)
    {
        var state = stateList[i].location;
        var selectedFlg = (currentSettings != null) && (currentSettings.location == stateList[i].location);
        var selectedStr = (selectedFlg == true) ? " selected" : "";

        var optionStr = "<option value='" + state + "'" + selectedStr + ">" + state + "</option>";
        $("#PB_GROUPXLOCATION").append(optionStr);
    }
    
    if ((currentSettings == null) || (currentSettings.location == null))
    {
        // Clear the SuperGroup select list since no state has been selected yet
        $("#PB_GROUPXPB_GROUP_ID").empty();
        $("#PB_GROUPXPB_GROUP_ID").append(emptyMarkup);
    } else {
        findSuperGroups(currentSettings.location)
    }
}

/*
 * Execute a server-side search.
 */
function findSuperGroups(givenState)
{
    var filter = {
            state : givenState
        };

    superGroupSearchService.findSuperGroups(filter, populateSuperGroups);

    return false;
}

/*
 * Populate SuperGroup information, presenting a list if there are several results.
 */
function populateSuperGroups(list)
{
    resetError($("#PB_GROUPXPB_GROUP_ID"));
    $("#PB_GROUPXPB_GROUP_ID").data("bean").invalidate = false;

    groupList = list;
    
    updateSuperGroups(groupList);
}

/*
 * Populate SuperGroup names into the SuperGroup select.
 */
function updateSuperGroups(groupList)
{
    var currentSettings = sgSearchCurrentSettings;

    $("#PB_GROUPXPB_GROUP_ID").empty();
    if(groupList.length>1)
    {
 	    $("#PB_GROUPXPB_GROUP_ID").append("<option value=''> --Please Select--</option>");
    }
    
    // Re-populate the names of the States into the list
    for (var i in groupList)
    {
        var groupId = groupList[i].superGroupId;
        var groupName = groupList[i].name;
        var selectedFlg = (currentSettings != null) && (currentSettings.superGroupId == groupId);
        var selectedStr = "";
        if (selectedFlg == true)
        {
            selectedStr = " selected='true'";
        }

        var optionStr = "<option value='" + groupId + "'" + selectedStr + ">" + groupName + "</option>";
        $("#PB_GROUPXPB_GROUP_ID").append(optionStr);
    }
}

/*
 * If there are any current settings, then select the active Accepting Patients option.
 */
function updateAcceptingPatients()
{
    var currentSettings = sgSearchCurrentSettings;

    if (currentSettings != null && currentSettings.acceptingPatientId != null)
    {
        $("#PROV_ACCEPTING_PATIENTXACCEPTING_PATIENT").find("option[value='" + currentSettings.acceptingPatientId + "']").attr("selected", "selected");
    }
}

/*
 * Populate State&SuperGroup information. There should only be a single value to display in each select element.
 */
function populateStateAndPbGroup(list)
{
    resetError($("#PB_GROUPXLOCATION"));
    $("#PB_GROUPXLOCATION").data("bean").invalidate = false;

    stateAndPbGroupList = list;
    
    // First, populate the SuperGroup list with those associated with the given state
    findSuperGroups(list[0].location);

    updateStateAndPbGroup(stateAndPbGroupList[0]);
}

/*
 * Set the active selection in both the State and SuperGroup lists to the values contained in the given settings.
 */
function updateStateAndPbGroup(currentSettings)
{
    // First, select the state. This will populate the SuperGroup list with the associated SuperGroups.
    if (currentSettings.location != null)
    {
        $("#PB_GROUPXLOCATION").val(currentSettings.location).attr("selected", "selected");
    }
    // Now select the given Super Group
    if (currentSettings.superGroupId != null)
    {
    	findSuperGroups(currentSettings.location); // need to be sure you have the correct SGs for the given state
    	$("#PB_GROUPXPB_GROUP_ID").val(currentSettings.superGroupId).attr("selected", "selected");
    	sgSearchCurrentSettings = currentSettings;
    }

    // And select the given setting for the Accepting Patients pull-down
    if (currentSettings.acceptingPatientId != null)
    {
    	$("#L_PROV_ACCEPTING_PATIENTXCODE").val(currentSettings.acceptingPatientId).attr("selected", "selected");
    }
}

/*******************************************************************************************************************
 * ******** SHARE-ABLE CODE *********
 ******************************************************************************************************************/
/*
 * Clear the value and remove error icons from the given field.
 */
function clearField(field)
{
    field.val("");
    var parent = field.parent();
    parent.find(".serious_error").remove();
    parent.find(".warning_error").remove();
}

/*
 * Refresh the error state of this widget and re-validate.
 */
function refreshError(widget)
{
    resetError(widget);

    var bean = widget.data("bean"); // fetch field bean

    if (bean != null)
    {
        if (bean.isValid() == false)
        {
            var icon = bean.critical ? $(".serious_error:first").clone() : $(".warning_error:first").clone();
            icon.find("img").attr("title", bean.message);
            icon.removeClass("hidden");
            widget.parent().append(icon);
        }
    }
}

/*
 * Reset error status on an array of page elements.
 */
function resetErrors(elements)
{
    for ( var i = 0; i < elements.length; i++)
    {
        resetError($(elements[i]));
    }
}

/*
 * Reset the displayed error status.
 */
function resetError(widget)
{
    var parent = widget.parent();
    parent.find(".serious_error").remove();
    parent.find(".warning_error").remove();

    var bean = widget.data("bean"); // fetch field bean

    if (bean != null)
    {
        bean.valid = true;
    }
}

/*
 * Make a server call to format the text of the given date widget.
 */
function formatDate(widget)
{
    if (widget.data("bean").isValid())
    {
        toolboxService.formatDate(widget.val(), function(result)
        {
            widget.val(result);
        });
    }
}
