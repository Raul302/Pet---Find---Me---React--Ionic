import React from 'react';

const passthrough = (Tag: any) => ({ children, ...props }: any) => React.createElement(Tag, props, children);

export const IonApp = passthrough('div');
export const IonCard = passthrough('div');
export const IonContent = ({ children, fullscreen, ...props }: any) => (
  <div {...props}>{children}</div>
);
export const IonHeader = passthrough('header');
export const IonLabel = passthrough('label');
export const IonPage = passthrough('main');
export const IonTitle = passthrough('h1');
export const IonToolbar = passthrough('div');
export const IonChip = passthrough('div');
export const IonAvatar = passthrough('div');
export const IonIcon = passthrough('span');
export const IonInput = passthrough('input');
export const IonText = passthrough('span');
export const IonCol = passthrough('div');
export const IonRow = passthrough('div');
export const IonModal = passthrough('div');
export const IonButtons = passthrough('div');
export const IonRouterOutlet = passthrough('div');
export const IonTabs = passthrough('div');
export const IonTabBar = passthrough('div');
export const IonTabButton: React.FC<any> = ({ children, ...props }) => (
  <button type="button" {...props}>{children}</button>
);

export const IonSegment: React.FC<any> = ({ onIonChange, children, ...props }) => (
  <div {...props}>
    {React.Children.map(children, child => {
      if (!React.isValidElement(child)) return child;
      const value = (child.props as any).value;
      const originalOnClick = (child.props as any).onClick;
      return React.cloneElement(child, {
        onClick: (event: any) => {
          originalOnClick?.(event);
          onIonChange?.({ detail: { value } });
        }
      } as any);
    })}
  </div>
);

export const IonSegmentButton: React.FC<any> = ({ children, ...props }) => (
  <button type="button" {...props}>{children}</button>
);

export const IonTextarea: React.FC<any> = ({ onIonInput, ...props }) => (
  <textarea
    {...props}
    onChange={event => onIonInput?.({ detail: { value: (event.target as HTMLTextAreaElement).value } })}
  />
);

export const IonButton: React.FC<any> = ({ children, onClick, ...props }) => (
  <button type="button" onClick={onClick} {...props}>{children}</button>
);

export const IonToast: React.FC<any> = ({ message, isOpen, children, ...props }) => (
  isOpen ? <div {...props}>{message || children}</div> : null
);

export const useIonViewWillLeave = () => {};

export const setupIonicReact = () => {};

export default {
  IonCard,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  IonChip,
  IonAvatar,
  IonTextarea,
  IonButton,
  IonIcon,
  IonInput,
  IonText,
  IonCol,
  IonRow,
  IonToast,
  IonModal,
  IonButtons,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  useIonViewWillLeave,
  setupIonicReact
};
