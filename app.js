const express = require('express');
const { response } = require('express');
const fetch = require('node-fetch')
require('dotenv').config();

console.log(process.env);

const Datastore = require('nedb')
const app = express();

app.listen(3000, () => console.log('listening at port 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }))

//creates the database object and loads it
const database = new Datastore('database.db');
database.loadDatabase();


//specify address + callback for post
app.post('/api', (request, response) => {
    console.log(request.body);
    const data = request.body
    const timeStamp = Date.now();
    data.timestamp = timeStamp;

    //inserts data ti database 
    database.insert(data);
    //console.log(database);

    response.json({
        status: 'success',
        timestamp: timeStamp,
        latitude: data.lat,
        longitude: data.lon,
        altitude: data.alt
    });
})

app.get('/satellite/:latlonalt', async (request, response) => {
    const latlonalt = request.params.latlonalt.split(',');
    const lat = latlonalt[0];
    const lon = latlonalt[1];
    const alt = latlonalt[2]

    const API_KEY = process.env.API_KEY;
    //need to add altitude parameter, otherwise it won't work, might default to zero
    let api_url = ``;
    if (latlonalt[2] === null) {
        api_url = `https://www.n2yo.com/rest/v1/satellite/above/${lat}/${lon}/0/5/0&apiKey=${API_KEY}`;
    } else {
        api_url = `https://www.n2yo.com/rest/v1/satellite/above/${lat}/${lon}/${alt}/5/0&apiKey=${API_KEY}`;
    }
    

    const satResponse = await fetch(api_url);
    const satjSon = await satResponse.json();
    //console.log(satjSon);
    response.json(satjSon);
})
