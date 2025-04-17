import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from './HomePage';
import { BrowserRouter } from 'react-router-dom';
import jest from 'jest-mock';
import {describe,test,beforeEach,afterEach,expect} from 'jest-mock';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders without crashing', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/BlogSphere/i)).toBeInTheDocument();
  });

  test('displays title and buttons after animation delay', () => {
    renderWithRouter(<HomePage />);
    
    const titleElement = screen.getByText(/BlogSphere/i);
    expect(titleElement.closest('header')).toHaveClass('opacity-0');
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(titleElement.closest('header')).toHaveClass('opacity-100');
    
    const loginButton = screen.getByText(/Login/i);
    const buttonsContainer = loginButton.closest('div');
    expect(buttonsContainer).toHaveClass('opacity-0');
    
    act(() => {
      jest.advanceTimersByTime(500); 
    });
    
    expect(buttonsContainer).toHaveClass('opacity-100');
  });

  test('navigates to login page when login button is clicked', () => {
    renderWithRouter(<HomePage />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    const loginButton = screen.getByText(/Login/i);
    fireEvent.click(loginButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navigates to register page when register button is clicked', () => {
    renderWithRouter(<HomePage />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    const registerButton = screen.getByText(/Register/i);
    fireEvent.click(registerButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('navigates to all blogs page when explore button is clicked', () => {
    renderWithRouter(<HomePage />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    const exploreButton = screen.getByText(/Explore Recent Blogs/i);
    fireEvent.click(exploreButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/allblog');
  });

  test('blog emoji changes on interval', () => {
    renderWithRouter(<HomePage />);
    
    const initialEmojiElement = screen.queryByText('✍️') || screen.queryByText('📝') || screen.queryByText('📚') || screen.queryByText('💭') || screen.queryByText('🖋️') || screen.queryByText('📖');
    const initialEmoji = initialEmojiElement.textContent;
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    const newEmojiElement = screen.queryByText('✍️') || screen.queryByText('📝') || screen.queryByText('📚') || screen.queryByText('💭') || screen.queryByText('🖋️') || screen.queryByText('📖');
    const newEmoji = newEmojiElement.textContent;
    
    expect(newEmoji).not.toBe(initialEmoji);
  });
});