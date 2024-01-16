function updateClock() {
    const now = new Date();

    // Get the current hours, minutes, and seconds
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    // Convert hours to 12-hour format
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    // Update the time string
    const timeString = `${hours}:${minutes}:${seconds} ${amOrPm}`;

    // Update the HTML elements
    document.querySelector('.hours').textContent = hours.toString().padStart(2, '0');
    document.querySelector('.minutes').textContent = minutes;
    document.querySelector('.seconds').textContent = seconds;
    document.querySelector('.am-pm').textContent = amOrPm;
}

setInterval(updateClock, 1000);