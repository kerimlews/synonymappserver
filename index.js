const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const service = require('./utils/service');

// port 
const port = 3000

// app
const app = express()


// extensions
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// API

app.post('/add', service.add)
app.get('/search/:word', service.search)

// server
app.listen(port, function() {
    console.log('Server started on port: ', port);
})


