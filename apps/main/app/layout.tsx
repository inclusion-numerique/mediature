import getConfig from 'next/config';

// TODO: enable Axe for React once compatible
// Ref: https://github.com/dequelabs/axe-core-npm/issues/500#issuecomment-1337125964
// // Enable Axe
// if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
//   const React = require('react');
//   const ReactDOM = require('react-dom');
//   const axe = require('@axe-core/react');
//   axe(React, ReactDOM, 1000);
// }

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
