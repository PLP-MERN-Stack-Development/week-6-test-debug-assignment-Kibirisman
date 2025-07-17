import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import BugForm from '../../pages/BugForm';
import { bugAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockBugAPI = bugAPI;

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: undefined }),
}));

// Test wrapper component
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('BugForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBugAPI.createBug.mockClear();
    mockBugAPI.updateBug.mockClear();
    mockBugAPI.getBug.mockClear();
  });

  describe('Create Mode', () => {
    it('renders create form with all required fields', () => {
      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      expect(screen.getByText('Report New Bug')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reporter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create bug/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /create bug/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/reporter is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for short title', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'ab'); // 2 characters

      const submitButton = screen.getByRole('button', { name: /create bug/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for short description', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'short'); // 5 characters

      const submitButton = screen.getByRole('button', { name: /create bug/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('successfully creates a bug with valid data', async () => {
      const user = userEvent.setup();
      const mockBugData = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'John Doe',
      };

      mockBugAPI.createBug.mockResolvedValue({
        data: { data: mockBugData }
      });

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      // Fill in the form
      await user.type(screen.getByLabelText(/title/i), 'Test Bug');
      await user.type(screen.getByLabelText(/description/i), 'This is a test bug description');
      await user.type(screen.getByLabelText(/reporter/i), 'John Doe');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create bug/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockBugAPI.createBug).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Bug',
            description: 'This is a test bug description',
            reporter: 'John Doe',
          })
        );
      });

      expect(toast.success).toHaveBeenCalledWith('Bug created successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/bugs/507f1f77bcf86cd799439011');
    });

    it('handles API error during bug creation', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Server error';

      mockBugAPI.createBug.mockRejectedValue({
        response: { data: { error: errorMessage } }
      });

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      // Fill in the form
      await user.type(screen.getByLabelText(/title/i), 'Test Bug');
      await user.type(screen.getByLabelText(/description/i), 'This is a test bug description');
      await user.type(screen.getByLabelText(/reporter/i), 'John Doe');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create bug/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('allows adding and removing steps to reproduce', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      // Initially should have one step input
      expect(screen.getAllByPlaceholderText(/step/i)).toHaveLength(1);

      // Add another step
      const addStepButton = screen.getByRole('button', { name: /add step/i });
      await user.click(addStepButton);

      expect(screen.getAllByPlaceholderText(/step/i)).toHaveLength(2);

      // Add some text to the steps
      const stepInputs = screen.getAllByPlaceholderText(/step/i);
      await user.type(stepInputs[0], 'First step');
      await user.type(stepInputs[1], 'Second step');

      // Remove the second step
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]); // Remove second step

      expect(screen.getAllByPlaceholderText(/step/i)).toHaveLength(1);
    });

    it('allows adding and removing tags', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      // Initially should have one tag input
      expect(screen.getAllByPlaceholderText(/tag/i)).toHaveLength(1);

      // Add another tag
      const addTagButton = screen.getByRole('button', { name: /add tag/i });
      await user.click(addTagButton);

      expect(screen.getAllByPlaceholderText(/tag/i)).toHaveLength(2);

      // Add some text to the tags
      const tagInputs = screen.getAllByPlaceholderText(/tag/i);
      await user.type(tagInputs[0], 'frontend');
      await user.type(tagInputs[1], 'urgent');

      // Remove the second tag
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]); // Remove second tag

      expect(screen.getAllByPlaceholderText(/tag/i)).toHaveLength(1);
    });

    it('navigates to bugs list when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/bugs');
    });
  });

  describe('Form Validation', () => {
    it('clears validation error when user starts typing', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      // Submit form to trigger validation errors
      const submitButton = screen.getByRole('button', { name: /create bug/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Start typing in title field
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'New title');

      // Error should be cleared
      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
    });

    it('validates all form fields before submission', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      // Fill in only some fields
      await user.type(screen.getByLabelText(/title/i), 'ab'); // Too short
      await user.type(screen.getByLabelText(/description/i), 'short'); // Too short

      const submitButton = screen.getByRole('button', { name: /create bug/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/reporter is required/i)).toBeInTheDocument();
      });

      // API should not be called
      expect(mockBugAPI.createBug).not.toHaveBeenCalled();
    });
  });

  describe('Form State Management', () => {
    it('updates form state when inputs change', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      // Type in various fields
      await user.type(screen.getByLabelText(/title/i), 'Test Bug Title');
      await user.type(screen.getByLabelText(/description/i), 'Test bug description with enough characters');
      await user.type(screen.getByLabelText(/reporter/i), 'Test Reporter');

      // Select different values
      await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
      await user.selectOptions(screen.getByLabelText(/category/i), 'frontend');
      await user.selectOptions(screen.getByLabelText(/severity/i), 'critical');

      // Verify form state is updated (by checking values)
      expect(screen.getByDisplayValue('Test Bug Title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test bug description with enough characters')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Reporter')).toBeInTheDocument();
      expect(screen.getByDisplayValue('high')).toBeInTheDocument();
      expect(screen.getByDisplayValue('frontend')).toBeInTheDocument();
      expect(screen.getByDisplayValue('critical')).toBeInTheDocument();
    });

    it('filters out empty array items before submission', async () => {
      const user = userEvent.setup();
      const mockBugData = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'John Doe',
      };

      mockBugAPI.createBug.mockResolvedValue({
        data: { data: mockBugData }
      });

      render(
        <TestWrapper>
          <BugForm />
        </TestWrapper>
      );

      // Fill in required fields
      await user.type(screen.getByLabelText(/title/i), 'Test Bug');
      await user.type(screen.getByLabelText(/description/i), 'This is a test bug description');
      await user.type(screen.getByLabelText(/reporter/i), 'John Doe');

      // Add some steps and tags, leaving some empty
      const addStepButton = screen.getByRole('button', { name: /add step/i });
      await user.click(addStepButton);
      await user.click(addStepButton);

      const stepInputs = screen.getAllByPlaceholderText(/step/i);
      await user.type(stepInputs[0], 'First step');
      // Leave second step empty
      await user.type(stepInputs[2], 'Third step');

      const addTagButton = screen.getByRole('button', { name: /add tag/i });
      await user.click(addTagButton);

      const tagInputs = screen.getAllByPlaceholderText(/tag/i);
      await user.type(tagInputs[0], 'frontend');
      // Leave second tag empty

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create bug/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockBugAPI.createBug).toHaveBeenCalledWith(
          expect.objectContaining({
            stepsToReproduce: ['First step', 'Third step'], // Empty step filtered out
            tags: ['frontend'], // Empty tag filtered out
          })
        );
      });
    });
  });
});