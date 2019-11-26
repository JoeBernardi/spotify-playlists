declare module "bent" {
    const spotify:any;
    export = spotify;
}

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
