import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Lottie from 'lottie-react';
import { theme } from '@theme';
import Button from '@components/ui/Button';
import BaseCard from '@components/ui/BaseCard';

import rocketAnimation from '@animations/thumbs-up.json';
import successAnimation from '@animations/success.json';

const starPop = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const Wrapper = styled(BaseCard)`
  display: flex;
  align-items: stretch;
  overflow: visible;
`;

const RocketSide = styled.div`
  position: relative;
  width: 35%;
  min-width: 200px;
  background: linear-gradient(145deg, ${theme.colors.primary} 0%, #2a2a8a 100%);
  border-radius: ${theme.radius} 0 0 ${theme.radius};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;

  @media (max-width: 768px) {
    display: none;
  }
`;

const AnimationWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: auto;
  z-index: 10;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ContentSide = styled.div`
  flex: 1;
  padding: 2vw 2vw 2vw 3vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 280px;

  @media (max-width: 768px) {
    padding: 6% 5%;
    min-height: 260px;
  }
`;

const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: ${theme.spacing.sm};
`;

const Title = styled.h3`
  font-size: clamp(1.25rem, 3vw, 1.6rem);
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.xs} 0;
  line-height: 1.3;
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: 1.6;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: clamp(0.4rem, 2vw, 0.75rem);
  margin-bottom: ${theme.spacing.lg};
`;

const Star = styled.button<{ $active: boolean; $animated: boolean }>`
  background: ${({ $active }) => ($active ? theme.colors.accentLight : theme.colors.backgroundAlt)};
  border: 2px solid ${({ $active }) => ($active ? '#fbbf24' : theme.colors.border)};
  border-radius: ${theme.radius};
  width: clamp(40px, 10vw, 52px);
  height: clamp(40px, 10vw, 52px);
  cursor: pointer;
  font-size: clamp(1rem, 3vw, 1.3rem);
  color: ${({ $active }) => ($active ? '#fbbf24' : theme.colors.textMuted)};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({ $animated }) =>
    $animated &&
    css`
      animation: ${starPop} 0.3s ease;
    `}

  &:hover {
    transform: scale(1.1);
    background: ${theme.colors.accentLight};
    border-color: #fbbf24;
    color: #fbbf24;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  align-items: flex-start;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.backgroundAlt};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius};
  font-size: ${theme.fontSize.sm};
  font-family: inherit;
  color: ${theme.colors.text};
  resize: none;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;


interface FeedbackProps {
  onSubmit?: (rating: number, comment: string) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [animatedStar, setAnimatedStar] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (star: number) => {
    setRating(star);
    setAnimatedStar(star);
    setTimeout(() => setAnimatedStar(null), 300);
  };

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit?.(rating, comment);
      setSubmitted(true);
    }
  };

  const displayRating = hoveredRating || rating;

  const currentAnimation = submitted ? successAnimation : rocketAnimation;

  return (
    <Wrapper>
      <RocketSide>
        <AnimationWrapper>
          <Lottie
            animationData={currentAnimation}
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        </AnimationWrapper>
      </RocketSide>
      <ContentSide>
        {submitted ? (
          <>
            <Eyebrow>
              <i className="bi bi-check-circle" />
              Merci
            </Eyebrow>
            <Title>Votre avis a bien été envoyé !</Title>
            <Subtitle>Merci de contribuer à l'amélioration de l'outil.</Subtitle>
          </>
        ) : (
          <>
            <Eyebrow>
              Votre avis compte
            </Eyebrow>
            <Title>Cette page vous a-t-elle été utile ?</Title>
            <Subtitle>Aidez-nous à améliorer l'outil en partageant votre expérience.</Subtitle>

            <StarsContainer>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  type="button"
                  $active={star <= displayRating}
                  $animated={star === animatedStar}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                >
                  <i className={star <= displayRating ? 'bi bi-star-fill' : 'bi bi-star'} />
                </Star>
              ))}
            </StarsContainer>

            <FormGroup>
              <TextArea
                placeholder="Un commentaire ? Une suggestion ?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button variant="primary" icon="bi bi-send" iconPosition="right" onClick={handleSubmit} disabled={rating === 0}>
                Envoyer
              </Button>
            </FormGroup>
          </>
        )}
      </ContentSide>
    </Wrapper>
  );
};

export default Feedback;
