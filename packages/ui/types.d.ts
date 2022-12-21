declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.scss?raw' {
  const content: string;
  export default content;
}

declare module '*.svg?inline' {
  const value: any;
  export default value;
}

declare module 'mjml-browser' {
  import mjml2html from 'mjml';
  export default mjml2html;
}
