declare module '*.yaml' {
  const content: object;
  export default content;
}

declare module '*.scss?raw' {
  const content: string;
  export default content;
}

// It extracts style types automatically thanks to the `tsconfig.json` plugin `typescript-plugin-css-modules`
declare module '*.module.css';
declare module '*.module.scss';

declare module '*.svg?inline' {
  const value: any;
  export default value;
}

declare module '*.lexical' {
  const content: string;
  export default content;
}

declare module 'mjml-browser' {
  import mjml2html from 'mjml';
  export default mjml2html;
}
