import React, { ReactNode } from "react";
import BaseCard from "@components/ui/BaseCard";

type NoticeType = "info" | "warning" | "alert";

interface NoticeProps {
    type: NoticeType;
    title: string;
    description: string | ReactNode;
    withCard?: boolean;
}

const Notice: React.FC<NoticeProps> = ({ type, title, description, withCard = true }) => {
    const notice = (
        <div className={`fr-notice fr-notice--${type}`}>
            <div className="fr-px-3w">
                <div className="fr-notice__body">
                    <p>
                        <span className="fr-notice__title fr-text--sm">{title}</span>
                        <span className="fr-notice__desc fr-text--sm">{description}</span>
                    </p>
                </div>
            </div>
        </div>
    );

    if (withCard) {
        return <BaseCard>{notice}</BaseCard>;
    }

    return notice;
};

export default Notice;

