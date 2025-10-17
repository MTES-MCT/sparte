import React from "react";

export type PopupTrigger = 'click' | 'hover';

export interface LayerPopupConfig {
    layerId: string;
    trigger: PopupTrigger;
    title: string;
    renderContent: (feature: any, event?: any) => React.ReactNode;
    onOpen?: (feature: any) => void;
    onClose?: () => void;
}

export interface PopupContentProps {
    feature: any;
    event?: any;
    onClose?: () => void;
}

export interface PopupState {
    isVisible: boolean;
    feature: any | null;
    event: any | null;
    position: { x: number; y: number };
    layerId: string | null;
}
