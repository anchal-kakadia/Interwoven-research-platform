import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { config } from "dotenv";
import { registerUser, getUser, registerReviewer } from "../services/user.service.js";
import UniqueLink from '../models/link.schema.js';
import { v4 as UUIDv4 } from 'uuid';

config();

const secretKey = `${process.env.SECRET_KEY}`

export const signIn = async (req, res) => {

    try {
        const { username, password } = req.body.credentials

        const user = await getUser({ username })

        if (!user) {
            res.send('Invalid credentials provided');
            console.error('Invalid credentials provided');
            return;
        } 

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            res.send('Invalid credentials provided');
            console.error('Invalid credentials provided');
            return;
        } 

        const payload = {
            sub: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
        }

        res.send({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: jwt.sign(payload, secretKey, { expiresIn: '24h' })
        })

    } catch (error) {
        console.error(`[Auth] 🚨 SignIn failed: ${error}`)
        res.status(400).send('Invalid credentials provided')
    }
}

export const signUp = async (req, res) => {
    const { username, password, name, email } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    try {

        const userData = await registerUser({
            username,
            password: hashPassword,
            name,
            email,
            role: 'author',
        })

        if (typeof userData === 'string') {
            if (userData.includes(' already exists.')) {
                console.warn(`[Auth] ⚠️ User already exists - ${userData}`);
                return res.status(409).send(userData);
            } else {
                console.error(
                    `[Auth] 🚨 User registration failed - ${userData}`
                );
                return res.status(400).send(userData);
            }
        } else {
            console.info(`✅ User registered successfully: ${username}`);
            res.status(200).send('User registered successfully');
        }
    } catch (error) {
        console.error(`[Auth] 🚨 Error during user registration: ${error}`)
        res.status(400).send('Something went wrong. Please try again.');
    }
}

export const meController = (req, res) => {
    if (!req.user) {
        res.status(400).send('Something went wrong. Please try again.');
    }

    res.json({
        id: req.user.id,
        username: req.user.username,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
    });
};

export const generateLink = async (req, res) => {
    try {
        const token = UUIDv4() // Generate random token
        const uniqueLink = new UniqueLink({ token });
        await uniqueLink.save();
        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const verifyLink = async (req, res) => {
    try {
        const { token } = req.body;

        const uniqueLink = await UniqueLink.findOne({ token });

        if (!uniqueLink) {
            return res.status(404).json({ error: 'Invalid or Used Link' });
        }
        // Mark the link as used
        // uniqueLink.used = true;
        await uniqueLink.save();
        // Delete the entry from the database
        // await UniqueLink.deleteOne({ _id: uniqueLink._id });
        res.status(200).json({ message: 'Link Verified and Deleted Successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const signUpReviewer = async (req,res) => {
    const { username, password, name, email, id } = req.body;

    const uniqueLink = await UniqueLink.findOne({ token : id});

    if(!uniqueLink)
    {
        res.status(500).send("Access denied");
        return;
    }

    await UniqueLink.deleteOne({ _id: uniqueLink._id });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    try {

        const userData = await registerReviewer({
            username,
            password: hashPassword,
            name,
            email,
            role: 'reviewer',
        })

        if (typeof userData === 'string') {
            if (userData.includes(' already exists.')) {
                console.warn(`[Auth] ⚠️ User already exists - ${userData}`);
                return res.status(409).send(userData);
            } else {
                console.error(
                    `[Auth] 🚨 User registration failed - ${userData}`
                );
                return res.status(400).send(userData);
            }
        } else {
            console.info(`✅ User registered successfully: ${username}`);
            res.status(200).send('User registered successfully');
        }
    } catch (error) {
        console.error(`[Auth] 🚨 Error during user registration: ${error}`)
        res.status(400).send('Something went wrong. Please try again.');
    }
}

export const authenticateToken = async (
    req,
    res,
    next
) => {
    try {
        const publicPaths = [
            '/user/summarize'
        ];

        if (publicPaths.includes(req.path)) {
            next();
            return;
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.warn(
                `[Auth] ⚠️ No token provided for protected route: ${req.path}`
            );
            return res.sendStatus(401);
        }

        const payload = jwt.verify(token, secretKey);

        if (!payload) {
            throw new Error('Token verification failed');
        }

        console.info(
            `[Auth] ✅ Token verified successfully for route: ${req.path}`
        );

        req.userAccessToken = payload;

        const user = await getUser(
            { id: payload.sub },
            { password: 0, _id: 0 }
        );

        req.user = user

        next();
    } catch (e) {
        console.error(
            `[Auth] 🚨 Token verification failed for route: ${req.path}, Error: ${e.message}`
        );

        return res.sendStatus(403);
    }
};

export const authenticateTokenGenerateLink = async (
    req,
    res,
    next
) => {
    try {
        const publicPaths = [

        ];

        if (publicPaths.includes(req.path)) {
            next();
            return;
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.warn(
                `[Auth] ⚠️ No token provided for protected route: ${req.path}`
            );
            return res.sendStatus(401);
        }

        const payload = jwt.verify(token, secretKey);

        if (!payload) {
            throw new Error('Token verification failed');
        }

        console.info(
            `[Auth] ✅ Token verified successfully for route: ${req.path}`
        );

        req.userAccessToken = payload;

        const user = await getUser(
            { id: payload.sub },
            { password: 0, _id: 0 }
        );

        if(user.role !== 'superAdmin')
        {
            return res.sendStatus(401).message('You are not authenticated');
        }

        req.user = user

        next();
    } catch (e) {
        console.error(
            `[Auth] 🚨 Token verification failed for route: ${req.path}, Error: ${e.message}`
        );

        return res.sendStatus(403);
    }
};