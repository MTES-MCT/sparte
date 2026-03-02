import React, { ReactNode } from "react";
import { Notice as DSFRNotice } from "@codegouvfr/react-dsfr/Notice";
import BaseCard from "@components/ui/BaseCard";

type NoticeType = "info" | "warning" | "alert";

interface NoticeProps {
    type: NoticeType;
    title: string;
    description: string | ReactNode;
    withCard?: boolean;
}

const SEVERITY_MAP: Record<NoticeType, "info" | "warning" | "alert"> = {
    info: "info",
    warning: "warning",
    alert: "alert",
};

const Notice: React.FC<NoticeProps> = ({ type, title, description, withCard = true }) => {
    const notice = (
        <DSFRNotice
            severity={SEVERITY_MAP[type]}
            title={<span className="fr-text--sm">{title}</span>}
            description={<span className="fr-text--sm">{description}</span>}
        />
    );

    if (withCard) {
        return <BaseCard>{notice}</BaseCard>;
    }

    return notice;
};

export default Notice;

