import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface AuthSCHProfile extends Record<string, any> {
  internal_id: string; // AuthSCH ID (varchar, max 36 characters). Issued without user approval upon login
  displayName: string; // name
  sn: string; // surname
  givenName: string; // first name
  mail: string; // email address
}

export default function AuthSCH<P extends AuthSCHProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "authsch",
    name: "AuthSch",
    type: "oauth",
    version: "2.0",
    authorization: {
      url: "https://auth.sch.bme.hu/site/login",
      params: {
        scope: "basic mail sn givenName displayName",
        response_type: "code",
        client_id: options.clientId,
      },
    },
    token: {
      url: "https://auth.sch.bme.hu/oauth2/token",
      params: {
        grant_type: "refresh_token",
      },
    },
    userinfo: {
      url: "https://auth.sch.bme.hu/api/profile",
      async request(context) {
        const url = new URL("https://auth.sch.bme.hu/api/profile");
        const token = context.tokens.access_token;
        if (token == undefined) {
          throw new Error("No access token found");
        }
        url.searchParams.set("access_token", token);
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Failed to fetch user information");
        }
        return response.json();
      },
    },
    checks: ["state"],
    profile(profile: AuthSCHProfile) {
      console.log(profile);
      return {
        id: profile.internal_id,
        name: profile.displayName,
        email: profile.mail,
      };
    },
    options,
  };
}
