mkdir -p ./dist
cp -R ./.next/standalone/* ./dist/
cp -R ./.next/static ./dist/apps/main/.next/
cp -R ./public ./dist/apps/main/
