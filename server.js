var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
const fs = require('fs');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', function(req, res){
    res.send('hello api');
});

app.post('/files', function(req, res){
    let rawdata = fs.readFileSync('config.json');
    let config = JSON.parse(rawdata);
    if (config.token == req.body.token)
    {
        fs.writeFile('./storage/test.json', JSON.stringify(req.body.entrylist), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('file written successfully');
        });
        newToken = generateNewToken();
        console.log(newToken);
        config.token = newToken;
        config.event = req.body.event;
        config.length = req.body.length;
        fs.writeFileSync("config.json", JSON.stringify(config));
        res.jsonp({"token" : newToken});
    }
    else 
    {
        console.log("wrong token");
        res.send("wrong token");
    }
});
function generateNewToken()
{
    var token = crypto.randomBytes(32).toString('hex');
    return token;
}
app.listen(3012, function(){
    console.log("server started");
});