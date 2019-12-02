declare module "bent" {
    const spotify: any;
    export = spotify;
}

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

declare module "*.svg" {
  const content: any;
  export default content;
}
