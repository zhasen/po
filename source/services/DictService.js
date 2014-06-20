var settings = require('../../settings');
var logger = require('../commons/logging').logger;
var pool = require("../commons/mysql");
var async = require("async");

var Service = {};

var generateFinder = function(pool, sql, multiple) {
    return function(callback){
        pool.getConnection(function(err, connection) {
            if(err){
                logger.error(err);
                callback(err, null);
                return;
            }

            connection.query(sql, function(err, rows, fields) {
                if(err){
                    logger.error(err);
                    callback(err, null);
                }
                else{
                    if(multiple){
                        callback(null, rows);
                    }
                    else{
                        if(rows && rows.length>0){
                            callback(null, rows[0]);
                        }
                        else{
                            callback(null, null);
                        }
                    }
                }
                connection.release();
            });
        });
    };
};



Service.listTargets = function(callback) {
    pool.getConnection(function(err, connection) {
        if(err){
            logger.error(err);
            callback(err, null);
            return;
        }
        connection.query('SELECT id, name from decks where id <= 20 order by displayorder', function(err, rows, fields) {
            if(err){
                callback(err, null);
                return;
            }
            callback(null, rows);
            connection.release();
        });
    });
};

var genSqlFilterDeckWords = function(deckId, core){
    var sql = 'SELECT id, word, review FROM deckworddetail WHERE deckid=' + deckId;
    if(core=='all'){

    }
    else if(core=='core'){
        sql += ' AND core=1';
    }
    else if(core=='uncore'){
        sql += ' AND core=0';
    }
    sql += ' ORDER BY id ASC';
    return sql;
};

Service.filterTargetWords = function(query, callback) {
    var sql = genSqlFilterDeckWords(query.target, query.core);
    pool.getConnection(function(err, connection) {
        if(err){
            logger.error(err);
            callback(err, null);
            return;
        }
        connection.query(sql, function(err, rows, fields) {
            if(err){
                logger.error(err);
                callback(err, null);
            }
            else{
                logger.log(rows);
                callback(null, rows);
            }
            connection.release();
        });
    });
};

var genSqlDeckWordDetail = function(deckWordId){
    return 'SELECT id, word, briefdef, method, review FROM deckworddetail WHERE id=' + deckWordId;
};
var genSqlWord = function(word){
    return 'SELECT word, wordAlt, hardLevel, phoneticSymbolEn, phoneticSymbolUs, picLocal, picSource FROM words WHERE word= \''+word+'\' LIMIT 1';
};

//var genSqlWordPhonetic = function(word){
//    return 'SELECT phoneticSymbolEn as ps FROM words WHERE word= \''+word+'\' LIMIT 1';
//};

var getWord = function(word, callback) {
    var sqlWord = genSqlWord(word);
    pool.getConnection(function(err, connection) {
        if(err){
            logger.error(err);
            callback(err, null);
            return;
        }

        connection.query(sqlWord, function(err, rows, fields) {
            if(err){
                logger.error(err);
                callback(err, null);
            }
            else{
                logger.log(rows);
                if(rows && rows.length>0){
                    callback(null, rows[0]);
                }
                else{
                    callback(null, null);
                }
            }
            connection.release();
        });
    });
};

var genSqlWordSpeech = function(word){
    return 'SELECT speechId FROM wordspeeches WHERE word= \''+word+'\' ORDER BY extentPercentage DESC, speechOrder ASC LIMIT 1';
};
var getWordSpeech = function(word, callback) {
    generateFinder(pool, genSqlWordSpeech(word))(callback);
};

var genSqlWordSentences = function(word){
    return 'SELECT sentence, sentenceChinese, soundLocal FROM wordsentences WHERE word= \''+word+'\' AND soundLocal IS NOT NULL ORDER BY sentenceOrder ASC LIMIT 1';
};
var getWordSentences = function(word, callback) {
    generateFinder(pool, genSqlWordSentences(word), true)(callback);
};


Service.getWordDetail = function(deckWordId, callback) {
    var sqlDeckWordDetail = genSqlDeckWordDetail(deckWordId);
    logger.debug(sqlDeckWordDetail);

    pool.getConnection(function(err, connection) {
        if(err){
            logger.error(err);
            callback(err, null);
            return;
        }
        connection.query(sqlDeckWordDetail, function(err, rows, fields) {
            if(err){
                logger.error(err);
                callback(err, null);
            }
            else{
                logger.log(rows);

                if(rows && rows.length>0){
                    var wordDetail = rows[0];
                    async.series([
                        function(cb){
                            getWord(wordDetail.word, function(err, result){
                                cb(err, result);
                            });
                        }
                        ,function(cb){
                            getWordSentences(wordDetail.word, function(err, result){
                                cb(err, result);
                            });
                        }
                        ,function(cb){
                            getWordSpeech(wordDetail.word, function(err, result){
                                cb(err, result);
                            });
                        }
                        ],

                        function(err, results){
                            if(err){
                                throw err; //TODO do more error handling
                            }
                            if(results[0]){
                                wordDetail.wordAlt = results[0].wordAlt;
                                wordDetail.pictureUrl = results[0].picLocal;
                                wordDetail.phoneticSymbolEn = results[0].phoneticSymbolEn;
                            }
                            if(results[1]){
                                wordDetail.sentences = results[1];
                            }

//                            if(results[1]){
//                                wordDetail.speechId = results[1].speechId;
//                            }
                            callback(null, wordDetail);
                        }
                    );
                }
                else{
                    callback(null, {id: deckWordId});
                }
            }
            connection.release();
        });
    });
};


var genSqlReviewWordDetail = function(deckWordId, review){
    return 'UPDATE deckworddetail SET review = '+review+' WHERE id=' + deckWordId;
};

Service.reviewWordDetail = function(id, review, callback) {
    var sqlReviewWordDetail = genSqlReviewWordDetail(id, review);
    pool.getConnection(function(err, connection) {
        if(err){
            logger.error(err);
            callback(err, null);
            return;
        }

        connection.query(sqlReviewWordDetail, function(err, rows) {
            if(err){
                logger.error(err);
                callback(err, null);
            }
            else{
                var result = rows.affectedRows>0;
                callback(null, result);
            }
            connection.release();
        });
    });
};




module.exports = Service;