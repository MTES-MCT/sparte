import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import Drawer from '@components/ui/Drawer';
import BaseCard from '@components/ui/BaseCard';
import IconBadge from '@components/ui/IconBadge';
import Button from '@components/ui/Button';

const Container = styled.div`
    padding: 1.25rem ${theme.spacing.lg};
    border-radius: ${theme.radius.default};
    background: ${theme.colors.background};
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: ${theme.spacing.lg};
`;

const TitleLabel = styled.span`
    font-weight: ${theme.fontWeight.bold};
    font-size: ${theme.fontSize.md};
    color: ${theme.colors.text};
    letter-spacing: -0.01em;
`;

const Content = styled.div`
    font-size: ${theme.fontSize.sm};
    line-height: 1.7;
    color: ${theme.colors.textLight};
    flex: 1;

    strong {
        color: ${theme.colors.text};
    }
`;

const MoreLinkWrapper = styled.div`
    align-self: flex-end;
    margin-top: auto;
    padding-top: ${theme.spacing.md};
`;

interface GuideContentProps {
    title: string;
    children: ReactNode;
    DrawerTitle?: string;
    drawerChildren?: ReactNode;
}

const GuideContent: React.FC<GuideContentProps> = ({ title, children, DrawerTitle, drawerChildren }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    return (
        <BaseCard>
            <Container>
                <Header>
                    <IconBadge icon="bi bi-lightbulb" size={40} />
                    <TitleLabel>{title}</TitleLabel>
                </Header>
                <Content>
                    {children}
                </Content>
                {drawerChildren && (
                    <>
                        <MoreLinkWrapper>
                            <Button variant="link" onClick={toggleDrawer} type="button">
                                En savoir plus
                                <i className="bi bi-arrow-right" aria-hidden="true" />
                            </Button>
                        </MoreLinkWrapper>
                        <Drawer
                            isOpen={isDrawerOpen}
                            title={DrawerTitle}
                            onClose={toggleDrawer}
                        >
                            {drawerChildren}
                        </Drawer>
                    </>
                )}
            </Container>
        </BaseCard>
    );
};

export default GuideContent;
