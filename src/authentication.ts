import * as request from 'request-promise-native';
import * as CryptoJS from 'crypto-js';
import { createInterface } from 'readline';

type Params = Record<string, string | number>;
interface TokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
}

const KEY = process.env.LUCIDCHART_CLIENT_ID as string;
const SECRET = process.env.LUCIDCHART_CLIENT_SECRET as string;
const BASE_PATH = 'https://www.lucidchart.com/oauth';

export async function authenticate() {
  const requestToken = await executeRequest('requestToken');
  console.log(`Please grant access at ${BASE_PATH}/authorize?oauth_token=${requestToken.oauth_token} and paste the verfication code:`);
  const verifier = await getVerificationCode();
  const accessToken = await executeRequest('accessToken', {
    oauth_verifier: verifier,
    oauth_token: requestToken.oauth_token
  }, requestToken.oauth_token_secret);
  console.log({ accessToken });
}

async function executeRequest(endpoint: string, additionalParams: Params = {}, tokenSecret: string = ''): Promise<TokenResponse> {
  const url = `${BASE_PATH}/${endpoint}`;
  const params: Params = {
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_nonce: Math.random(),
    oauth_consumer_key: KEY,
    oauth_signature_method: 'HMAC-SHA1'
  };
  Object.assign(params, additionalParams);
  params.oauth_signature = calculateSignature('GET', url, params, tokenSecret);
  const response: string = await request(url, {
    qs: params
  });
  return splitQueryString(response);
}

function splitQueryString<T extends {}>(response: string): T {
  return response.split('&').reduce<T>((result, keyValuePair) => {
    const [key, value] = keyValuePair.split('=');
    return { ...result, [key]: value };
  }, {} as T);
}

function calculateSignature(method: string, url: string, params: Params, tokenSecret: string): string {
  const signatureBase = createSignatureBase(method, url, params);
  const key = `${SECRET}&${tokenSecret}`;
  const encoding = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signatureBase, key));
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

async function getVerificationCode(): Promise<string> {
  return new Promise(resolve => {
    createInterface({
      input: process.stdin
    }).question('', resolve);
  });
}
