import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ProductCard = styled.div`
  background: ${props => props.theme.backgroundCard};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: ${props => props.theme.shadow};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15), 0 4px 12px -5px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.theme.primary}30;
  }

  &.ended img {
    filter: grayscale(40%);
  }

  &.pending img {
    filter: brightness(0.85);
  }
`;

export const StatusOverlay = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.725rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;

  ${ProductCard}.ended & {
    opacity: 1;
    background: #64748b; // Slate grey for ended
  }

  ${ProductCard}.pending & {
    opacity: 1;
    background: #e11d48; // Rose red for pending
  }
`;

export const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const ProductImage = styled.div`
  width: 100%;
  padding-top: 70%; /* Premium 16:11 Aspect Ratio */
  position: relative;
  background-color: ${props => props.theme.secondary};
  overflow: hidden;
  border-bottom: 1px solid ${props => props.theme.border};

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${ProductCard}:hover & img {
    transform: scale(1.06);
  }
`;

export const ProductInfo = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 0.5rem;
`;

export const ProductTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: ${props => props.theme.text};
  margin: 0;
`;

export const ProductDescription = styled.p`
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${props => props.theme.textSecondary};
  flex-grow: 1;
  margin-bottom: 0.75rem;
`;

export const ProductPrice = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

export const PriceLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${props => props.theme.textSecondary}aa;
`;

export const PriceValue = styled.span`
  font-size: 1.35rem;
  font-weight: 800;
  color: ${props => props.theme.primary};
`;

export const HighestBidder = styled.div`
  font-size: 0.825rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.25rem;
  border-top: 1px solid ${props => props.theme.border};
  padding-top: 0.625rem;
  color: ${props => props.theme.textSecondary};
`;

export const BidderLabel = styled.span`
  font-weight: 500;
`;

export const BidderName = styled.span`
  font-weight: 700;
  color: ${props => props.theme.text};
`;
