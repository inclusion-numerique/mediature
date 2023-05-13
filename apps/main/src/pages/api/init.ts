import { NextApiRequest, NextApiResponse } from 'next';

import { initPgBoss } from '@mediature/main/src/server/cron';

let init = false;

// It appears the PostgreSQL client for `pg-boss` acts differently than the `prisma` ORM one about SSL connection
// For now the only solution we found is to not check certificates because we had the following thrown from `bossClient.start()`:
//
// ```
// > curl http://localhost:$PORT/api/init
// Error: self signed certificate in certificate chain
// at TLSSocket._finishInit (node:_tls_wrap:946:8)
// at TLSSocket.onConnectSecure (node:_tls_wrap:1532:34)
// at TLSWrap.callbackTrampoline (node:internal/async_hooks:130:17) {
// at TLSWrap.ssl.onhandshakedone (node:_tls_wrap:727:12)
// }
// code: 'SELF_SIGNED_CERT_IN_CHAIN'
// at TLSSocket.emit (node:events:527:28)
// Failed to initialize some services
// ```
let databaseUrl = process.env.DATABASE_URL || '';
databaseUrl = databaseUrl.replace('sslmode=prefer', 'sslmode=no-verify');

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  // As of 2023 Next.js provides no way to launch a callback after startup (which is a shame)
  // so we are unable to schedule our cron tasks... Among lot of hacky solutions
  // we chose to trigger an endpoint at start thanks to the `Procfile` Heroku post-start process
  // even if not perfect, that's the only viable solution to benefit from shared environment variables,
  // database client, TypeScript... And in case you want to test it locally, just trigger the `/api/init` endpoint.
  //
  // Main related issue: https://github.com/vercel/next.js/discussions/15341

  if (!init) {
    init = true;

    try {
      await initPgBoss(databaseUrl);

      console.log('All services have been initialized');
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to initialize some services');

      // Kill the process to be sure the host is aware of a critical failure that needs to be handled
      process.exit(1);
    }
  }

  res.send('Initialized');
}

export default handler;
