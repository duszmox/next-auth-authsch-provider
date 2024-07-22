# NextAuth.js AuthSCH Provider

[![Github](https://img.shields.io/badge/GitHub-%20-green)](https://github.com/duszmox/next-auth-authsch-provider) [![npm](https://img.shields.io/badge/npm-1.0.1-red)](https://www.npmjs.com/package/next-auth-authsch-provider)

This package provides an OAuth2 provider for [NextAuth.js](https://next-auth.js.org/), integrating with the AuthSCH authentication service. AuthSCH is a centralized authentication service for students of the Budapest University of Technology and Economics (BME).

## Installation

Install the package via npm:

```bash
npm install next-auth-authsch-provider
```

## Configuration

To use the AuthSCH provider in your NextAuth.js setup, you'll need to configure it with the required parameters. Below is an example configuration.

### Example with default scope

```javascript
import NextAuth from "next-auth";
import AuthSCHProvider from "next-auth-authsch-provider";

export default NextAuth({
  ...
  providers: [
    AuthSCHProvider({
      clientId: process.env.AUTHSCH_CLIENT_ID,
      clientSecret: process.env.AUTHSCH_CLIENT_SECRET,
    }),
  ],
  ...
});
```

### Example with custom scope

```javascript
import NextAuth from "next-auth";
import AuthSCHProvider, { type AuthSCHProfile } from "next-auth-authsch-provider";

export default NextAuth({
  ...
  providers: [
    AuthSCHProvider({
      clientId: process.env.AUTHSCH_CLIENT_ID,
      clientSecret: process.env.AUTHSCH_CLIENT_SECRET,
      scope: "basic mail sn givenName displayName permanentaddress",
      profile(profile: AuthSCHProfile) {
        return {
          id: profile.internal_id,
          name: profile.displayName,
          email: profile.mail,
          address: profile.permanentaddress, // you also need to extend the User type to accept more fields
        };
      },
    }),
  ],
  ...
});
```

## AuthSCH Profile

The AuthSCH profile provides a comprehensive set of user information. Here is an overview of the properties available:

- `internal_id` (string): AuthSCH ID (max 36 characters).
- `displayName` (string): Full name.
- `sn` (string): Surname.
- `givenName` (string): First name.
- `mail` (string): Email address.
- `niifPersonOrgID` (string | null): Neptun code (if linked).
- `linkedAccounts` (object): Linked accounts (e.g., BME email, schacc username).
- `eduPersonEntitlement` (array): Membership status in circles (leader/member/old member).
- `roomNumber` (string | null): Dorm room number (if applicable).
- `mobile` (string): Mobile number.
- `niifEduPersonAttendedCourse` (array): Courses attended in the current semester.
- `entrants` (object): Community entrants (fall and spring).
- `admembership` (array): Group memberships in KSZK's Active Directory.
- `bmeunitscope` (string): University affiliation (e.g., BME, BME_VIK).
- `permanentaddress` (string): Permanent address.

## Options

### `AuthSCHProfileOptions`

The `AuthSCHProfileOptions` interface extends `OAuthUserConfig` and includes the following:

- `scope` (string): Scope can be used to request additional information from the user. Default is `basic mail sn givenName displayName`.

## Default Scope

If no scope is specified, the following default scopes are used: `basic mail sn givenName displayName`.

## Further Information

For more detailed information on the AuthSCH API and the available scopes, visit the [AuthSCH API documentation](https://git.sch.bme.hu/kszk/authsch/-/wikis/api).

## License

This project is licensed under the ISC License.

---

By using this provider, you can easily integrate AuthSCH authentication into your Next.js application with NextAuth.js. For any questions or issues, please refer to the official documentation or raise an issue in the repository.
