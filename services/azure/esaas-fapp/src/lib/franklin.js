
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

function sanitizeFilename(name) {
  if (!name) return '';
  return decodeURIComponent(name).toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sanitizePath(path) {
  if (!path) return '';
  const extension = path.split('.').pop();
  const pathname = extension !== path ? path.substring(0, path.lastIndexOf('.')) : path;
  let sanitizedPath = '';
  pathname.split('/').forEach((p) => {
    if (p !== '') {
      sanitizedPath += `/${sanitizeFilename(p)}`;
    }
  });
  if (extension !== path) {
    sanitizedPath += `.${extension}`;
  }
  return sanitizedPath;
}

export function generateDocumentPath({ url }) {
  let p = new URL(url).pathname;
  if (p.endsWith('/')) {
    p = `${p}index`;
  }
  p = decodeURIComponent(p)
    .toLowerCase()
    .replace(/\.html$/, '')
    .replace(/[^a-z0-9/]/gm, '-');
  return sanitizePath(p);
}
