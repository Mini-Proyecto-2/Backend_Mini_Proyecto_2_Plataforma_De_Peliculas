import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ msg: 'Email already in use' });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed, name });
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
}
