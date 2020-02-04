
const query = require('./query');

const add = async (req, res, next) => {
    const { word, synonym } = req.body
    const wordExists = await query.exists(word) === 1;
    const synonymExists = await query.exists(synonym) === 1;

    let keysToChange = [];
    let matrix = []; // applay on keys
    let newKey = null;
    const words = await query.keys();

    let matrixWord = wordExists ? await query.get(word) : [];
    let matrixSynonym = synonymExists ? await query.get(synonym) : [];

    const translateMatrixToIndexes = matrix => matrix
        .map((num, index) => num === 1 && index)
        .filter(num => num)

    const translateMatrixToWords = matrix => matrix
        .map((num, index) => num === 1 && words[index])
        .filter(num => num)

    if (wordExists && synonymExists) {

        const synonymIndexes = translateMatrixToIndexes(matrixSynonym);
        const updateMatrix = (num, index) => synonymIndexes.includes(index) ? 1 : num
        matrix = matrixWord.map(updateMatrix);
        keysToChange = translateMatrixToWords(matrix);

    } else if (wordExists || synonymExists) {

        matrix = matrixWord.length > 0 ? matrixWord : matrixSynonym;
        newKey = matrixWord.length > 0 ? synonym : word;
        keysToChange = translateMatrixToWords(matrix)
        keysToChange.push(newKey);
        matrix.push(1); // new one

    } else {

        keysToChange.push(word, synonym);
        matrix = Array.from(Array(words.length).keys())
            .map(n => 0);
        matrix.push(1, 1);

        // update others
        words.forEach(async word => {
            const newMatrix = await query.get(word);
            newMatrix.push(0, 0)
            await query.set(word, newMatrix);
        });
    }

    keysToChange.forEach(async key => await query.set(key, matrix))

    res.status(200).send('OK!')
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

const service = {
    add, search
} 

module.exports = service;