
// borrowed from https://github.com/adobe/helix-bot/blob/main/src/utils.js
export function extractHelixUrls(text) {
  if (!text) {
    return [];
  }
  const matches = text.matchAll(/https:\/\/([a-z\d\-._]+)\.hlx3?\.(page|live)([a-z\d\-+._%/?=&@#]*)/mig);
  const ret = {};
  for (const m of matches) {
    const [url, key, , pathname] = m;
    const rro = key.toLowerCase();
    const [ref, repo, owner] = rro.split('--');
    ret[url] = {
      url,
      key: rro,
      pathname,
      owner,
      repo,
      ref,
    };
  }
  return Object.values(ret).sort((u0, u1) => u0.url.localeCompare(u1.url));
}
