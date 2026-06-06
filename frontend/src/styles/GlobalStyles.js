import styled, { createGlobalStyle } from 'styled-components';

export const lightTheme = {
  body: '#f8fafc', // slate-50
  text: '#0f172a', // slate-900
  textSecondary: '#475569', // slate-600
  primary: '#4f46e5', // indigo-600
  primaryHover: '#4338ca', // indigo-700
  secondary: '#f1f5f9', // slate-100
  secondaryHover: '#e2e8f0', // slate-200
  accent: '#10b981', // emerald-500
  backgroundCard: '#ffffff',
  border: '#e2e8f0', // slate-200
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  glassBackground: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(241, 245, 249, 0.6)',
  inputBg: '#ffffff',
};

export const darkTheme = {
  body: '#020617', // slate-955
  text: '#f8fafc', // slate-50
  textSecondary: '#94a3b8', // slate-400
  primary: '#6366f1', // indigo-500
  primaryHover: '#4f46e5', // indigo-600
  secondary: '#1e293b', // slate-800
  secondaryHover: '#334155', // slate-700
  accent: '#34d399', // emerald-400
  backgroundCard: '#0f172a', // slate-900
  border: '#1e293b', // slate-800
  shadow: '0 4px 20px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.25)',
  glassBackground: 'rgba(15, 23, 42, 0.65)',
  glassBorder: 'rgba(255, 255, 255, 0.05)',
  inputBg: '#0f172a',
};

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  body {
    background-color: ${props => props.theme.body};
    color: ${props => props.theme.text};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  background: ${props => props.theme.glassBackground};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${props => props.theme.glassBorder};
  color: ${props => props.theme.text};
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${props => props.theme.shadow};
  transition: background 0.3s ease, border-bottom 0.3s ease, color 0.3s ease;
`;

export const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.accent} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

export const NavLink = styled.a`
  color: ${props => props.theme.textSecondary};
  text-decoration: none;
  font-weight: 600;
  font-size: 0.925rem;
  transition: color 0.2s ease, transform 0.2s ease;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.text};
    transform: translateY(-1px);
  }
`;

export const Main = styled.main`
  flex: 1;
  padding: 2.5rem 2rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
`;

export const Footer = styled.footer`
  background: ${props => props.theme.backgroundCard};
  border-top: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.textSecondary};
  text-align: center;
  padding: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.3s ease, border-top 0.3s ease, color 0.3s ease;
`;

export const Button = styled.button`
  background: ${props => props.theme.secondary};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 0.625rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.theme.secondaryHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${props => props.theme.secondary};
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const PrimaryButton = styled(Button)`
  background: ${props => props.theme.primary};
  color: #ffffff;
  border: 1px solid transparent;

  &:hover {
    background: ${props => props.theme.primaryHover};
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
  }
`;

export const SecondaryButton = styled(Button)`
  background: ${props => props.theme.secondary};
  color: ${props => props.theme.text};

  &:hover {
    background: ${props => props.theme.secondaryHover};
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.inputBg};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  font-size: 0.95rem;
  color: ${props => props.theme.text};
  transition: all 0.2s ease;

  &::placeholder {
    color: ${props => props.theme.textSecondary}80;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}15;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.inputBg};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  font-size: 0.95rem;
  color: ${props => props.theme.text};
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.2em;
  padding-right: 2.5rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}15;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.inputBg};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  font-size: 0.95rem;
  color: ${props => props.theme.text};
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 110px;

  &::placeholder {
    color: ${props => props.theme.textSecondary}80;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}15;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const FormContainer = styled.div`
  max-width: 420px;
  width: 100%;
  margin: 3rem auto;
  padding: 2.5rem;
  background: ${props => props.theme.backgroundCard};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  box-shadow: ${props => props.theme.shadow};
  transition: all 0.3s ease;
`;

export const FormToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: ${props => props.theme.secondary};
  border-radius: 10px;
  padding: 0.25rem;
  border: 1px solid ${props => props.theme.border};
`;

export const ToggleButton = styled.button`
  flex: 1;
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;

  &.active {
    background: ${props => props.theme.backgroundCard};
    color: ${props => props.theme.text};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  &:hover:not(.active) {
    color: ${props => props.theme.text};
  }
`;

export const Message = styled.p`
  text-align: center;
  margin-top: 1.25rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  width: 100%;
`;

export const StyledLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 0.125rem;
  display: inline-block;
  transition: color 0.2s ease;
`;

