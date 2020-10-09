//document.getElementById('infoTable').style.visibility = 'hidden';
//var ProgressBar = require('progressbar.js');

/**
 * cliet facing script, all code here directly implemented into client side,
 * user will be able to see all of this code
 */

//adds on click to main button to begin locating satellites
document.getElementById("locateButton").onclick = function search() {
    //checks if the restart search button is there, if so, remove it
    if (document.contains(document.getElementById('restartText'))) {
        document.getElementById('restartText').remove();
    }

    //checks if the gelocator is available on the current system
    if ('geolocation' in navigator) {
        console.log('geolocation available');
        try {
            let searching = true;
            navigator.geolocation.getCurrentPosition(async position => {
                console.log(position);
                //gets the current latitude, longitude and altitude of the device
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const alt = position.coords.altitude;

                //displays the lat and lon to the user
                document.getElementById('latitude').textContent = lat;
                document.getElementById('longitude').textContent = lon;

                //var loadBar = new ProgressBar.Line("#barContainer");

                //const api_url = `https://api.n2yo.com/rest/v1/satellite/above/${lat}/${lon}/27/5/0&apiKey=${API_KEY}`;
                const data = { lat, lon, alt };

                //fetch request parameters
                const options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }
                const response = await fetch('/api', options);

                //convert resonse to javascript object
                const json = await response.json();
                console.log(json);

                //creates abort controller to allow the user to cancel the api request
                const controller = new AbortController;
                const signal = controller.signal;

                //updates the data every 10 seconds
                async function checkSat() {

                    const api_url = `satellite/${lat},${lon},${alt}`;

                    try {
                        const satResponse = await fetch(api_url, {
                            signal: signal
                        });
                        const satjSon = await satResponse.json();
                        console.log(satjSon);


                        generateTable(satjSon);
                    } catch (error) {
                        if (error.name === 'AbortError') {
                            console.log('Fetch aborted');
                        }
                    }

                }

                checkSat()
                let intervalChecks = window.setInterval(checkSat, 10000);



                //stops the updating by removing interval function
                const stopButton = document.getElementById('stopButton');

                stopButton.onclick = function () {
                    if (searching) {
                        searching = false;
                        clearInterval(intervalChecks);
                        //document.getElementById('restartText').remove();
                        var restartText = document.createElement("p")
                        restartText.textContent = "Click 'locate' to start searching again"

                        restartText.id = 'restartText';
                        document.getElementById('locateButton').after(restartText);
                        controller.abort();
                        console.log("Request aborted");
                    }
                }



            });
        } catch (error) {
            console.error(error);
        }
    } else {
        console.log('geolocation unavailable');
    }
}

/**
 * Adds the data to the table and makes it visible
 * @param {json} satJson JSON data for satellites located
 */
function generateTable(satJson) {
    let table = document.getElementById('infoTable')
    let tableBody = table.getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    satJson.above.forEach(element => {
        let row = tableBody.insertRow();

        row.insertCell(0).textContent = element.satid;
        row.insertCell(1).textContent = element.satname;
        row.insertCell(2).textContent = element.launchDate;

    });

    table.style.visibility = 'visible';
}