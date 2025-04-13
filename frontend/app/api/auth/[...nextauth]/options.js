import CredentialsProvider from 'next-auth/providers/credentials';

const geCookiesPrefix = () => {
	const nextAuthUrl = process.env.NEXTAUTH_URL || '';
	const useSecureCookies = `${nextAuthUrl}`.startsWith('https://');
	const prefix = (process.env.NEXTAUTH_COOKIES_PREFIX || '').toLowerCase();

	return `${useSecureCookies ? '__Secure-' : ''}${prefix ? `${prefix}.` : ''}`;
};

function getEnvVar(variableName) {
	return process.env[variableName] || '';
}

export const options = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: {
					label: 'Username: ',
					type: 'text',
				},
				password: {
					label: 'Password: ',
					type: 'password',
				},
			},

			async authorize(credentials, req) {
				const res = await fetch(`${process.env.API_URL}/auth/signIn`, {
					method: 'POST',
					body: JSON.stringify({ credentials }),
					headers: {
						'Content-Type': 'application/json',
					},
				});


				if (!res.ok) throw new Error()

				const user = await res.json();

				if (!user)
					throw new Error()

				return user;
			},
		}),
	],
	jwt: {
		maxAge: 12 * 60 * 60,
	},
	session: {
		strategy: 'jwt',
		maxAge: 12 * 60 * 60,
	},

	cookies: {
		csrfToken: {
			name: `${geCookiesPrefix()}next-auth.csrf-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				domain: getRootDomain(), // Set the domain to the root domain
				secure: process.env.NODE_ENV === 'production' // Adjust based on your environment
			}
		},
		sessionToken: {
			name: `${geCookiesPrefix()}next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				domain: getRootDomain(), // Set the domain dynamically
				secure: process.env.NODE_ENV === 'production' // Adjust based on your environment
			}
		},
		callbackUrl: {
			name: `${geCookiesPrefix()}next-auth.callback-url`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				domain: getRootDomain(), // Set the domain dynamically
				secure: process.env.NODE_ENV === 'production' // Adjust based on your environment
			}
		},
		pkceCodeVerifier: {
			name: `${geCookiesPrefix()}next-auth.pkce.code_verifier`,
			options: {
				maxAge: 900,
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				domain: getRootDomain(), // Set the domain dynamically
				secure: process.env.NODE_ENV === 'production' // Adjust based on your environment
			}
		},
		state: {
			name: `${geCookiesPrefix()}next-auth.state`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				maxAge: 900,
				domain: getRootDomain(), // Set the domain dynamically
				secure: process.env.NODE_ENV === 'production' // Adjust based on your environment
			}
		},
		nonce: {
			name: `${geCookiesPrefix()}next-auth.nonce`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				domain: getRootDomain(), // Set the domain dynamically
				secure: process.env.NODE_ENV === 'production' // Adjust based on your environment
			}
		}
	},
	callbacks: {
		async jwt({ token, user }) {
			return { ...token, ...user };
		},
		async session({ session, token, user }) {			
			const res = await fetch(`${getEnvVar('API_URL')}/auth/me`, {
				method: 'post',
				headers: {
					'Content-type': 'application/json',
					 Authorization: `Bearer ${token.accessToken}`,
				},
				body:JSON.stringify(token)
			});

			if (!res.ok) {
				session.user = null;
				return session;
			}

			const data = await res.json();
			if (data) {
				session.user = data;
				if (session.user) {
					(session.user).accessToken = token.accessToken;
				}

				return session;
			}

			session.user = token;
			return session;
		},
	},
	theme: {
		colorScheme: 'light',
		logo: '',
		brandColor: '#038d9a9c',
	},
	pages: {
		signIn: '/signin',
	},
};

// Helper function to get the root domain
function getRootDomain() {
	const url = new URL(getEnvVar('NEXTAUTH_URL') || 'http://localhost:3000');
	const parts = url.hostname.split('.');
	const rootDomain = parts.slice(-2).join('.');
	return rootDomain;
}
