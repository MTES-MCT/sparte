import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@codegouvfr/react-dsfr/Button';
import styled from 'styled-components';

const ZoneWrapper = styled.div`
    position: relative;
    border: 1px solid var(--border-default-grey);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 2rem;
`;

const ZoneHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--background-alt-grey);
    border-bottom: 1px solid var(--border-default-grey);
`;

const Toolbar = styled.div`
    display: flex;
    gap: 0.7rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e0e0e0;
    background: white;
    flex-wrap: wrap;
`;

const Icon = styled.i`
    font-size: 1.4em;
`;

const Label = styled.label`
    font-size: 0.875rem;
`;

const EditorArea = styled.div`
    padding: 1rem;
    min-height: 6.25rem;

    .ProseMirror {
        outline: none;
        min-height: 5rem;
        font-size: 0.875rem;
        line-height: 1.5rem;

        > * + * {
            margin-top: 0.75rem;
        }

        p {
            margin: 0;
            font-size: 0.875rem;
        }

        ul, ol {
            padding-left: 1.5rem;
            margin: 0.5rem 0;
        }

        li {
            margin: 0.25rem 0;

            p {
                margin: 0;
            }
        }

        .is-editor-empty:first-child::before {
            color: var(--text-mention-grey);
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
            font-style: italic;
        }
    }
`;

const PrintContentBox = styled.div`
    background: #f0f7ff;
    border-left: 4px solid #000091;
    padding: 1.5rem;
    margin: 2rem 0;
    border-radius: 0 8px 8px 0;

    p {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        line-height: 1.7;
        color: #333;
    }

    p:last-child {
        margin-bottom: 0;
    }

    ul, ol {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }

    li {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        line-height: 1.6;
    }
`;

export type ContentZoneMode = 'edit' | 'print';

interface ContentZoneProps {
    content: string;
    mode: ContentZoneMode;
    placeholder?: string;
    onChange?: (content: string) => void;
}

const EditableContent: React.FC<{
    content: string;
    placeholder: string;
    onChange: (content: string) => void;
}> = ({ content, placeholder, onChange }) => {
    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Bold,
            Italic,
            BulletList,
            OrderedList,
            ListItem,
            History,
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (html !== content) {
                onChange(html);
            }
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content]);

    const focusEditor = useCallback(() => {
        editor?.chain().focus().run();
    }, [editor]);

    if (!editor) {
        return (
            <ZoneWrapper>
                <ZoneHeader>
                    <Label className="fr-label">Commentaire</Label>
                </ZoneHeader>
                <EditorArea>
                    <p style={{ color: 'var(--text-mention-grey)', fontStyle: 'italic' }}>Chargement...</p>
                </EditorArea>
            </ZoneWrapper>
        );
    }

    return (
        <ZoneWrapper onClick={focusEditor}>
            <ZoneHeader>
                <Label className="fr-label">Commentaire</Label>
                <span className="fr-hint-text">(optionnel)</span>
            </ZoneHeader>
            <Toolbar onClick={(e) => e.stopPropagation()}>
                <Button
                    size="small"
                    priority={editor.isActive('bold') ? 'primary' : 'tertiary'}
                    type="button"
                    title="Gras (Ctrl+B)"
                    nativeButtonProps={{
                        onMouseDown: (e) => {
                            e.preventDefault();
                            editor.chain().focus().toggleBold().run();
                        },
                    }}
                >
                    <Icon className="bi bi-type-bold" aria-hidden="true"></Icon>
                </Button>
                <Button
                    size="small"
                    priority={editor.isActive('italic') ? 'primary' : 'tertiary'}
                    type="button"
                    title="Italique (Ctrl+I)"
                    nativeButtonProps={{
                        onMouseDown: (e) => {
                            e.preventDefault();
                            editor.chain().focus().toggleItalic().run();
                        },
                    }}
                >
                    <Icon className="bi bi-type-italic" aria-hidden="true"></Icon>
                </Button>
                <Button
                    size="small"
                    priority={editor.isActive('bulletList') ? 'primary' : 'tertiary'}
                    type="button"
                    title="Liste à puces"
                    nativeButtonProps={{
                        onMouseDown: (e) => {
                            e.preventDefault();
                            editor.chain().focus().toggleBulletList().run();
                        },
                    }}
                >
                    <Icon className="bi bi-list-ul" aria-hidden="true"></Icon>
                </Button>
                <Button
                    size="small"
                    priority={editor.isActive('orderedList') ? 'primary' : 'tertiary'}
                    type="button"
                    title="Liste numérotée"
                    nativeButtonProps={{
                        onMouseDown: (e) => {
                            e.preventDefault();
                            editor.chain().focus().toggleOrderedList().run();
                        },
                    }}
                >
                    <Icon className="bi bi-list-ol" aria-hidden="true"></Icon>
                </Button>
            </Toolbar>
            <EditorArea onClick={(e) => e.stopPropagation()}>
                <EditorContent editor={editor} />
            </EditorArea>
        </ZoneWrapper>
    );
};

const PrintContent: React.FC<{ content: string }> = ({ content }) => {
    if (!content || content === "<p></p>" || content.trim() === "") {
        return null;
    }
    return <PrintContentBox dangerouslySetInnerHTML={{ __html: content }} />;
};

const ContentZone: React.FC<ContentZoneProps> = ({
    content,
    mode,
    placeholder = 'Cliquez ici pour ajouter votre commentaire...',
    onChange,
}) => {
    if (mode === 'edit') {
        if (!onChange) {
            console.warn('ContentZone: onChange is required in edit mode');
            return null;
        }
        return (
            <EditableContent
                content={content}
                placeholder={placeholder}
                onChange={onChange}
            />
        );
    }

    return <PrintContent content={content} />;
};

export default ContentZone;

