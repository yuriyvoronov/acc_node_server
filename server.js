var express = require('express');
var bodyParser = require('body-parser');
const fs = require('fs');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
    res.send('hello api');
});

app.post('/files', function(req, res){
    console.log(req.body);
    
    fs.writeFile('./storage/test.json', JSON.stringify(req.body), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('file written successfully');
    });
    res.send("data posted");
});

app.listen(3012, function(){
    console.log("server started");
});