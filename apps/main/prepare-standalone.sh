mkdir -p ./dist
cp -R ./public ./dist/public
cp -R ./.next/standalone/* ./dist/
cp -R ./.next/static ./dist/apps/main/.next/
