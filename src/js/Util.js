import agentJSON from '../../build/contracts/Agent.json'
import medHistoryJSON from '../../build/contracts/MedicalHistory.json'

function getAddress(ag) {
  return new Promise((res, rej) => {
    ag.myAddress((err, add) => {
      res(add);

    });
  });
}

function getName(ag) {
  return new Promise((res, rej) => {
    ag.name((err, nm) => {
      res(nm);
    });
  });
}

function getUid(ag) {
  return new Promise((res, rej) => {
    ag.uid((err, ui) => {
      res(ui);
    });
  });
}

function getDid(ag) {
  return new Promise((res, rej) => {
    ag.did((err, di) => {
      res(di);
    });
  });
}

function getAType(ag) {
  return new Promise((res, rej) => {
    ag.aType((err, tp) => {
      res(tp);
    });
  });
}

function getMHistory(ag) {
  return new Promise((res, rej) => {
    ag.mHistory((err, mh) => {
      res(mh);
    });
  });
}

function getHomeAddress(mh) {
  return new Promise((res, rej) => {
    mh.homeAddress((err, ha) => {
      res(ha);
    });
  });
}
function getPhoneNumber(mh) {
  return new Promise((res, rej) => {
    mh.phoneNumber((err, pn) => {
      res(pn);
    });
  });
}

function getHRbyId(mh, i) {
  return new Promise((res, rej) => {
    mh.haemoglobinRecords(i, (err, hr) => {
      res({ i: i, x: hr[1], y: parseFloat(hr[0]) });
    });
  });
}

function getHaemoglobinRecords(mh) {
  return new Promise((res, rej) => {
    var haemoglobinRecords = [];
    var ri = 1;
    mh.haemoglobinRecordsCount((err, hrc) => {
      if (hrc == 0) {
        res(haemoglobinRecords);
      }
      for (var i = 1; i <= hrc; i++) {
        getHRbyId(mh, i).then((ar) => {
          haemoglobinRecords = [...haemoglobinRecords, ar]
          if (haemoglobinRecords.length == hrc) {
            haemoglobinRecords = haemoglobinRecords.sort((a, b) => a.i - b.i)
            res(haemoglobinRecords)
          }
        });
      }
    });
  });
}

export function getDataByPrivacy(privacy, data) {
  return new Promise((res, rej) => {
    if (data.length == 0) { res(data) }
    switch (privacy) {
      case "fal": {
        var aData = [];
        var i = 0;
        data.forEach(element => {
          var rn = Math.random();
          if (rn > 0.5) {
            aData.push({ x: element.x, y: element.y + 3 * rn })
          } else {
            aData.push({ x: element.x, y: element.y - 3 * rn })
          }
          i++;
          if (i == data.length) {
            res(aData)
          }
        });
        break;
      }
      case "rg": {
        var i = 0;
        var aData = [];
        data.forEach(element => {
          if (element.y > 18) {
            aData.push({ x: element.x, y: "High" })
          } else if (element.y > 12) {
            aData.push({ x: element.x, y: "Normal" })
          } else {
            aData.push({ x: element.x, y: "Low" })
          }
          i++;
          if (i == data.length) {
            res(aData)
          }
        });
        break;
      }
      case "pl": {
        var aData = [];
        for (var i = data.length - 4; i < data.length; i++) {
          aData.push({ x: data[i].x, y: data[i].y })
          if (aData.length == 4) {
            res(aData)
          }
        }

        break;
      }
      case "tr": {

        var i = 0;
        var aData = [];
        var avg = 0;
        var sd = 0;
        data.forEach(element => {
          avg += element.y;
          i++;
          if (i == data.length) {
            avg = avg / data.length;
            var sum = 0;
            var i2 = 0;
            data.forEach(element2 => {
              i2++;
              sum += Math.pow(element2.y - avg, 2);
              if (i2 == data.length) {
                sd = Math.sqrt(sum / (data.length - 1));
                res([{ x: "AVG-σ", y: avg - sd }, { x: "AVG", y: avg }, { x: "AVG+σ", y: avg + sd }])
              }
            })
          }
        });
        break;
      }
      default: {
        res(data)
        break;
      }
    }
  });
}



export function getMHistoryData(web3, mhAddress) {
  return new Promise((res, rej) => {
    let mh = web3.eth.contract(medHistoryJSON.abi).at(mhAddress);
    var name = "";
    var homeAddress = "";
    var phoneNumber = "";
    var haemoglobinRecords = [];
    getName(mh).then((nm) => {
      name = nm;
      getHomeAddress(mh).then((ha) => {
        homeAddress = ha;
        getPhoneNumber(mh).then((pn) => {
          phoneNumber = pn;
          getHaemoglobinRecords(mh).then((hr) => {
            haemoglobinRecords = hr;
            res({
              name: name,
              homeAddress: homeAddress,
              phoneNumber: phoneNumber,
              haemoglobinRecords: haemoglobinRecords
            })
          });
        });
      });
    });;

  });
}

export function addHaemoglobinRecord(web3, mhAddress, val, dt, ot, ow) {
  return new Promise((res, rej) => {
    let mh = web3.eth.contract(medHistoryJSON.abi).at(mhAddress);
    mh.addHaemoglobinRecord(val, dt, ow, ot, { from: ot }, function (error, result) {
      if (!error)
        res(true)
      else
        res(false)
    });
  });
}

export function SetMHistoryAll(web3, mhAddress, nm, ha, pn, ot, ow) {
  return new Promise((res, rej) => {
    let mh = web3.eth.contract(medHistoryJSON.abi).at(mhAddress);
    mh.setAll(nm, ha, pn, ow, ot, { from: ot }, function (error, result) {
      if (!error)
        res(true)
      else
        res(false)
    });
  });
}

function getAgentById(platformInstance, i) {
  return new Promise((res, rej) => {
    platformInstance.agents(i).then((agent) => {
      let ag = web3.eth.contract(agentJSON.abi).at(agent);
      getAddress(ag).then((address) => {
        getName(ag).then((name) => {
          getUid(ag).then((uid) => {
            getDid(ag).then((did) => {
              getAType(ag).then((aType) => {
                getMHistory(ag).then((mh) => {
                  var agentArray = {
                    i: i,
                    address: address,
                    name: name,
                    uid: uid,
                    did: did,
                    aType: aType,
                    mHistory: mh
                  };
                  res(agentArray)
                });
              });
            });
          });
        });
      });
    });
  })
}

export function getAgents(platformInstance, web3) {
  return new Promise((res, rej) => {

    platformInstance.agentsCount().then((aCount) => {
      var list = [];
      if (aCount == 0) { res(list) }
      for (var i = 1; i <= aCount; i++) {
        getAgentById(platformInstance, i).then((agent) => {
          list = [...list, agent]
          if (list.length == aCount) {
            list = list.sort((a, b) => a.i - b.i)
            var filtered = list.filter(function (item) {
              return item.aType == "pt";
            });
            res(filtered)
          }
        })
      }
    })
  });
}

export function getAgentByUID(platformInstance, web3, userId) {
  return new Promise((res, rej) => {
    platformInstance.agentsCount().then(async (aCount) => {
      for (var i = 1; i <= aCount; i++) {
        platformInstance.agents(i).then((agent) => {
          let ag = web3.eth.contract(agentJSON.abi).at(agent);
          getAddress(ag).then((address) => {
            getName(ag).then((name) => {
              getUid(ag).then((uid) => {
                getDid(ag).then((did) => {
                  getAType(ag).then((aType) => {
                    getMHistory(ag).then((mh) => {
                      var agentArray = {
                        address: address,
                        name: name,
                        uid: uid,
                        did: did,
                        aType: aType,
                        mHistory: mh
                      };
                      if (userId == uid) {
                        res(agentArray)
                      }
                    });
                  });
                });
              });
            });
          });
        });
      }
    })
  });

}

export function setMedHistory(platformInstance, web3, userAddress, nm, ha, pn, account) {
  platformInstance.agentsCount().then((aCount) => {
    for (var i = 1; i <= aCount; i++) {
      platformInstance.agents(i).then((agent) => {
        let ag = web3.eth.contract(agentJSON.abi).at(agent);

        getAddress(ag).then((ad) => {
          if (ad == userAddress) {
            ag.setMedHistory(nm, ha, pn, { from: account }, () => {
              i = account + 1;
            });

          }
        });

      });
    }
  })
}

export function getAgentByAddress(platformInstance, web3, userAddress) {
  return new Promise((res, rej) => {
    platformInstance.agentsCount().then((aCount) => {

      for (var i = 1; i <= aCount; i++) {
        platformInstance.agents(i).then((agent) => {
          let ag = web3.eth.contract(agentJSON.abi).at(agent);
          getAddress(ag).then((address) => {
            getName(ag).then((name) => {
              getUid(ag).then((uid) => {
                getDid(ag).then((did) => {
                  getAType(ag).then((aType) => {
                    getMHistory(ag).then((mh) => {
                      var agentArray = {
                        address: address,
                        name: name,
                        uid: uid,
                        did: did,
                        aType: aType,
                        mHistory: mh
                      };
                      if (userAddress == address) {
                        res(agentArray)
                      }
                    });
                  });
                });
              });
            });
          });
        });
      }
    })
  });

}

export function getPatientsDoctors(platformInstance, web3) {
  return new Promise((res, rej) => {

    platformInstance.agentsCount().then(async (aCount) => {

      var pList = [];
      var dList = [];
      var id = 1;
      var pCont = 1;
      var dCont = 1;
      for (var i = 1; i <= aCount; i++) {
        var agent = await platformInstance.agents(i);
        let ag = web3.eth.contract(agentJSON.abi).at(agent);
        var address = await getAddress(ag);
        var name = await getName(ag);
        var uid = await getUid(ag);
        var did = await getDid(ag);
        var aType = await getAType(ag);
        var rs = await getFamilyDoctorRelationship(platformInstance, address);
        var agentArray = {
          id: aType == "pt" ? pCont : dCont,
          address: address,
          name: name,
          uid: uid,
          did: did,
          aType: aType,
          fdAddress: rs == null ? null : rs.other
        };
        if (aType == "pt") {
          pList = [...pList, agentArray];
          pCont++;
        } else if (aType == "dc") {
          dList = [...dList, agentArray];
          dCont++;
        }
        if (id == aCount) {
          var fn = { patients: pList, doctors: dList }
          res(fn);
        }
        id++;
      }
    });
  });
}

function getRelationshipById(platformInstance, i) {
  return new Promise((res, rej) => {
    platformInstance.relationships(i).then((relationship) => {
      res({
        id: i,
        patient: relationship[0],
        other: relationship[1],
        access: relationship[2],
        type: relationship[3],
        active: relationship[4]
      })
    });
  })
}



export function getRelationships(platformInstance, tp, accountAdd) {
  return new Promise((res, rej) => {
    platformInstance.relationshipsCount().then(async (rCount) => {
      var list = [];
      if (rCount == 0) res([])
      var id = 0;
      for (var i = 1; i <= rCount; i++) {
        getRelationshipById(platformInstance, i).then((rs) => {
          id++;
          var add = tp == "pt" ? rs.patient : rs.other;
          if (add == accountAdd) {
            list = [...list, rs]
          }
          if (id == rCount) {
            list = list.sort((a, b) => a.id - b.id)
            res(list)
          }
        })
      }
    })
  });
}

export function getFamilyDoctorRelationship(platformInstance, pt) {
  return new Promise((res, rej) => {
    platformInstance.relationshipsCount().then(async (rCount) => {
      if (rCount == 0) {
        res(null);
      }
      var id = 0;
      for (var i = 1; i <= rCount; i++) {

        getRelationshipById(platformInstance, i).then((relationship) => {
          id++;
          if (pt == relationship.patient && relationship.type == "fd") {
            res(relationship)
          }
          if (id == rCount) {
            res(null)
          }
        })
      }
    })
  });
}

export function getRelationshipByAddresses(platformInstance, pt, ot) {
  return new Promise((res, rej) => {
    platformInstance.relationshipsCount().then(async (rCount) => {
      if (rCount == 0) {
        res(null);
      }
      var id = 0;
      for (var i = 1; i <= rCount; i++) {
        getRelationshipById(platformInstance, i).then((relationship) => {
          id++;
          if (pt == relationship.patient && ot == relationship.other) {
            res(relationship)
          }
          if (id == rCount) {
            res(null)
          }

        })

      }
    })
  });
}

export function getRelationshipByAddressesNFD(platformInstance, pt, ot) {
  return new Promise((res, rej) => {

    platformInstance.relationshipsCount().then(async (rCount) => {
      if (rCount == 0) {
        res(null);
      }
      var id = 0;
      for (var i = 1; i <= rCount; i++) {
        getRelationshipById(platformInstance, i).then((relationship) => {
          id++;
          if (pt == relationship.patient && ot == relationship.other && relationship.type == "nm") {
            res(relationship)
          }
          if (id == rCount) {
            res(null)
          }

        })

      }

    })
  });
}

export function relationshipSent(platformInstance, pt, ot) {
  return new Promise((res, rej) => {
    platformInstance.relationshipsCount().then(async (rCount) => {
      var id = 0;
      if (rCount == 0) res(false)
      for (var i = 1; i <= rCount; i++) {
        platformInstance.relationships(i).then((relationship) => {
          id++;
          if (pt == relationship[0] && ot == relationship[1]) {
            res(true);
          }
          if (id == rCount) {
            res(false)
          }
        });
      }
    })
  });
}



export function deleteRelationship(platformInstance, rId) {
  platformInstance.deleteRelationship(rId);
}

require("@babel/polyfill");