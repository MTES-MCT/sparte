import React, { memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { selectIsNavbarOpen } from "@store/navbarSlice";
import ButtonToggleNavbar from "@components/ui/ButtonToggleNavbar";
import { useGetUserLandPreferenceQuery, useToggleFavoriteMutation } from '@services/api';

const activeColor = '#4318FF';

const Container = styled.div`
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid #EBEBEC;
    z-index: 997;
    padding: 1rem 1.5rem;
    min-height: 4.6rem;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
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
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-start;
    }
`;

const Title = styled.div`
    color: ${activeColor};
    margin: 0;
    padding: 0;
    font-size: 1.75em;
    line-height: 1.2em;
    font-weight: 600;
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    padding: 0.25rem;
    color: ${({ $active }) => ($active ? '#FFD700' : '#ccc')};
    transition: color 0.2s ease;

    &:hover {
        color: #FFD700;
    }

    &:disabled {
        cursor: default;
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
                        $active={isFavorited}
                        onClick={handleToggleFavorite}
                        disabled={isToggling}
                        title={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                        {isFavorited ? '\u2605' : '\u2606'}
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
