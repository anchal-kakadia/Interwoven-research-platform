import User from '../models/user.schema.js'

export const getAllUser = async (req, res) => {

    try {
        const users = await User.find({});
        const userMap = {};
        users.forEach((user) => {
            userMap[user._id] = user;
        });

        res.status(200).send(userMap);
    } catch (error) {
        console.error('[User Controller] Error getting all users: ', error)
        res.status(500).send('🚨 Users retrieval failed');

    }
}

export const getUser = async (req, res) => {
    const { id } = req.body;

    try {
        const user = await User.findOne({ id });
        res.status(200).send(user)
    } catch (error) {
        console.error('[User Controller] Error getting retrieving a user: ', error)
        res.status(500).send('🚨 User retrieval failed');
    }
}

export const updateUser = async (req, res) => {

    const { id, ...updateFields } = req.body

    try {
        const updatedUser = await User.findOneAndUpdate(
            { id: id },
            { $set: updateFields }, // Update only the fields present in updateFields
            { new: true } // To return the updated document
        );

        res.status(200).send(updatedUser);
    } catch (error) {
        console.error('[User Controller] Error getting updating a user: ', error)
        res.status(500).send('🚨 User updation failed');
    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.body;

    try {
        const user = await User.deleteOne({ id });
        return user
    } catch (error) {
        console.error('[User Controller] Error getting retrieving a user: ', error)
        res.status(500).send('🚨 User retrieval failed');
    }
}

export const getAllReviewer = async (req, res) => {

    try {
        const users = await User.find({ role: 'reviewer' });
        res.status(200).send(users);
    } catch (error) {
        console.error('[User Controller] Error getting getting reviewers: ', error)
        res.status(500).send('🚨 User retrieval failed');
    }
}

export const getAllAuthor = async (req,res) => {
    try {
        const users = await User.find({ role: 'author' });
        res.status(200).send(users);
    } catch (error) {
        console.error('[User Controller] Error getting getting authors: ', error)
        res.status(500).send('🚨 User retrieval failed');
    }
}

export const changeRoleToAuthor = async (req, res) => {

    const { userId } = req.body;

    try {

        const response = await User.findOneAndUpdate(
            { id: userId },
            { $set: { role: "author" } },
            { new: true }
        )

        res.status(200).send(response);

    } catch (error) {
        console.error('[User Controller] Error changing role of user: ', error)
        res.status(500).send('🚨 User retrieval failed');
    }

}


