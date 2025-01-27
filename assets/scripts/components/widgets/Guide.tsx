import React, { useState } from "react";
import styled from "styled-components";
import Drawer from "@components/ui/Drawer";
import InformationIcon from "@images/information.svg";

const StyledInformationIcon = styled(InformationIcon)`
  max-width: 75px;
  height: auto;
  fill: #48d5a7;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  border-radius: 6px;
  background: #c8f2e5;
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
`;

const Content = styled.div`
  font-size: 0.8em;
  padding: 0;
  margin: 0;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  transition:
    color 0.3s ease,
    background 0.3s ease;
  &:hover {
    background: #000091 !important;
    color: #fff !important;
  }
`;

interface GuideProps {
  title: string;
  contentHtml: string;
  DrawerTitle?: string;
  DrawerContentHtml?: string;
}

const Guide: React.FC<GuideProps> = ({
  title,
  contentHtml,
  DrawerTitle,
  DrawerContentHtml,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Container>
      <StyledInformationIcon />
      <div>
        <Title>{title}</Title>
        <Content dangerouslySetInnerHTML={{ __html: contentHtml }} />
        {DrawerContentHtml && (
          <>
            <Button
              onClick={toggleDrawer}
              className="fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
            >
              En savoir plus
            </Button>

            <Drawer
              isOpen={isDrawerOpen}
              title={DrawerTitle}
              contentHtml={DrawerContentHtml}
              onClose={toggleDrawer}
            />
          </>
        )}
      </div>
    </Container>
  );
};

export default Guide;
