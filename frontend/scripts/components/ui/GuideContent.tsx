import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';
import Drawer from '@components/ui/Drawer';
import InformationIcon from '@images/information.svg';

const StyledInformationIcon = styled(InformationIcon)`
    max-width: 75px;
    height: auto;
    fill:rgb(155, 186, 224);
`;

const Container = styled.div<{ $column: boolean }>`
    display: flex;
    align-items: start;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: 6px;
    background:#E6EEFE;
    margin-bottom: 2rem;

    ${({ $column }) => $column && `
        flex-direction: column;
        align-items: center;
        height: 100%;
    `}

    img {
        width: 75px;
        height: auto;
    }
`;

const Title = styled.div`
    font-weight: 600;
    font-size: 1em;
    margin-bottom: 0.8rem;
`;

const Content = styled.div`
    margin-bottom: 1rem;
    font-size: 0.85rem;
    line-height: 1.5rem;
    margin-bottom: 0.5rem;
    
    & > p {
        font-size: 0.85rem;
        line-height: 1.5rem;
        margin-bottom: 0.5rem;
    }
`;

const Button = styled.button`
    transition: color .3s ease, background .3s ease;
    &:hover {
        background: #000091 !important;
        color: #fff !important;
    }
`;

interface GuideContentProps {
    title: string;
    children: ReactNode;
    DrawerTitle?: string;
    drawerChildren?: ReactNode;
    column?: boolean;
}

const GuideContent: React.FC<GuideContentProps> = ({ title, children, DrawerTitle, drawerChildren, column = false }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <Container $column={column}>
            <StyledInformationIcon />
            <div>
                <Title>{ title }</Title>
                <Content>
                    {children}
                </Content>
                {drawerChildren && (
                    <>
                        <Button onClick={toggleDrawer} className="fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line">
                            En savoir plus
                        </Button>

                        <Drawer
                            isOpen={isDrawerOpen}
                            title={DrawerTitle}
                            onClose={toggleDrawer}
                        >
                            {drawerChildren}
                        </Drawer>
                    </>
                )}
            </div>
        </Container>
    );
};

export default GuideContent;