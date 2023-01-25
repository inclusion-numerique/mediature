const scriptSrcValues = ["'self'", "'unsafe-inline'"];

// Due to Next.js hot reload in development we need to allow `eval()`
// Ref: https://github.com/vercel/next.js/issues/14221
if (process.env.NODE_ENV !== 'production') {
  scriptSrcValues.push("'unsafe-eval'");
}

module.exports = {
  // Those headers are directly inspired from the default of https://github.com/helmetjs/helmet
  // (they don't have a Next.js integration so dealing with it manually)
  securityHeaders: {
    'Content-Security-Policy': `default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src ${scriptSrcValues.join(
      ' '
    )};script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests`,
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Origin-Agent-Cluster': '?1',
    'Referrer-Policy': 'no-referrer',
    'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-XSS-Protection': '0',
  },
  convertHeadersForNextjs: function (headers) {
    return Object.keys(headers).map((headerName) => {
      return {
        key: headerName,
        value: headers[headerName],
      };
    });
  },
};
