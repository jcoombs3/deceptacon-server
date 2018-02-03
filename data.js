var CIRCLES = [
  {
    name: "Paranoia Paradise",
    moderator: null,
    game: null
  },
  {
    name: "Second Room",
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
    color: "darkblue",
    isMod: true,
    isAdmin: true
  },
  {
    firstname: "Villager",
    lastname: "B",
    username: "b",
    fullname: "Villager B",
    pin: [0, 0, 0, 0],
    picture: "Werewolf.png",
    color: "tan",
    isMod: false,
    isAdmin: false
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
    name: 'Villager'
  },
  {
    name: 'Seer'
  },
  {
    name: 'Bodyguard'
  },
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
    name: 'Cupid'
  },
  {
    name: 'The Count'
  },
  {
    name: 'Diseased'
  },
  {
    name: 'Ghost'
  },
  {
    name: 'Hunter'
  },
  {
    name: 'Village Idiot'
  },
  {
    name: 'Insomniac'
  },
  {
    name: 'Lycan'
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
    name: 'Old Hag'
  },
  {
    name: 'Old Man'
  },
  {
    name: 'Private Investigator'
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
    name: 'Spellcaster'
  },
  {
    name: 'Tough Guy'
  },
  {
    name: 'Troublemaker'
  },
  {
    name: 'The Thing'
  },
  {
    name: 'Witch'
  },
  {
    name: 'Cursed (Not Turned)'
  },
  {
    name: 'Leprechaun'
  }
];

var EVIL_ROLES = [
  {
    name: 'Werewolf'
  },
  {
    name: 'Wolf Cub'
  },
  {
    name: 'Minion'
  },
  {
    name: 'Frute Brute'
  },
  {
    name: 'Wolf Man'
  },
  {
    name: 'Sorcerer'
  },
  {
    name: 'Dream Wolf'
  },
  {
    name: 'Lone Wolf'
  },
  {
    name: 'Dire Wolf'
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
  }
];

var CULT_ROLES = [
  {
    name: 'Cult Leader'
  },
  {
    name: 'Cult Initiate'
  }
];

var NEUTRAL_ROLES = [
  {
    name: 'Tanner'
  },
  {
    name: 'The Lovers'
  },
  {
    name: 'Bogeyman'
  },
  {
    name: 'Doppleganger (Not Turned)'
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