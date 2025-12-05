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
import styled from 'styled-components';

const EditorWrapper = styled.div`
    border: 1px solid var(--border-default-grey);
    border-radius: 4px;
    background: white;

    &:focus-within {
        border-color: var(--border-active-blue-france);
        box-shadow: inset 0 -2px 0 0 var(--border-active-blue-france);
    }
`;

const Toolbar = styled.div`
    display: flex;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid var(--border-default-grey);
    background: var(--background-alt-grey);
    flex-wrap: wrap;
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
    padding: 6px 10px;
    border: 1px solid ${props => props.$active ? 'var(--border-active-blue-france)' : 'var(--border-default-grey)'};
    border-radius: 4px;
    background: ${props => props.$active ? 'var(--background-active-blue-france)' : 'white'};
    color: ${props => props.$active ? 'white' : 'var(--text-default-grey)'};
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        background: ${props => props.$active ? 'var(--background-active-blue-france-hover)' : 'var(--background-alt-grey)'};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const EditorContentWrapper = styled.div`
    padding: 16px;
    min-height: 150px;
    max-height: 400px;
    overflow-y: auto;

    .ProseMirror {
        outline: none;
        min-height: 120px;

        p {
            margin: 0 0 8px 0;
        }

        ul, ol {
            margin: 8px 0;
            padding-left: 24px;
        }

        li {
            margin: 4px 0;
        }

        p.is-editor-empty:first-child::before {
            color: var(--text-mention-grey);
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
        }
    }
`;

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    onChange,
    placeholder = 'Saisissez votre texte...',
    disabled = false,
}) => {
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
            Placeholder.configure({ placeholder }),
        ],
        content,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled);
        }
    }, [disabled, editor]);

    const handleBold = useCallback(() => {
        editor?.chain().focus().toggleBold().run();
    }, [editor]);

    const handleItalic = useCallback(() => {
        editor?.chain().focus().toggleItalic().run();
    }, [editor]);

    const handleBulletList = useCallback(() => {
        editor?.chain().focus().toggleBulletList().run();
    }, [editor]);

    const handleOrderedList = useCallback(() => {
        editor?.chain().focus().toggleOrderedList().run();
    }, [editor]);

    const handleUndo = useCallback(() => {
        editor?.chain().focus().undo().run();
    }, [editor]);

    const handleRedo = useCallback(() => {
        editor?.chain().focus().redo().run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <EditorWrapper>
            <Toolbar>
                <ToolbarButton
                    type="button"
                    onClick={handleBold}
                    $active={editor.isActive('bold')}
                    disabled={disabled}
                    title="Gras"
                >
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    onClick={handleItalic}
                    $active={editor.isActive('italic')}
                    disabled={disabled}
                    title="Italique"
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    onClick={handleBulletList}
                    $active={editor.isActive('bulletList')}
                    disabled={disabled}
                    title="Liste à puces"
                >
                    <i className="bi bi-list-ul" />
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    onClick={handleOrderedList}
                    $active={editor.isActive('orderedList')}
                    disabled={disabled}
                    title="Liste numérotée"
                >
                    <i className="bi bi-list-ol" />
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    onClick={handleUndo}
                    disabled={disabled || !editor.can().undo()}
                    title="Annuler"
                >
                    <i className="bi bi-arrow-counterclockwise" />
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    onClick={handleRedo}
                    disabled={disabled || !editor.can().redo()}
                    title="Rétablir"
                >
                    <i className="bi bi-arrow-clockwise" />
                </ToolbarButton>
            </Toolbar>
            <EditorContentWrapper>
                <EditorContent editor={editor} />
            </EditorContentWrapper>
        </EditorWrapper>
    );
};

export default RichTextEditor;

