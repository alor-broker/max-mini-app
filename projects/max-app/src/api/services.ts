import { API_CONFIG } from "./config";

// --- Models ---
export interface User {
  clientId: string;
  login: string;
}

export interface RefreshJwtTokenResponse {
  jwt: string;
  refreshExpiresAt: string;
}

interface JwtBody {
  exp: number;
  portfolios: string;
  clientid: string;
  ein: string;
  agreements: string;
  sub: string;
}

// --- Helper Functions ---
const decodeJwtBody = (jwt: string): JwtBody => {
  try {
    const mainPart = jwt.split('.')[1];
    const decodedString = atob(mainPart);
    return JSON.parse(decodedString) as JwtBody;
  } catch (e) {
    console.error("Failed to decode JWT", e);
    throw new Error("Invalid Token");
  }
};

// --- AuthService ---

export const AuthService = {
  // Initiate SSO Login
  redirectToSso: (isExit: boolean = false) => {
    const callbackUrl = `${window.location.protocol}//${window.location.host}/auth/sso`;
    const scope = 'MiniApp';
    // Construct URL: environment.ssoUrl + `?url=${callbackUrl}&scope=${scope}`
    const ssoUrl = `${API_CONFIG.ssoUrl}?url=${callbackUrl}&scope=${scope}${isExit ? '&exit=1' : ''}`;
    window.location.assign(ssoUrl);
  },

  // Exchange Refresh Token for Access Token (JWT)
  refreshToken: async (token: string): Promise<{ user: User, jwt: string } | null> => {
    try {
      const response = await fetch(`${API_CONFIG.userDataUrl}/auth/actions/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: token })
      });

      if (!response.ok) {
        return null;
      }

      const data: RefreshJwtTokenResponse = await response.json();

      const jwtBody = decodeJwtBody(data.jwt);
      return {
        jwt: data.jwt,
        user: {
          clientId: jwtBody.clientid,
          login: jwtBody.sub
        }
      };
    } catch (error) {
      console.error("Failed to refresh token", error);
      return null;
    }
  },

  // In services.ts we also had isAuthenticated. 
  // Moving logic to AuthContext mostly, but keep helper if needed.
};

export const UserService = {
  getUserFromToken: (token: string): User => {
    const jwtBody = decodeJwtBody(token);
    return {
      clientId: jwtBody.clientid,
      login: jwtBody.sub
    };
  }
};
