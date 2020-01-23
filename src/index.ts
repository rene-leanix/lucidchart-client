import { authenticate, TokenResponse, executeRequest } from './requests';
import * as fs from 'fs';

if (!process.env.LUCIDCHART_CLIENT_ID || !process.env.LUCIDCHART_CLIENT_SECRET) {
  console.error('Please define the environment variables LUCIDCHART_CLIENT_ID and LUCIDCHART_CLIENT_SECRET.');
  process.exit(1);
}

async function main() {
  // Retrieve the access token
  let accessToken: TokenResponse;
  if (process.env.LUCIDCHART_TOKEN && process.env.LUCIDCHART_TOKEN_SECRET) {
    accessToken = {
      oauth_token: process.env.LUCIDCHART_TOKEN,
      oauth_token_secret: process.env.LUCIDCHART_TOKEN_SECRET
    };
  } else {
    accessToken = await authenticate();
    console.log(`Authentication successful! Please add the following environment variables:

export LUCIDCHART_TOKEN=${accessToken.oauth_token}
export LUCIDCHART_TOKEN_SECRET=${accessToken.oauth_token_secret}

If you don't, every new authentication will invalidate the previously granted access tokens.`);
  }
  // Execute an example request
  const docs = await executeRequest('documents/docs', accessToken);
  fs.writeFileSync('docs.xml', docs, 'utf8');
  console.log('All documents saved as docs.xml');
}

main()
  .catch(err => console.error(err.toString()));
