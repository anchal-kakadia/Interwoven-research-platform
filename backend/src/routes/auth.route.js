import { Router } from 'express';
import { signIn, signUp, meController, authenticateToken, generateLink, verifyLink, authenticateTokenGenerateLink, signUpReviewer } from '../controllers/auth.controller.js';
const authRouter = Router();

authRouter.post('/signIn', signIn);
authRouter.post('/signUp', signUp);
authRouter.post('/signUpReviewer', signUpReviewer);

authRouter.get('/generateLink', authenticateTokenGenerateLink, generateLink);
authRouter.post('/verifyLink', verifyLink);
authRouter.post('/me', authenticateToken, meController);

export default authRouter;
