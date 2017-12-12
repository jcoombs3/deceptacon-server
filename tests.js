var async = require('async');
var axios = require('axios');

const deceptaconUrl = 'http://localhost:8080';

module.exports = {
  debug: false,
  data: {
    villager: null,
    circle: null,
    game: null
  },
  foo: function (res, db) {
    console.log("############################################");
    console.log("############################################");
    console.log("############################################");
    console.log("############################################");
    
    module.exports.data.villager = null;
    module.exports.data.circle = null;
    module.exports.data.game = null;
    
    var beginAsync = function() {
      async.waterfall([
        function(callback) {
          callback(null);
        },
        registerVillager,
        registerVillagerSameUsername,
        getVillagers,
        getVillager,
        getCircles,
        reserveCircle,
        reserveAnotherCircle,
        registerGame,
        getGames,
        getGame,
        joinGame,
        removeVillager,
        beginGame,
        endGame
      ], function (err, result) {
        module.exports.debug = false;
        res.status(200).json({});
      });
    };
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    // USER STORIES 
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    
    /* 
      as a user, I would like to register my account, 
      so that I can access all of the app's features
    */
    var registerVillager = function(callback) {module.exports.REGISTER_VILLAGER(callback)};
    
    /* 
      as a user, I would like to retrieve all users in the system, 
      so that I can review their light activity
    */
    var getVillagers = function(callback) {module.exports.GET_VILLAGERS(callback)};
    
    /* 
      as a user, I would like to retrieve one villager in the system,
      so that I can view their deceptacon history
    */
    var getVillager = function(callback) {module.exports.GET_VILLAGER(callback)};
    
    /* 
      as a user, I would like to retrieve all game circles in the system, 
      so that I can review what active games are going on 
    */
    var getCircles = function(callback) {module.exports.GET_CIRCLES(callback)};
    
    /* 
      as a moderator, I would like to reserve a circle for my game, 
      so that I can moderate a future game
    */
    var reserveCircle = function(callback) {module.exports.RESERVE_CIRCLE(callback)};
    
    /* 
      as a moderator, I would like to create a game for my circle, 
      so that users can be notified of an 'active' game
    */
    var registerGame = function(callback) {module.exports.REGISTER_GAME(callback)};
    
    /* 
      as a user, I would like to retrieve all games in the system, 
      so that I can review the activity
    */
    var getGames = function(callback) {module.exports.GET_GAMES(callback)};
    
    /* 
      as a user, I would like to retrieve one game in the system,
      so that I can view all of its details deceptacon history
    */
    var getGame = function(callback) {module.exports.GET_GAME(callback)};
    
    /* 
      as a user, I would like to join a game within a circle, 
      so that I can play a round of Werewolf or other
    */
    var joinGame = function(callback) {module.exports.JOIN_GAME(callback)};
    
    /* 
      as a user, I would like to remove myself from a game, 
      so that my seat is given up for another user
      
      as a moderator, I would like to remove a user from a game,
      so that another villager can take their spot
    */
    var removeVillager = function(callback) {module.exports.REMOVE_VILLAGER(callback)};
    
    /*
      as a moderator, I would like to begin my game,
      so that my villagers can play my game within the circle
    */
    var beginGame = function(callback) {module.exports.BEGIN_GAME(callback)};
    
    /*
      as a moderator, I would like to end my game,
      so that the room can be available for a new mod
    */
    var endGame = function(callback) {module.exports.END_GAME(callback)};
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    // ERROR HANDLING 
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    
    /* 
      as an app, I want to inform the user they need to use a different username
      so that there are unique usernames in the system
    */
    var registerVillagerSameUsername = function(callback) {module.exports.SAME_USERNAME(callback)};
    
    /* 
      as an app, I want to inform the user they cannot moderate 2 rooms at the same time
      so that multiple moderators can run circles
    */
    var reserveAnotherCircle = function(callback) {module.exports.RESERVE_ANOTHER_CIRCLE(callback)};
    
    this.debug = true;
    beginAsync();
  },
  UNIQUE_NAME: function(db, callback) {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  },
  REGISTER_VILLAGER: function(callback) {
    axios.post(deceptaconUrl+'/register/villager', {
      username: 'test-villager-'+module.exports.UNIQUE_NAME(),
      firstname: 'fn-'+module.exports.UNIQUE_NAME(),
      lastname: 'ln-'+module.exports.UNIQUE_NAME(),
      pin: [0,0,0,0]
    })
    .then(function (response) {
      handleTestSuccess('registerVillager', response.data);
      module.exports.data.villager = response.data;
      callback();
    })
    .catch(function (err) {
      handleTestFailed('registerVillager');
    });
  },
  SAME_USERNAME: function(callback) {
    let villager = module.exports.data.villager;
    axios.post(deceptaconUrl+'/register/villager', {
      username: villager.username,
      firstname: 'fn-'+module.exports.UNIQUE_NAME(),
      lastname: 'ln-'+module.exports.UNIQUE_NAME(),
      pin: [0,0,0,0]
    })
    .then(function (response) {
      handleTestFailed('sameUsername');
    })
    .catch(function (err) {
      // username is duplicate and registration failed
      handleTestSuccess('sameUsername');
      callback();
    });
  },
  GET_VILLAGERS: function(callback) {
    axios.get(deceptaconUrl+'/villager')
    .then(function (response) {
      if (response.data) {
        handleTestSuccess('getVillagers', response.data);
        callback();
      } else {
        handleTestFailed('getVillagers');
      }
    })
    .catch(function (err) {
      handleTestFailed('getVillagers');
    });
  },
  GET_VILLAGER: function(callback) {
    let villager = module.exports.data.villager;
    axios.get(deceptaconUrl+'/villager/'+villager._id)
    .then(function (response) {
      if (response.data) {
        handleTestSuccess('getVillager', response.data);
        callback();
      } else {
        handleTestFailed('getVillager');
      }
    })
    .catch(function (err) {
      handleTestFailed('getVillager');
    });
  },
  GET_CIRCLES: function(callback) {
    axios.get(deceptaconUrl+'/circle')
    .then(function (response) {
      if (response.data) {
        module.exports.data.circle = response.data[0];
        handleTestSuccess('getCircles', response.data);
        callback();
      } else {
        handleTestFailed('getCircles');
      }
    })
    .catch(function (err) {
      handleTestFailed('getCircles');
    });
  },
  RESERVE_CIRCLE: function(callback) {
    let villager = module.exports.data.villager;
    let circle = module.exports.data.circle;
    
    axios.post(deceptaconUrl+'/circle/reserve', {
      villagerId: villager._id,
      circleId: circle._id
    })
    .then(function (response) {
      handleTestSuccess('reserveCircle', response.data);
      callback();
    })
    .catch(function (err) {
      console.log('if you received this message, consider purging the Database');
      handleTestFailed('reserveCircle');
    });
  },
  RESERVE_ANOTHER_CIRCLE: function(callback) {
    let villager = module.exports.data.villager;
    let circle = module.exports.data.circle;
    
    axios.post(deceptaconUrl+'/circle/reserve', {
      villagerId: villager._id,
      circleId: circle._id
    })
    .then(function (response) {
      handleTestFailed('reserveAnotherCircle');
    })
    .catch(function (err) {
      handleTestSuccess('reserveAnotherCircle');
      callback();
    });
  },
  REGISTER_GAME: function(callback) {
    let villager = module.exports.data.villager;
    let circle = module.exports.data.circle;
    let game = {
      seats: 13
    }
    
    axios.post(deceptaconUrl+'/register/game', {
      villagerId: villager._id,
      circleId: circle._id,
      game: game
    })
    .then(function (response) {
      module.exports.data.circle = response.data;
      handleTestSuccess('registerGame', response.data);
      callback();
    })
    .catch(function (err) {
      handleTestFailed('registerGame');
    });
  },
  GET_GAMES: function(callback) {
    axios.get(deceptaconUrl+'/game')
    .then(function (response) {
      if (response.data) {
        // should only be 1 so this should be okay
        module.exports.data.game = response.data[0];
        handleTestSuccess('getGames', response.data);
        callback();
      } else {
        //handleTestFailed('getGames');
      }
    })
    .catch(function (err) {
      //handleTestFailed('getGames');
    });
  },
  GET_GAME: function(callback) {
    let game = module.exports.data.game;
    axios.get(deceptaconUrl+'/game/'+game._id)
    .then(function (response) {
      if (response.data) {
        handleTestSuccess('getGame', response.data);
        callback();
      } else {
        handleTestFailed('getGame');
      }
    })
    .catch(function (err) {
      handleTestFailed('getGame');
    });
  },
  JOIN_GAME: function(callback) {
    let villager = module.exports.data.villager;
    let game = module.exports.data.game;
    axios.post(deceptaconUrl+'/game/join', {
      villagerId: villager._id,
      gameId: game._id
    })
    .then(function (response) {
      handleTestSuccess('joinGame', response.data);
      callback();
    })
    .catch(function (err) {
      handleTestFailed('joinGame');
    });
  },
  REMOVE_VILLAGER: function(callback) {
    let villager = module.exports.data.villager;
    let game = module.exports.data.game;
    axios.put(deceptaconUrl+'/game/remove', {
      villagerId: villager._id,
      gameId: game._id
    })
    .then(function (response) {
      handleTestSuccess('removeVillager', response.data);
      callback();
    })
    .catch(function (err) {
      handleTestFailed('removeVillager');
    });
  },
  BEGIN_GAME: function(callback) {
    let game = module.exports.data.game;
    axios.post(deceptaconUrl+'/game/begin', {
      gameId: game._id
    })
    .then(function (response) {
      handleTestSuccess('beginGame', response.data);
      callback();
    })
    .catch(function (err) {
      handleTestFailed('beginGame');
    });
  },
  END_GAME: function(callback) {
    let game = module.exports.data.game;
    axios.post(deceptaconUrl+'/game/end', {
      gameId: game._id
    })
    .then(function (response) {
      handleTestSuccess('endGame', response.data);
      callback();
    })
    .catch(function (err) {
      handleTestFailed('endGame');
    });
  }
};

function handleTestSuccess(apiName, data) {
  console.log('~~API Test: ' + apiName + ' | Success');
  if (data && !data.success) {
    console.log(data);
  }
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
}

function handleTestFailed(apiName) {
  console.log('~~API Test: ' + apiName + ' | Failed');
  module.exports.debug = false;
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
}