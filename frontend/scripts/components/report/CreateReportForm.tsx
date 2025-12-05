import React, { useState } from 'react';
import styled from 'styled-components';
import { ReportType, ReportTypeOption } from '@services/types/reportDraft';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-weight: 600;
    color: var(--text-label-grey);
    font-size: 14px;
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid var(--border-default-grey);
    border-radius: 4px;
    font-size: 16px;
    width: 100%;

    &:focus {
        outline: none;
        border-color: var(--border-active-blue-france);
        box-shadow: inset 0 -2px 0 0 var(--border-active-blue-france);
    }
`;

const Select = styled.select`
    padding: 12px;
    border: 1px solid var(--border-default-grey);
    border-radius: 4px;
    font-size: 16px;
    width: 100%;
    background: white;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: var(--border-active-blue-france);
        box-shadow: inset 0 -2px 0 0 var(--border-active-blue-france);
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 16px;
`;

interface CreateReportFormProps {
    reportTypes: ReportTypeOption[];
    onSubmit: (data: { name: string; reportType: ReportType }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const CreateReportForm: React.FC<CreateReportFormProps> = ({
    reportTypes,
    onSubmit,
    onCancel,
    isLoading,
}) => {
    const [name, setName] = useState('');
    const [reportType, setReportType] = useState<ReportType>(reportTypes[0]?.value || 'rapport-complet');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && reportType) {
            onSubmit({ name: name.trim(), reportType });
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label htmlFor="report-name">Nom du rapport</Label>
                <Input
                    id="report-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Rapport triennal 2024"
                    required
                    autoFocus
                />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="report-type">Type de rapport</Label>
                <Select
                    id="report-type"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    required
                >
                    {reportTypes.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </Select>
            </FormGroup>

            <ButtonGroup>
                <button
                    type="button"
                    className="fr-btn fr-btn--secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="fr-btn"
                    disabled={!name.trim() || isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="fr-spinner fr-spinner--sm fr-mr-1w" aria-hidden="true" />
                            Création...
                        </>
                    ) : (
                        'Créer le rapport'
                    )}
                </button>
            </ButtonGroup>
        </Form>
    );
};

export default CreateReportForm;

