import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Recommendations from './Recommendations';
import { motion } from 'framer-motion';

const Hero = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.primary}20 0%, ${props => props.theme.accent}15 100%), 
              url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop') 
              no-repeat center center/cover;
  color: ${props => props.theme.text};
  text-align: center;
  padding: 8rem 2rem;
  border-radius: 24px;
  margin-bottom: 3rem;
  border: 1px solid ${props => props.theme.border};
  box-shadow: ${props => props.theme.shadow};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
`;

const HeroContent = styled.div`
  max-width: 700px;
  
  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.25rem;
    letter-spacing: -0.03em;
    line-height: 1.1;
    background: linear-gradient(135deg, ${props => props.theme.text} 30%, ${props => props.theme.primary} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 1.2rem;
    color: ${props => props.theme.textSecondary};
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }
`;

const PrimaryButton = styled(Link)`
  background-color: ${props => props.theme.primary};
  color: white;
  padding: 0.875rem 2.25rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 15px ${props => props.theme.primary}30;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;

  &:hover {
    background-color: ${props => props.theme.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${props => props.theme.primary}45;
  }

  &:active {
    transform: translateY(0);
  }
`;

const HowItWorks = styled.section`
  padding: 4rem 1.5rem;
  text-align: center;

  h2 {
    font-size: 2.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 3rem;
    color: ${props => props.theme.text};
  }
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const Step = styled.div`
  background: ${props => props.theme.backgroundCard};
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  box-shadow: ${props => props.theme.shadow};
  padding: 2.5rem 2rem;
  max-width: 340px;
  flex: 1 1 300px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme.primary}25;
  }

  h3 {
    font-size: 1.35rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: ${props => props.theme.text};
    letter-spacing: -0.01em;
  }

  p {
    color: ${props => props.theme.textSecondary};
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

const StepIcon = styled.div`
  background-color: ${props => props.theme.primary};
  color: white;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px ${props => props.theme.primary}25;
`;

const Home = () => {
  return (
    <>
      <Hero
        as={motion.section}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <HeroContent>
          <h1>The Thrill of the Bid, Redefined.</h1>
          <p>Discover rare finds, exclusive items, and unbeatable deals. Your next treasure is just a bid away.</p>
          <PrimaryButton to="/listings">Explore Auctions</PrimaryButton>
        </HeroContent>
      </Hero>

      <Recommendations />

      <HowItWorks>
        <h2>How It Works</h2>
        <StepsContainer>
          <Step
            as={motion.div}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <StepIcon>1</StepIcon>
            <h3>Register & Browse</h3>
            <p>Create a free account and explore thousands of items.</p>
          </Step>
          <Step
            as={motion.div}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <StepIcon>2</StepIcon>
            <h3>Place Your Bid</h3>
            <p>Enter your bid on items you want to win.</p>
          </Step>
          <Step
            as={motion.div}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <StepIcon>3</StepIcon>
            <h3>Win & Pay</h3>
            <p>If you're the highest bidder, the item is yours!</p>
          </Step>
        </StepsContainer>
      </HowItWorks>
    </>
  );
};

export default Home;
