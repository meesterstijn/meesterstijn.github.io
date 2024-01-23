function displayDate() {
    // Create a new Date object
    var currentDate = new Date();
  
    // Get the current date, month, and year
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1; // Months are zero-based
    var year = currentDate.getFullYear();
  
    // Display the date on the webpage
    document.getElementById("currentDate").innerHTML = day + '/' + month + '/' + year;
  }
  
  // Call the displayDate function when the document is fully loaded
  document.addEventListener("DOMContentLoaded", function () {
    displayDate();
  });