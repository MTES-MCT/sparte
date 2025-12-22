import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';
import Drawer from '@components/ui/Drawer';

const Container = styled.div`
    padding: 1.2rem 1.5rem;
    border-radius: 3px;
    background: #D4EEE6;
`;

const Title = styled.div`
    font-weight: 600;
    font-size: 1em;
    margin-bottom: 0.8rem;
`;

const Content = styled.div`
    font-size: 0.85rem;
    line-height: 1.5rem;
    margin-bottom: 0.5rem;
    
    & > p {
        font-size: 0.85rem;
        line-height: 1.5rem;
        margin-bottom: 0.2rem;
    }
    & > ul {
        font-size: 0.85rem;
        line-height: 1.5rem;
        margin-bottom: 0.2rem;

        & > li:last-child {
            padding-bottom: 0;
        }
    }
`;

const Button = styled.button`
    transition: color .3s ease, background .3s ease;
    &:hover {
        background: #000091 !important;
        color: #fff !important;
    }
`;

interface GuideProps {
    title: string;
    children: ReactNode;
    DrawerTitle?: string;
    drawerChildren?: ReactNode;
    className?: string;
}

const Guide: React.FC<GuideProps> = ({ title, children, DrawerTitle, drawerChildren, className }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <Container className={`fr-mb-5w ${className}`}>
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

export default Guide;
