import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', sans-serif;
  }

  body {
    background: #f9f9f9;
    color: #333;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  background: #2e3b55;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const HeaderTitle = styled.h1`
  font-size: 1.3rem;
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const NavLink = styled.a`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: text-decoration 0.2s ease;

  &:hover {
    text-decoration: underline;
  }
`;

export const Main = styled.main`
  flex: 1;
  padding: 1.5rem;
`;

export const Footer = styled.footer`
  background: #2e3b55;
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
`;

export const Button = styled.button`
  background: #2e3b55;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-weight: 500;

  &:hover {
    background: #43557e;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled(Button)`
  background-color: #f0c14b;
  color: #111;
  border: 1px solid #a88734;

  &:hover {
    background-color: #eab530;
  }
`;

export const SecondaryButton = styled(Button)`
  background-color: #e7e7e7;
  color: #111;
  border: 1px solid #adadad;

  &:hover {
    background-color: #dcdcdc;
  }
`;

export const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2e3b55;
  }
`;

export const Select = styled.select`
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #fff;

  &:focus {
    outline: none;
    border-color: #2e3b55;
  }
`;

export const TextArea = styled.textarea`
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #2e3b55;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const FormContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;

export const FormToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

export const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;

  &.active {
    color: #2e3b55;
    border-bottom-color: #2e3b55;
  }
`;

export const Message = styled.p`
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-weight: 500;
`;
