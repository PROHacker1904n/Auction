import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ProductCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  &.ended .product-image img {
    filter: grayscale(80%);
  }

  &.pending .product-image img {
    filter: brightness(0.8);
  }
`;

export const StatusOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;

  ${ProductCard}.ended & {
    opacity: 1;
  }

  ${ProductCard}.pending & {
    opacity: 1;
    background: rgba(0, 0, 0, 0.4);
    color: white;
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
  padding-top: 100%;
  position: relative;
  background-color: #f0f0f0;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ProductInfo = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const ProductTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111;
`;

export const ProductDescription = styled.p`
  font-size: 0.9rem;
  color: #555;
  flex-grow: 1;
  margin-bottom: 1rem;
`;

export const ProductPrice = styled.div`
  margin-top: auto;
  margin-bottom: 0.5rem;
`;

export const PriceLabel = styled.span`
  font-size: 0.8rem;
  color: #555;
`;

export const PriceValue = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #B12704;
`;

export const HighestBidder = styled.div`
  font-size: 0.8rem;
  color: #555;
`;

export const BidderLabel = styled.span`
  font-weight: 500;
`;

export const BidderName = styled.span`
  font-weight: 600;
  color: #111;
`;
