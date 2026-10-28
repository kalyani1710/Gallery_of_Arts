
declare module "curtainsjs" {
  export class Curtains {
    constructor(options: {
      container: HTMLElement;
      watchScroll?: boolean;
      pixelRatio?: number;
    });

    onError(callback: () => void): this;
    onContextLost(callback: () => void): this;
    dispose(): void;
  }
}
