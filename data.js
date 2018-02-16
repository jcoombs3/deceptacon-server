var CIRCLES = [
  {
    name: "Peach A",
    moderator: null,
    game: null,
    type: 0,
  },
  {
    name: "Peach B",
    moderator: null,
    game: null,
    type: 0,
  },
  {
    name: "Dogwood A",
    moderator: null,
    game: null,
    type: 0,
  },
  {
    name: "Dogwood B",
    moderator: null,
    game: null,
    type: 0,
  },
  {
    name: "King",
    moderator: null,
    game: null,
    type: 0,
  },
  {
    name: "Stone Mtn",
    moderator: null,
    game: null,
    type: 0,
  },
  {
    name: "Live Oak",
    moderator: null,
    game: null,
    type: 0,
  },
  {
    name: "Custom 1",
    moderator: null,
    game: null,
    type: 1,
  },
  {
    name: "Custom 2",
    moderator: null,
    game: null,
    type: 1,
  },
  {
    name: "Custom 3",
    moderator: null,
    game: null,
    type: 1,
  },
  {
    name: "Custom 4",
    moderator: null,
    game: null,
    type: 1,
  },
  {
    name: "Custom 5",
    moderator: null,
    game: null,
    type: 1,
  },
  {
    name: "Custom 6",
    moderator: null,
    game: null,
    type: 1,
  },
];

var VILLAGERS = [
  {
    firstname: "John",
    lastname: "Coombs",
    username: "ancientwings",
    fullname: "John Coombs",
    pin: [2, 2, 2, 2],
    picture: "Drunk.png",
    color: "orange",
    isMod: true,
    isAdmin: true
  }
];

var ALIGNMENTS = [
  {
    name: 'Good',
    idx: 0
  },
  {
    name: 'Evil',
    idx: 1
  },
  {
    name: 'Vampire',
    idx: 2
  },
  {
    name: 'Cult',
    idx: 3
  },
  {
    name: 'Neutral',
    idx: 4
  },
  {
    name: 'Other',
    idx: 5
  }
];

var GOOD_ROLES = [
  {
    name: 'Apprentice Seer'
  },
  {
    name: 'Aura Seer'
  },
  {
    name: 'Beholder'
  },
  {
    name: 'Bodyguard'
  },
  {
    name: 'Cupid'
  },
  {
    name: 'Cursed (Not Turned)'
  },
  {
    name: 'Diseased'
  },
  {
    name: 'Doppleganger (Not Turned)'
  },
  {
    name: 'Dr Helgo (Good)'
  },
  {
    name: 'Drunk (Not Turned)'
  },
  {
    name: "Frankenstein's Monster"
  },
  {
    name: 'Ghost'
  },
  {
    name: 'Gunsmith'
  },
  {
    name: 'Hunter'
  },
  {
    name: 'Insomniac'
  },
  {
    name: 'Leprechaun'
  },
  {
    name: 'Lovers (2 Goods)'
  },
  {
    name: 'Lycan'
  },
  {
    name: 'Mad Bomber'
  },
  {
    name: 'Martyr'
  },
  {
    name: 'Mason'
  },
  {
    name: 'Mayor'
  },
  {
    name: 'Mentalist'
  },
  {
    name: 'Mummy'
  },
  {
    name: 'Old Hag'
  },
  {
    name: 'Old Man'
  },
  {
    name: 'Pacifist'
  },
  {
    name: 'Priest'
  },
  {
    name: 'Prince'
  },
  {
    name: 'Private Investigator'
  },
  {
    name: 'Revealer'
  },
  {
    name: 'Seer'
  },
  {
    name: 'Spellcaster'
  },
  {
    name: 'The Count'
  },
  {
    name: 'The Huntress'
  },
  {
    name: 'The Thing'
  },
  {
    name: 'Time Bandit'
  },
  {
    name: 'Tough Guy'
  },
  {
    name: 'Troublemaker'
  },
  {
    name: 'Villager'
  },
  {
    name: 'Villager Idiot'
  },
  {
    name: 'Virginia Wolf'
  },
  {
    name: 'Witch'
  }
];

var EVIL_ROLES = [
  {
    name: 'Alpha Wolf'
  },
  {
    name: 'Big Bad Wolf'
  },
  {
    name: 'Dire Wolf'
  },
  {
    name: 'Dr Helgo (Wolf)'
  },
  {
    name: 'Dream Wolf'
  },
  {
    name: 'Fang Face'
  },
  {
    name: 'Fruit Brute'
  },
  {
    name: 'Lone Wolf'
  },
  {
    name: 'Minion'
  },
  {
    name: 'Sorcerer'
  },
  {
    name: 'Teen Wolf'
  },
  {
    name: 'Werewolf'
  },
  {
    name: 'Wolf Cub'
  },
  {
    name: 'Wolf Man'
  },
  {
    name: 'Wolverine'
  }
];

var VAMPIRE_ROLES = [
  {
    name: 'Vampire'
  },
  {
    name: 'Dracula'
  },
  {
    name: "Dracula's Wife"
  },
  {
    name: "Dr Helgo (Vampire)"
  }
];

var CULT_ROLES = [
  {
    name: 'Cult Leader'
  },
  {
    name: 'Cult Initiate'
  },
  {
    name: "Dr Helgo (Cult)"
  }
];

var NEUTRAL_ROLES = [
  {
    name: 'Tanner'
  },
  {
    name: 'Lovers (1 Good, 1 Evil)'
  },
  {
    name: 'Bogeyman'
  },
  {
    name: 'Drunk (Not Turned)'
  },
  {
    name: 'Hoodlum'
  },
  {
    name: 'Bloody Mary'
  },
  {
    name: 'Chupacabra'
  },
  {
    name: 'Sasquatch'
  },
  {
    name: 'Nostradamus'
  },
  {
    name: 'The Blob'
  },
  {
    name: 'Zombie'
  },
  {
    name: "Dr Helgo (Neutral)"
  }
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
    for (i = 0; i < GOOD_ROLES.length; i++) {
      let ii = i;
      db.collection("role").findOne({name: GOOD_ROLES[ii].name}, function (err, iRole) {
        if (!iRole) {
          db.collection("alignment").findOne({name: 'Good'}, function (err, iAlignment) {
            if (iAlignment) {
              let obj = {
                name: GOOD_ROLES[ii].name,
                alignment: iAlignment._id
              };
              db.collection("role").insertOne(obj, function (err, doc) {
                if (!err) {
                  console.log('Created Good Role: ' + JSON.stringify(doc.ops[0]));
                }
              });
            }
          });
        }
      });
    }
    for (i = 0; i < EVIL_ROLES.length; i++) {
      let ii = i;
      db.collection("role").findOne({name: EVIL_ROLES[ii].name}, function (err, iRole) {
        if (!iRole) {
          db.collection("alignment").findOne({name: 'Evil'}, function (err, iAlignment) {
            if (iAlignment) {
              let obj = {
                name: EVIL_ROLES[ii].name,
                alignment: iAlignment._id
              };
              db.collection("role").insertOne(obj, function (err, doc) {
                if (!err) {
                  console.log('Created Evil Role: ' + JSON.stringify(doc.ops[0]));
                }
              });
            }
          });
        }
      });
    }
    for (i = 0; i < VAMPIRE_ROLES.length; i++) {
      let ii = i;
      db.collection("role").findOne({name: VAMPIRE_ROLES[ii].name}, function (err, iRole) {
        if (!iRole) {
          db.collection("alignment").findOne({name: 'Vampire'}, function (err, iAlignment) {
            if (iAlignment) {
              let obj = {
                name: VAMPIRE_ROLES[ii].name,
                alignment: iAlignment._id
              };
              db.collection("role").insertOne(obj, function (err, doc) {
                if (!err) {
                  console.log('Created Vampire Role: ' + JSON.stringify(doc.ops[0]));
                }
              });
            }
          });
        }
      });
    }
    for (i = 0; i < CULT_ROLES.length; i++) {
      let ii = i;
      db.collection("role").findOne({name: CULT_ROLES[ii].name}, function (err, iRole) {
        if (!iRole) {
          db.collection("alignment").findOne({name: 'Cult'}, function (err, iAlignment) {
            if (iAlignment) {
              let obj = {
                name: CULT_ROLES[ii].name,
                alignment: iAlignment._id
              };
              db.collection("role").insertOne(obj, function (err, doc) {
                if (!err) {
                  console.log('Created Cult Role: ' + JSON.stringify(doc.ops[0]));
                }
              });
            }
          });
        }
      });
    }
    for (i = 0; i < NEUTRAL_ROLES.length; i++) {
      let ii = i;
      db.collection("role").findOne({name: NEUTRAL_ROLES[ii].name}, function (err, iRole) {
        if (!iRole) {
          db.collection("alignment").findOne({name: 'Neutral'}, function (err, iAlignment) {
            if (iAlignment) {
              let obj = {
                name: NEUTRAL_ROLES[ii].name,
                alignment: iAlignment._id
              };
              db.collection("role").insertOne(obj, function (err, doc) {
                if (!err) {
                  console.log('Created Neutral Role: ' + JSON.stringify(doc.ops[0]));
                }
              });
            }
          });
        }
      });
    }
  }
}