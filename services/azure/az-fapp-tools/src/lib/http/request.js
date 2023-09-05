
const parseMultiValueHeader = (all) => Object.fromEntries(all.split(';').map((one) => one.trim().split('=')));

export function parseCookies(
  url,
  headerVal,
){
  const u = new URL(url);
  const cookies = parseMultiValueHeader(headerVal);
  const spl = u.hostname.split('.');
  const domain = spl.slice(Math.max(spl.length - 3, 0)).join('.');
  // TODO: make these configurable from the header
  const cookieArr = Object.entries(cookies).map(([name, value]) => ({
    domain,
    name,
    value,
    sameSite: 'None',
    path: '/',
    httpOnly: true,
    secure: true,
    expires: Math.ceil(Date.now() / 1000 + 30),
  }));
  return cookieArr;
};
