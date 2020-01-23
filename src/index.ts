import { authenticate, TokenResponse } from './requests';

if (!process.env.LUCIDCHART_CLIENT_ID || !process.env.LUCIDCHART_CLIENT_SECRET) {
  console.error('Please define the environment variables LUCIDCHART_CLIENT_ID and LUCIDCHART_CLIENT_SECRET.');
  process.exit(1);
}

async function main() {
  let accessToken: TokenResponse;
  if (process.env.LUCIDCHART_TOKEN && process.env.LUCIDCHART_TOKEN_SECRET) {
    accessToken = {
      oauth_token: process.env.LUCIDCHART_TOKEN,
      oauth_token_secret: process.env.LUCIDCHART_TOKEN_SECRET
    };
  } else {
    accessToken = await authenticate();
    console.log(`Authentication successful!
Please add the following environment variables: LUCIDCHART_TOKEN=${accessToken.oauth_token} and LUCIDCHART_TOKEN_SECRET=${accessToken.oauth_token_secret}.
If you don't, every new authentication will invalidate the previously granted access tokens.
`);
  }
}

main()
  .catch(err => console.error(err.toString()));
