$(document).ready(function() {	
	$("#tabs").tabs();
	$('#submit').click(saveOptions);
	$('#enableHistoryLimiter').change(function() { 
		var isChecked = $(this).is(":checked");

		$('#historyLimitNumber').prop("disabled", !isChecked);
		$('#downloadLimitNumber').prop("disabled", !isChecked);
	});

	$('#enableNewTabRedirect').change(function() { 
		var isChecked = $(this).is(":checked");

		$('#newTabRedirectUrl').prop("disabled", !isChecked);
	});
	loadOptions();
});

function loadOptions()
{
	chrome.storage.local.get(null,	function(options) {
		$('#newTabRedirectUrl').val(options.newTabRedirectUrl == null ? "" : options.newTabRedirectUrl);
		$('#enableHistoryLimiter').prop("checked",options.limitHistory == null ? true : options.limitHistory).trigger("change");		
		$('#enableNewTabRedirect').prop("checked",options.redirectNewTab == null ? true : options.redirectNewTab).trigger("change");
		$('#historyLimitNumber').val(options.historyLimitNumber == null ? 4 : options.historyLimitNumber);
		$('#downloadLimitNumber').val(options.downloadHistoryLimitNumber == null ? 4 : options.downloadHistoryLimitNumber);
		$('#moveTabsToTheEnd').prop("checked",options.redirectNewTab == null ? true : options.redirectNewTab);
		$('#enableViewImage').prop("checked",options.enableViewImage == null ? true : options.enableViewImage);
	});
}

function saveOptions()
{
	var url = $('#newTabRedirectUrl').val();
	var useHistoryLimiter = $('#enableHistoryLimiter').is(":checked");
	var hLimit = $('#historyLimitNumber').val();
	var dLimit = $('#downloadLimitNumber').val();
	var redirectNewTab = $('#enableNewTabRedirect').is(":checked");
	var openNewTabsInTheEnd = $('#moveTabsToTheEnd').is(":checked");
	var enableViewImage = $('#enableViewImage').is(":checked");

	if (url.length > 0 && isValidNumber(hLimit) && isValidNumber(dLimit))
	{
		var storageObj = {};
		storageObj["newTabRedirectUrl"] = url;
		storageObj["limitHistory"] = useHistoryLimiter;
		storageObj["historyLimitNumber"] = hLimit;
		storageObj["downloadHistoryLimitNumber"] = dLimit;
		storageObj["redirectNewTab"] = redirectNewTab;
		storageObj["moveTabsToTheEnd"] = openNewTabsInTheEnd;
		storageObj["enableViewImage"] = enableViewImage;

		chrome.storage.local.set(storageObj, 
			function() {			
				chrome.extension.getBackgroundPage().updateValues();
				displaySuccess("Changes have been saved")
		});	
	}
	else
	{
		displayError("Input is not valid");
	}
}

function displayError(message)
{
	$('#messages').css("color","red")
	displayMessage(message);
}

function displaySuccess(message)
{	
	$('#messages').css("color","green")
	displayMessage(message);
}

function displayMessage(message)
{	
	$('#messages').text(message);
	$('#messages').fadeIn(1000);
	$('#messages').fadeOut(2000);
}

function isValidNumber(input)
{
	var value = $.trim(input);
	var isDigit = $.isNumeric(value);

	return isDigit && value >= 0;
}