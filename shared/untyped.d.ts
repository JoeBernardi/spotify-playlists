declare module "bent" {
    const bent: any;
    export = bent;

}

declare module "webfontloader" {
    const webfontloader: any;
    export = webfontloader;
}

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
    interface Fragment {
        [elemName: string]: any;
    }
}

declare module "*.svg" {
  const content: any;
  export default content;
}
