declare module 'virtual:pwa-register' {
  export type RegisterSWOptions = {
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (err: any) => void;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  };

  export function registerSW(options?: RegisterSWOptions): (reloadApp?: boolean) => Promise<void> | void;
  export default registerSW;
}
