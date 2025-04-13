import { Router } from 'express';
import { updateUser, getAllUser, getUser, deleteUser, getAllReviewer, changeRoleToAuthor, getAllAuthor } from '../controllers/user.controller.js'
import { createFile, updateFile, addReview, getFile, getAllFiles, updateFileDetails, deleteFile, getFileWithStatus, setFileStatus, setRejectFileStatus, assignFiles, getFilesAdmin, getFilesReviewer, sendReview, getAdminReviewFiles, approveReview, getFilesAcceptedAdmin, getFilesInReviewAdmin, editReviewerReview, deleteReviewerReview, editAdminReviewerReview } from '../controllers/file.controller.js'
import { sendInviteEmail } from '../controllers/email.controller.js'
import { askLLM, summarizeLLM,findPlagiarism } from '../controllers/llm.controller.js';

import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRouter = Router();
userRouter.post('/update', updateUser);
userRouter.get('/getAllUser', getAllUser);
userRouter.get('/getUser', getUser);
userRouter.delete('/delete', deleteUser);
userRouter.get('/getAllReviewer', getAllReviewer)
userRouter.get('/getAllAuthor', getAllAuthor)

userRouter.post('/changeRole', changeRoleToAuthor)

//Files section
userRouter.post('/uploadFile', upload.single('file'), createFile)
userRouter.get('/getFile/:fileId', getFile)
userRouter.get('/getFiles', getAllFiles)
userRouter.get('/getFilesAdmin', getFilesAdmin)
userRouter.get('/getFilesAcceptedAdmin', getFilesAcceptedAdmin)
userRouter.get('/getFilesInReviewAdmin', getFilesInReviewAdmin)

userRouter.get('/getFilesReviewer', getFilesReviewer)
userRouter.get('/getAdminReviewFiles', getAdminReviewFiles)

userRouter.post('/editReviewerReview', editReviewerReview)
userRouter.delete('/deleteReviewerReview', deleteReviewerReview)

userRouter.post('/editAdminReviewerReview', editAdminReviewerReview)


userRouter.post('/updateFileDetails', updateFileDetails)
userRouter.put('/updateFile', upload.single('file'), updateFile)
userRouter.get('/getFileWithStatus', getFileWithStatus)
userRouter.post('/setFileStatus', setFileStatus)
userRouter.post('/setRejectFileStatus', setRejectFileStatus)
userRouter.post('/assignFiles', assignFiles)
userRouter.delete('/deleteFile', deleteFile)
userRouter.post('/addReview', addReview)
userRouter.post('/sendReview', sendReview)
userRouter.post('/approveReview', approveReview)

userRouter.post('/askLLM', askLLM)
userRouter.post('/summarize', summarizeLLM)
userRouter.post('/findPlagiarism', findPlagiarism)
//Email section

userRouter.post('/sendInviteEmail', sendInviteEmail)

export default userRouter;
