declare module '@reown/appkit/react' {
    export function createAppKit(config: any): any;
}

declare module '@reown/appkit-adapter-wagmi' {
    export class WagmiAdapter {
        constructor(config: any);
        wagmiConfig: any;
    }
}

declare namespace JSX {
    interface IntrinsicElements {
        'w3m-button': any;
        'appkit-button': any;
    }
}