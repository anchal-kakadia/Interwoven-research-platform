import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.schema.js'


export const registerUser = async ({name, username, password, role}) => {
    const uniqueId = uuidv4();

    const user = new User({
        id: uniqueId,
        name,
        username,
        password,
        role
    })

    try {
        await user.save();
        console.info(
            `[mongodb] ✅ User with ${username} registered successfully`
        );
        return user;
    } catch (error) {
        console.error(`[mongodb] 🚨 Error during user registration - ${error}`);

    }
}

export const registerReviewer = async ({name, username, password, role}) => {
    const uniqueId = uuidv4();

    const user = new User({
        id: uniqueId,
        name,
        username,
        password,
        role
    })

    try {
        await user.save();
        console.info(
            `[mongodb] ✅ User with ${username} registered successfully`
        );
        return user;
    } catch (error) {
        console.error(`[mongodb] 🚨 Error during user registration - ${error}`);

    }
}

export const getUser = (filter, projection, options) => {
    return User.findOne(filter, projection, options);
};

