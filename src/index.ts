import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface AuthSCHProfile extends Record<string, any> {
  internal_id: string; // AuthSCH ID (varchar, max 36 characters). Issued without user approval upon login
  displayName: string; // name
  sn: string; // surname
  givenName: string; // first name
  mail: string; // email address
  niifPersonOrgID: string | null; // neptun code (only if BME directory ID is linked, otherwise returns null)
  linkedAccounts: {
    bme?: string; // @bme.hu email
    schacc?: string; // schacc username
    vir?: number; // vir id (integer)
    virUid?: string; // vir username
  };
  eduPersonEntitlement: {
    id: number;
    name: string;
    status: string;
    start: string;
    end: string | null;
  }[];
  roomNumber: string | null; // user room number (dorm name and room number if a dorm resident, null otherwise)
  mobile: string; // mobile number from VIR
  niifEduPersonAttendedCourse: string[]; // courses attended in the current semester
  entrants: {
    fall: string[]; // community entrants from VIR (fall)
    spring: string[]; // community entrants from VIR (spring)
  };
  admembership: string[]; // group memberships in KSZK's Active Directory
  bmeunitscope:
    | "BME"
    | "BME_NEWBIE"
    | "BME_VIK"
    | "BME_VIK_ACTIVE"
    | "BME_VIK_NEWBIE"
    | "BME_VBK"
    | "BME_VBK_ACTIVE"
    | "BME_VBK_NEWBIE"; // university affiliation
  permanentaddress: string; // permanent address
}

interface AuthSCHProfileOptions<P> extends OAuthUserConfig<P> {
  /** Scope can be used to request additional information from the user, see https://git.sch.bme.hu/kszk/authsch/-/wikis/api for more information.
   * Default: `basic mail sn givenName displayName` **/
  scope?: string;
}

export default function AuthSCH<P extends AuthSCHProfile>(
  options: AuthSCHProfileOptions<P>
): OAuthConfig<P> {
  let defaultScope = "basic mail sn givenName displayName";
  if (!options.scope) {
    options.scope = defaultScope;
  }
  return {
    id: "authsch",
    name: "AuthSch",
    type: "oauth",
    version: "2.0",
    authorization: {
      url: "https://auth.sch.bme.hu/site/login",
      params: {
        scope: options.scope,
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
        try {
          const url = new URL("https://auth.sch.bme.hu/api/profile");
          const token = context.tokens.access_token;

          if (!token) {
            throw new Error("No access token found");
          }

          url.searchParams.set("access_token", token);

          const response = await fetch(url.toString());

          if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(
              `Failed to fetch user information: ${response.status} ${response.statusText} - ${errorDetails}`
            );
          }

          return await response.json();
        } catch (error) {
          console.error(
            "An error occurred while fetching user information:",
            error
          );
          throw error; // Re-throw the error to be handled by the caller
        }
      },
    },
    checks: ["state"],
    style: {
      logo: "https://git.sch.bme.hu/uploads/-/system/appearance/header_logo/1/sch.png",
      bg: "#173c65",
      text: "#fff",
    },
    profile(profile: AuthSCHProfile) {
      return {
        id: profile.internal_id,
        name: profile.displayName,
        email: profile.mail,
      };
    },
    options,
  };
}
