var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
const fs = require('fs');
let child_process = require('child_process');
var kill  = require('tree-kill');
let app = express();
var request = require('request');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var chokidar = require('chokidar');

//chokidar.watch('results').on('all', (event, path) => {
//  console.log(event, path);
//});

chokidar.watch("./results", {ignoreInitial : true,}).on("all", (event, path) => {
    console.log(event, path);
    if (event == "add")
        {
            var req = request.post("https://endurance.simcentral.ru/results/add", function (err, resp, body) {
              if (err) {
                console.log('Error!');
              } else {
                console.log('URL: ' + body);
              }
            });
            var form = req.form();
            form.append('event_id', '40');
            console.log(path);
            form.append('results', fs.createReadStream('./' + path));
        }
});

//var watcher = chokidar.watch('results', {persistent: true});
//watcher
//  .on('all', function(path) {console.log('File', path, 'has been added');})

app.post('/files', function(req, res){
    let rawdata = fs.readFileSync('config.json');
    let config = JSON.parse(rawdata);
    let bat = null
	console.log(req.body);
	console.log(config.token);
    if (config.token == req.body.token)
    {
        fs.writeFile('../cfg/entrylist.json', JSON.stringify(req.body.entrylist), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('entry list written successfully');
        });
        fs.writeFile('../cfg/event.json', JSON.stringify(req.body.event), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('event written successfully');
        });
		fs.writeFile('../cfg/eventRules.json', JSON.stringify(req.body.eventRules), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('event rules written successfully');
        });
        newToken = generateNewToken();
        console.log(newToken);
        config.token = newToken;
        config.event = req.body.event;
        config.length = req.body.length;
        startServer(req.body.length);
        fs.writeFileSync("config.json", JSON.stringify(config));
        res.json({"token" : newToken});
    }
    else 
    {
        console.log("wrong token");
        res.send("wrong token");
    }
});
function startServer(time)
{
    console.log('server starting...');
    bat = child_process.spawn('../accServer.exe', [], {shell: true});
    console.log('server started');
    setTimeout(() => { console.log('server killing...'); kill(bat.pid);}, time);
}
function generateNewToken()
{
    var token = crypto.randomBytes(32).toString('hex');
    return token;
}

app.listen(3012, function(){
    console.log("server started");
});