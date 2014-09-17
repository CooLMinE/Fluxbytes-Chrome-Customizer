// Default variable values
var limitHistory = true;
var historyLimitNumber = 4;
var downloadHistoryLimitNumber = 4;

var redirectNewTab = true;
var newTabRedirectUrl = "https://www.google.com/";

var moveTabsToTheEnd = true;
var enableViewImage = true;
var viewImageContextmenuID = "8753449";

// Events
chrome.history.onVisited.addListener(pageVisitedEvent);
chrome.downloads.onChanged.addListener(fileStateChangedEvent);
chrome.tabs.onCreated.addListener(tabCreatedEvent);
chrome.runtime.onStartup.addListener(updateValues);
chrome.runtime.onInstalled.addListener(updateValues);

function updateValues()
{
	chrome.storage.local.get(null,	function(options) {
		 limitHistory = options.limitHistory == null ? true : options.limitHistory;
		 historyLimitNumber = options.historyLimitNumber == null ? 4 : options.historyLimitNumber;
		 downloadHistoryLimitNumber = options.downloadHistoryLimitNumber == null ? 4 : options.downloadHistoryLimitNumber;
		 redirectNewTab = options.redirectNewTab == null ? true : options.redirectNewTab;
		 newTabRedirectUrl = options.newTabRedirectUrl == null ? "https://www.google.com/" : options.newTabRedirectUrl;
		 moveTabsToTheEnd = options.moveTabsToTheEnd == null ? true : options.moveTabsToTheEnd;
		 enableViewImage = options.enableViewImage == null ? true : options.enableViewImage;
		 enableViewImageMenu(enableViewImage);
	});
}

function enableViewImageMenu(enable)
{
	if (enable)
	{
		chrome.contextMenus.create({"id": viewImageContextmenuID,
			"title": "View Image",
            "contexts": ["image"],
            "onclick": viewImage});
	}
	else
	{
		chrome.contextMenus.remove(viewImageContextmenuID);
	}
}


function pageVisitedEvent(item)
{
	if(limitHistory)
	{
		trimVisitedPagesHistory(historyLimitNumber);
	}
}

function fileStateChangedEvent()
{
	// This will trim only the files with state 'completed'	
	if (limitHistory)
	{
		trimFilesHistory(downloadHistoryLimitNumber);
	}
}

function trimFilesHistory(n)
{
	chrome.downloads.search({ state : 'complete', orderBy: ["-endTime"] }, function(fileItems)
	{
		if (fileItems.length > n)
		{
			for (var i = n; i < fileItems.length; i++)
			{
				chrome.downloads.erase({ id: fileItems[i].id, state: 'complete', endTime: fileItems[i].endTime });
			}
		}
	});
}

function trimVisitedPagesHistory(n)
{
	chrome.history.search({ text: "" }, function(entries) {
		var sortedEntries = entries.sort(function(a,b) { return a.lastVisitTime < b.lastVisitTime });

		if (sortedEntries.length > n)
		{	
			for (var i = n; i < sortedEntries.length; i++)
			{
				chrome.history.deleteUrl( { url : sortedEntries[i].url });
			}
		}
	});
}

function tabCreatedEvent(tab)
{
	if (moveTabsToTheEnd)
	{
		chrome.tabs.move([tab.id], { index : -1});
	}

	if (redirectNewTab)
	{
		if (tab.url != null && tab.url == "chrome://newtab/")
		{
			chrome.tabs.update(tab.id, { url: newTabRedirectUrl });
		}	
	}
}

function viewImage(clickInfo, tab) {
	//chrome.tabs.update(tab.id, {"url": clickInfo.srcUrl});
	chrome.tabs.create({"url": clickInfo.srcUrl});
}

