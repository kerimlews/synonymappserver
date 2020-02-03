const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')
const cors = require('cors')

// port 
const port = 3000

// app
const app = express()
const client = redis.createClient()

// extensions
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// API

app.post('/add', function(req, res, next) {    
    const { word, synonym } = req.body
    let matrixWord = getMatrix(word);
    let matrixSynonym = getMatrix(synonym);

    function getMatrix(value) {
        if (exists(value)) { return get(value) }
        return [];
    }

    if (exists(word) && exists(synonym)) {
        // translate matrix 1 numbers to index number
        const wordIndexes = translateMatrixToIndexes(matrixWord);
        const synonymIndexes = translateMatrixToIndexes(matrixSynonym);
        
        // update matrix, set 1 instead of 0 on place founded by index
        matrixWord = updateMatrix(wordIndexes, matrixWord);
        matrixSynonym = updateMatrix(synonymIndexes, matrixSynonym);    
    } else {
        if (matrixWord.length > 0) {
            matrixWord.push(1);
            matrixSynonym = matrixWord;
        } else if (matrixSynonym.length > 0) {
            matrixSynonym.push(1);
            matrixSynonym = matrixWord;
        }
    }

    // save matrix
    set(word, matrixWord);
    set(synonym, matrixSynonym);    

    res.status(200).send('OK')
})

app.get('/search', function(req, res, next) {
    const { word } = req.body;
    const result = [];

    // get matrix and words
    const matrix = get(word);
    const words = client.keys();

    // get indexes of 1 numbers
    const indexes = translateMatrixToIndexes(matrix);

    // get words by index
    words.forEach((word, index) => {
        if (indexes.includes(index)) {
            result.push(word);
        }
    });

    // response
    res.status(200).send(result)
})

// server
app.listen(port, function() {
    console.log('Server started on port: ', port);
})

// utils

function updateMatrix(indexes, matrix) {
    matrix.forEach((num, index) => {
        if (indexes.includes(index)) {
            num = 1
        }
    });

    return matrix
}

function translateMatrixToIndexes(matrix) {
    const indexes = [];

    matrix.forEach((num, index) => {
        if (num === 1) {
            indexes.push(index)
        }
    });

    return indexes;
}
function get(value) {
    return client.hget(0, value);
}
function exists(value) {
    return client.hexists(0, value);
}
function set(key, value) {
    return client.hset(0, key, value.toString());
}
function keys(key) {
    return client.keys().toArray();
}
function length() {
    return client.hlen(0);
}

