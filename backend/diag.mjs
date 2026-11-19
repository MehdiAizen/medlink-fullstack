const base = process.env.KEYCLOAK_URL;
const realm = process.env.KEYCLOAK_REALM || 'medlink';

const tokRes = await fetch(`${base}/realms/${realm}/protocol/openid-connect/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.KEYCLOAK_BACKEND_CLIENT_ID,
    client_secret: process.env.KEYCLOAK_BACKEND_CLIENT_SECRET,
  }),
});
console.log('1) token HTTP', tokRes.status);
const tok = await tokRes.json();
if (!tok.access_token) { console.log(tok); process.exit(1); }

const p = JSON.parse(Buffer.from(tok.access_token.split('.')[1], 'base64url').toString());
console.log('iss        :', p.iss);
console.log('azp        :', p.azp);
console.log('token_type :', tok.token_type);
console.log('DPoP (cnf) :', p.cnf ? 'OUI' : 'non');
console.log('roles realm-management :', p.resource_access?.['realm-management']?.roles);

const r = await fetch(`${base}/admin/realms/${realm}/users?max=1`, {
  headers: { Authorization: `Bearer ${tok.access_token}` },
});
console.log('2) GET users HTTP', r.status);
console.log('www-authenticate :', r.headers.get('www-authenticate'));
console.log('corps :', (await r.text()).slice(0, 300));
console.log('aud        :', p.aud);
console.log('exp - now  :', p.exp - Math.floor(Date.now() / 1000), 's');
console.log('iat - now  :', p.iat - Math.floor(Date.now() / 1000), 's');