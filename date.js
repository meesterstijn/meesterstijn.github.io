function displayDate() {
  // Create a new Date object
  var currentDate = new Date();

  // Get the current day, date, month, and year
  var dayOfWeekIndex = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  var day = currentDate.getDate();
  var monthIndex = currentDate.getMonth(); // Months are zero-based
  var year = currentDate.getFullYear();

  // Array of day names and month names
  var daysOfWeek = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  var months = ["januari", "februari", "maart", "april", "mei", "juni", 
                "juli", "augustus", "september", "oktober", "november", "december"];

  // Get the current day name and month name
  var dayOfWeek = daysOfWeek[dayOfWeekIndex];
  var month = months[monthIndex];

  // Display the full date with the day of the week on the webpage
  document.getElementById("currentDate").innerHTML = dayOfWeek + '<br>' + day + ' ' + month + ' ' + year;
}

// Call the displayDate function when the document is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  displayDate();
});
