const User = require('../model/User');

const userDao = {
  findByEmail: async (email) => {
    const user = await User.findOne({ email });
    return user;
  },

  findById: async (id) => {
    return await User.findById(id);
  },

  findByResetToken: async (token) => {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
  },

  setResetToken: async (email, token, expires) => {
    return await User.findOneAndUpdate(
      { email },
      {
        $set: {
          resetPasswordToken: token,
          resetPasswordExpires: expires
        }
      },
      { new: true }
    );
  },

  updatePassword: async (userId, hashedPassword) => {
    return await User.updateOne(
      { _id: userId },
      {
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
      }
    );
  },

  create: async (userData) => {
    const newUser = new User(userData);
    try {
      return await newUser.save();
    } catch (error) {
      if (error.code === 11000) {
        const err = new Error()
        err.code = 'USER_EXIST';
        throw err;
      } else {
        console.log(error);
        const err = new Error('Something went wrong while communicating with DB');
        err.code = 'INTERNAL_SERVER_ERROR';
        throw err;
      }
    }
  }
};

module.exports = userDao;