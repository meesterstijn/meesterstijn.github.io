// Calling showTime function at every second
setInterval(showTime, 1000);

// Defining showTime function
function showTime() {
    // Getting current time and date
    let time = new Date();
    let day = time.getDate();
    let monthIndex = time.getMonth();
    let year = time.getFullYear();
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();

    // Adding leading zeros to hours, minutes, and seconds if needed
    hour = hour < 10 ? "0" + hour : hour;
    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;

    // Array of month names
    let months = ["januari", "februari", "maart", "april", "mei", "juni", 
                  "juli", "augustus", "september", "oktober", "november", "december"];
    
    // Get the current month name
    let month = months[monthIndex];

    // Creating the current time string
    let currentTime = day + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;

    // Displaying the time in the element with id="clock"
    document.getElementById("clock").innerHTML = currentTime;
}

// Initial call to display the time immediately
showTime();