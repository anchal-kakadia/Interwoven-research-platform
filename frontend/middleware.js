// Without a defined matcher, this middleware will be called on every request
// and applies next-auth to entire app
import { withAuth } from 'next-auth/middleware';

import { options } from './app/api/auth/[...nextauth]/options';

export default withAuth({ cookies: options.cookies, jwt: options.jwt, pages: options.pages });

// Applies next-auth only to specific routes - can be regex or string
export const config = {
    matcher: [
        '/',
        '/admin',
        '/author',
        '/reviewer'
    ],
};
