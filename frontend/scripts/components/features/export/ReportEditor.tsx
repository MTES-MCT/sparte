import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { ReportDraft, ReportType } from '@services/types/reportDraft';
import RichTextEditor from './RichTextEditor';

const EditorContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
`;

const TitleInput = styled.input`
    font-size: 24px;
    font-weight: 700;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 8px 0;
    flex: 1;
    min-width: 200px;
    background: transparent;

    &:focus {
        outline: none;
        border-bottom-color: var(--border-active-blue-france);
    }

    &:hover:not(:focus) {
        border-bottom-color: var(--border-default-grey);
    }
`;

const SaveStatus = styled.div<{ $status: 'saved' | 'saving' | 'error' }>`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: ${props => {
        switch (props.$status) {
            case 'saved': return 'var(--text-default-success)';
            case 'saving': return 'var(--text-mention-grey)';
            case 'error': return 'var(--text-default-error)';
        }
    }};
`;

const Section = styled.div`
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-title-grey);
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
        content: '';
        width: 4px;
        height: 24px;
        background: var(--border-active-blue-france);
        border-radius: 2px;
    }
`;

const SectionDescription = styled.p`
    margin: 0 0 16px 0;
    font-size: 14px;
    color: var(--text-mention-grey);
`;

const Actions = styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
`;

interface EditableSection {
    key: string;
    title: string;
    description: string;
    placeholder: string;
}

const EDITABLE_SECTIONS: Record<ReportType, EditableSection[]> = {
    'rapport-complet': [
        {
            key: 'intro',
            title: 'Introduction générale',
            description: 'Présentez le contexte et les enjeux du diagnostic pour votre territoire. Ce texte apparaîtra après la fiche d\'identité territoriale.',
            placeholder: 'Présentez ici le contexte de votre territoire et les enjeux de ce diagnostic...',
        },
        {
            key: 'conso_comment',
            title: 'Commentaire sur la consommation d\'espaces',
            description: 'Analysez et commentez les données de consommation d\'espaces NAF présentées dans les graphiques.',
            placeholder: 'Commentez l\'évolution de la consommation d\'espaces sur votre territoire...',
        },
        {
            key: 'comparison_comment',
            title: 'Commentaire sur les comparaisons territoriales',
            description: 'Analysez la position de votre territoire par rapport aux territoires voisins ou similaires.',
            placeholder: 'Commentez les comparaisons avec les autres territoires...',
        },
        {
            key: 'artif_comment',
            title: 'Commentaire sur l\'artificialisation',
            description: 'Commentez les données d\'artificialisation et de flux présentées (si disponibles sur votre territoire).',
            placeholder: 'Commentez les données d\'artificialisation...',
        },
        {
            key: 'conclusion',
            title: 'Conclusion et perspectives',
            description: 'Synthétisez les enseignements du diagnostic et les orientations envisagées pour votre territoire.',
            placeholder: 'Synthétisez les enseignements et perspectives...',
        },
    ],
    'rapport-local': [
        {
            key: 'intro',
            title: 'Introduction',
            description: 'Contextualisez ce rapport triennal local. Présentez votre territoire et les raisons de ce rapport.',
            placeholder: 'Présentez le contexte de ce rapport triennal local...',
        },
        {
            key: 'bilan_comment',
            title: 'Commentaire sur le bilan de consommation',
            description: 'Commentez le bilan de consommation d\'espaces NAF sur la période analysée.',
            placeholder: 'Commentez le bilan de consommation d\'espaces NAF...',
        },
        {
            key: 'objectifs_comment',
            title: 'Évaluation du respect des objectifs',
            description: 'Évaluez le respect des objectifs fixés dans les documents d\'urbanisme et de planification.',
            placeholder: 'Évaluez le respect des objectifs de réduction...',
        },
        {
            key: 'perspectives',
            title: 'Perspectives et mesures envisagées',
            description: 'Décrivez les orientations et mesures envisagées pour atteindre les objectifs de sobriété foncière.',
            placeholder: 'Décrivez les perspectives et mesures envisagées...',
        },
    ],
};

interface ReportEditorProps {
    draft: ReportDraft;
    onSave: (data: { name: string; content: Record<string, string> }) => Promise<void>;
    onExportPdf: () => void;
    isExporting?: boolean;
    disabled?: boolean;
}

const AUTOSAVE_DELAY = 2000;

const ReportEditor: React.FC<ReportEditorProps> = ({
    draft,
    onSave,
    onExportPdf,
    isExporting,
    disabled,
}) => {
    const [name, setName] = useState(draft.name);
    const [content, setContent] = useState<Record<string, string>>(draft.content);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef({ name: draft.name, content: draft.content });

    const sections = EDITABLE_SECTIONS[draft.report_type] || EDITABLE_SECTIONS['rapport-complet'];

    const performSave = useCallback(async (currentName: string, currentContent: Record<string, string>) => {
        if (
            currentName === lastSavedRef.current.name &&
            JSON.stringify(currentContent) === JSON.stringify(lastSavedRef.current.content)
        ) {
            return;
        }

        setSaveStatus('saving');
        try {
            await onSave({ name: currentName, content: currentContent });
            lastSavedRef.current = { name: currentName, content: currentContent };
            setSaveStatus('saved');
        } catch {
            setSaveStatus('error');
        }
    }, [onSave]);

    const scheduleSave = useCallback((currentName: string, currentContent: Record<string, string>) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            performSave(currentName, currentContent);
        }, AUTOSAVE_DELAY);
    }, [performSave]);

    useEffect(() => {
        setName(draft.name);
        setContent(draft.content);
        lastSavedRef.current = { name: draft.name, content: draft.content };
        setSaveStatus('saved');
    }, [draft.id, draft.name, draft.content]);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const handleNameChange = (newName: string) => {
        setName(newName);
        scheduleSave(newName, content);
    };

    const handleContentChange = (key: string, value: string) => {
        const newContent = { ...content, [key]: value };
        setContent(newContent);
        scheduleSave(name, newContent);
    };

    const handleManualSave = async () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        await performSave(name, content);
    };

    return (
        <EditorContainer>
            <Header>
                <TitleInput
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Nom du rapport"
                    disabled={disabled}
                />
                <SaveStatus $status={saveStatus}>
                    {saveStatus === 'saving' && (
                        <>
                            <span className="fr-spinner fr-spinner--sm" aria-hidden="true" />
                            Enregistrement...
                        </>
                    )}
                    {saveStatus === 'saved' && (
                        <>
                            <i className="bi bi-check-circle-fill" />
                            Enregistré
                        </>
                    )}
                    {saveStatus === 'error' && (
                        <>
                            <i className="bi bi-exclamation-circle-fill" />
                            Erreur de sauvegarde
                        </>
                    )}
                </SaveStatus>
            </Header>

            {sections.map(section => (
                <Section key={section.key}>
                    <SectionTitle>{section.title}</SectionTitle>
                    <SectionDescription>{section.description}</SectionDescription>
                    <RichTextEditor
                        content={content[section.key] || ''}
                        onChange={(value) => handleContentChange(section.key, value)}
                        placeholder={section.placeholder}
                        disabled={disabled}
                    />
                </Section>
            ))}

            <Actions>
                <button
                    type="button"
                    className="fr-btn fr-btn--secondary"
                    onClick={handleManualSave}
                    disabled={disabled || saveStatus === 'saving'}
                >
                    <i className="bi bi-floppy fr-mr-1w" />
                    Enregistrer maintenant
                </button>
                <button
                    type="button"
                    className="fr-btn"
                    onClick={onExportPdf}
                    disabled={disabled || isExporting}
                >
                    {isExporting ? (
                        <>
                            <span className="fr-spinner fr-spinner--sm fr-mr-1w" aria-hidden="true" />
                            Export en cours...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-file-earmark-pdf fr-mr-1w" />
                            Télécharger le PDF
                        </>
                    )}
                </button>
            </Actions>
        </EditorContainer>
    );
};

export default ReportEditor;

