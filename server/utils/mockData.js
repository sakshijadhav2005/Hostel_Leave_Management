// Mock data store for development without MongoDB
let users = [
  {
    _id: 'rector@example.com',
    name: 'Rector',
    email: 'rector@example.com',
    passwordHash: '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    room_no: 'Office',
    hostel_no: 'H1',
    role: 'rector'
  },
  {
    _id: 'student@example.com',
    name: 'Test Student',
    email: 'student@example.com',
    passwordHash: '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    room_no: '101',
    hostel_no: 'H1',
    role: 'student'
  }
];

let shortLeaves = [];
let longLeaves = [];

const MockUser = {
  findOne: async ({ email }) => users.find(u => u.email === email),
  findById: async (id) => users.find(u => u._id === id),
  find: async (filter = {}) => {
    let result = users;
    if (filter.role) {
      result = result.filter(u => u.role === filter.role);
    }
    return result;
  },
  create: async (userData) => {
    users.push(userData);
    return userData;
  }
};

const MockShortLeave = {
  find: async (filter = {}) => {
    let result = shortLeaves;
    if (filter.student_id) {
      result = result.filter(leave => leave.student_id === filter.student_id);
    }
    return result;
  },
  create: async (data) => {
    const newLeave = { ...data, _id: Date.now().toString() };
    shortLeaves.push(newLeave);
    return newLeave;
  },
  findOneAndUpdate: async (filter, update) => {
    const index = shortLeaves.findIndex(leave => leave._id === filter._id);
    if (index !== -1) {
      shortLeaves[index] = { ...shortLeaves[index], ...update };
      return shortLeaves[index];
    }
    return null;
  }
};

const MockLongLeave = {
  find: async (filter = {}) => {
    let result = longLeaves;
    if (filter.student_id) {
      result = result.filter(leave => leave.student_id === filter.student_id);
    }
    return result;
  },
  create: async (data) => {
    const newLeave = { ...data, _id: Date.now().toString() };
    longLeaves.push(newLeave);
    return newLeave;
  },
  findOneAndUpdate: async (filter, update) => {
    const index = longLeaves.findIndex(leave => leave._id === filter._id);
    if (index !== -1) {
      longLeaves[index] = { ...longLeaves[index], ...update };
      return longLeaves[index];
    }
    return null;
  }
};

module.exports = {
  MockUser,
  MockShortLeave,
  MockLongLeave
};
