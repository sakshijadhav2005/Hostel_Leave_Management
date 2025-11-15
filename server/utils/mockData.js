// Mock data removed — this file intentionally exports empty stubs.
// All real data should come from MongoDB via Mongoose models.
// If any part of the code imports these mocks, it will now receive
// harmless no-op functions that return empty results.

module.exports = {
  MockUser: {
    findOne: async () => null,
    findById: async () => null,
    find: async () => [],
    create: async () => null,
  },
  MockShortLeave: {
    find: async () => [],
    create: async () => null,
    findOneAndUpdate: async () => null,
  },
  MockLongLeave: {
    find: async () => [],
    create: async () => null,
    findOneAndUpdate: async () => null,
  }
};
