import React from "react";
import { LandDetailResultType } from "@services/types/land";

interface DataGouvProps {
    landData: LandDetailResultType;
}

const DATASETS = [
    {
        id: "697b4f4d51a9d53976e5a8c9",
        title: "Artificialisation des sols - données par région, département, SCoT, commune et EPCI",
    },
    {
        id: "697b4f4ceea77fb452ba9d6d",
        title: "Imperméabilisation des sols - données par région, département, SCoT, commune et EPCI",
    },
];

const DataGouv: React.FC<DataGouvProps> = ({ landData }) => {
    return (
        <div className="fr-container--fluid fr-p-3w">
            {DATASETS.map(({ id, title }) => (
                <div
                    key={id}
                    className="fr-mb-1w"
                    style={{ cursor: "pointer" }}
                    onClick={() => window.open(`https://www.data.gouv.fr/fr/datasets/${id}/`, "_blank")}
                >
                    <iframe
                        src={`https://www.data.gouv.fr/embeds/datasets/${id}`}
                        style={{ width: "100%", height: "180px", border: "none", borderRadius: "6px", overflow: "hidden", pointerEvents: "none" }}
                        title={title}
                    />
                </div>
            ))}
        </div>
    );
};

export default DataGouv;
