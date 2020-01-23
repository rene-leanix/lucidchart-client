import * as request from 'request-promise-native';
import * as CryptoJS from 'crypto-js';

type Params = Record<string, string | number>;

const KEY = process.env.LUCIDCHART_CLIENT_ID as string;
const SECRET = process.env.LUCIDCHART_CLIENT_SECRET as string;

export async function authenticate() {
  const response = await executeRequest('requestToken');
  const [token, tokenSecret] = response.split('&').map(keyValuePair => keyValuePair.split('=')[1]);
  console.log({ token, tokenSecret });
}

async function executeRequest(endpoint: string): Promise<string> {
  const url = `https://www.lucidchart.com/oauth/${endpoint}`;
  const params: Params = {
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_nonce: Math.random(),
    oauth_consumer_key: KEY,
    oauth_signature_method: 'HMAC-SHA1'
  };
  params.oauth_signature = calculateSignature('POST', url, params);
  return request.post(url, {
    qs: params
  });
}

function calculateSignature(method: string, url: string, params: Params): string {
  const signatureBase = createSignatureBase(method, url, params);
  const encoding = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signatureBase, `${SECRET}&`));
  return encoding;
}

function createSignatureBase(method: string, url: string, params: Record<string, string | number>) {
  const paramsString = Object.entries(params)
    .sort(([key1], [key2]) => key1 < key2 ? -1 : key1 === key2 ? 0 : 1)
    .map(([key, value]) => `${key}=${encodeData(value)}`)
    .join('&');
  const result = method + '&' + encodeData(url) + '&' + encodeData(paramsString);
  return result;
}

function encodeData(toEncode: string | number): string {
  if (toEncode === null || toEncode === '') {
    return '';
  } else {
    const result = encodeURIComponent(toEncode);
    // Fix the mismatch between OAuth's RFC3986's and Javascript's beliefs in what is right and wrong ;)
    // Copied from https://github.com/ciaranj/node-oauth/blob/master/lib/oauth.js
    return result.replace(/\!/g, '%21')
      .replace(/\'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }
}
