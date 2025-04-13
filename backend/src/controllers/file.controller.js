import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.schema.js';
import { PDFDocument } from 'pdf-lib';
import nlp from 'compromise';
import * as fuzz from 'fuzzball';


export const createFile = async (req, res) => {

    const { id, author_name, description } = req.body
    const { file } = req
    const uniqueId = uuidv4();

    const newFileData = {
        file_id: uniqueId,
        file_name: file.originalname,
        file_description: description,
        file_data: file.buffer,
        status: 'pending',
        author: author_name,
        authorId: req.user.id,
        reviewers: []
    };

    try {
        const updatedUser = await User.findOneAndUpdate(
            { id: req.user.id },
            { $push: { files: newFileData } },
            { new: true })

        const updatedAdmin = await User.findOneAndUpdate(
            {
                role: "superAdmin"
            },
            {
                $push: {
                    files: newFileData
                }
            },
            {
                new: true
            }
        );

        res.status(200).send(updatedUser);
    } catch (error) {
        console.error('[File Controller] Error creating a file: ', error)
        res.status(500).send('🚨 File updation failed');
    }

}

export const deleteFile = async (req, res) => {

    try {

        const { file_id } = req.body;

        const admin = await User.findOne({ role: 'superAdmin' })

        const response = await User.findOneAndUpdate(
            {
                id: req.user.id
            },
            {
                $pull: {
                    files: {
                        file_id: file_id
                    }
                }
            },
            { new: true }
        )

        const response2 = await User.findOneAndUpdate(
            {
                id: admin.id
            },
            {
                $pull: {
                    files: {
                        file_id: file_id
                    }
                }
            },
            { new: true }
        )

        res.status(200).send(response);

    } catch (error) {
        console.error('[File Controller] Error deleting a file: ', error)
        res.status(500).send('🚨 File deletion failed');
    }

}

export const getFileWithStatus = async (req, res) => {

    try {
        // const response = await User.aggregate([
        //     {
        //         $match: {
        //             id: req.user.id,
        //             "files.status": "reviewed"
        //         }
        //     },
        //     {
        //         $unwind: "$files"
        //     },
        //     {
        //         $match: {
        //             "files.status": "reviewed"
        //         }
        //     },
        //     {
        //         $project: {
        //             "files.status": 1,
        //             "files.file_id": 1,
        //             "files.file_name": 1,
        //             "files.file_data": 1,
        //             "files.file_description": 1,
        //             "files.author": 1,
        //             "files.authorId": 1
        //         }
        //     }
        // ]);

        const response = await User.aggregate([
            {
                $match: {
                    id: req.user.id,
                    "files.status": { $in: ["reviewed", "rejected"] }
                }
            },
            {
                $unwind: "$files"
            },
            {
                $match: {
                    "files.status": { $in: ["reviewed", "rejected"] }
                }
            },
            {
                $project: {
                    "files.status": 1,
                    "files.file_id": 1,
                    "files.file_name": 1,
                    "files.file_data": 1,
                    "files.file_description": 1,
                    "files.author": 1,
                    "files.authorId": 1,
                    "files.reason": 1,
                    "files.reviews": 1
                }
            }
        ]);

        res.status(200).send(response);

    } catch (error) {
        console.error('[File Controller] Error getting a file with status: ', error)
        res.status(500).send('🚨 File retrieval failed');
    }
}

export const getFile = async (req, res) => {
    try {
        const file_id = req.params.fileId;

        const file = await User.findOne(
            {
                id: req.user.id,
                files: {
                    $elemMatch: {
                        file_id: file_id
                    }
                }
            },
            {
                files: {
                    $elemMatch: {
                        file_id: file_id
                    }
                }
            }
        )

        console.log(file.files[0].file_data)

        const bytes = Uint8Array.from(Buffer.from(file.files[0].file_data, 'base64'));
        console.log(bytes)
        const pdfDoc = await PDFDocument.load(bytes);
        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error fetching PDF:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getAllFiles = async (req, res) => {
    try {
        // const user = await User.findOne({ id: req.user.id });
        const user = await User.aggregate([
            {
                $match: {
                    id: req.user.id
                }
            },
            {
                $unwind: "$files"
            },
            {
                $match: {
                    "files.status": { $nin: ["rejected", "reviewed"] }
                }
            },
            {
                $project: {
                    "files.status": 1,
                    "files.file_id": 1,
                    "files.file_name": 1,
                    "files.file_data": 1,
                    "files.file_description": 1,
                    "files.author": 1,
                    "files.authorId": 1,
                }
            }
        ]);

        res.status(200).send(user);
    } catch (error) {
        console.error('[File Controller] Error getting all files:', error);
        res.status(500).send('🚨 Files retrieval failed');
    }
}

export const getFilesReviewer = async (req, res) => {
    try {
        // const user = await User.findOne({ id: req.user.id });
        const user = await User.aggregate([
            {
                $match: {
                    id: req.user.id
                }
            },
            {
                $unwind: "$files"
            },
            {
                $match: {
                    "files.status": { $nin: ["rejected", "reviewed"] }
                }
            },
            {
                $project: {
                    "files.status": 1,
                    "files.file_id": 1,
                    "files.file_name": 1,
                    "files.file_data": 1,
                    "files.file_description": 1,
                    "files.reviewers": 1,
                }
            }
        ]);

        res.status(200).send(user);
    } catch (error) {
        console.error('[File Controller] Error getting all files:', error);
        res.status(500).send('🚨 Files retrieval failed');
    }
}

export const getAdminReviewFiles = async (req, res) => {
    try {
        // const user = await User.findOne({ id: req.user.id });
        const user = await User.aggregate([
            {
                $match: {
                    id: req.user.id
                }
            },
            {
                $unwind: "$files"
            },
            {
                $match: {
                    "files.status": { $nin: ["rejected", "reviewed", "inreview", "pending"] }
                }
            },
            {
                $project: {
                    "files.status": 1,
                    "files.file_id": 1,
                    "files.file_name": 1,
                    "files.file_data": 1,
                    "files.file_description": 1,
                    "files.reviewers": 1,
                    "files.authorId": 1
                }
            }
        ]);

        res.status(200).send(user);
    } catch (error) {
        console.error('[File Controller] Error getting all files:', error);
        res.status(500).send('🚨 Files retrieval failed');
    }
}

export const getFilesAdmin = async (req, res) => {
    try {
        // const user = await User.findOne({ id: req.user.id });
        const user = await User.aggregate([
            {
                $match: {
                    id: req.user.id
                }
            },
            {
                $unwind: "$files"
            },
            {
                $match: {
                    "files.status": { $nin: ["rejected", "reviewed", "inreview", "accepted", "adminReview"] }
                }
            },
            {
                $project: {
                    "files.status": 1,
                    "files.file_id": 1,
                    "files.file_name": 1,
                    "files.file_data": 1,
                    "files.file_description": 1,
                    "files.author": 1,
                    "files.authorId": 1,
                }
            }
        ]);

        res.status(200).send(user);
    } catch (error) {
        console.error('[File Controller] Error getting all files:', error);
        res.status(500).send('🚨 Files retrieval failed');
    }
}

export const getFilesAcceptedAdmin = async (req, res) => {
    try {
        // const user = await User.findOne({ id: req.user.id });
        const user = await User.aggregate([
            {
                $match: {
                    id: req.user.id
                }
            },
            {
                $unwind: "$files"
            },
            {
                $match: {
                    "files.status": { $in: ["accepted"] }
                }
            },
            {
                $project: {
                    "files.status": 1,
                    "files.file_id": 1,
                    "files.file_name": 1,
                    "files.file_data": 1,
                    "files.file_description": 1,
                    "files.author": 1,
                    "files.authorId": 1,
                }
            }
        ]);

        res.status(200).send(user);
    } catch (error) {
        console.error('[File Controller] Error getting all files:', error);
        res.status(500).send('🚨 Files retrieval failed');
    }
}

export const getFilesInReviewAdmin = async (req, res) => {
    try {
        // const user = await User.findOne({ id: req.user.id });
        const user = await User.aggregate([
            {
                $match: {
                    id: req.user.id
                }
            },
            {
                $unwind: "$files"
            },
            {
                $match: {
                    "files.status": { $nin: ["rejected", "reviewed", "pending", "adminReview"] }
                }
            },
            {
                $project: {
                    "files.status": 1,
                    "files.file_id": 1,
                    "files.file_name": 1,
                    "files.file_data": 1,
                    "files.file_description": 1,
                    "files.author": 1,
                    "files.authorId": 1,
                    "files.reviewers": 1
                }
            }
        ]);

        res.status(200).send(user);
    } catch (error) {
        console.error('[File Controller] Error getting all files:', error);
        res.status(500).send('🚨 Files retrieval failed');
    }
}

export const updateFile = async (req, res) => {

    const { id, file_id } = req.body;
    const { file } = req;

    const updatedFileData = file.buffer;

    try {
        const user = await User.findOne({
            id: id,
            'files': {
                $elemMatch: {
                    file_id: file_id,
                    status: 'pending'
                }
            }
        });

        if (!user) {
            console.error('User or file not found or file status is not pending');
            res.status(404).send('User or file not found or file status is not pending');
            return;
        }

        const updatedUser = await User.findOneAndUpdate(
            {
                id: id,
                'files.file_id': file_id
            },
            { $set: { 'files.$.file_data': updatedFileData } },
            { new: true }
        );

        res.status(200).send(updatedUser);
    } catch (error) {
        console.error('[File Controller] Error updating a file:', error);
        res.status(500).send('🚨 File updation failed');
    }
}

export const updateFileDetails = async (req, res) => {

    try {
        const { file_id, updatedName, updatedDescription } = req.body;

        const updateQuery = {};

        // Check if newName is provided
        if (updatedName) {
            updateQuery["files.$.file_name"] = updatedName;
        }

        // Check if newDescription is provided
        if (updatedDescription) {
            updateQuery["files.$.file_description"] = updatedDescription;
        }

        const admin = await User.findOne({ role: 'superAdmin' })

        const updatedFile = await User.findOneAndUpdate(
            {
                id: req.user.id,
                "files.file_id": file_id
            },
            {
                $set: updateQuery
            },
            { new: true }
        )

        const updatedFile2 = await User.findOneAndUpdate(
            {
                id: admin.id,
                "files.file_id": file_id
            },
            {
                $set: updateQuery
            },
            { new: true }
        )

        res.status(200).send(updatedFile);

    } catch (error) {
        console.error('[File Controller] Error updating a file:: ', error)
        res.status(500).send('🚨 File updation failed');
    }

}

export const setFileStatus = async (req, res) => {


    try {

        const { file_id, author_id, status } = req.body;

        const updatedAdmin = await User.findOneAndUpdate(
            {
                id: req.user.id,
                "files.file_id": file_id
            },
            {
                $set: {
                    "files.$.status": status
                }
            },
            {
                new: true
            }
        );

        const updatedUser = await User.findOneAndUpdate(
            {
                id: author_id,
                "files.file_id": file_id
            },
            {
                $set: {
                    "files.$.status": status
                }
            },
            {
                new: true
            }
        );

        res.status(200).send('File status updated successfully');

    } catch (error) {
        console.error('[File Controller] Error setting file status: ', error)
        res.status(500).send('🚨 File updation failed');
    }

}

export const setRejectFileStatus = async (req, res) => {

    try {
        const { file_id, author_id, status, reason } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            {
                id: author_id,
                "files.file_id": file_id
            },
            {
                $set: {
                    "files.$.status": status,
                    "files.$.reason": reason
                }
            },
            {
                new: true
            }
        );

        const response = await User.findOneAndUpdate(
            {
                id: req.user.id
            },
            {
                $pull: {
                    files: {
                        file_id: file_id
                    }
                }
            },
            { new: true }
        )
        res.status(200).send('File rejected successfully');

    } catch (error) {
        console.error('[File Controller] Error setting file status: ', error)
        res.status(500).send('🚨 File updation failed');
    }
}

const createReviewDetails = async (userId, file_id) => {

    const user = await User.findOne({ id: userId });

    return {
        id: userId,
        name: user.name,
        file_id: file_id,
        comments: []
    };
};

export const assignFiles = async (req, res) => {

    try {

        const { file_id, userIds } = req.body

        const admin = await User.findOne({ role: 'superAdmin' })

        await User.findOneAndUpdate(
            {
                id: req.user.id,
                "files.file_id": file_id
            },
            {
                $set: {
                    "files.$.status": "inreview"
                }
            },
            {
                new: true
            }
        )

        const fileDetails = await User.aggregate([
            {
                $match: {
                    id: req.user.id,
                    "files.file_id": file_id
                }
            },
            {
                $unwind: "$files"
            },
            {
                $match: {
                    "files.file_id": file_id
                }
            },
            {
                $project: {
                    "files.status": 1,
                    "files.file_id": 1,
                    "files.file_name": 1,
                    "files.file_data": 1,
                    "files.file_description": 1,
                    "files.reviewers": 1
                }
            }
        ])


        const promises = userIds.map(userId => {
            return User.findOneAndUpdate(
                { id: userId },
                { $push: { files: fileDetails[0].files } },
                { new: true }
            );
        });

        await Promise.all(promises)


        userIds.forEach(async userId => {
            try {
                const reviewDetails = await createReviewDetails(userId, file_id); // Construct reviewDetails dynamically
                const updatedReviewer = await User.findOneAndUpdate(
                    {
                        id: userId,
                        "files.file_id": file_id
                    },
                    {
                        $push: {
                            "files.$.reviewers": reviewDetails
                        }
                    },
                    {
                        new: true
                    }
                );
                const updatedUser = await User.findOneAndUpdate(
                    {
                        id: req.user.id,
                        "files.file_id": file_id
                    },
                    {
                        $push: {
                            "files.$.reviewers": reviewDetails
                        }
                    },
                    {
                        new: true
                    }
                );

                console.log(updatedUser)
                if (updatedUser) {
                    console.log(`Review details added successfully for user ${userId}`);
                } else {
                    console.log(`User ${userId} or file not found for the given fileId.`);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });

        res.status(200).send('Files assigned successfully');

    } catch (error) {
        console.error('[File Controller] Error assigning files: ', error)
        res.status(500).send('🚨 File updation failed');
    }

}

export const addReview = async (req, res) => {
    const { file_id, review_id, review } = req.body;

    const newComment = {
        id: uuidv4(),
        review: review
    };

    try {
        const updatedUser = await User.findOneAndUpdate(
            {
                id: req.user.id,
                'files': {
                    $elemMatch: {
                        file_id: file_id,
                        'reviewers.id': review_id
                    }
                }
            },
            { $push: { 'files.$[file].reviewers.$[reviewer].comments': newComment } },
            {
                new: true,
                arrayFilters: [
                    { 'file.file_id': file_id },
                    { 'reviewer.id': review_id }
                ]
            }
        );

        // const updatedUser = await User.findOneAndUpdate(
        //     {
        //         id: req.user.id,
        //         "files.file_id": file_id
        //     },
        //     {
        //         $push: {
        //             "files.$.reviewers": reviewDetails
        //         }
        //     },
        //     {
        //         new: true
        //     }
        // )

        res.status(200).send(updatedUser);
    } catch (error) {
        console.error('[User Controller] Error getting adding a comment: ', error)
        res.status(500).send('🚨 File updation failed');
    }
}

function sanitizeText(text, authorName) {

    // Fuzzy matching options
    const options = {
        scorer: fuzz.token_set_ratio,
        processor: fuzz.full_process,
        cutoff: 80 // Adjust as needed based on your requirements
    };

    // Find potential matches for the author's name in the text
    const matches = fuzz.extract(authorName, [text], options);

    if (matches.length === 0) {
        console.log("No potential matches found for the author's name.");
        return text;
    }

    // Construct regex pattern to specifically target occurrences of the author's name
    const authorRegex = new RegExp('\\b' + authorName + '\\b', 'gi');

    // Replace occurrences of the author's name with '[REDACTED_AUTHOR]'
    text = text.replace(authorRegex, '[REDACTED_AUTHOR]');

    // Regex for phone number matching
    const phoneRegex = /(?:\+\d{1,3}\s*)?(?:\d{10}|\d{2}\s?\d{8}|\d{3}[-.]?\d{3}[-.]?\d{4})\b/g;

    // Replace phone numbers with placeholders
    text = text.replace(phoneRegex, '[REDACTED_PHONE]');

    // Tokenize the text
    const doc = nlp(text);

    // Arrays to store identified personal information
    const redactedNames = [];
    const redactedEmails = [];
    const redactedPhones = [];

    // Identify and redact or replace entities
    doc.people().forEach(person => {
        const name = person.out('text');
        // Check if the identified name matches the author's name
        if (fuzz.token_set_ratio(name.toLowerCase(), authorName.toLowerCase()) < 80) {
            redactedNames.push(name);
            text = text.replace(new RegExp(name, 'gi'), '[REDACTED_NAME]');
        }
    });

    // Regex for email matching
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    // Replace emails with placeholders
    text = text.replace(emailRegex, '[REDACTED_EMAIL]');
    return text;
}

export const sendReview = async (req, res) => {

    try {

        const { file_id, reviewDetails } = req.body;

        const admin = await User.findOne({ role: 'superAdmin' })

        const promises = reviewDetails.map((item, index) => {

            // console.log(sanitizeText(item.review, req.user.name))
            return User.findOneAndUpdate(
                {
                    id: admin.id,
                    "files.file_id": file_id,
                    "files.reviewers.id": req.user.id
                },
                {
                    $push: {
                        "files.$[file].reviewers.$[reviewer].comments": { id: uuidv4(), review: sanitizeText(item.review, req.user.name) }
                    },
                    $set: {
                        "files.$[file].status": "adminReview"
                    }
                },
                {
                    new: true,
                    arrayFilters: [
                        { "file.file_id": file_id },
                        { "reviewer.id": req.user.id }
                    ]
                }
            )
        });

        const reviewer = await User.findOneAndUpdate(
            {
                id: req.user.id
            },
            {
                $pull: {
                    files: { file_id: file_id } // Remove the file with the specified fileIdToDelete
                }
            },
            {
                new: true
            }
        )

        // const response = await User.findOneAndUpdate(
        //     {
        //       id: admin.id,
        //       "files.file_id": file_id,
        //       "files.reviewers.id": req.user.id
        //     },
        //     {
        //       $push: {
        //         "files.$[file].reviewers.$[reviewer].comments": reviewDetails
        //       },
        //       $set: {
        //         "files.$[file].status": "adminReview"
        //       }
        //     },
        //     {
        //       new: true,
        //       arrayFilters: [
        //         { "file.file_id": file_id },
        //         { "reviewer.id": req.user.id }
        //       ]
        //     }
        //   )

        await Promise.all(promises);

        res.status(200).send("review sent successfully");

    } catch (error) {
        console.error('[User Controller] Error getting sending reviews: ', error)
        res.status(500).send('🚨 File updation failed');
    }
}

export const approveReview = async (req, res) => {

    const { file_id, author_id, reviewObject } = req.body;

    try {
        const admin = await User.findOne({ role: 'superAdmin' })

        await User.findOneAndUpdate(
            { id: admin.id, "files.file_id": file_id },
            {
                $set: { "files.$.status": "reviewed" }
            },
            { new: true }
        )

        const response = await User.findOneAndUpdate(
            { id: author_id, "files.file_id": file_id },
            {
                $push: { "files.$.reviews": reviewObject },
                $set: { "files.$.status": "reviewed" }
            },
            { new: true }
        )
        res.status(200).send("review sent successfully");

    } catch (error) {
        console.error('[Files Controller] Error getting sending approved reviews: ', error)
        res.status(500).send('🚨 File updation failed');
    }

}

export const editReviewerReview = async (req, res) => {
    try {
        const { fileId, reviewerId, updatedReviewData } = req.body;

        // await User.findOneAndUpdate(
        //     {
        //         id: req.user.id,
        //         "files.file_id": fileId,
        //         "files.reviewers.id": reviewId
        //     },
        //     {
        //         $set: {
        //             "files.$[file].reviewers.$[review].review": updatedReviewData.review
        //         }
        //     },
        //     {
        //         new: true,
        //         arrayFilters: [
        //             { "file.file_id": fileId },
        //             { "review.id": reviewId },
        //         ]
        //     }
        // )

        await User.findOneAndUpdate(
            {
                id: req.user.id,
                "files.file_id": fileId,
                "files.reviewers.id": reviewerId,
                "files.reviewers.comments.id": updatedReviewData.id
            },
            {
                $set: {
                    "files.$[file].reviewers.$[reviewer].comments.$[comment].review": updatedReviewData.review
                }
            },
            {
                new: true,
                arrayFilters: [
                    { "file.file_id": fileId },
                    { "reviewer.id": reviewerId },
                    { "comment.id": updatedReviewData.id }
                ]
            }
        );

        res.status(200).send("Review updated successfully")
    } catch (error) {
        console.error('[Files Controller] Error editing the review : ', error)
        res.status(500).send('🚨 File updation failed');
    }
}

export const deleteReviewerReview = async (req, res) => {
    try {
        const { fileId, reviewId, reviewerId } = req.body;

        // await User.findOneAndUpdate(
        //     {
        //         id: req.user.id,
        //         "files.file_id": fileId
        //     },
        //     {
        //         $pull: {
        //             "files.$.reviewers": { id: reviewId } // Delete the reviewer object with the specified ID
        //         }
        //     },
        //     {
        //         new: true
        //     }
        // )

        await User.findOneAndUpdate(
            {
                id: req.user.id,
                "files.file_id": fileId,
                "files.reviewers.id": reviewerId
            },
            {
                $pull: {
                    "files.$[file].reviewers.$[reviewer].comments": { id: reviewId }
                }
            },
            {
                new: true,
                arrayFilters: [
                    { "file.file_id": fileId },
                    { "reviewer.id": reviewerId }
                ]
            }
        );

        res.status(200).send("Review updated successfully")
    } catch (error) {
        console.error('[Files Controller] Error editing the review : ', error)
        res.status(500).send('🚨 File updation failed');
    }


}

export const editAdminReviewerReview = async (req, res) => {

    try {

        const { fileId, reviewerId, reviewId, review } = req.body;

        const data = await User.findOneAndUpdate(
            {
                id: req.user.id,
                "files.file_id": fileId,
                "files.reviewers.id": reviewerId,
                "files.reviewers.comments.id": reviewId
            },
            {
                $set: {
                    "files.$[file].reviewers.$[reviewer].comments.$[comment].review": review
                }
            },
            {
                new: true,
                arrayFilters: [
                    { "file.file_id": fileId },
                    { "reviewer.id": reviewerId },
                    { "comment.id": reviewId }
                ]
            }
        );

        console.log(data);
        res.status(200).send("Review updated successfully")

    } catch (error) {
        console.error('[Files Controller] Error editing the review : ', error)
        res.status(500).send('🚨 File updation failed');
    }
}