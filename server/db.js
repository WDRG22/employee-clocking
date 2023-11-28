require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri);

const EmployeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String
});

// Hash employee password before saving
EmployeeSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

const WorkEntrySchema = new mongoose.Schema({
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    clockInTime: {
      type: Date,
      required: true
    },
    clockOutTime: Date,
    clockInCoordinates: {
      latitude: Number,
      longitude: Number
    },
    clockInCoordinates: {
      latitude: Number,
      longitude: Number
    },
    clockInLocation: String,
    clockOutLocation: String,
    tasks: [String]
  });

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
});

const Employee = mongoose.model('Employee', EmployeeSchema);
const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
const WorkEntry = mongoose.model('WorkEntry', WorkEntrySchema);

module.exports = {
  Employee,
  RefreshToken,
  WorkEntry,
  connectDb: () => mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
};
