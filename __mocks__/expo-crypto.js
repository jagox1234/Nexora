// Jest manual mock for expo-crypto
module.exports = {
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: async (_alg, val) => 'hash_'+val,
};
