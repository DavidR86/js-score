const express = require('express');
const app = express();

app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.sendFile("index.html", {root: "./public"});
});

app.listen(3001, () => console.log('listening on port 3001!'));
