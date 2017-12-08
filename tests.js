var async = require('async');
var axios = require('axios');

const deceptaconUrl = 'http://localhost:8080';

module.exports = {
  debug: false,
  data: {
    villager: null,
    circle: null
  },
  foo: function (res, db) {
    console.log("############################################");
    console.log("############################################");
    console.log("############################################");
    console.log("############################################");
    
    module.exports.data.villager = null;
    module.exports.data.circle = null;
    
    var beginAsync = function() {
      async.waterfall([
        function(callback) {
          callback(null);
        },
        registerVillager,
        registerVillagerSameUsername,
        getVillagers,
        getVillager,
        getCircles
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
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    // ERROR HANDLING 
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    
    /* 
      as an app, I want to inform the user they need to use a different username
      so that there are unique usernames in the system
    */
    var registerVillagerSameUsername = function(callback) {module.exports.SAME_USERNAME(callback)};
    
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
      // username is duplicate and registration failed
      handleTestSuccess('sameUsername', response.data);
      callback();
    })
    .catch(function (err) {
      handleTestFailed('sameUsername');
      handleError(res, err.message, err.data);
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
  }
};

function handleTestSuccess(apiName, data) {
  console.log('~~API Test: ' + apiName + ' | Success');
  if (!data.success) {
    console.log(data);
  }
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
}

function handleTestFailed(apiName) {
  console.log('~~API Test: ' + apiName + ' | Failed');
  module.exports.debug = false;
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
}