import getConfig from 'next/config';

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: show app version once `next/config` is available
  // Ref: https://github.com/vercel/next.js/issues/42065#issuecomment-1298530144
  // const { publicRuntimeConfig } = getConfig();

  return (
    <html lang="en">
      <body>
        {children}
        {/* <div>{publicRuntimeConfig.appVersion}</div> */}
      </body>
    </html>
  );
}
