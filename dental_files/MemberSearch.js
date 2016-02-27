/****************************************************************************************
Overview:
	This re-usable AJAX component lets the user:
	  a) Enter member search criteria  
	  b) Asynchronously fetch member
	  c) Lets the user select a member based on the eligibility (if needed), 
	  d) Renders selected member data on the UI 
	  e) Passes JavaScript object of the selected member to the parent component. 
	  f) For AHB-18541 - return only a Policy Benefit of the selected/returned member
	  	 (isPolicyBenefitOnlyMode())
	  
Interface methods:
	1) Parent's ready() function calls OnReadyMemberSearch() method.
		So, this child component is expected to provide this method. 
	2) This component calls parentMemberProcess() on the parent. 
		So, parent is expected to provide this method.

Provider Security & working with other child component:
	If it is a provider user, this component requires JavaScript objects provided by ProviderAndLocation component.

Note:
	This AJAX-component is meant for DentaQuest.
    DentaQuest wants to use the  field labels that are used in ClaimEntry. 
    Hence we use CLAIM_SUBSCRIBER fields for UI rendering.

Author : Sathish Gurram
****************************************************************************************/
//Error Messages
var memberIdCodeMessage = "Invalid Member Id code";
var memberSrchDataEntered = "false";
var memberSelectionList =  null; // To fix the issue of more than one eiligble record in Member eligibility Search Screen AHB-18200
var searchServiceActive = false; // To avoid duplicate service call going on when fast tab out from member Id and first name

//savedMemberSearchCriteria object is used to initialize the member search 
//field values with the user already entered earlier. 

function populateMemberSearchFields(savedMemberSearchCriteria)
{
	if(savedMemberSearchCriteria != null)
	{
		if( savedMemberSearchCriteria.memberIdCode != 'undefined' && savedMemberSearchCriteria.memberIdCode != null && savedMemberSearchCriteria.memberIdCode.length > 0)
		{
			memberSrchDataEntered = "true";
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val(savedMemberSearchCriteria.memberIdCode);
		}
		
		if( savedMemberSearchCriteria.memberLastName != 'undefined' && savedMemberSearchCriteria.memberLastName != null && savedMemberSearchCriteria.memberLastName.length > 0)
		{
			memberSrchDataEntered = "true";
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val(savedMemberSearchCriteria.memberLastName);
		}
		
		if( savedMemberSearchCriteria.memberFirstName != 'undefined' &&  savedMemberSearchCriteria.memberFirstName != null && savedMemberSearchCriteria.memberFirstName.length > 0)
		{
			memberSrchDataEntered = "true";
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val(savedMemberSearchCriteria.memberFirstName);
		}
		
		if( savedMemberSearchCriteria.memberDob != 'undefined' && savedMemberSearchCriteria.memberDob != null )
		{
	        var date = toolkit.ticksToDateString(savedMemberSearchCriteria.memberDob);
	        $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val(date);
	        
	        if(date.length > 0)
	        {
	        	memberSrchDataEntered = "true";
	        }
		}
	}
	
	if (memberSrchDataEntered == "false")
	{
		$(".mbr_search_title").toggleClass("searchtitle_collapse");
		$(".mbr_srch_toggle_container").hide();
	}
} 
	
function clearMember()
{
	clearField($("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME"));
	clearField($("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME"));
	clearField($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB"));
	clearField($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"));
		
	$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean").invalidate = false;
	$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean").message = memberIdCodeMessage;
		 	
	enableMemberInputs();
		
	activeMember = null;
	$("#member_status").html("");	
	
	if(isMemberSearch2Mode())
	{
		$("#member_status2").hide();
		$("#MEMBER_LISTSXSERVICE_DATE").val(toolkit.getDateString(new Date()));
	}
	
	if(isMemberListDetailMode())
	{
		$("#MEMBER_LISTSXSERVICE_DATE").val(toolkit.getDateString(new Date()));
	}

	if(isAmbulanceMode())
	{
		clearField($("#MEMBERXGENDER_CODE"));
		if(authType == "AMB" || authType == "MHO")
		{
			clearProvider($("#referring_provider_search_panel").find("#clear_provider"));
		}
	}

}

/*
 * Called as part of member selection or to restore state after a bounce.  
*/
function enableMemberInputs()
{
	toolkit.enableElement($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB"));
	toolkit.enableElement($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"));
	toolkit.enableElement($("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME"));
	toolkit.enableElement($("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME"));
	 	
	//Search Member button
	if(isPolicyBenefitOnlyMode() || isAmbulanceMode())
	{
	 	toolkit.enableElement($("#search_member")) 
	}
	
	if(isAmbulanceMode())
	{
		toolkit.enableElement($("#MEMBERXGENDER_CODE"));
	}
}
	
/*
* Called as part of member selection or to restore state after a bounce.  
*/
function disableMemberInputs()
{
	toolkit.disableElement($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB"));
	toolkit.disableElement($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"));
	toolkit.disableElement($("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME"));
	toolkit.disableElement($("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME"));
	if(isAmbulanceMode)
	{
		toolkit.disableElement($("#MEMBERXGENDER_CODE"));
	}
	//Search Member button
	if(isPolicyBenefitOnlyMode() || isAmbulanceMode()) 
	{
		toolkit.disableElement($("#search_member"))
	}
}

/*
 * To Implement the Search Conditions  based on the Client/Base loaded and tthe type of User that has logged in
 */
function isProvider()
{
	var lastName = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val();
	var firstName = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val();
	var memberDob = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val();
	var memberNo = 	 $("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val();
	var genderCode = $("#MEMBERXGENDER_CODE").val();
	var memberDob = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val();
	
	if(!isBaseBuild())
	{
		if(isProviderUser())
		{
			if(memberNo.length > 0 || ( memberDob.length > 0 && firstName.length > 0 && lastName.length > 0))
			{
				return true;
			}
		}
		else
		{
			if(memberNo.length > 0 || memberDob.length > 0|| firstName.length > 0 || lastName.length > 0)
			{
				return true;
			}
		}
	}
	else
	{
		if(memberDob.length > 0 && (memberNo.length > 0 || (firstName.length > 0 && lastName.length > 0)))
		{
			return true;
		}
	}
	return false;
	
}

function isPolicyBenefitOnlyMode()
{
  	if( memberSearchContext.policyBenefitOnlyMode != 'undefined'  
		&& memberSearchContext.policyBenefitOnlyMode == true)
	{
		return true;
	}
	return false;
}

function isReferralAddMode()
{
	if( memberSearchContext.referralAddMode != 'undefined'  
		&& memberSearchContext.referralAddMode == true)
	{
		return true;
	}
	return false;
}

function isMemberListDetailMode()
{
	if( memberSearchContext.memberListDetailMode != 'undefined'  
		&& memberSearchContext.memberListDetailMode == true)
	{
		return true;
	}
	return false;
}

function isMemberListMode()
{
	if( memberSearchContext.memberListMode != 'undefined'  
		&& memberSearchContext.memberListMode == true)
	{
		return true;
	}
	return false;
}

function isMemberSearch2Mode()
{
	if( memberSearchContext.memberSearch2Mode != 'undefined'  
		&& memberSearchContext.memberSearch2Mode == true)
	{
		return true;
	}
	return false;
}
	
function isAmbulanceMode()
{
  	if( memberSearchContext.ambulanceMode != 'undefined'  
		&& memberSearchContext.ambulanceMode == true)
	{
			return true;
	}
	return false;
}

function isBaseBuild()
{
  	if( memberSearchContext.isBaseBuild != 'undefined'  
		&& memberSearchContext.isBaseBuild == true)
	{
			return true;
	}
	return false;
}

function getCurrentMemberEntries()
{
	var member = {};
    
	if(isPolicyBenefitOnlyMode()) 
	{
		member.memberIdCode= $("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val();
		member.memberLastName = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val();
		member.memberFirstName = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val();
		member.memberDob = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val();
	}
	return member;
}

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
	

//savedMemberSearchCriteria object is used to initialize the member search 
//field values with the user already entered earlier. 

function OnReadyMemberSearch()
{	
	var color = { lite: "#FBFBFB", dark: "#F2F2F2" }
	var activeMember =	null;
	
	if(isBaseBuild())
	{
		$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").data("bean", new Bean({element: $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB"), name: "Member Date of Birth", required: true, type: "date", arrow: -1, message: "A valid past date "}));
	}
	else 
	{
		$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").data("bean", new Bean({element: $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB"), name: "Member Date of Birth", required: false, type: "date", arrow: -1, message: "A valid past date is mandatory"}));
	}
	$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean", new Bean({element: $("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"), name: "Member Id", required: false, max: 20, message: memberIdCodeMessage}));
	$("#MEMBER_LISTSXSERVICE_DATE").data("bean", new Bean({element: $("#MEMBER_LISTSXSERVICE_DATE"), name: "Service Date",type: "date", required: true, message: "Enter a valid Service date"}));
	//For member search full view, do not show:
	//  a) personalization text 
	//  b) search button
	if(!isPolicyBenefitOnlyMode())
	{
		$("#mbrSrchPersonalization").hide();
		$("#member_eligibility_legend_title").html("Member Eligibility");
		$("#member_eligibility_legend").attr("class", "");
		if(!isAmbulanceMode())
		{
			$("#search_member").hide();
		}
	}
	//for member list
	if(isMemberListMode())
	{  
		$("#search_member").attr("id","add");
		$("#add").attr("value","Add");
		
		$("#add").show();
		
		$("#add").click(function(event)
		{
			$("#multiplePotentialMembers").html("");
				if($("#update").length <= 0)
				{
					$("#para").hide();
					var valid = true;
					$("#error_summary_container").show();
					var summary = $("#client_error_summary");
					summary.empty();
					var arr = new Array($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB"),$("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME"),$("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME"),$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"),$("#MEMBER_LISTSXSERVICE_DATE"));
				
					for(var field in arr)
					{
						if(arr[field] != null && arr[field].data != undefined)
						{
							var bean = arr[field].data("bean");
						
							if(bean)
							{
								if(bean.isValid() == false)
								{
									var prefix = bean.critical ? "<b>Error: </b>" : "<b>Warning: </b>";
									summary.append("<div><span class=\"error_message\">" + prefix + bean.name + ": " + bean.message + "</span></div>");
									valid = false; 
								}
							}
						}
					}
					if(valid)
					{	
						event.preventDefault();
						addMember();
					}
					return false;
		 		}
		});
    }
	
	/*
	 * Populate member information, presenting a list if there are several results. 
	 */
	function populateMember(list)
	{
		searchServiceActive = false;
		
		// Reset and update later in this function 
		$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean").invalidate = false;

		// Clear any current error flag
		resetError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"));

		//AHB-18029 Restrict Multiple Member results
		resetError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"));
		$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean").invalidate = false;

		memberSelectionList = list;
		
		//To check auth allowed flag before search 
		if(isReferralAddMode()) 
		{    
			$("#client_error_summary").html("");
			for(var i in list)
			{
				if(list[i].authAllowed == "N")
				{
			        clearMember();
			        // Added this condition to synchronize the calls made to validate the member if referral is allowed.
			        if($("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val() == "" && $("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val() == ""
			        	&& $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val() == "" && $("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val() == ""){
			        	alert("Referral Not Required for this Member");
			        	return false;
			        }
				}
			}
		}
      
		//We have only one row in the list
		if(list.length == 1)
		{
			var member = list[0];
			updateMember(member);	
		}
		//We have multiple rows in the list, so handle if there are multiple members.
		//We do not want multiple members - force the user to enter more search criteria
		else if(list.length > 1)
		{			
			var prevMemberid = 0;
			
			/*
			 * AHB-18200 For member eligibility Search
			 * If Member Search Results have all active records open window popup for selection
			 * AHB-18200 For member eligibility Search all are inactive then auto select the recored which is having most recent expiry date
			 * AHB-18200 For member eligibility Search all are inactive and having same expiry then open window popup for selection
			 */
			var newActiveList = new Array();
			var newInEligibleList = new Array();
			var allInEligibleHaveSameExpiry = true;
			var mostRecentExpiryInEligibleRecord = null;
			var multipleMember  = false;
			if(isMemberSearch2Mode() || isMemberListDetailMode()) 
 			{
				mostRecentExpiryInEligibleRecord = list[0];
				for(var i in list)
				{
					
					if (i == 0) // initialize
					{
						prevMemberid = list[i].memberId;
					}
					
					if (prevMemberid != list[i].memberId)
					{
						multipleMember = true;
						break;
					}
					
					if(list[i].memberStatus == "active")
					{
						newActiveList[newActiveList.length] = list[i];				
					}
					else if(list[i].memberStatus == "inactive")
					{
						newInEligibleList[newInEligibleList.length] = list[i];
						
						if((new Date(mostRecentExpiryInEligibleRecord.expirationDate) - new Date(list[i].expirationDate))<0)
						{
							mostRecentExpiryInEligibleRecord = list[i];
							allInEligibleHaveSameExpiry = false;
						}
						else if((new Date(mostRecentExpiryInEligibleRecord.expirationDate) - new Date(list[i].expirationDate))>0)
						{
							allInEligibleHaveSameExpiry = false;
						}							
					}
				}
				
				if(multipleMember)
				{
					newActiveList = new Array();
					newInEligibleList = new Array();
					allInEligibleHaveSameExpiry = false;
					mostRecentExpiryInEligibleRecord = null;
					multipleMember  = false;
				}
				else if(newActiveList.length == 1)
				{
					updateMember(newActiveList[0]);	
					return;
				}
				else if(newActiveList.length > 1 && newInEligibleList.length==0)
				{
					list = newActiveList;
				}
				else if(newActiveList.length == 0 && allInEligibleHaveSameExpiry )
				{
					list = newInEligibleList;
				}
				else if(newActiveList.length == 0 && !allInEligibleHaveSameExpiry )
				{
					updateMember(mostRecentExpiryInEligibleRecord);	
					return;
				}
 			}
 			
 			//Begin : AHB-16765 Restrict Multiple Member results
			//If list has multiple members, do not render a select-able list of members.
			//Render a user message to do a more refined search.
							

			for(var i in list)
			{
				var multiMember = list[i];

				if (i == 0) // initialize
				{
					prevMemberid = multiMember.memberId;
				}

				// Retrieve member Id
				if( isAmbulanceMode() || (selectedLocation != null && !isNaN(selectedLocation.providerId)) || isMemberListDetailMode() || isPolicyBenefitOnlyMode())
				{
					if (prevMemberid != multiMember.memberId)
					{
						// Force an error state
						$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean").invalidate = true;

						// Display the error mark-up
						$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean").message = $("#multipleMemberResultsMsg").val();	
						refreshError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"));
						alert($("#multipleMemberResultsMsg").val());
						if( isMemberListMode() || isMemberSearch2Mode() )
					  	{
	                  		$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").focus(); 
                        }
					 	if( isMemberListMode())
					 	{
					    	$("#multiplePotentialMembers").html("<font color='red'>Multiple potential members found. Please add more information and search again..</font>");
							$("#add").attr("disabled","disabled");
					 	}
						return;
					}
					//It is not a multi-member, we are working with the same member. So, no error.
					else 
					{
						$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean").invalidate = false;
						$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean").message = memberIdCodeMessage;
						refreshError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"));
					}
			 	}
			}
			//End : AHB-16765 Restrict Multiple Member results

			var body = $(".member_table_body");
			var template = body.find(".member_table_entry:first");

			$(".member_table_body").find(".member_table_entry").remove();
			
			for(var i in list)
			{			
				var member = list[i];

				var row = template.clone(true);

				row.css("background-color", i % 2 ? color.dark : color.lite);	
				
				row.find(".msr_product").html(member.planName);

				if(!isPolicyBenefitOnlyMode()) 
				{
					row.find(".msr_last").html(member.memberLastName);
					row.find(".msr_first").html(member.memberFirstName);
					row.find(".msr_key").html(member.memberIdCode);
					//row.find(".msr_product").html(member.planName);
					var fullAddress = 	member.memberAddress + "<br/>" + 
					(member.memberAddress2 != null ? member.memberAddress2 + "<br/>" : "") +
					member.memberCity + ", " + member.memberState + "&nbsp;" + member.memberZipCode;
					row.find(".msr_address").html(fullAddress);

					var date = toolkit.ticksToDateString(member.memberDob);

					row.find(".msr_dob").html(date);			
		 		}
				var button = row.find(":submit:first");
				button.attr("id", "msr_idx_" + i);

				body.append(row);
			}		
			
			/*
			 * AHB-18541 - Only the policy benefit id needs to be returned.
			 * Do not populate the member search fields with results.
			 */
			if(isPolicyBenefitOnlyMode()) 
			{
				$(".fullView").remove();	
			}
			
			var height = $("#member_eligibility_panel").height();
			var position = $("#member_eligibility_panel").offset();

			// Show search container, if they cancel by clicking the mask area, memSrchPem.clear will get focus
			showModalDialog($("#clear_member"), $("#member_search_container"), position.top + height + 8, position.left);
		}
		//We do not have any results/rows in the list. 
		//It means there in no member found with the user entered search criteria. 
		else
		{
			var last = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val();
			var first = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val();
			var memberNo = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val();

			if(memberNo.length > 0) // if bogus ID code
			{
				// Force an error state
				$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").data("bean").invalidate = true;

				// Display the error mark-up
				refreshError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"));
			}
			else if(first.length > 0 && last.length > 0) 
			{
				// We have a first and last, so an empty ID code is legitimate 
				resetError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE")); 
			}

			toolkit.disableElement($("#member_service_history"));
			
			if(isMemberSearch2Mode())
 			{	
				$("#member_status2").remove();
				$("#clear_member").after('<span id="member_status2"><font color="red">&nbsp;&nbsp;'+$("#eligibilityStatusNotFound").val()+'</font></span>');
				parentMemberProcess(list);
 			}
 			else
 			{
 				if(isAmbulanceMode())
 				{
 					$("#member_status").html($("#eligibilityStatusNotFound").val().toUpperCase());
 					$("#member_status").attr("class","notfound");
 				}
 				else
 				{
 					$("#member_status").html($("#eligibilityStatusNotFound").val());
 				}
 				// AHB 15577 (Member List Detail Screen): When updation of member is doing, if the member status is not found then it should not enable search feilds
 				if(isMemberListDetailMode()){
 					if($("#update").length>0){
 						$("#update").attr("disabled","disabled");
 						resetError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE"));
 					}else if($("#add").length>0){
 						$("#add").attr("disabled","disabled");
 						enableMemberInputs();
 					}
 				}else {
 					enableMemberInputs();
 				}	
 			}	
		}
	}

	/**************************
	 * Member Eligibility
	 **************************/
	
	/*
	 * Retrieve a list of eligible members based on DOB and member ID
	 * or a complete last name and a partial first name. 
	 */
	$("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").blur(function()
	 {
		findMembers();
	 });

	 /*
	  * Blur the Member No. code triggers a member search. 
	  */
	$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").blur(function()
	 {
	 	var memberNo = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val();
		if(memberNo.length > 0) 
		{
	 		findMembers();
	 		clearMember();//AHB-22820
	 	}
	 });
	
	// Format the member DOB according to server rules. 
	$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").change(function()
	{
		toolkit.checkDateFormat2($('#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB'));//Date field formated to MM/DD/YYYY format.
	});
	
	/*
	 * Execute a server-side search. 
	 */
	function findMembers()
	{
		var lastName = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val();
		var firstName = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val();
		var memberDob = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val();
		var memberNo = 	 $("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val();
		var genderCode = $("#MEMBERXGENDER_CODE").val();

		var memberDob = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val();
		var condition  = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/
		if(isBaseBuild())
		{
			if (!condition.test(memberDob)&& !isMemberSearch2Mode() && !isMemberListDetailMode() )
			{ 
				refreshError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB")); 
				return false;    
			} 
		}
		
		if(isProvider())
	 	{
	 		var filter = 
	 		{ 
			 	lastName:			lastName,
			 	firstName:			firstName,
			 	memberDob:			memberDob,
			 	memberNo:			memberNo,
			    genderCode:			genderCode
	 		}; 
	 		
	 		//Initialize serviceDate to today
	 		filter.serviceDate = toolkit.getCurrentDateString();
	 		
	 		if(isPolicyBenefitOnlyMode())
	 		{
	 			toolkit.disableElement($("#search_member"));
	 			filter.policyBenefitOnlyMode = "true";
	 		}

 			//If Provider (Basic Information) component is used in conjunction with this Member Search Component,
 			//then make sure that user provided/selected values for all  required fields.  
 			if(!isPolicyBenefitOnlyMode() && isProviderUser() && !isMemberSearch2Mode() && !isMemberListDetailMode() && !isAmbulanceMode())
 			{	
 				//Populate the filter values from parent component objects
				if(providerSvcDate != null && providerSvcDate.length > 0)
				{
					filter.serviceDate = providerSvcDate;
	 			}
	 		
 				if( selectedLocation != null && !isNaN(selectedLocation.providerId))
 				{
 					filter.serviceOfficeId = selectedLocation.providerId;
 				}
 			
 				if( selectedProvider != null && !isNaN(selectedProvider.providerId))
 				{
 					filter.treatingProviderId = selectedProvider.providerId;
 				}
 				
 				//Do we have enough provider information to execute the member search?
 				if (filter.serviceDate.length > 0 &&
 					(!isNaN(filter.serviceOfficeId) && filter.serviceOfficeId != 0) &&
 					(!isNaN(filter.treatingProviderId) && filter.treatingProviderId != 0))	
 				{
 					if(!searchServiceActive){
 						searchServiceActive = true;
 						memberSearchService.findMembers(filter, populateMember);
 					}
 				}
 			}
 			else if(isMemberSearch2Mode()) //AHB-18200 For member eligibility Search
 			{
 				
 				/* NPI Logic */
 				if(!validNpi){
 					alert($("#cannotDoMemberSearch").val());
 					return false;
 				}
 				
 				if(isProviderUser() && ($("#X12_PROVIDERXRENDERING").val()=="none" || $("#X12_PROVIDERXSERVICE_FACILITY").val()=="none")){
 					displayError();
 					return false;
 				}
 				
 				if(new Date(memberDob) > new Date( $("#MEMBER_LISTSXSERVICE_DATE").val()) || isNaN(new Date( memberDob))){
 					displayError("CLAIM_SUBSCRIBERXSUBSCRIBER_DOB"," The Date of Birth should be less than Service Date.");
 					return false;
 				}else {
 					$(".error_message").html(" ");
 				}
 				
 				if(totalSearchResultCount >250){
 					alert("Sorry!!! You can add only 250 members to one member list.")
 				}
 				//To validate service Date before search
 				var todayDate = toolkit.getCurrentDateString();
 		    	var ServiceDate = $("#MEMBER_LISTSXSERVICE_DATE").val();
 				var condition  = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/
 				if (!condition.test(ServiceDate))
 				{ 
 					refreshError($(this));
 					alert(" A valid Service date is required");
 					return false;    
 				} 
 				     
 				filter.serviceDate = $("#MEMBER_LISTSXSERVICE_DATE").val();
 				//Populate the filter values from parent component objects
 				if( selectedLocation != null && !isNaN(selectedLocation.providerId))
 				{
 					filter.serviceOfficeId = selectedLocation.providerId;
 				}
 			
 				if( selectedProvider != null && !isNaN(selectedProvider.providerId))
 				{
 					filter.treatingProviderId = selectedProvider.providerId;
 				}
 				
 				//Do we have enough provider information to execute the member search?
 				if (filter.serviceDate.length > 0)	
 				{
					if(!searchServiceActive){
						searchServiceActive = true;
						memberSearchService.findMembers2(filter, populateMember);
					}
 				}
 				else
 				{
 					displayError();
 				}
 				
 			}else if(isMemberListDetailMode()){ //AHB-18200 For member list
 				
 				if(isNaN(new Date( memberDob))){
 					refreshError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB")); 
 					alert(" A valid DOB is required");
 					return false;
 				}
 				else if(isMemberListMode())
				{		
					var serviceDateMessage = $("#serviceDateMessage").val();	
					if(new Date(memberDob) > new Date( $("#MEMBER_LISTSXSERVICE_DATE").val()))
					{					
						alert(serviceDateMessage);	
						$("#add").attr("disabled","disabled");
						return false;	
					}
				}
 				
 				filter.serviceDate = $("#MEMBER_LISTSXSERVICE_DATE").val();
 				/*
 				 * If service date is empty for is not in valid format the search should not happen
 				 */
 				if (filter.serviceDate.length == 0 || !$("#MEMBER_LISTSXSERVICE_DATE").data("bean").isValid())
				{
 					refreshError($("#MEMBER_LISTSXSERVICE_DATE")); 
 					return false;
 				}
 		        //Populate the filter values from parent component objects
                filter.serviceOfficeId = $("#location").val();
				filter.treatingProviderId = $("#provider").val();
				
				//Do we have enough provider information to execute the member search?
				if (filter.serviceDate.length > 0 &&
					(!isNaN(filter.serviceOfficeId) && filter.serviceOfficeId != 0) &&
					(!isNaN(filter.treatingProviderId) && filter.treatingProviderId != 0))	
				{
					if(!searchServiceActive){
						searchServiceActive = true;
						memberSearchService.findMembers2(filter, populateMember);
					}
				}
 			}else if(isReferralAddMode()){
 				//Populate the filter values from parent component objects
 				if(providerSvcDate != null && providerSvcDate.length > 0)
 				{
	 				filter.serviceDate = providerSvcDate;
	 			}
	 		
 				if( selectedLocation != null && !isNaN(selectedLocation.providerId))
 				{
					filter.serviceOfficeId = selectedLocation.providerId;
 				}
 			
 				if( selectedProvider != null && !isNaN(selectedProvider.providerId))
 				{
 					filter.treatingProviderId = selectedProvider.providerId;
 				}
 				
 				//Do we have enough provider information to execute the member search?
 				if (filter.serviceDate.length > 0 &&
 					(!isNaN(filter.serviceOfficeId) && filter.serviceOfficeId != 0) &&
 					(!isNaN(filter.treatingProviderId) && filter.treatingProviderId != 0))	
 				{
 					if(!searchServiceActive){
 						searchServiceActive = true;
						memberSearchService.findMembers(filter, populateMember);
 					}
 				}
 			}
 			else if(isAmbulanceMode()){
 				//Populate the filter values from parent component objects
 				if(genderCode != null && genderCode.length > 0)
 				{
	 				filter.genderCode = genderCode;
	 			}
 				if(!searchServiceActive)
 				{
					searchServiceActive = true;
					memberSearchService.findMembers(filter, populateMember);
				}
 			}
 			else
 			{
 	 			// Member Search Component is working in stand alone mode.
 	 			// It is NOT used in conjunction with Provider (Basic Information) component.
 				if(!searchServiceActive){
 					searchServiceActive = true;
 					memberSearchService.findMembers(filter, populateMember);
 				}
 			}
	 	}
		
	 	else
	 	{
	 		if(isPolicyBenefitOnlyMode()){
	 			alert($("#searchCriteriaMsg").val());
	 		}
	 	}
	 	
	 	if(isPolicyBenefitOnlyMode())
	 	{
	 		toolkit.enableElement($("#search_member"));
	 	}
		return false;
	}
	
	if(!isReferralAddMode()){
	//DOB date format validation (MM/DD/YYYY)
	$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").change(function()
	{
		toolboxService.formatDate($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val(), function(result)
        {
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val(result);
			var memberDob = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val();
	        var condition  = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/

	        if (!condition.test(memberDob))
	        { 
	        	refreshError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB")); 
	            alert(" A valid DOB is required");
	            return false;    
			} 
        });
		
	 });
}
else
{
	$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").change(function()
			{
				toolboxService.formatDate($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val(), function(result)
		        {
					$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val(result);
					var memberDob = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val();
			        var condition  = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/

			        if (!condition.test(memberDob))
			        { 
						refreshError($("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB")); 
						return false;    
					} 
				});
				
			 });
}
	
	/**************************
	 * Member Selection
	 **************************/

	$(".member_search_select").live("click", onSelectMember); // dynamically apply event handler
	
	/*
	 * Search member  
	 */
	$("#search_member").click(function(event) 
	{
		findMembers();
		event.preventDefault();
	});
	
	/*
	 * Clear member information.  
	 */
	$("#clear_member").click(function(event) 
	{
		clearMember();
		event.preventDefault();
		$("#referralNotAllowed").html("");
		if(isReferralAddMode()){
			$("#memberId").attr("value","");
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").focus();
		}else if(isMemberListMode()){
			$("#add").prop("disabled",""); //AHB-25538: attr does not work when enabling a disabled element using empty string,hence changing to prop.
			$("#multiplePotentialMembers").html("");
			$("#multiplePotentialMembers").html("");
			$("#MEMBER_LISTSXSERVICE_DATE").focus(); 
			if($("#update").length>0){
				$("#update").prop("disabled",""); //AHB-25538: attr does not work when enabling a disabled element using empty string,hence changing to prop.
				$("#update").attr("value","Add");
				$("#update").attr("id","add");
				/*
				 * setting the service date to current date and formatting the same
				 */
				$("#MEMBER_LISTSXSERVICE_DATE").attr("value",toolkit.getCurrentDateString());
				formatDate($("#MEMBER_LISTSXSERVICE_DATE"));
				$("#member_eligibility_legend_title").html("Add a Member");
			}
			resetError($("#MEMBER_LISTSXSERVICE_DATE"));
		}else if(isMemberSearch2Mode())
		{
			$("#MEMBER_LISTSXSERVICE_DATE").focus();
		}
		else if(isAmbulanceMode())
		{
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").focus();
		}
		// for all other usages, default to date of birth
		else
		{
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").focus(); 
		}
		
		//AHB-25749: To clear and hide the servicing provider section
		if(isReferralAddMode()) 
		{
			providerPanel = $("#servicing_provider_search_panel")
			clearField(providerPanel.find("#X12_PROVIDERXLAST_OR_ORG_NAME"));
			clearField(providerPanel.find("#X12_PROVIDERXFIRST_NAME"));
			clearField(providerPanel.find("#X12_PROVIDERXID_CODE"));

			toolkit.enableElement(providerPanel.find("#X12_PROVIDERXLAST_OR_ORG_NAME"));
			toolkit.enableElement(providerPanel.find("#X12_PROVIDERXFIRST_NAME"));
			toolkit.enableElement(providerPanel.find("#X12_PROVIDERXID_CODE"));
			toolkit.enableElement(providerPanel.find("#search_provider"));
			providerPanel.find("#providerId").val("");
			providerPanel.find("#locationId").val("");
			providerPanel.find("#providerSpeciality").val("");
			
			providerPanel.find("#provider_status").html("");
			providerPanel.find(".provider_error").html("");
			providerPanel.find("#providerId").val("");
			providerPanel.find("#networkId").val("");
			providerPanel.find("#locationId").val("");
			providerPanel.find("#providerSpeciality").val("");
			providerPanel.find("#X12_PROVIDERXFULL_ADDRESS").html("");
			providerPanel.find("#addressInfo").hide();
			$("#ReferralTypeCode").show();
		   	$("#returnMessage").show();
		   	$("#ProviderSpecialityCode").show();
		   	$("#space1").show();
		   	$("#space2").show();
		   	providerPanel.hide();
		}
	});
	
	/*
	 * Fetch the chosen member data and set focus to the next logical field. 
	 */
	function onSelectMember(event)
	{
		var i = toolkit.parsePrimaryIndex(this.id);
		var member = memberSelectionList[i];
		updateMember(member);
		hideModalDialog();
		
		return false;
	}
	
	/*
	 * Update member fields. 
	 */
	function updateMember(member)
	{
		activeMember = member;
		//alert("her"+isReferralAddMode());
		if(isReferralAddMode()) 
		{
			$("#memberId").attr("value",member.memberId);
			$("#memberNo").attr("value",member.memberIdCode);
			$("#eligibilityId").attr("value", member.eligibilityId);
			$("#eligibilityBenefitId").attr("value", member.eligibilityBenefitId);
			//alert(member.memberId+" "+member.memberIdCode);
		}
		
		if(isPolicyBenefitOnlyMode()) 
		{
			member.memberIdCode= $("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val();
			member.memberLastName = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val();
			member.memberFirstName = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val();
			member.memberDob = $("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val();
			
			$("#member_status").html("");		
		}else if(isMemberSearch2Mode()){ //AHB-18200 For member eligibility Search
			var exits = false;
				
			for(var i=0;i<activeMemberList.length;i++){
				if(activeMemberList[i].eligibilityId==member.eligibilityId && (new Date(activeMemberList[i].serviceDate)-new Date($("#MEMBER_LISTSXSERVICE_DATE").val()))==0){
					exits = true;
					enableBgColor(i+1,"active");
					$("#clear_member").focus();
					alert("This member ("+member.memberIdCode+") already exists in Active List");
					return false;
				}
			}
			
			for(var i=0;i<inEligibleMemberList.length;i++){
				if(inEligibleMemberList[i].eligibilityId==member.eligibilityId && (new Date(inEligibleMemberList[i].serviceDate)-new Date($("#MEMBER_LISTSXSERVICE_DATE").val()))==0){
					exits = true;
					enableBgColor(i+1,"ineligible");
					alert("This member ("+member.memberIdCode+") already exists in Ineligible List");
					$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").focus();
					return false;
				}
			}
		
			if(!exits){
			
				$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val(member.memberIdCode);
				$("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val(member.memberLastName);
				$("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val(member.memberFirstName);	
				
				$("#member_status2").remove();
				//Member Status
				if(member.memberStatus == "active") 
				{
					$("#clear_member").before('<span id="member_status2"><font color="green">&nbsp;&nbsp;'+$("#eligibilityStatusActive").val()+'</font></span>');
				}
				else if(member.memberStatus == "inactive")
				{
					$("#clear_member").before('<span id="member_status2"><font color="blue">&nbsp;&nbsp;'+$("#eligibilityStatusInEligibile").val()+'</font></span>');	 
				}
			}
		}
		if(isAmbulanceMode())
		{
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val(member.memberIdCode);
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val(member.memberLastName);
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val(member.memberFirstName);
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val(member.memberDob);
			$("#MEMBERXGENDER_CODE").find("option[value='" + member.genderCode + "']").attr("selected", "selected");

	    	//Member Status
			if(member.memberStatus == "active") 
			{
				$("#member_status").html($("#eligibilityStatusActive").val().toUpperCase());
				$("#member_status").attr("class","active");
			}
			else if(member.memberStatus == "inactive")
			{
				$("#member_status").html($("#eligibilityStatusInEligibile").val().toUpperCase());
				$("#member_status").attr("class","inactive");
			}
			
		}
		else
		{
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_ID_CODE").val(member.memberIdCode);
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_LAST_NAME").val(member.memberLastName);
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_FIRST_NAME").val(member.memberFirstName);	
			$("#CLAIM_SUBSCRIBERXSUBSCRIBER_DOB").val(member.memberDob);
			
			if(isMemberListDetailMode()){
				$("#add").prop("disabled",""); //AHB-25538: attr does not work when enabling a disabled element using empty string,hence changing to prop.
				$("#update").prop("disabled",""); //AHB-25538: attr does not work when enabling a disabled element using empty string,hence changing to prop. 
			}
	    	//Member Status
			if(member.memberStatus == "active") 
			{
				$("#member_status").html($("#eligibilityStatusActive").val());	
			}
			else if(member.memberStatus == "inactive")
			{
				$("#member_status").html($("#eligibilityStatusInEligibile").val());
			}
		}
		
		disableMemberInputs();
		
		parentMemberProcess(member);
	}
	
	
	
	/**********************************************************************
	 			********* SHARE-ABLE CODE ********* 
	 ***********************************************************************/
	
	/*
	 * Refresh the error state of this widget and re-validate. 
	 */
	function refreshError(widget)
	{
		resetError(widget);

		var bean = widget.data("bean"); // fetch field bean

		if(bean != null)
		{
			if(bean.isValid() == false)
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
		for(var i = 0; i < elements.length; i++)
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
		
		if(bean != null)
		{
			bean.valid = true;
		}
	}
	
	/*
	 * Displays the content block in a modal dialog. 
	 */
	function showModalDialog(button, content, top, left) 
	{  
		var opacity = 0.20;  
		
		$("#modal_mask").css("width", $(document).width());
		$("#modal_mask").css("height", $(document).height());  

        /* When the mask area is clicked, dismiss the dialog and
         * transfer focus back to the triggering button. This is
         * effectively "cancel". */  
		$("#modal_mask").click(function()
    	{
    		hideModalDialog();
    		button.focus(); 
    	});

		$("#modal_mask").show();      
		$("#modal_mask").fadeTo("fast", opacity);    

        content.show(); 

        $("#modal_dialog_content").empty(); 
        $("#modal_dialog_content").append(content);
         
        $("#modal_dialog_container").css("top",  top);  
        $("#modal_dialog_container").css("left", left);
        $("#modal_dialog_container").show();

        // Get inputs, if any
       	var inputs = content.find("input");
       	
       	if(inputs.length > 0) // if the dialog has inputs   
       	{
       		// Set focus to first input
       		var first = content.find("input:first");
       		first.focus();
       		
       		if(inputs.length > 1) // more than one input, we can rotate focus
       		{
       			// Get the last input
       			var last = content.find("input:last");
       			
       			// Tab off the last input rotates focus back to the first
       			last.blur(function(){first.focus();});
       		}
       	}
	}  

	/*
	 * Hide the modal dialog. 
	 */
	function hideModalDialog()
	{
		$("#modal_mask").hide();
		$("#modal_dialog_container").hide();
		return false;
	}
	
	/*
	 * Make a server call to format the text of the given date widget. 
	 */
	function formatDate(widget)
	{
        if(widget.data("bean").isValid())
        {
            toolboxService.formatDate(widget.val(), function(result)
            {
                widget.val(result);
            });
        }
    }
}