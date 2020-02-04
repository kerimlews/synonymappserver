
const query = require('./query');

const add = async (req, res, next) => {
    const { word, synonym } = req.body
    const wordExists = await query.exists(word) === 1;
    const synonymExists = await query.exists(synonym) === 1;
    const keys = await query.keys();

    let matrixWord = wordExists ? await query.get(word) : [];
    let matrixSynonym = synonymExists ? await query.get(synonym) : [];

    let keysToChange = [];
    let otherKeys = [];
    let updateValues = [];
    let matrix = []; // applay on keys
    let newKey = null;

    if (wordExists && synonymExists) {

        const synonymIndexes = translateMatrixToIndexes(matrixSynonym);
        const updateMatrix = (num, index) => synonymIndexes.includes(index) ? 1 : num
        matrix = matrixWord.map(updateMatrix);
        keysToChange = translateMatrixToWords(matrix, keys);

    } else if (wordExists || synonymExists) {

        matrix = matrixWord.length > 0 ? matrixWord : matrixSynonym;
        newKey = matrixWord.length > 0 ? synonym : word;
        keysToChange = translateMatrixToWords(matrix, keys);

        // new one  
        keysToChange.push(newKey);
        matrix.push(1); 

        // update others
        updateValues.push(0);
    } else {

        keysToChange.push(word, synonym);
        matrix = createArray(keys.length, 0);
        matrix.push(1, 1);

        // update others
        updateValues.push(0, 0);
    }

    if (updateValues.length > 0) {
        otherKeys = keys.filter(word => !keysToChange.includes(word));
        otherKeys.forEach(async word => {
            let newMatrix = await query.get(word);
            newMatrix = [...newMatrix, ...updateValues];
            await query.set(word, newMatrix);
        });
    }

    keysToChange.forEach(async key => await query.set(key, matrix));

    res.status(200).send({ keysToChange, matrix })
}

const search = async (req, res, next) => {
    const { word } = req.params;
    let result = []; 
    const words = await query.keys();
    const wordExists = await query.exists(word);
    const matrix = wordExists ? await query.get(word): [];
    
    result = matrix
        .map((num, index) => num === 1 && words[index])
        .filter(num => num && num !== word);

    // response
    res.status(200).send(result);
}

// helpers
const createArray = (length, value) =>
    Array.from(Array(length).keys()).map(n => value)

const translateMatrixToIndexes = matrix => matrix
    .map((num, index) => num === 1 && index)
    .filter(num => num)

const translateMatrixToWords = (matrix, keys) => matrix
    .map((num, index) => num === 1 && keys[index])
    .filter(num => num)

// export
const service = {
    add, search
} 

module.exports = service;