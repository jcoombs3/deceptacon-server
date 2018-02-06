var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var async = require('async');
var ObjectId = require('mongodb').ObjectId;
var app = express();

var deceptaconTests = require('./tests');
var deceptaconMobileData = require('./data');

var mongodb = require('mongodb'),
  mongoClient = mongodb.MongoClient,
  ObjectID = mongodb.ObjectID, // Used in API endpoints
  db; // We'll initialize connection below

app.use(bodyParser.json());
app.set('port', process.env.PORT || 8080);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//app.use(cors()); // CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
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
  deceptaconMobileData.createTestData(db);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

var ERRORS = {
  LOGIN: {
    GENERIC: "Your username or password is incorrect. Please try again"
  },
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
    NO_GAME_ID: "No game id was supplied",
    NO_MOD_ID: "No moderator id was supplied",
    NO_SEATS: "No seats was supplied",
    GAME_FULL: "Game is full"
  },
  MODERATE: {
    NO_VILLAGER_ID: "No villager id",
    NO_CIRCLE_ID: "No circle id",
    NO_GAME_OBJECT: "No game params",
    MODERATOR_FOUND: "another villager is moderating this circle",
    ALREADY_MODERATING: "this villager is already moderating another room"
  },
  SAVE: {
    NO_VILLAGER_ID: "No villager id",
    NO_FIRSTNAME: "No firstname",
    NO_LASTNAME: "No lastnme",
    NO_PICTURE: "No picture",
    NO_COLOR: "No color"
  },
  ALIGNMENT: {
    ALL: "Failed to get all alignments",
    ONE: "Failed to get this alignment",
    NO: "No alignment found with this id"
  },
  ROLE: {
    ALL: "Failed to get all roles",
    ONE: "Failed to get this role",
    NO: "No role found with this id"
  }
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// DEV TESTS //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// curl -G localhost:8080/test

// curl -G localhost:8080/villager/5a7648ffc0f3bd0014f8f326
// curl -G localhost:8080/villager/5a763d29222f20c941cc1af8

app.get("/test", function (req, res) {
  deceptaconTests.foo(res, db);
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// VILLAGER //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// REGISTER A VILLAGER
app.post("/register/villager", function (req, res) {
  // normalize and capitalize for consistency in villager input
  var iFirstName = capitalize(req.body.firstname.toLowerCase());
  var iLastName = "";
  var iFullName = iFirstName;
  if (req.body.lastname) {
    iLastName = capitalize(req.body.lastname.toLowerCase());
    iFullName = iFirstName + " " + iLastName;
  }

  var villager = {
    username: req.body.username,
    firstname: iFirstName,
    lastname: iLastName ? iLastName : '',
    fullname: iFullName,
    pin: req.body.pin,
    picture: req.body.picture,
    color: req.body.color,
    isAdmin: false,
    isMod: false
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

// LOGIN VILLAGER
app.post("/login", function (req, res) {
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      getVillager,
      getCurrentGame
    ], function (err, villager) {
      res.status(200).json(villager);
    });
  };
  
  var getVillager = function(callback) {
    db.collection("villager").findOne({username: req.body.username, pin: req.body.pin}, {pin: 0}, function (err, villager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (villager) {
        callback(null, villager);
      } else {
        handleError(res, "", ERRORS.LOGIN.GENERIC, 400);
      }
    });
  };
  
  var getCurrentGame = function(villager, callback) {
    if (villager.currentGame) {
      db.collection("game").findOne(
        {_id: new ObjectId(villager.currentGame.game._id)}, 
        function (err, game) {
          if (err) {
            handleError(res, err.message, ERRORS.VILLAGER.ONE);
          } else if (game) {
            villager.currentGame.game = game;
            callback(null, villager);
          } else {
            handleError(res, "", ERRORS.VILLAGER.NO, 400);
          }
        });
    } else {
      callback(null, villager);
    }
  };
  
  beginAsync();
});

// GET ALL VILLAGERS
app.get("/villager", function (req, res) {
  db.collection("villager").find({}, {_id: 1, fullname: 1, picture: 1, color: 1, isMod: 1, isAdmin: 1}).sort({firstname: 1}).toArray(function (err, villagers) {
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
      getGames,
      getCircleNames,
      getModerators,
      getRoles,
      getAlignments,
      getWinners
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
  
  var getGames = function(villager, callback) {
    let iUserDetails = "userDetails." + req.params.id + ""; 
    db.collection("game").find({$or:
      [{moderator: req.params.id}, {villagers: {$in: [req.params.id]}}, {iUserDetails: {$exists: true}}]}, 
      {timestamp: 1, moderator: 1, userDetails: 1, status: 1, circle: 1}).sort({timestamp: 1})
      .toArray(function (err, games) {
        if (err) {
          handleError(res, err.message, ERRORS.VILLAGER.ONE);
        } else if (games) {
          villager.gameHistory = games;
          if (villager.gameHistory.length > 0) {
            callback(null, villager);
          } else {
            res.status(200).json(villager);
          }
        } else {
          handleError(res, "", ERRORS.VILLAGER.NO, 400);
        }
    });
  };
  
  var getCircleNames = function (villager, callback) {
    let counter = 0;
    for (var i = 0; i < villager.gameHistory.length; i++) {
      let idx = i;
      db.collection("circle").findOne({
        _id: new ObjectId(villager.gameHistory[idx].circle)
      }, {pin: 0}, function (err, circle) {
        if (err) {
          handleError(res, err.message, ERRORS.CIRCLE.ONE);
        } else if (circle) {
          villager.gameHistory[idx].circle = circle.name;
        }
        counter++;
        if (counter >= villager.gameHistory.length) {
          callback(null, villager);
        }
      });
    }
  };
  
  var getModerators = function (villager, callback) {
    let counter = 0;
    for (var i = 0; i < villager.gameHistory.length; i++) {
      let idx = i;
      db.collection("villager").findOne({
        _id: new ObjectId(villager.gameHistory[idx].moderator)
      }, {pin: 0}, function (err, moderator) {
        if (err) {
          handleError(res, err.message, ERRORS.VILLAGER.ONE);
        } else if (moderator) {
          villager.gameHistory[idx].moderator = moderator;
        }
        counter++;
        if (counter >= villager.gameHistory.length) {
          callback(null, villager);
        }
      });
    }
  };
  
  var getRoles = function (villager, callback) {
    let counter = 0;
    for (var i = 0; i < villager.gameHistory.length; i++) {
      let idx = i;
      if (villager.gameHistory[idx].userDetails[villager._id]) {
        db.collection("role").findOne({
          _id: new ObjectId(villager.gameHistory[idx].userDetails[villager._id].role)
        }, function (err, role) {
          if (err) {
            handleError(res, err.message, ERRORS.ROLE.ONE);
          } else if (role) {
            villager.gameHistory[idx].userDetails[villager._id].role = role;
          }
          counter++;
          checkCounter(counter, villager, callback);
        });
      } else {
        counter++;
        checkCounter(counter, villager, callback);
      }
    }
  };
  
  var checkCounter = function (counter, villager, callback) {
    if (counter >= villager.gameHistory.length) {
      callback(null, villager);
    }
  };
  
  var getAlignments = function (villager, callback) {
    let counter = 0;
    for (var i = 0; i < villager.gameHistory.length; i++) {
      let idx = i;
      if (villager.gameHistory[idx].userDetails[villager._id]) {
        db.collection("alignment").findOne({
          _id: new ObjectId(villager.gameHistory[idx].userDetails[villager._id].alignment)
        }, {idx: 0}, function (err, alignment) {
          if (err) {
            handleError(res, err.message, ERRORS.ALIGNMENT.ONE);
          } else if (alignment) {
            villager.gameHistory[idx].userDetails[villager._id].alignment = alignment;
          }
          counter++;
          checkCounter(counter, villager, callback);
        });
      } else {
        counter++;
        checkCounter(counter, villager, callback);
      }
    }
  };
  
  var getWinners = function (villager, callback) {
    let counter = 0;
    for (var i = 0; i < villager.gameHistory.length; i++) {
      let idx = i;
      db.collection("alignment").findOne({
        _id: new ObjectId(villager.gameHistory[idx].userDetails.winner)
      }, {idx: 0}, function (err, winner) {
        if (err) {
          handleError(res, err.message, ERRORS.ALIGNMENT.ONE);
        } else if (winner) {
          villager.gameHistory[idx].userDetails.winner = winner;
        }
        counter++;
        if (counter >= villager.gameHistory.length) {
          callback(null, villager);
        }
      });
    }
  };
  
  beginAsync();
});

// UPDATE VILLAGER RIGHTS 
app.post("/rights/villager", function (req, res) {
  const villagerId = req.body._id;
  const isAdmin = req.body.isAdmin;
  const isMod = req.body.isMod;
  
  if (!villagerId) {
    handleError(res, "", ERRORS.SAVE.NO_VILLAGER_ID, 400);
  } else if (isAdmin === undefined || isAdmin === null) {
    handleError(res, "", 'No isAdmin found', 400);      
  } else if (isMod === undefined || isMod === null) {
    handleError(res, "", 'No isMod found', 400);      
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyVillager,
      updateVillager,
      retrieveUpdatedVillager
    ], function (err, villager) {
      res.status(200).json(villager);
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
  
  var updateVillager = function (callback) {
    try {
      db.collection("villager").findOneAndUpdate(
        {_id: new ObjectId(villagerId)},
        {$set: {isAdmin: isAdmin, isMod: isMod}},
        {upsert: true, returnNewDocument: true}, 
        function(err, doc) {
          if (err) { throw err; }
          else { 
            callback();
          }
        }
      );
    } catch (e){
      handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
    }
  };
  
  var retrieveUpdatedVillager = function (callback) {
    db.collection("villager").findOne({_id: new ObjectId(villagerId)}, {pin: 0}, function (err, iVillager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (iVillager) {
        callback(null, iVillager);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  beginAsync();
  
});

// SAVE VILLAGER
app.post("/save/villager", function (req, res) {
  const villagerId = req.body._id;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const picture = req.body.picture;
  const color = req.body.color;
  
  if (!villagerId) {
    handleError(res, "", ERRORS.SAVE.NO_VILLAGER_ID, 400);
  } else if (!firstname) {
    handleError(res, "", ERRORS.SAVE.NO_FIRSTNAME, 400);      
  } else if (!lastname) {
    handleError(res, "", ERRORS.SAVE.NO_LASTNAME, 400);      
  } else if (!picture) {
    handleError(res, "", ERRORS.SAVE.NO_PICTURE, 400);      
  } else if (!color) {
    handleError(res, "", ERRORS.SAVE.NO_COLOR, 400);      
  }
  
  const fullname = firstname + " " + lastname;
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyVillager,
      saveVillager,
      retrieveUpdatedVillager,
    ], function (err, villager) {
      res.status(200).json(villager);
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
  
  var saveVillager = function (callback) {
    try {
      db.collection("villager").findOneAndUpdate(
        {_id: new ObjectId(villagerId)},
        {$set: {firstname: firstname, lastname: lastname, fullname: fullname, picture: picture, color: color}},
        {upsert: true, returnNewDocument: true}, 
        function(err, doc) {
          if (err) { throw err; }
          else { 
            callback();
          }
        }
      );
    } catch (e){
      handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
    }
  };
  
  var retrieveUpdatedVillager = function (callback) {
    db.collection("villager").findOne({_id: new ObjectId(villagerId)}, function (err, iVillager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (iVillager) {
        callback(null, iVillager);
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
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      getCircles,
      getModerators,
      getGames
    ], function (err, circles) {
      res.status(200).json(circles);
    });
  };
  
  var getCircles = function (callback) {
    db.collection("circle").find({}).sort({name: 1, game: 1, moderator: 1}).toArray(function (err, circles) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ALL);
      } else {
        callback(null, circles);
      }
    });
  };
  
  var getModerators = function (circles, callback) {
    let counter = 0;
    for (var i = 0; i < circles.length; i++) {
      let idx = i;
      db.collection("villager").findOne({_id: new ObjectId(circles[idx].moderator)}, function (err, villager) {
        if (err) {
          handleError(res, err.message, ERRORS.VILLAGER.ONE);
        } else if (villager) {
          circles[idx].moderator = villager;
        }
        counter++;
        if (counter >= circles.length) {
          callback(null, circles);
        }
      });
    }
  };
  
  var getGames = function (circles, callback) {
    let counter = 0;
    for (var i = 0; i < circles.length; i++) {
      let idx = i;
      db.collection("game").findOne({_id: new ObjectId(circles[idx].game)}, function (err, game) {
        if (err) {
          handleError(res, err.message, ERRORS.GAME.ONE);
        } else if (game) {
          circles[idx].game = game;
        }
        counter++;
        if (counter >= circles.length) {
          callback(null, circles);
        }
      });
    }
  };
  
  beginAsync();
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
      makeModerator,
      retrieveUpdatedCircle
    ], function (err, circle) {
      res.status(200).json(circle);
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
        db.collection("circle").findOneAndUpdate(
          {_id: new ObjectId(circleId)},
          {$set: {moderator: new ObjectId(villagerId)}},
          {upsert: true, returnNewDocument: true}, 
          function(err, doc) {
            if (err) { throw err; }
            else { 
              callback(null, doc.value);
            }
          }
        );
      } catch (e){
        handleError(res, "", e, 400);
      }
    }
  };
  
  var retrieveUpdatedCircle = function (circle, callback) {
    db.collection("circle").findOne({_id: new ObjectId(circle._id)}, function (err, iCircle) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ONE);
      } else if (iCircle) {
        callback(null, iCircle);
      } else {
        handleError(res, "", ERRORS.CIRCLE.NO, 400);
      }
    });
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
  gameObj.placeholders = [];
  gameObj.timestamp = new Date();
  gameObj.circle = circleId;
  gameObj.userDetails = {};
  gameObj.status = {
    active: false,
    end: false,
    cancelled: false
  };
  
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
      getUpdatedCircle,
      setCurrentGame,
      getModerator
    ], function (err, result) {
      
    });
  };
  
  var verifyVillager = function (callback) {
    db.collection("villager").findOne({_id: new ObjectId(villagerId)}, function (err, iVillager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (iVillager) {
        callback(null);
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
    db.collection("game").insertOne(gameObj, function (err, doc) {
      if (err) {
        handleError(res, err.message, ERRORS.REGISTRATION.GAME);
      } else {
        callback(null, doc.ops[0]);
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
      callback(null, game);
    }
    catch(e){
      handleError(res, "", e, 400);
    }
  };
  
  var getUpdatedCircle = function (game, callback) {
    db.collection("circle").findOne({_id: new ObjectId(circleId)}, function (err, circle) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ONE);
      } else if (circle) {
        circle.game = game;
        callback(null, circle);
      } else {
        handleError(res, "", ERRORS.CIRCLE.NO, 400);
      }
    });
  };
  
  var setCurrentGame = function (circle, callback) {
    try {
      let iTry = db.collection("villager").findOneAndUpdate(
        {_id: new ObjectId(villagerId)},
        {$set: {"currentGame": circle}},
        {maxTimeMS: 5}
      );
      callback(null, circle);
    }
    catch(e){
      handleError(res, "", e, 400);
    }
  };
  
  var getModerator = function (circle, callback) {
    db.collection("villager").findOne({_id: new ObjectId(villagerId)}, function (err, iVillager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (iVillager) {
        circle.moderator = iVillager;
        circle.game.moderator = iVillager;
        res.status(201).json(circle);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  }
      
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
        game.moderator = villager;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  var getVillagers = function (game, callback) {
    let arr = [];
    for (var i = 0; i < game.villagers.length; i++) {
      arr.push(new ObjectId(game.villagers[i]));
    }
    db.collection("villager").find({_id: {$in: arr}}, {pin:0}).toArray(function(err, villagers) {
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

// UPDATE GAME, SEATS 
app.post("/game/update", function (req, res) {
  const gameId = req.body.gameId;
  const seats = req.body.seats;
  
  if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
  } else if (!seats) {
    handleError(res, "", ERRORS.GAME.NO_SEATS, 400);
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      updateGame,
      retrieveUpdatedGame,
      getModerator,
      getVillagers
    ], function (err, game) {
      res.status(200).json(game);
    });
  };
  
  var updateGame = function (callback) {
    try {
      db.collection("game").findOneAndUpdate(
      {_id: new ObjectId(gameId)},
      {$set: {seats:seats}},
      {upsert: true, returnNewDocument: true}, 
      function(err, doc) {
        if (err) { throw err; }
        else { 
          callback();
        }
      });
    } catch (e){
      handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
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
  
  var getModerator = function (game, callback) {
    db.collection("villager").findOne({_id: new ObjectId(game.moderator)}, {pin: 0}, function (err, villager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (villager) {
        game.moderator = villager;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  var getVillagers = function (game, callback) {
    let arr = [];
    for (var i = 0; i < game.villagers.length; i++) {
      arr.push(new ObjectId(game.villagers[i]));
    }
    db.collection("villager").find({_id: {$in: arr}}, {pin:0}).toArray(function(err, villagers) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ALL);
      } else if (villagers) {
        game.villagers = villagers;
        callback(null, game);
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
      reserveSeat,
      getUpdatedGame,
      getUpdatedCircle,
      setCurrentGame
    ], function (err, circle) {
      res.status(201).json(circle);
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
    if ((game.villagers.length + game.placeholders.length) < game.seats) {
      callback();
    } else {
      handleError(res, "", ERRORS.GAME.GAME_FULL);
    }
  };
  
  var reserveSeat = function (callback) {
    try {
      let iTry = db.collection("game").findOneAndUpdate(
        {_id: new ObjectId(gameId)},
        {$addToSet: {"villagers": villagerId}},
        {maxTimeMS: 5}
      );  
    }
    catch(e){
      handleError(res, "", e, 400);
    }
    setTimeout(function() {
      callback();
    }, 10);
  };
  
  var getUpdatedGame = function (callback) {
    db.collection("game").findOne({_id: new ObjectId(gameId)}, function (err, game) {
      if (err) {
        handleError(res, err.message, ERRORS.GAME.ONE);
      } else if (game) {
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.GAME.NO, 400);
      }
    });
  };
  
  var getUpdatedCircle = function (game, callback) {
    db.collection("circle").findOne({_id: new ObjectId(game.circle)}, function (err, circle) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ONE);
      } else if (circle) {
        circle.game = game;
        circle.moderator = game.moderator;
        callback(null, circle);
      } else {
        handleError(res, "", ERRORS.CIRCLE.NO, 400);
      }
    });
  };
  
  var setCurrentGame = function (circle, callback) {
    try {
      let iTry = db.collection("villager").findOneAndUpdate(
        {_id: new ObjectId(villagerId)},
        {$set: {"currentGame": circle}},
        {maxTimeMS: 5}
      );
    }
    catch(e){
      handleError(res, "", e, 400);
    }
    setTimeout(function() {
      callback(null, circle);
    }, 10);
  };

  beginAsync();
});

app.post("/game/placeholder", function (req, res) {
  const modId = req.body.modId;
  const gameId = req.body.gameId;
  
  if (!modId) {
    handleError(res, "", ERRORS.GAME.NO_MOD_ID, 400);
  } else if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);     
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyGame,
      verifySeatAvailable,
      reservePlaceholderSeat,
      getUpdatedGame,
      getModerator,
      getVillagers,
      getUpdatedCircle
    ], function (err, circle) {
      res.status(201).json(circle);
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
    if ((game.villagers.length + game.placeholders.length) < game.seats) {
      callback(null, game);
    } else {
      handleError(res, "", ERRORS.GAME.GAME_FULL);
    }
  };
  
  var reservePlaceholderSeat = function (game, callback) {
    let iPlaceholders = game.placeholders;
    iPlaceholders.push({}); 
    try {
      let iTry = db.collection("game").findOneAndUpdate(
        {_id: new ObjectId(gameId)},
        {$set: {"placeholders": iPlaceholders}},
        {maxTimeMS: 5}
      );  
    }
    catch(e){
      handleError(res, "", e, 400);
    }
    setTimeout(function() {
      callback();
    }, 10);
  };
  
  var getUpdatedGame = function (callback) {
    db.collection("game").findOne({_id: new ObjectId(gameId)}, function (err, game) {
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
        game.moderator = villager;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };

  var getVillagers = function (game, callback) {
    let arr = [];
    for (var i = 0; i < game.villagers.length; i++) {
      arr.push(new ObjectId(game.villagers[i]));
    }
    db.collection("villager").find({_id: {$in: arr}}, {pin:0}).toArray(function(err, villagers) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ALL);
      } else if (villagers) {
        game.villagers = villagers;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.ALL, 400);
      }
    });
  };
  
  var getUpdatedCircle = function (game, callback) {
    db.collection("circle").findOne({_id: new ObjectId(game.circle)}, function (err, circle) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ONE);
      } else if (circle) {
        circle.game = game;
        callback(null, circle);
      } else {
        handleError(res, "", ERRORS.CIRCLE.NO, 400);
      }
    });
  };

  beginAsync();
});


// REMOVE VILLAGER FROM A GAME 
app.post("/game/remove/villager", function (req, res) {
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
      removeVillager,
      getUpdatedGame,
      getModerator,
      getVillagers,
      getUpdatedCircle,
      removeCurrentGameFromVillager
    ], function (err, circle) {
      res.status(200).json(circle);
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
      $pull: {villagers: {$in: [villagerId]}}
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
  
  var getUpdatedGame = function (callback) {
    db.collection("game").findOne({_id: new ObjectId(gameId)}, function (err, game) {
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
        game.moderator = villager;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };

  var getVillagers = function (game, callback) {
    let arr = [];
    for (var i = 0; i < game.villagers.length; i++) {
      arr.push(new ObjectId(game.villagers[i]));
    }
    db.collection("villager").find({_id: {$in: arr}}, {pin:0}).toArray(function(err, villagers) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ALL);
      } else if (villagers) {
        game.villagers = villagers;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.ALL, 400);
      }
    });
  };
  
  var getUpdatedCircle = function (game, callback) {
    db.collection("circle").findOne({_id: new ObjectId(game.circle)}, function (err, circle) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ONE);
      } else if (circle) {
        circle.game = game;
        circle.moderator = game.moderator;
        callback(null, circle);
      } else {
        handleError(res, "", ERRORS.CIRCLE.NO, 400);
      }
    });
  };
  
  var removeCurrentGameFromVillager = function (circle, callback) {
    try {
      let iTry = db.collection("villager").findOneAndUpdate(
        {_id: new ObjectId(villagerId)},
        {$set: {"currentGame": null}},
        {maxTimeMS: 5}
      );
      res.status(200).json(circle);
    }
    catch(e){
      handleError(res, "", e, 400);
    }
  };

  beginAsync();
});

// REMOVE PLACEHOLDER FROM A GAME
app.post("/game/remove/placeholder", function (req, res) {
  const modId = req.body.modId;
  const gameId = req.body.gameId;
  
  if (!modId) {
    handleError(res, "", ERRORS.GAME.NO_MOD_ID, 400);
  } else if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);     
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyGame,
      removePlaceholder,
      getUpdatedGame,
      getModerator,
      getVillagers,
      getUpdatedCircle
    ], function (err, circle) {
      res.status(200).json(circle);
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
  
  var removePlaceholder = function (game, callback) {
    let iPlaceholders = game.placeholders;
    iPlaceholders.splice(0, 1);
    db.collection("game").update({
      _id: new ObjectId(gameId)
    }, {
      $set: {placeholders: iPlaceholders}
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
  
  var getUpdatedGame = function (callback) {
    db.collection("game").findOne({_id: new ObjectId(gameId)}, function (err, game) {
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
        game.moderator = villager;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };

  var getVillagers = function (game, callback) {
    let arr = [];
    for (var i = 0; i < game.villagers.length; i++) {
      arr.push(new ObjectId(game.villagers[i]));
    }
    db.collection("villager").find({_id: {$in: arr}}, {pin:0}).toArray(function(err, villagers) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ALL);
      } else if (villagers) {
        game.villagers = villagers;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.ALL, 400);
      }
    });
  };
  
  var getUpdatedCircle = function (game, callback) {
    db.collection("circle").findOne({_id: new ObjectId(game.circle)}, function (err, circle) {
      if (err) {
        handleError(res, err.message, ERRORS.CIRCLE.ONE);
      } else if (circle) {
        circle.game = game;
        callback(null, circle);
      } else {
        handleError(res, "", ERRORS.CIRCLE.NO, 400);
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
      getModerator,
      getVillagers
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
      function(err, doc) {
        if (err) { throw err; }
        else { 
          callback();
        }
      });
    } catch (e){
      handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
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
  
  var getModerator = function (game, callback) {
    db.collection("villager").findOne({_id: new ObjectId(game.moderator)}, {pin: 0}, function (err, villager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (villager) {
        game.moderator = villager;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  var getVillagers = function (game, callback) {
    let arr = [];
    for (var i = 0; i < game.villagers.length; i++) {
      arr.push(new ObjectId(game.villagers[i]));
    }
    db.collection("villager").find({_id: {$in: arr}}, {pin:0}).toArray(function(err, villagers) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ALL);
      } else if (villagers) {
        game.villagers = villagers;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.ALL, 400);
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
      makeCircleAvailable,
      retrieveUpdatedGame,
      getModerator,
      getVillagers
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
        function(err, doc) {
          if (err) { throw err; }
          else { 
            callback(null, doc.value);
          }
        }
      );
    } catch (e){
      handleError(res, "", "Generic Error", 400);
    }
  };
  
  var makeCircleAvailable = function (game, callback) {
    try {
      db.collection("circle").findOneAndUpdate(
        {_id: new ObjectId(game.circle)},
        {$set: {moderator: null, game: null}},
        {upsert: true, returnNewDocument: true}, 
        function(err, doc) {
          if (err) { throw err; }
          else { 
            callback(null);
          }
        }
      );
    } catch (e){
      handleError(res, "", "ERROR making Circle available", 400);
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
  
  var getModerator = function (game, callback) {
    db.collection("villager").findOne({_id: new ObjectId(game.moderator)}, {pin: 0}, function (err, villager) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ONE);
      } else if (villager) {
        game.moderator = villager;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.NO, 400);
      }
    });
  };
  
  var getVillagers = function (game, callback) {
    let arr = [];
    for (var i = 0; i < game.villagers.length; i++) {
      arr.push(new ObjectId(game.villagers[i]));
    }
    db.collection("villager").find({_id: {$in: arr}}, {pin:0}).toArray(function(err, villagers) {
      if (err) {
        handleError(res, err.message, ERRORS.VILLAGER.ALL);
      } else if (villagers) {
        game.villagers = villagers;
        callback(null, game);
      } else {
        handleError(res, "", ERRORS.VILLAGER.ALL, 400);
      }
    });
  };
  
  beginAsync();
});

// CANCEL A GAME
app.post("/game/cancel", function (req, res) {
  const gameId = req.body.gameId;
  
  if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      cancelGame,
      makeCircleAvailable,
      retrieveUpdatedGame,
    ], function (err, game) {
      res.status(200).json(game);
    });
  };
  
  var cancelGame = function (callback) {
    try {
      db.collection("game").findOneAndUpdate(
        {_id: new ObjectId(gameId)},
        {$set: {status:{
          active: false,
          ended: false,
          cancelled: true
        }}},
        {upsert: true, returnNewDocument: true}, 
        function(err, doc) {
          if (err) { throw err; }
          else { 
            callback(null, doc.value);
          }
        }
      );
    } catch (e){
      handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
    }
  };
  
  var makeCircleAvailable = function (game, callback) {
    try {
      db.collection("circle").findOneAndUpdate(
        {_id: new ObjectId(game.circle)},
        {$set: {moderator: null, game: null}},
        {upsert: true, returnNewDocument: true}, 
        function(err, doc) {
          if (err) { throw err; }
          else { 
            callback();
          }
        }
      );
    } catch (e){
      handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
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

// PUBLISH ROLE & ALIGNMENT
app.post("/game/publish", function (req, res) {
  const gameId = req.body.gameId;
  const villagerId = req.body.villagerId;
  const iAlignment = req.body.alignment;
  const iRole = req.body.role;
  const detailObj = {
    alignment: iAlignment,
    role: iRole
  };
  
  if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
  } else if (!villagerId) {
    handleError(res, "", ERRORS.GAME.NO_VILLAGER_ID, 400);
  } else if (!iAlignment) {
    handleError(res, "", "No alignment added", 400);
  } else if (!iRole) {
    handleError(res, "", "No role added", 400);
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyVillager,
      verifyGame,
      updateVillagerDetails,
      removeCurrentGameFromVillager
    ], function (err, result) {
      res.status(200).json(result);
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
  
  var updateVillagerDetails = function (game, callback) {
    let iUserDetails = game.userDetails;
    iUserDetails[villagerId] = detailObj;
    try {
      db.collection("game").findOneAndUpdate(
        {_id: new ObjectId(gameId)},
        {$set: {userDetails: iUserDetails}},
        function(err, doc) {
          if (err) { throw err; }
          else { 
            callback();
          }
        }
      );
      // {upsert: true, returnNewDocument: true}, 
    } catch (e){
      handleError(res, "", "Error adding userDetails", 400);
    }
  };
  
  var removeCurrentGameFromVillager = function (callback) {
    try {
      let iTry = db.collection("villager").findOneAndUpdate(
        {_id: new ObjectId(villagerId)},
        {$set: {"currentGame": null}},
        {maxTimeMS: 5}
      );
      callback(null, {success: true});
    }
    catch(e){
      handleError(res, "", e, 400);
    }
  };
  
  beginAsync();
});

// PUBLISH WINNER
app.post("/game/winner", function (req, res) {
  const gameId = req.body.gameId;
  const villagerId = req.body.villagerId;
  const iWinner = req.body.winner;
  
  if (!gameId) {
    handleError(res, "", ERRORS.GAME.NO_GAME_ID, 400);
  } else if (!villagerId) {
    handleError(res, "", ERRORS.GAME.NO_VILLAGER_ID, 400);
  } else if (!iWinner) {
    handleError(res, "", "No winner added", 400);
  }
  
  var beginAsync = function () {
    async.waterfall([
      function(callback) {
        callback(null);
      },
      verifyVillager,
      verifyGame,
      updateWinnerDetails,
      removeCurrentGameFromVillager
    ], function (err, result) {
      res.status(200).json(result);
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
  
  var updateWinnerDetails = function (game, callback) {
    let iUserDetails = game.userDetails;
    iUserDetails['winner'] = iWinner;
    try {
      db.collection("game").findOneAndUpdate(
        {_id: new ObjectId(gameId)},
        {$set: {userDetails: iUserDetails}},
        function(err, doc) {
          if (err) { throw err; }
          else { 
            callback();
          }
        }
      );
      // {upsert: true, returnNewDocument: true}, 
    } catch (e){
      handleError(res, "", "Error adding userDetails", 400);
    }
  };
  
  var removeCurrentGameFromVillager = function (callback) {
    try {
      let iTry = db.collection("villager").findOneAndUpdate(
        {_id: new ObjectId(villagerId)},
        {$set: {"currentGame": null}},
        {maxTimeMS: 5}
      );
      callback(null, {success: true});
    }
    catch(e) {
      handleError(res, "", e, 400);
    }
  };
  
  beginAsync();
});

// GET ALL ALIGNMENTS
app.get("/alignment", function (req, res) {
  db.collection("alignment").find({}).sort({idx: 1}).toArray(function (err, alignments) {
    if (err) {
      handleError(res, err.message, ERRORS.ALIGNMENT.ALL);
    } else {
      res.status(200).json(alignments);
    }
  });
});

// GET ALL ROLES associated 
app.get("/roles/:id", function (req, res) {
  
  db.collection("role").find({
    alignment: new ObjectId(req.params.id)
  }).sort({name: 1}).toArray(function (err, roles) {
    if (err) {
      handleError(res, err.message, ERRORS.ROLE.ALL);
    } else {
      res.status(200).json(roles);
    }
  });
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