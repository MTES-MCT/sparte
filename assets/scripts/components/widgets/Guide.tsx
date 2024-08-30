import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Drawer from '@components/ui/Drawer';

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem;
    border-radius: 6px;
    background: #111245;
    background: -webkit-linear-gradient(277deg, #111245 0%, #5521a0 100%);
    background: linear-gradient(277deg, #111245 0%, #5521a0 100%);
    margin-bottom: 2rem;

    img {
        width: 75px;
        height: auto;
    }
`;

const Title = styled.div`
    font-weight: 600;
    font-size: 0.9em;
    margin-bottom: 0.4rem;
    color: #fff;
`;

const Content = styled.div`
    font-size: 0.8em;
    color: #fff;
    padding: 0;
    margin: 0;
    margin-bottom: 0.4rem;
`;

const Button = styled.button`
    background: #fff;
`;

interface GuideProps {
    title: string;
    contentHtml: string;
    DrawerTitle: string;
    DrawerContentHtml: string;
}

const Guide: React.FC<GuideProps> = ({ title, contentHtml, DrawerTitle, DrawerContentHtml }) => {
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setDrawerOpen(!isDrawerOpen);
    };

    return (
        <>
            <Container>
                <img src="/static/project/img/information.svg" alt="" />
                <div>
                    <Title>{ title }</Title>
                    <Content dangerouslySetInnerHTML={{ __html: contentHtml }} />
                    <Button onClick={toggleDrawer} className="fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line">
                        En savoir plus sur le cadre réglementaire
                    </Button>
                </div>
            </Container>

            <Drawer
                isOpen={isDrawerOpen}
                title={DrawerTitle}
                contentHtml={DrawerContentHtml}
                onClose={toggleDrawer}
            />
        </>
    );
};

export default Guide;