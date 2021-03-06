require("@babel/polyfill");

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const service = require('./utils/service');

// port 
const port = process.env.PORT || 3000;
const index = path.resolve(__dirname, '../', 'index.html');
// app
const app = express();

// extensions
app.use(express.static(path.join(__dirname)))
app.use(cors())
app.use(compression()); //Compress all routes
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// API

app.get('/', (req, res, next) => res.sendFile(index))
app.post('/add', service.add)
app.get('/search/:word', service.search)

// server
app.listen(port, function() {
    console.log('Server started on port: ', port);
})


