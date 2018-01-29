var CIRCLES = [
  {
    name: "Paranoia Paradise",
    moderator: null,
    game: null
  }
];

var VILLAGERS = [
  {
    firstname: "Villager",
    lastname: "A",
    username: "a",
    fullname: "Villager A",
    pin: [0, 0, 0, 0],
    picture: "Werewolf.png",
    color: "darkblue"
  },
  {
    firstname: "Villager",
    lastname: "B",
    username: "b",
    fullname: "Villager B",
    pin: [0, 0, 0, 0],
    picture: "Werewolf.png",
    color: "tan"
  },
  {
    firstname: "Villager",
    lastname: "C",
    username: "c",
    fullname: "Villager C",
    pin: [0, 0, 0, 0],
    picture: "Werewolf.png",
    color: "tan"
  },
  {
    firstname: "Villager",
    lastname: "D",
    username: "d",
    fullname: "Villager D",
    pin: [0, 0, 0, 0],
    picture: "Werewolf.png",
    color: "orange"
  },
  {
    firstname: "Villager",
    lastname: "E",
    username: "e",
    fullname: "Villager E",
    pin: [0, 0, 0, 0],
    picture: "Werewolf.png",
    color: "yellow"
  },
  {
    firstname: "Villager",
    lastname: "F",
    username: "f",
    fullname: "Villager F",
    pin: [0, 0, 0, 0],
    picture: "Werewolf.png",
    color: "tan"
  },
  {
    firstname: "Villager",
    lastname: "G",
    username: "g",
    fullname: "Villager G",
    pin: [0, 0, 0, 0],
    picture: "Werewolf.png",
    color: "darkblue"
  }
];

var ALIGNMENTS = [
  {
    name: 'Good'
  },
  {
    name: 'Evil'
  },
  {
    name: 'Vampire'
  },
  {
    name: 'Cult'
  },
  {
    name: 'Neutral'
  },
  {
    name: 'Other'
  },
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
    for (i = 0; i < ALIGNMENTS.length; i++) {
      let ii = i;
      db.collection("alignment").findOne({name: ALIGNMENTS[ii].name}, function (err, iAlignment) {
        if (!iAlignment) {
          db.collection("alignment").insertOne(ALIGNMENTS[ii], function (err, doc) {
            if (!err) {
              console.log('Created Alignment: ' + JSON.stringify(doc.ops[0]));
            }
          });
        }
      });
    }
  }
}