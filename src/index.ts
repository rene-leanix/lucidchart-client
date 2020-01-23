import { authenticate } from './authentication';

if (!process.env.LUCIDCHART_CLIENT_ID || !process.env.LUCIDCHART_CLIENT_SECRET) {
  console.error('Please define the environment variables LUCIDCHART_CLIENT_ID and LUCIDCHART_CLIENT_SECRET.');
  process.exit(1);
}

authenticate()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err.toString());
    process.exit(1);
  });
