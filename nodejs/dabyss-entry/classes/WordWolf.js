const aws = require('../clients/awsClient');
const Group = require('./Group');
const Game = require('./Game');

class WordWolf extends Game {
    constructor(playersId) {
        super(playersId);
    }
}

module.exports = WordWolf;