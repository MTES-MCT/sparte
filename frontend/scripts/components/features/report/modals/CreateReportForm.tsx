import React, { useState } from 'react';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { ReportType } from '@services/types/reportDraft';
import { LandDetailResultType } from '@services/types/land';

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
    'rapport-complet': 'Rapport Complet',
    'rapport-local': 'Rapport Triennal Local',
};

interface CreateReportFormProps {
    reportType: ReportType;
    onSubmit: (data: { name: string; reportType: ReportType }) => void;
    onCancel: () => void;
    isLoading?: boolean;
    landData: LandDetailResultType;
}

const formatDate = () => {
    const now = new Date();
    const month = now.toLocaleDateString('fr-FR', { month: 'long' });
    const year = now.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
};

const CreateReportForm: React.FC<CreateReportFormProps> = ({
    reportType,
    onSubmit,
    onCancel,
    isLoading,
    landData,
}) => {
    const defaultName = `${REPORT_TYPE_LABELS[reportType]} - ${landData.name} - ${formatDate()}`;
    const [name, setName] = useState(defaultName);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit({ name: name.trim(), reportType });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="fr-input-group fr-mb-3w">
                <label className="fr-label fr-mb-1w">Type de rapport</label>
                <Badge small>{REPORT_TYPE_LABELS[reportType]}</Badge>
            </div>

            <Input
                label="Nom du rapport"
                nativeInputProps={{
                    type: "text",
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    placeholder: "Entrez le nom du rapport",
                    required: true,
                    autoFocus: true,
                    disabled: isLoading,
                }}
            />

            <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline fr-mt-3w">
                <Button
                    priority="secondary"
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Annuler
                </Button>
                <Button
                    type="submit"
                    disabled={!name.trim() || isLoading}
                >
                    {isLoading ? 'Création...' : 'Créer le rapport'}
                </Button>
            </div>
        </form>
    );
};

export default CreateReportForm;
