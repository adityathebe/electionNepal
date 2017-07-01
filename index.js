let electionData = require("./Province.json");

let request = require('request')
let cheerio = require('cheerio')
let cors = require('cors')
let express = require('express')
let app = express()
app.use(cors())

let url_a = "http://election.ekantipur.com/?pradesh=1&panto=jhapa&location="
let url_b = "&lng=eng"

/* == Get the ID of given location from Province.json == */
function getLocationID(placeName) {
    for (var i = 0; i < electionData.length; i++) {
        for (var j = 0; j < electionData[i].districts.length; j++) {
            for (var k = 0; k < electionData[i].districts[j].Municipalities.length; k++) {
                var location = electionData[i].districts[j].Municipalities[k];
                if(placeName == location.english_name)
                    return location.id;
            }
        }
    }
    return 1000000;
}

/* == Get the ID of given location from Province.json == */
function checkLocation(placeID) {
    for (var i = 0; i < electionData.length; i++) {
        for (var j = 0; j < electionData[i].districts.length; j++) {
            for (var k = 0; k < electionData[i].districts[j].Municipalities.length; k++) {
                var location = electionData[i].districts[j].Municipalities[k];
                if(placeID == location.id)
                    return true;
            }
        }
    }
    return false;
}

app.get('/', (req,res) => {
    var reply = {
        "Message" : "No endpoint!",
    }
    res.send(reply)
})

/* === Search with Location ID === */
app.get('/id/:place', (req, res)=> {
    /*=== First check if location id is valid ===*/
    if(checkLocation(req.params.place)){
        let url = url_a + req.params.place + url_b;
        sendData(url, res);
    } else {
        var reply = {
            names : ["Invalid Location"],
            votes : []
        }
        res.send(reply)
    }
})

/* === Search with Location Name === */
app.get('/location/:place', (req, res)=> {
    var placeName = req.params.place.toLowerCase();
    var code = getLocationID(placeName);
    if(code == 1000000) {
        var reply = {
            names : ["Invalid Location"],
            votes : []
        }
        res.send(reply)
    } else {
        let url = url_a + code + url_b;
        sendData(url, res);
    }
})

/* === Take Url and Send Reply === */
function sendData(url, res) {
    request(url, gotData);
    function gotData(error, response, body) {
        if (error || response.statusCode !== 200) {
            throw new Error("Site DOWN!");
        }   

        let mayor = [];
        let party = [];

        /* ------ Cheerio -------- */
        let $ = cheerio.load(body);
        $("#winner-label").each(function(i, elem) {
            let temp = $(this).text()
            mayor[i] = temp.replace(' — ','')
        });

        $("#leader-label").each(function(i, elem) {
            let temp_vote = $(this).text()
            votes[i] = temp_vote.replace(' Vote','')
        });

        mayor.join(', ')
        votes.join(', ')

        var reply = {
            names : mayor,
            votes : votes
        }
        res.send(reply)
    }
}

console.log('Server Up and running!');
app.listen(process.env.PORT || 3000);