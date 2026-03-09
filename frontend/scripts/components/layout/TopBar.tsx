import React, { memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { selectIsNavbarOpen } from "@store/navbarSlice";
import ButtonToggleNavbar from "@components/ui/ButtonToggleNavbar";
import Button from "@components/ui/Button";
import { Tooltip } from "react-tooltip";
import { useGetUserLandPreferenceQuery, useToggleFavoriteMutation } from '@services/api';
import { theme } from '@theme';

const Container = styled.div`
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid ${theme.colors.border};
    z-index: 997;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    min-height: 4.6rem;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.md};
    }
`;

const LeftSection = styled.div`
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};

    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-start;
    }
`;

const Title = styled.div`
    color: ${theme.colors.purple};
    margin: 0;
    padding: 0;
    font-size: ${theme.fontSize.xxl};
    line-height: 1.2em;
    font-weight: ${theme.fontWeight.semibold};
`;

const FavoriteButton = styled(Button)<{ $active: boolean }>`
    font-size: ${theme.fontSize.xl};
    line-height: 1;
    color: ${({ $active }) => ($active ? theme.colors.star : theme.colors.textMuted)};

    &:hover {
        color: ${theme.colors.star};
    }

    &:disabled {
        opacity: 0.5;
    }
`;

interface TopBarProps {
    name?: string;
    landType?: string;
    landId?: string;
}

const TopBar: React.FC<TopBarProps> = ({ name, landType, landId }) => {
    const isOpen = useSelector(selectIsNavbarOpen);
    const { data: preference } = useGetUserLandPreferenceQuery(
        { land_type: landType!, land_id: landId! },
        { skip: !landType || !landId },
    );
    const [toggleFavorite, { isLoading: isToggling }] = useToggleFavoriteMutation();

    const handleToggleFavorite = useCallback(() => {
        if (landType && landId) {
            toggleFavorite({ land_type: landType, land_id: landId });
        }
    }, [landType, landId, toggleFavorite]);

    const isFavorited = preference?.is_favorited ?? false;

    return (
        <Container>
            <LeftSection>
                { !isOpen && <ButtonToggleNavbar /> }
                <Title>{ name }</Title>
                {landType && landId && (
                    <FavoriteButton
                        variant="tertiary" noBackground
                        $active={isFavorited}
                        onClick={handleToggleFavorite}
                        disabled={isToggling}
                        data-tooltip-id="tooltip-favorite"
                        data-tooltip-content={isFavorited ? 'Retirer des territoires favoris' : 'Ajouter aux territoires favoris'}
                        aria-label={isFavorited ? 'Retirer des territoires favoris' : 'Ajouter aux territoires favoris'}
                    >
                        {isFavorited ? <i className='bi bi-star-fill'></i> : <i className='bi bi-star'></i>}
                        <Tooltip id="tooltip-favorite" className="fr-text--xs" place="right" />
                    </FavoriteButton>
                )}
            </LeftSection>
            <RightSection id="topbar-slot">
                {/* Le contenu sera rendu ici via React Portal */}
            </RightSection>
        </Container>
    );
};

export default memo(TopBar);
