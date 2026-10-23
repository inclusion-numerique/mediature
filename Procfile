# The web process launches the start script directly, instead of the default `npm start` that would chain `npm` and `pnpm` processes
# staying alive just to wait for the server (~150MB of memory, too much when containers have 256MB or 512MB)
web: cd apps/main && ./start-and-wait-to-init.sh
# We use `npx` to avoid using `pnpm db:migration:deploy:unsecure`
# like that we can throw away all the dependencies at once without complicating things by reinstalling prisma
postdeploy: cd apps/main && npx prisma@6.19.3 migrate deploy
