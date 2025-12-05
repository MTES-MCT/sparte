import React, { useEffect, useCallback, useState } from 'react';
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

const ZoneWrapper = styled.div<{ $isFocused: boolean }>`
    position: relative;
    border: 2px dashed ${props => props.$isFocused ? '#000091' : '#c0c0c0'};
    border-radius: 8px;
    margin: 1.5rem 0;
    background: ${props => props.$isFocused ? '#f8f8ff' : '#fafafa'};
    transition: all 0.2s ease;
    cursor: text;

    &:hover {
        border-color: #000091;
        background: #f8f8ff;
    }
`;

const ZoneHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: linear-gradient(135deg, #000091 0%, #1212ff 100%);
    border-radius: 6px 6px 0 0;
`;

const ZoneLabel = styled.span`
    font-size: 13px;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ZoneHint = styled.span`
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
`;

const Toolbar = styled.div`
    display: flex;
    gap: 4px;
    padding: 10px 16px;
    border-bottom: 1px solid #e0e0e0;
    background: white;
    flex-wrap: wrap;
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
    padding: 6px 10px;
    border: 1px solid ${props => props.$active ? '#000091' : '#ddd'};
    border-radius: 4px;
    background: ${props => props.$active ? '#000091' : 'white'};
    color: ${props => props.$active ? 'white' : '#333'};
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    transition: all 0.15s ease;

    &:hover {
        background: ${props => props.$active ? '#0000b3' : '#f0f0f0'};
        border-color: ${props => props.$active ? '#0000b3' : '#bbb'};
    }

    &:active {
        transform: scale(0.95);
    }
`;

const EditorArea = styled.div`
    padding: 16px;
    min-height: 100px;

    .ProseMirror {
        outline: none;
        min-height: 80px;
        font-size: 0.9rem;
        line-height: 1.7;
        color: #333;

        > * + * {
            margin-top: 0.75em;
        }

        p {
            margin: 0;
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
            color: #999;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
            font-style: italic;
        }
    }
`;

interface EditableZoneProps {
    label: string;
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const EditableZone: React.FC<EditableZoneProps> = ({
    label,
    content,
    onChange,
    placeholder = 'Cliquez ici pour ajouter votre commentaire...',
}) => {
    const [isFocused, setIsFocused] = useState(false);

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
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
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
            <ZoneWrapper $isFocused={false}>
                <ZoneHeader>
                    <ZoneLabel>✏️ {label}</ZoneLabel>
                </ZoneHeader>
                <EditorArea>
                    <p style={{ color: '#999', fontStyle: 'italic' }}>Chargement...</p>
                </EditorArea>
            </ZoneWrapper>
        );
    }

    return (
        <ZoneWrapper $isFocused={isFocused} onClick={focusEditor}>
            <ZoneHeader>
                <ZoneLabel>✏️ {label}</ZoneLabel>
                <ZoneHint>Zone éditable</ZoneHint>
            </ZoneHeader>
            <Toolbar onClick={(e) => e.stopPropagation()}>
                <ToolbarButton
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleBold().run();
                    }}
                    $active={editor.isActive('bold')}
                    title="Gras (Ctrl+B)"
                >
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleItalic().run();
                    }}
                    $active={editor.isActive('italic')}
                    title="Italique (Ctrl+I)"
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleBulletList().run();
                    }}
                    $active={editor.isActive('bulletList')}
                    title="Liste à puces"
                >
                    • Liste
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleOrderedList().run();
                    }}
                    $active={editor.isActive('orderedList')}
                    title="Liste numérotée"
                >
                    1. Liste
                </ToolbarButton>
            </Toolbar>
            <EditorArea onClick={(e) => e.stopPropagation()}>
                <EditorContent editor={editor} />
            </EditorArea>
        </ZoneWrapper>
    );
};

export default EditableZone;
