function main() {
// Define variables for AM and PM budgets
var AM_BUDGET = 55;
var PM_BUDGET = 49.3;

// Define time zone offset in minutes
var offset = -8 * 60; // GMT-8 in minutes

var datesToAdjust = [
  new Date(2023, 1, 16),
  new Date(2023, 1, 24),
  new Date(2023, 2, 8),
  new Date(2023, 2, 23),
  new Date(2023, 3, 7),
  new Date(2023, 3, 26),
  new Date(2023, 4, 10),
  new Date(2023, 4, 25),
  new Date(2023, 5, 7),
  new Date(2023, 5, 15),
  new Date(2023, 5, 29),
  new Date(2023, 6, 29)
];

var now = new Date();
var nowDate = new Date();
nowDate.setHours(0, 0, 0, 0);
var hours = now.getHours();

var found = false;
for (var i = 0; i < datesToAdjust.length; i++) {
  if (datesToAdjust[i].getTime() === nowDate.getTime()) {
    found = true;
    break;
  }
}

if (found) {
  // Get all active campaigns
var campaignIterator = AdsApp.campaigns()
  .withCondition("Status = 'ENABLED'")
  .withCondition("EndDate >= '" + now.toISOString().slice(0,10) + "'")
  .get();

  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();

    // Check the current time and set the budget accordingly
if (hours < 12) {
campaign.getBudget().setAmount(AM_BUDGET);


} else {
campaign.getBudget().setAmount(PM_BUDGET);

    }
  }
}

}
function compareDates(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}
