var CIRCLES = [
  {name: "Circle-A"},
  {name: "Circle-B"},
  {name: "Circle-C"},
  {name: "Circle-D"},
];

var VILLAGERS = [
  {firstname: "Villager", lastname: "A", username: "a", pin: [0,0,0,0]},
  {firstname: "Villager", lastname: "B", username: "b", pin: [0,0,0,0]},
  {firstname: "Villager", lastname: "C", username: "c", pin: [0,0,0,0]},
  {firstname: "Villager", lastname: "D", username: "d", pin: [0,0,0,0]},
  {firstname: "Villager", lastname: "E", username: "e", pin: [0,0,0,0]},
  {firstname: "Villager", lastname: "F", username: "f", pin: [0,0,0,0]},
  {firstname: "Villager", lastname: "G", username: "g", pin: [0,0,0,0]}
];

module.exports = {
  createTestData: function (db) {
    var i;
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
    for (i = 0; i < VILLAGERS.length; i++) {
      let ii = i;
      db.collection("villager").findOne({username: VILLAGERS[ii].username}, function (err, iVillager) {
        if (!iVillager) {
          db.collection("villager").insertOne(VILLAGERS[ii], function (err, doc) {
            if (!err) {
              console.log('Created Villager: ' + JSON.stringify(doc.ops[0]));
            }
          });
        }
      });
    }
  }
}