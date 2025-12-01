import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Recommendations from './Recommendations';

const Hero = styled.section`
  background: linear-gradient(rgba(46, 59, 85, 0.8), rgba(46, 59, 85, 0.8)), 
              url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop') 
              no-repeat center center/cover;
  color: white;
  text-align: center;
  padding: 6rem 1.5rem;
`;

const HeroContent = styled.div`
  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    max-width: 600px;
    margin: 0 auto 2rem;
  }
`;

const PrimaryButton = styled(Link)`
  background-color: #f0c14b;
  color: #111;
  padding: 0.8rem 2rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
  display: inline-block;

  &:hover {
    background-color: #eab530;
  }
`;

const HowItWorks = styled.section`
  padding: 3rem 1.5rem;
  text-align: center;

  h2 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const Step = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 1.5rem;
  max-width: 320px;
  text-align: center;

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    color: #555;
    margin-bottom: 1.5rem;
  }
`;

const StepIcon = styled.div`
  background-color: #2e3b55;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Home = () => {
  return (
    <>
      <Hero>
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
          <Step>
            <StepIcon>1</StepIcon>
            <h3>Register & Browse</h3>
            <p>Create a free account and explore thousands of items.</p>
          </Step>
          <Step>
            <StepIcon>2</StepIcon>
            <h3>Place Your Bid</h3>
            <p>Enter your bid on items you want to win.</p>
          </Step>
          <Step>
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
