# We use `npx` to avoid using `pnpm db:migration:deploy:unsecure`
# like that we can throw away all the dependencies at once without complicating things by reinstalling prisma
postdeploy: cd apps/main && npx prisma@4.11.0 migrate deploy
