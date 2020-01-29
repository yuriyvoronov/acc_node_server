let express = require('express');
let bodyParser = require('body-parser');
let crypto = require('crypto');
const fs = require('fs');
let child_process = require('child_process');
let kill  = require('tree-kill');
let app = express();
let request = require('request');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let chokidar = require('chokidar');



chokidar.watch("./results", {ignoreInitial : true,}).on("all", (event, path) => {
    console.log(event, path);
    if (event == "add" && (path.search('entrylist') == -1))
        {
            let req = request.post("https://endurance.simcentral.ru/results/test", function (err, resp, body) {
              if (err) {
                console.log('Error!');
              } else {
                console.log('Response: ' + body);
              }
            });
            let form = req.form();
            let rawdata = fs.readFileSync('config.json');
            let config = JSON.parse(rawdata);
            form.append('event_id', config.event);
            console.log(path);
            form.append('results', fs.createReadStream('./' + path));
        }
});


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
    let token = crypto.randomBytes(32).toString('hex');
    return token;
}

app.listen(3012, function(){
    console.log("server started");
});