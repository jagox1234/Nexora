// Jest manual mock for expo-location
let watchCb;
const removeFn = jest.fn();
module.exports = {
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords:{ latitude:10, longitude:20 }, accuracy:5, timestamp: Date.now() })),
  reverseGeocodeAsync: jest.fn(async () => ([{ city:'TestCity', region:'TestRegion', country:'TC', street:'Main' }])),
  Accuracy: { Balanced:2, Lowest:1 },
  watchPositionAsync: jest.fn(async (_opts, cb) => { watchCb = cb; cb({ coords:{ latitude:10, longitude:20 }, timestamp:Date.now() }); return { remove: removeFn, _highFreq:true, coords:{ latitude:10, longitude:20 } }; }),
  __emit(loc){ if(watchCb) watchCb(loc); },
  __getRemove: () => removeFn,
};
