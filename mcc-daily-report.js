//////////////////////////////////////////////////////////
//  Script: MCC Daily Client Repot                      //
//  Author: David Ogletree www.wmetraining.com           //
//////////////////////////////////////////////////////////
function main() {
	
//Set email subject
  var subjectTo = "";
//Set who gets email if more than one seperate by commas
  var emailTo = "";
//Enter label name for script to report on
  var labelName = '';
  var accountSelector = MccApp.accounts()
      .withLimit(100)
//Enger Manager Account Customer ID  
      .withCondition("ManagerCustomerId = '1231231234'")    
      .withCondition('LabelNames CONTAINS "' + labelName + '"')


  accountSelector.executeInParallel("processClientAccount", "afterProcessAllClientAccounts");
  
}

function processClientAccount() {
  var clientAccount = AdWordsApp.currentAccount();
  // Process your client account here.
  var clientName = clientAccount.getName();
  var campaignSelector = AdWordsApp.campaigns();
  var campaignIterator = campaignSelector.get();
  var dailyBudget = 0;
  var campaignInfo = '';
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
	
    
    if(campaign.getName().split(",").length == 3.0){
	var budget = campaign.getBudget();
	var dailyBudget = budget.getAmount();
	campaignInfo = campaign.getName().split(",");
  	} 
  }//end while  

	var newName = campaignInfo[0];
    var newDays = campaignInfo[1];
    var newBudget = 'New Budget: ' + campaignInfo[2];
  var thisMonth = clientAccount.getStatsFor(getDateRange().thisMonth).getCost();
	if(thisMonth > 20){
  var lastWeek = clientAccount.getStatsFor("LAST_7_DAYS").getCost();
  var daysSoFar = getDays().daysSoFar;
  var totalDays = getDays().totalDays;
  var daysLeft = beforeAfter(newDays).daysLeft;
  var daysSoFar = thisMonth/beforeAfter(newDays).daysSoFar;
  var mPace = (daysSoFar * daysLeft) + thisMonth;      
//  var mPace = (thisMonth/beforeAfter(newDays).daysLeft) * (beforeAfter(newDays).daysLeft + beforeAfter(newDays).daysSoFar);
  var wPace = ((lastWeek/newDays.length) * (beforeAfter(newDays).daysLeft)) + thisMonth;  
  var proposedBudget = ((campaignInfo[2].substring(1) - thisMonth) / (beforeAfter(newDays).daysLeft));
  var proposedBudget = 'Proposed Daily Budget: $' + proposedBudget.toFixed(2);
  var line1 = '   This Month $' + thisMonth.toFixed(2) + ' -> $' + mPace.toFixed(2);
  var yesterday = '   Yesterday = $' + clientAccount.getStatsFor("YESTERDAY").getCost();

  
  var line2 = '   Last 7 Days $' + lastWeek.toFixed(2) + ' -> $' + wPace.toFixed(2);
  var emailText = "";

  var newLine = '\n<br>';
  var campaignBudget = 'Campaign budget = $' + dailyBudget;

  emailText = newName + " " + newDays + newLine + newBudget + newLine + line1 + newLine + line2 + newLine + yesterday + newLine + campaignBudget + newLine + proposedBudget + newLine + newLine;
  //Determine if Good or Bad
    var companybudget = campaignInfo[2].substring(1);
    var paceformonth = mPace.toFixed(2) - 20;
    var answer = companybudget - paceformonth;

    if(answer < 0){
      emailText = "[B]" + emailText
    } else if((answer - 20) > 0){
      emailText = "[B]" + emailText
	} else {
      emailText = "[G]" + emailText
    }
    
  // optionally, return a result, as a text.
  return emailText;
   } else {
   emailText = "[B]" + clientName + "<br>\n" + 'no Traffic' + "<br>\n<br>\n";

  return emailText;
   }
}

function afterProcessAllClientAccounts(results) {
  var emailText = "";
  for (var i = 0; i < results.length; i++) {
    var result = results[i].getReturnValue();
    // Process the result further
    

   if(result.substring(0,3) == "[B]"){
        emailText = emailText + result;      
      } else {
        emailText = emailText;
      }

    
    
  }

  
  MailApp.sendEmail({

                    to: emailTo,
                    subject: subjectTo,
                    htmlBody: emailText,
                    name: "Google Ads"
                    });   
  
Logger.log(emailText.replace(/<(?:.|\n)*?>/gm, ''));
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getDays() {
  var d = new Date(Utilities.formatDate(new Date(), AdWordsApp.currentAccount().getTimeZone(), "MMM dd,yyyy HH:mm:ss"));
  var totalDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  // daysSoFar is -1 because "today" hasn't happened yet
  var daysSoFar = d.getDate() - 1;
  var daysLeft = totalDays - daysSoFar;
  var fullYear = d.getFullYear();
  var theMonth = d.getMonth()+1;
  var day = d.getDay();
  return {daysSoFar:daysSoFar,totalDays:totalDays,theMonth:theMonth,daysLeft:daysLeft,day:day};
}
function getDateRange() {
    var d = new Date(Utilities.formatDate(new Date(), AdWordsApp.currentAccount().getTimeZone(), "MMM dd,yyyy HH:mm:ss"));
    var totalDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
    var now = new Date();
    //var totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();  
    var firstDay = new Date(now.getFullYear(), now.getMonth(), 1); // return first day of the month
    var yesterday = new Date(now.getTime() - MILLIS_PER_DAY);
    var timeZone = AdWordsApp.currentAccount().getTimeZone();
    var thisMonth = Utilities.formatDate(firstDay, timeZone, 'yyyyMMdd') + ', ' + Utilities.formatDate(yesterday, timeZone, 'yyyyMMdd');
    var lastWeekend = "";
    var workDays = 0;
    var i = 0;

  for(var i=0; i<totalDays; i++) {
    var loopDay = new Date(firstDay.getTime() + ((i+1) * 86400000))
    if (loopDay.getDay() != 0 && loopDay.getDay() != 6) {
      workDays++;
    } else if(i < totalDays - yesterday.getDate()){
      lastWeekend = Utilities.formatDate(loopDay, timeZone, 'yyyyMMdd') + ', ' + Utilities.formatDate(loopDay, timeZone, 'yyyyMMdd')
    }

}
    
  return {thisMonth:thisMonth,lastWeekend:lastWeekend,workDays:workDays};

} 

function beforeAfter(newDays){	
    var daysSoFar = 0;
	var daysLeft = 0;
    var now = new Date();
    var d = new Date(Utilities.formatDate(new Date(), AdWordsApp.currentAccount().getTimeZone(), "MMM dd,yyyy HH:mm:ss"));
    var yesterday = d.getDate() - 1;
    var today = d.getDate();
    var totalDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    var totalDaysLeft = totalDays - (yesterday);
    var firstDay = new Date(now.getFullYear(), now.getMonth(), 1); // return first day of the month
    var currentDay = new Date(now.getFullYear(), now.getMonth(), today); 

    for(var i=0; i<yesterday; i++) {
    var loopDay = new Date(firstDay.getTime() + ((i) * 86400000))
		if(newDays.search(loopDay.getDay().toFixed(0)) != -1){
			daysSoFar++;
		}
        if(loopDay.getDay().toFixed(0) == "0"){
        	if(newDays.search(7) != -1){
            daysSoFar++;
            }
        }
	}
    for(var i=0; i<totalDaysLeft; i++) {
    var loopDay = new Date(currentDay.getTime() + ((i) * 86400000))
		if(newDays.search(loopDay.getDay().toFixed(0)) != -1){
			daysLeft++;
		}
		if(loopDay.getDay().toFixed(0) == "0"){
        	if(newDays.search(7) != -1){
            daysLeft++;
            }
        }

	}
  return {daysLeft:daysLeft,daysSoFar:daysSoFar};
}


