//document.getElementById('infoTable').style.visibility = 'hidden';

//adds on click to main button to begin locating satellites
document.getElementById("locateButton").onclick = function search() {
    if (document.contains(document.getElementById('restartText'))) {
        document.getElementById('restartText').remove();
    }
    if ('geolocation' in navigator) {
        console.log('geolocation available');
        try {
            navigator.geolocation.getCurrentPosition(async position => {
                console.log(position);
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const alt = position.coords.altitude;

                document.getElementById('latitude').textContent = lat;
                document.getElementById('longitude').textContent = lon;


                //need to add altitude parameter, otherwise it won't work, might default to zero
                //const api_url = `https://www.n2yo.com/rest/v1/satellite/above/${lat}/${lon}/27/5/0&apiKey=${API_KEY}`;
                const data = { lat, lon, alt };
                const options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }
                const response = await fetch('/api', options);
                const json = await response.json();
                console.log(json);

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
                    clearInterval(intervalChecks);
                    var restartText = document.createElement("p")
                    restartText.textContent = "Click 'locate' to start searching again"
                    restartText.id = 'restartText';
                    document.getElementById('locateButton').after(restartText);
                    controller.abort();
                    console.log("Request aborted");
                }



            });
        } catch(error){
            console.error(error);
        }
    } else {
        console.log('geolocation unavailable');
    }
}

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