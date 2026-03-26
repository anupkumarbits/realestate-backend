import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/admin/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(res, user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Create an admin (Initialization ONLY)
// @route   POST /api/admin/init
// @access  Public
const initAdmin = async (req, res) => {
  // Check if an admin already exists
  const count = await User.countDocuments({});
  if (count > 0) {
    return res.status(400).json({ message: 'Admin already initialized' });
  }

  const { name, email, password } = req.body;

  const user = await User.create({
    name: name || 'Admin',
    email: email || 'admin@realestate.com',
    password: password || '123456',
    role: 'admin',
  });

  if (user) {
    res.status(201).json({
      message: 'Admin user created successfully.',
      email: user.email,
      password: 'As provided or 123456 defaults',
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export { authUser, initAdmin };
