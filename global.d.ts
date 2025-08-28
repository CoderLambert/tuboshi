declare module 'lamejs' {
    const lamejs: any
    export default lamejs
}

declare module 'lamejs/src/js/MPEGMode' {
    const MPEGMode: any
    export default MPEGMode
}

declare module 'lamejs/src/js/Lame' {
    const Lame: any
    export default Lame
}

declare module 'lamejs/src/js/BitStream' {
    const BitStream: any
    export default BitStream
}

declare module 'react-18-input-autosize';

declare global {
    interface Window {
        flutter_inappwebview?: {
            callHandler: (methodName: string, params?: any) => Promise<any>;
        };

        webkit?: {
            messageHandlers: {
                [key: string]: {
                    postMessage: (params: any) => void;
                };
            };
        };

        Android?: {
            [key: string]: (...args: any[]) => any;
        };

        [key: string]: any; // 用于动态回调函数
    }
}
export { } // 添加这一行
