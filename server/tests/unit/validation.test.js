const { validationResult } = require('express-validator');
const {
  createBugValidation,
  updateBugValidation,
  bugIdValidation,
  bugQueryValidation,
  assignBugValidation,
  resolveBugValidation,
} = require('../../src/utils/validation');

// Helper function to run validation
const runValidation = async (validations, req) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  return errors;
};

// Mock request object
const createMockReq = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
});

describe('Validation Utils', () => {
  describe('createBugValidation', () => {
    it('should pass validation with valid bug data', async () => {
      const req = createMockReq({
        title: 'Valid Bug Title',
        description: 'This is a valid bug description with enough characters',
        reporter: 'John Doe',
        status: 'open',
        priority: 'high',
        category: 'frontend',
        severity: 'major',
        environment: 'production',
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation if title is missing', async () => {
      const req = createMockReq({
        description: 'This is a valid bug description',
        reporter: 'John Doe',
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'title')).toBe(true);
    });

    it('should fail validation if title is too short', async () => {
      const req = createMockReq({
        title: 'ab', // 2 characters
        description: 'This is a valid bug description',
        reporter: 'John Doe',
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'title' && error.msg.includes('between 3 and 100'))).toBe(true);
    });

    it('should fail validation if title is too long', async () => {
      const req = createMockReq({
        title: 'a'.repeat(101), // 101 characters
        description: 'This is a valid bug description',
        reporter: 'John Doe',
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'title' && error.msg.includes('between 3 and 100'))).toBe(true);
    });

    it('should fail validation if description is missing', async () => {
      const req = createMockReq({
        title: 'Valid Bug Title',
        reporter: 'John Doe',
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'description')).toBe(true);
    });

    it('should fail validation if description is too short', async () => {
      const req = createMockReq({
        title: 'Valid Bug Title',
        description: 'short', // 5 characters
        reporter: 'John Doe',
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'description' && error.msg.includes('between 10 and 2000'))).toBe(true);
    });

    it('should fail validation if reporter is missing', async () => {
      const req = createMockReq({
        title: 'Valid Bug Title',
        description: 'This is a valid bug description',
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'reporter')).toBe(true);
    });

    it('should fail validation with invalid status', async () => {
      const req = createMockReq({
        title: 'Valid Bug Title',
        description: 'This is a valid bug description',
        reporter: 'John Doe',
        status: 'invalid-status',
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'status')).toBe(true);
    });

    it('should fail validation with invalid priority', async () => {
      const req = createMockReq({
        title: 'Valid Bug Title',
        description: 'This is a valid bug description',
        reporter: 'John Doe',
        priority: 'invalid-priority',
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'priority')).toBe(true);
    });

    it('should pass validation with valid arrays', async () => {
      const req = createMockReq({
        title: 'Valid Bug Title',
        description: 'This is a valid bug description',
        reporter: 'John Doe',
        stepsToReproduce: ['Step 1', 'Step 2', 'Step 3'],
        tags: ['bug', 'frontend', 'urgent'],
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation with invalid array items', async () => {
      const req = createMockReq({
        title: 'Valid Bug Title',
        description: 'This is a valid bug description',
        reporter: 'John Doe',
        stepsToReproduce: ['Valid step', ''], // Empty step
        tags: ['valid-tag', 'a'.repeat(21)], // Tag too long
      });

      const errors = await runValidation(createBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('updateBugValidation', () => {
    it('should pass validation with partial update data', async () => {
      const req = createMockReq({
        title: 'Updated Bug Title',
        status: 'in-progress',
      });

      const errors = await runValidation(updateBugValidation, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass validation with resolution data', async () => {
      const req = createMockReq({
        status: 'resolved',
        resolution: 'Fixed the issue by updating the configuration',
        resolvedBy: 'Developer Name',
      });

      const errors = await runValidation(updateBugValidation, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation if resolution is too long', async () => {
      const req = createMockReq({
        resolution: 'a'.repeat(1001), // 1001 characters
      });

      const errors = await runValidation(updateBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'resolution')).toBe(true);
    });
  });

  describe('bugIdValidation', () => {
    it('should pass validation with valid MongoDB ObjectId', async () => {
      const req = createMockReq({}, { id: '507f1f77bcf86cd799439011' });

      const errors = await runValidation(bugIdValidation, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation with invalid ObjectId', async () => {
      const req = createMockReq({}, { id: 'invalid-id' });

      const errors = await runValidation(bugIdValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'id')).toBe(true);
    });
  });

  describe('bugQueryValidation', () => {
    it('should pass validation with valid query parameters', async () => {
      const req = createMockReq({}, {}, {
        page: '1',
        limit: '10',
        status: 'open',
        priority: 'high',
        category: 'frontend',
        search: 'bug description',
      });

      const errors = await runValidation(bugQueryValidation, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation with invalid page number', async () => {
      const req = createMockReq({}, {}, {
        page: '0', // Page must be >= 1
      });

      const errors = await runValidation(bugQueryValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'page')).toBe(true);
    });

    it('should fail validation with invalid limit', async () => {
      const req = createMockReq({}, {}, {
        limit: '101', // Limit must be <= 100
      });

      const errors = await runValidation(bugQueryValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'limit')).toBe(true);
    });

    it('should fail validation with invalid status in query', async () => {
      const req = createMockReq({}, {}, {
        status: 'invalid-status',
      });

      const errors = await runValidation(bugQueryValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'status')).toBe(true);
    });
  });

  describe('assignBugValidation', () => {
    it('should pass validation with valid assignee', async () => {
      const req = createMockReq({
        assignee: 'John Doe',
      });

      const errors = await runValidation(assignBugValidation, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation if assignee is missing', async () => {
      const req = createMockReq({});

      const errors = await runValidation(assignBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'assignee')).toBe(true);
    });

    it('should fail validation if assignee is too long', async () => {
      const req = createMockReq({
        assignee: 'a'.repeat(51), // 51 characters
      });

      const errors = await runValidation(assignBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'assignee')).toBe(true);
    });
  });

  describe('resolveBugValidation', () => {
    it('should pass validation with valid resolution data', async () => {
      const req = createMockReq({
        resolvedBy: 'Jane Smith',
        resolution: 'Fixed the issue by updating the database schema and adding proper validation',
      });

      const errors = await runValidation(resolveBugValidation, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation if resolvedBy is missing', async () => {
      const req = createMockReq({
        resolution: 'Fixed the issue',
      });

      const errors = await runValidation(resolveBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'resolvedBy')).toBe(true);
    });

    it('should fail validation if resolution is missing', async () => {
      const req = createMockReq({
        resolvedBy: 'Jane Smith',
      });

      const errors = await runValidation(resolveBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'resolution')).toBe(true);
    });

    it('should fail validation if resolution is too short', async () => {
      const req = createMockReq({
        resolvedBy: 'Jane Smith',
        resolution: 'Fixed', // 5 characters, minimum is 10
      });

      const errors = await runValidation(resolveBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'resolution' && error.msg.includes('between 10 and 1000'))).toBe(true);
    });

    it('should fail validation if resolution is too long', async () => {
      const req = createMockReq({
        resolvedBy: 'Jane Smith',
        resolution: 'a'.repeat(1001), // 1001 characters
      });

      const errors = await runValidation(resolveBugValidation, req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(error => error.path === 'resolution' && error.msg.includes('between 10 and 1000'))).toBe(true);
    });
  });
});