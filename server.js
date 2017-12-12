//server.js (todo-ionic2-heroku/server.js)
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var async = require('async');
var axios = require('axios');
var ObjectId = require('mongodb').ObjectId;
var app = express();

var deceptaconTests = require('./tests');

var mongodb = require('mongodb'),
  mongoClient = mongodb.MongoClient,
  ObjectID = mongodb.ObjectID, // Used in API endpoints
  db; // We'll initialize connection below

app.use(bodyParser.json());
app.set('port', process.env.PORT || 8080);
app.use(cors()); // CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.use(express.static("www")); // Our Ionic app build is in the www folder (kept up-to-date by the Ionic CLI using 'ionic serve')

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://heroku_w8rhxrvs:h5s44kgf5k8lc1vko7sslf3r8n@ds131480.mlab.com:31480/heroku_w8rhxrvs';

// Initialize database connection and then start the server.
mongoClient.connect(MONGODB_URI, function (err, database) {
  if (err) {
    process.exit(1);
  }

  db = database; // Our database object from mLab

  console.log("Database connection ready");

  // Initialize the app.
  app.listen(app.get('port'), function () {
    console.log("You're a wizard, Harry. I'm a what? Yes, a wizard, on port", app.get('port'));
  });
  
  initializeDatabase();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

function initializeDatabase() {
  var i;
  
  var CIRCLES = [
    {"name": "Circle-A"},
    {"name": "Circle-B"},
    {"name": "Circle-C"},
    {"name": "Circle-D"},
  ];
  
  for (i = 0; i < CIRCLES.length; i++) {
    let ii = i;
    db.collection("circle").findOne({name: CIRCLES[ii].name}, function (err, iCircle) {
      if (!iCircle) {
        db.collection("circle").insertOne(CIRCLES[ii], function (err, doc) {
          if (!err) {
            console.log('Created Circle: ' + JSON.stringify(doc.ops[0]));
          }
        });
      }
    });
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

var ERRORS = {
  REGISTRATION: {
    USERNAME: "Username is already being used",
    VILLAGER: "Failed to register villager",
    GAME: "failed to register game"
  },
  VILLAGER: {
    ALL: "Failed to get all villagers",
    ONE: "Failed to get this villager",
    NO: "No villager found with this id"
  },
  CIRCLE: {
    ALL: "Failed to get all circles",
    ONE: "Failed to get this circle",
    NO: "No circle found with this id",
    GAME_FOUND: "another game is already active"
  },
  GAME: {
    ALL: "Failed to get all games",
    ONE: "Failed to get this game",
    NO: "No game found with this id",
    NO_VILLAGER_ID: "No villager id was supplied",
    NO_GAME_ID: "No villager id was supplied",
    GAME_FULL: "Game is full"
  },
  MODERATE: {
    NO_VILLAGER_ID: "No villager id",
    NO_CIRCLE_ID: "No circle id",
    NO_GAME_OBJECT: "No game params",
    MODERATOR_FOUND: "another villager is moderating this circle",
    ALREADY_MODERATING: "this villager is already moderating another room"
  }
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// DEV TESTS //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// curl -G localhost:8080/test

app.get("/test", function (req, res) {
  deceptaconTests.foo(res, db);
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// VILLAGER //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// REGISTER A VILLAGER
app.post("/register/villager", function (req, res) {
  // normalize and capitalize for consistency in villager input
  var iFirstName = capitalize(req.body.firstname);
  var iLastName = capitalize(req.body.lastname);
  var iFullName = iFirstName + " " + iLastName;

  var villager = {
    username: req.body.username,
    firstname: iFirstName,
    lastname: iLastName,
    fullname: iFullName,
    pin: req.body.pin
  };
  
  db.collection("villager").findOne({username: villager.username}, function (err, iVillager) {
    if (iVillager) {
      handleError(res, "", ERRORS.REGISTRATION.USERNAME, 400);
    } else {
      db.collection("villager").insertOne(villager, function (err, doc) {
        if (err) {
          handleError(res, err.message, ERRORS.REGISTRATION.VILLAGER);
        } else {
          res.status(201).json(doc.ops[0]);
        }
      });
    }
  });
});

// GET ALL VILLAGERS
app.get("/villager", function (req, res) {
  db.collection("villager").find({}, {_id: 1, fullname: 1}).sort({lastname: -1}).toArray(function (err, villagers) {
    if (err) {
      handleError(res, err.message, ERRORS.VILLAGER.ALL);
    } else {
      res.status(200).json(villagers);
    }
  });
});

// GET A VILLAGER 
app.get("/villager/:id", function (req, res) {
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      getVillager,
      getCareerHistory
    ], function (err, villager) {
      res.status(200).json(villager);
    });
  };
  
  var getVillager = function(callback) {
    db.collection("villager").findOne({_id: new ObjectId(req.params.id)}, {pin: 0}, function (err, villager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (villager) {
        callback(null, villager);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  var getCareerHistory = function(villager, callback) {
    db.collection("game").find({$or: 
      [{villagers: {$in: [new ObjectId(req.params.id)]}}, 
       {moderator: new ObjectId(req.params.id)}] 
      }).toArray(function (err, games) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (games) {
        villager.gameHistory = games;
        callback(null, villager);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  beginAsync();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// CIRCLE //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// GET ALL CIRCLES
app.get("/circle", function (req, res) {
  db.collection("circle").find({}).sort({name: -1}).toArray(function (err, circles) {
    if (err) {
      handleError(res, err.message, ERRORS.CIRCLE.ALL);
    } else {
      res.status(200).json(circles);
    }
  });
});

// RESERVE A CIRCLE
app.post("/circle/reserve", function (req, res) {
  const villagerId = req.body.villagerId;
  const circleId = req.body.circleId;
  
  if (!villagerId) {
    handleError(res, "", ERRORS.MODERATE.NO_VILLAGER_ID, 400);
  } else if (!circleId) {
    handleError(res, "", ERRORS.MODERATE.NO_CIRCLE_ID, 400);      
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyVillager,
      verifyNotModerating,
      verifyCircle,
      makeModerator
    ], function (err, result) {
      res.status(200).json({});
    });
  };
  
  var verifyVillager = function (callback) {
    db.collection("villager").findOne({_id: new ObjectId(villagerId)}, function (err, iVillager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (iVillager) {
        callback();
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  var verifyNotModerating = function (callback) {
    db.collection("circle").findOne({moderator: new ObjectId(villagerId)}, function (err, iVillager) {
      if (iVillager) {
        handleError(res, "", ERRORS.MODERATE.ALREADY_MODERATING, 400);
      } else {
        callback();
      }
    });
  };
  
  var verifyCircle = function (callback) {
    db.collection("circle").findOne({_id: new ObjectId(circleId)}, function (err, circle) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ONE);
      } else if (circle) {
        callback(null, circle);
      } else {
        handleError(res, "", ERRORS.CIRCLE.NO, 400);
      }
    });
  };
  
  var makeModerator = function (circle, callback) {
    if (circle.moderator) {
      handleError(res, 'err.message', ERRORS.MODERATE.MODERATOR_FOUND);
    } else {
      try {
        let iTry = db.collection("circle").findOneAndUpdate(
          {_id: new ObjectId(circleId)},
          {$set: {"moderator": new ObjectId(villagerId)}},
          {maxTimeMS: 5}
        );  
        callback();
      }
      catch(e){
        handleError(res, "", e, 400);
      }
    }
  };
      
  beginAsync();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// GAME //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// REGISTER A GAME WITHIN A CIRCLE
app.post("/register/game", function (req, res) {
  const villagerId = req.body.villagerId;
  const circleId = req.body.circleId;
  const gameObj = req.body.game;
  gameObj.moderator = villagerId;
  gameObj.villagers = [];
  gameObj.timestamp = new Date();
  gameObj.circle = circleId;
  
  if (!villagerId) {
    handleError(res, "", ERRORS.MODERATE.NO_VILLAGER_ID, 400);
  } else if (!circleId) {
    handleError(res, "", ERRORS.MODERATE.NO_CIRCLE_ID, 400);      
  } else if (!gameObj) {
    handleError(res, "", ERRORS.MODERATE.NO_GAME_OBJECT, 400);     
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyVillager,
      verifyCircle,
      verifyHasNoGame,
      createGame,
      addGameToCircle,
      getUpdatedCircle
    ], function (err, result) {
      res.status(200).json({});
    });
  };
  
  var verifyVillager = function (callback) {
    db.collection("villager").findOne({_id: new ObjectId(villagerId)}, function (err, iVillager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (iVillager) {
        callback();
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  // verify the circle exists, AND this villager is the moderating
  var verifyCircle = function (callback) {
    db.collection("circle").findOne({_id: new ObjectId(circleId), moderator: new ObjectId(villagerId)}, function (err, circle) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ONE);
      } else if (circle) {
        callback(null, circle);
      } else {
        handleError(res, "", ERRORS.CIRCLE.NO, 400);
      }
    });
  };
  
  var verifyHasNoGame = function (circle, callback) {
    if (circle.game) {
      handleError(res, err.message, ERRORS.CIRCLE.GAME_FOUND);
    } else {
      callback(null, circle);
    }
  };
  
  var createGame = function (circle, callback) {
    db.collection("game").insertOne(gameObj, function (err, game) {
      if (err) {
        handleError(res, err.message, ERRORS.REGISTRATION.GAME);
      } else {
        callback(null, game);
      }
    });
  };
  
  var addGameToCircle = function (game, callback) {
    try {
      let iTry = db.collection("circle").findOneAndUpdate(
        {_id: new ObjectId(circleId)},
        {$set: {"game": new ObjectId(game._id)}},
        {maxTimeMS: 5}
      );
      callback();
    }
    catch(e){
      handleError(res, "", e, 400);
    }
  };
  
  var getUpdatedCircle = function (callback) {
    db.collection("circle").findOne({_id: new ObjectId(circleId)}, function (err, circle) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ONE);
      } else if (circle) {
        res.status(201).json(circle);
      } else {
        handleError(res, "", ERRORS.CIRCLE.NO, 400);
      }
    });
  };
      
  beginAsync();
});

// GET ALL GAMES
app.get("/game", function (req, res) {
  db.collection("game").find({}).toArray(function (err, games) {
    if (err) {
      handleError(res, err.message, ERRORS.GAME.ALL);
    } else {
      res.status(200).json(games);
    }
  });
});

// GET A GAME 
app.get("/game/:id", function (req, res) {
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      getGame,
      getModerator,
      getVillagers
    ], function (err, result) {
      res.status(200).json({});
    });
  };
  
  var getGame = function (callback) {
    db.collection("game").findOne({_id: new ObjectId(req.params.id)}, function (err, game) {
      if (err) {
        handleError(res, err.message, ERRORS.GAME.ONE);
      } else if (game) {
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.GAME.NO, 400);
      }
    });
  };
  
  var getModerator = function (game, callback) {
    db.collection("villager").findOne({_id: new ObjectId(game.moderator)}, {pin: 0}, function (err, villager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (villager) {
        game.moderator = villager.fullname;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  var getVillagers = function (game, callback) {
    db.collection("villager").find({_id: {$in: game.villagers}}, {pin:0}).toArray(function(err, villagers) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ALL);
      } else if (villagers) {
        game.villagers = villagers;
        res.status(200).json(game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.ALL, 400);
      }
    });
  };
  
  beginAsync();
});

// JOIN A GAME 
app.post("/game/join", function (req, res) {
  const villagerId = req.body.villagerId;
  const gameId = req.body.gameId;
  
  if (!villagerId) {
    handleError(res, "", ERRORS.GAME.NO_VILLAGER_ID, 400);
  } else if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);     
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyVillager,
      verifyGame,
      verifySeatAvailable,
      reserveSeat
    ], function (err, result) {
      res.status(200).json({});
    });
  };
  
  var verifyVillager = function (callback) {
    db.collection("villager").findOne({_id: new ObjectId(villagerId)}, function (err, iVillager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (iVillager) {
        callback();
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  var verifyGame = function (callback) {
    db.collection("game").findOne({_id: new ObjectId(gameId)}, function (err, iGame) {
      if (err) {
        handleError(res, err.message, ERRORS.GAME.ONE);
      } else if (iGame) {
        callback(null, iGame);
      } else {
        handleError(res, "", ERRORS.GAME.NO, 400);
      }
    });
  };
  
  var verifySeatAvailable = function (game, callback) {
    if (game.villagers.length < game.seats) {
      callback();
    } else {
      handleError(res, err.message, ERRORS.GAME.GAME_FULL);
    }
  };
  
  var reserveSeat = function (callback) {
    try {
      let iTry = db.collection("game").findOneAndUpdate(
        {_id: new ObjectId(gameId)},
        {$addToSet: {"villagers": new ObjectId(villagerId)}},
        {maxTimeMS: 5}
      );  
    }
    catch(e){
      handleError(res, "", e, 400);
    }
    setTimeout(function() {
      db.collection("game").findOne({_id: new ObjectId(gameId)}, function (err, game) {
        if (err) {
          handleError(res, err.message, ERRORS.GAME.ONE);
        } else if (game) {
          res.status(200).json(game);
        } else {
          handleError(res, "", ERRORS.GAME.NO, 400);
        }
      });
    }, 10);
  };

  beginAsync();
});

// REMOVE VILLAGER FROM A GAME 
app.put("/game/remove", function (req, res) {
  const villagerId = req.body.villagerId;
  const gameId = req.body.gameId;
  
  if (!villagerId) {
    handleError(res, "", ERRORS.GAME.NO_VILLAGER_ID, 400);
  } else if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);     
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyVillager,
      verifyGame,
      removeVillager
    ], function (err, result) {
      res.status(200).json({});
    });
  };
  
  var verifyVillager = function (callback) {
    db.collection("villager").findOne({_id: new ObjectId(villagerId)}, function (err, iVillager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (iVillager) {
        callback();
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  var verifyGame = function (callback) {
    db.collection("game").findOne({_id: new ObjectId(gameId)}, function (err, iGame) {
      if (err) {
        handleError(res, err.message, ERRORS.GAME.ONE);
      } else if (iGame) {
        callback(null, iGame);
      } else {
        handleError(res, "", ERRORS.GAME.NO, 400);
      }
    });
  };
  
  var removeVillager = function (game, callback) {
    db.collection("game").update({
      _id: new ObjectId(gameId)
    }, {
      $pull: {villagers: new ObjectId(villagerId)}
    }, function (err, result) {
      if (err) {
        handleError(res, err.message, ERRORS.GAME.ONE);
      } else if (result) {
        callback();
      } else {
        handleError(res, "", ERRORS.GAME.NO, 400);
      }
    });
  };

  beginAsync();
});

// BEGIN A GAME
app.post("/game/begin", function (req, res) {
  const gameId = req.body.gameId;
  
  if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      beginGame,
      retrieveUpdatedGame,
    ], function (err, game) {
      res.status(200).json(game);
    });
  };
  
  var beginGame = function (callback) {
    try {
      db.collection("game").findOneAndUpdate(
      {_id: new ObjectId(gameId)},
      {$set: {status:{
        active: true,
        ended: false,
        cancelled: false
      }}},
      {upsert: true, returnNewDocument: true}, 
      function(err, game) {
        if (err) { throw err; }
        else { 
          callback();
        }
      });
    } catch (e){
      print(e);
    }
  };
  
  var retrieveUpdatedGame = function (callback) {
    db.collection("game").findOne({_id: new ObjectId(gameId)}, function (err, iGame) {
      if (err) {
        handleError(res, err.message, ERRORS.GAME.ONE);
      } else if (iGame) {
        callback(null, iGame);
      } else {
        handleError(res, "", ERRORS.GAME.NO, 400);
      }
    });
  };
  
  beginAsync();
});

// END A GAME
app.post("/game/end", function (req, res) {
  const gameId = req.body.gameId;
  
  if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      endGame,
      retrieveUpdatedGame,
    ], function (err, game) {
      res.status(200).json(game);
    });
  };
  
  var endGame = function (callback) {
    try {
      db.collection("game").findOneAndUpdate(
      {_id: new ObjectId(gameId)},
      {$set: {status:{
        active: false,
        ended: true,
        cancelled: false
      }}},
      {upsert: true, returnNewDocument: true}, 
      function(err, game) {
        if (err) { throw err; }
        else { 
          callback();
        }
      });
    } catch (e){
      print(e);
    }
  };
  
  var retrieveUpdatedGame = function (callback) {
    db.collection("game").findOne({_id: new ObjectId(gameId)}, function (err, iGame) {
      if (err) {
        handleError(res, err.message, ERRORS.GAME.ONE);
      } else if (iGame) {
        callback(null, iGame);
      } else {
        handleError(res, "", ERRORS.GAME.NO, 400);
      }
    });
  };
  
  beginAsync();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ERROR HANDLING FOR THE API //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

function handleError(res, reason, message, code) {
 console.log("API Error: " + reason);
  res.status(code || 500).json({
    "Error": message
  });
}