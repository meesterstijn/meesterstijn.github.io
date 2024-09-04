function displayDate() {
  // Create a new Date object
  var currentDate = new Date();

  // Get the current date, month, and year
  var day = currentDate.getDate();
  var monthIndex = currentDate.getMonth(); // Months are zero-based
  var year = currentDate.getFullYear();

  // Array of month names
  var months = ["januari", "februari", "maart", "april", "mei", "juni", 
                "juli", "augustus", "september", "oktober", "november", "december"];

  // Get the current month name
  var month = months[monthIndex];

  // Display the date on the webpage
  document.getElementById("currentDate").innerHTML = day + ' ' + month + ' ' + year;
}

// Call the displayDate function when the document is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  displayDate();
});