const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Bug = require('../../src/models/Bug');

// Clean up database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

describe('Bug API Integration Tests', () => {
  // Sample bug data for testing
  const sampleBugData = {
    title: 'Test Bug',
    description: 'This is a test bug description with enough characters to pass validation',
    reporter: 'Test Reporter',
    status: 'open',
    priority: 'medium',
    category: 'frontend',
    severity: 'major',
    environment: 'development',
  };

  const sampleBugData2 = {
    title: 'Another Test Bug',
    description: 'This is another test bug description for testing purposes',
    reporter: 'Another Reporter',
    status: 'in-progress',
    priority: 'high',
    category: 'backend',
    assignee: 'Test Assignee',
  };

  describe('POST /api/bugs', () => {
    it('should create a new bug with valid data', async () => {
      const res = await request(app)
        .post('/api/bugs')
        .send(sampleBugData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toBe(sampleBugData.title);
      expect(res.body.data.description).toBe(sampleBugData.description);
      expect(res.body.data.reporter).toBe(sampleBugData.reporter);
      expect(res.body.data.status).toBe(sampleBugData.status);
      expect(res.body.data.priority).toBe(sampleBugData.priority);
    });

    it('should return 400 if title is missing', async () => {
      const invalidData = { ...sampleBugData };
      delete invalidData.title;

      const res = await request(app)
        .post('/api/bugs')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'title',
            msg: expect.stringMatching(/required/i),
          }),
        ])
      );
    });

    it('should return 400 if description is missing', async () => {
      const invalidData = { ...sampleBugData };
      delete invalidData.description;

      const res = await request(app)
        .post('/api/bugs')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'description',
            msg: expect.stringMatching(/required/i),
          }),
        ])
      );
    });

    it('should return 400 if reporter is missing', async () => {
      const invalidData = { ...sampleBugData };
      delete invalidData.reporter;

      const res = await request(app)
        .post('/api/bugs')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'reporter',
            msg: expect.stringMatching(/required/i),
          }),
        ])
      );
    });

    it('should return 400 if title is too short', async () => {
      const invalidData = { ...sampleBugData, title: 'ab' };

      const res = await request(app)
        .post('/api/bugs')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'title',
            msg: expect.stringMatching(/between 3 and 100/i),
          }),
        ])
      );
    });

    it('should return 400 if description is too short', async () => {
      const invalidData = { ...sampleBugData, description: 'short' };

      const res = await request(app)
        .post('/api/bugs')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'description',
            msg: expect.stringMatching(/between 10 and 2000/i),
          }),
        ])
      );
    });

    it('should return 400 with invalid status', async () => {
      const invalidData = { ...sampleBugData, status: 'invalid-status' };

      const res = await request(app)
        .post('/api/bugs')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'status',
          }),
        ])
      );
    });

    it('should create bug with arrays (steps and tags)', async () => {
      const bugWithArrays = {
        ...sampleBugData,
        stepsToReproduce: ['Step 1', 'Step 2', 'Step 3'],
        tags: ['frontend', 'urgent'],
      };

      const res = await request(app)
        .post('/api/bugs')
        .send(bugWithArrays);

      expect(res.status).toBe(201);
      expect(res.body.data.stepsToReproduce).toEqual(bugWithArrays.stepsToReproduce);
      expect(res.body.data.tags).toEqual(bugWithArrays.tags);
    });
  });

  describe('GET /api/bugs', () => {
    beforeEach(async () => {
      // Create test bugs
      await Bug.create(sampleBugData);
      await Bug.create(sampleBugData2);
    });

    it('should return all bugs', async () => {
      const res = await request(app).get('/api/bugs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(1);
    });

    it('should filter bugs by status', async () => {
      const res = await request(app)
        .get('/api/bugs')
        .query({ status: 'open' });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].status).toBe('open');
    });

    it('should filter bugs by priority', async () => {
      const res = await request(app)
        .get('/api/bugs')
        .query({ priority: 'high' });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].priority).toBe('high');
    });

    it('should filter bugs by category', async () => {
      const res = await request(app)
        .get('/api/bugs')
        .query({ category: 'backend' });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].category).toBe('backend');
    });

    it('should filter bugs by assignee', async () => {
      const res = await request(app)
        .get('/api/bugs')
        .query({ assignee: 'Test Assignee' });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].assignee).toBe('Test Assignee');
    });

    it('should search bugs in title and description', async () => {
      const res = await request(app)
        .get('/api/bugs')
        .query({ search: 'Another' });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toContain('Another');
    });

    it('should paginate results', async () => {
      // Create more bugs for pagination
      for (let i = 3; i <= 15; i++) {
        await Bug.create({
          title: `Bug ${i}`,
          description: `Description for bug ${i} with enough characters`,
          reporter: `Reporter ${i}`,
        });
      }

      const page1 = await request(app)
        .get('/api/bugs')
        .query({ page: 1, limit: 10 });

      const page2 = await request(app)
        .get('/api/bugs')
        .query({ page: 2, limit: 10 });

      expect(page1.status).toBe(200);
      expect(page1.body.count).toBe(10);
      expect(page1.body.page).toBe(1);

      expect(page2.status).toBe(200);
      expect(page2.body.count).toBe(5);
      expect(page2.body.page).toBe(2);

      // Ensure different bugs on different pages
      expect(page1.body.data[0]._id).not.toBe(page2.body.data[0]._id);
    });

    it('should validate query parameters', async () => {
      const res = await request(app)
        .get('/api/bugs')
        .query({ status: 'invalid-status' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/bugs/:id', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create(sampleBugData);
      bugId = bug._id.toString();
    });

    it('should return a bug by ID', async () => {
      const res = await request(app).get(`/api/bugs/${bugId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(bugId);
      expect(res.body.data.title).toBe(sampleBugData.title);
    });

    it('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/bugs/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Bug not found');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const res = await request(app).get('/api/bugs/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/bugs/:id', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create(sampleBugData);
      bugId = bug._id.toString();
    });

    it('should update a bug with valid data', async () => {
      const updateData = {
        title: 'Updated Bug Title',
        status: 'in-progress',
        priority: 'high',
      };

      const res = await request(app)
        .put(`/api/bugs/${bugId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updateData.title);
      expect(res.body.data.status).toBe(updateData.status);
      expect(res.body.data.priority).toBe(updateData.priority);
    });

    it('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { title: 'Updated Title' };

      const res = await request(app)
        .put(`/api/bugs/${nonExistentId}`)
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Bug not found');
    });

    it('should return 400 with invalid data', async () => {
      const invalidData = { title: 'ab' }; // Too short

      const res = await request(app)
        .put(`/api/bugs/${bugId}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should set resolvedAt when status changes to resolved', async () => {
      const updateData = { status: 'resolved' };

      const res = await request(app)
        .put(`/api/bugs/${bugId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('resolved');
      expect(res.body.data.resolvedAt).toBeDefined();
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create(sampleBugData);
      bugId = bug._id.toString();
    });

    it('should delete a bug', async () => {
      const res = await request(app).delete(`/api/bugs/${bugId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Bug deleted successfully');

      // Verify bug is deleted
      const deletedBug = await Bug.findById(bugId);
      expect(deletedBug).toBeNull();
    });

    it('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/bugs/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Bug not found');
    });
  });

  describe('PUT /api/bugs/:id/assign', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create(sampleBugData);
      bugId = bug._id.toString();
    });

    it('should assign a bug to a user', async () => {
      const assigneeData = { assignee: 'John Doe' };

      const res = await request(app)
        .put(`/api/bugs/${bugId}/assign`)
        .send(assigneeData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assignee).toBe('John Doe');
      expect(res.body.data.status).toBe('in-progress'); // Should change from 'open'
    });

    it('should return 400 if assignee is missing', async () => {
      const res = await request(app)
        .put(`/api/bugs/${bugId}/assign`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Assignee is required');
    });

    it('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const assigneeData = { assignee: 'John Doe' };

      const res = await request(app)
        .put(`/api/bugs/${nonExistentId}/assign`)
        .send(assigneeData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Bug not found');
    });
  });

  describe('PUT /api/bugs/:id/resolve', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create(sampleBugData);
      bugId = bug._id.toString();
    });

    it('should resolve a bug', async () => {
      const resolutionData = {
        resolvedBy: 'Jane Smith',
        resolution: 'Fixed the issue by updating the configuration files and restarting the service',
      };

      const res = await request(app)
        .put(`/api/bugs/${bugId}/resolve`)
        .send(resolutionData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('resolved');
      expect(res.body.data.resolvedBy).toBe(resolutionData.resolvedBy);
      expect(res.body.data.resolution).toBe(resolutionData.resolution);
      expect(res.body.data.resolvedAt).toBeDefined();
    });

    it('should return 400 if resolution data is incomplete', async () => {
      const incompleteData = { resolvedBy: 'Jane Smith' }; // Missing resolution

      const res = await request(app)
        .put(`/api/bugs/${bugId}/resolve`)
        .send(incompleteData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Resolved by and resolution are required');
    });

    it('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const resolutionData = {
        resolvedBy: 'Jane Smith',
        resolution: 'Fixed the issue',
      };

      const res = await request(app)
        .put(`/api/bugs/${nonExistentId}/resolve`)
        .send(resolutionData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Bug not found');
    });
  });

  describe('GET /api/bugs/stats', () => {
    beforeEach(async () => {
      // Create bugs with different statuses and priorities
      await Bug.create([
        { ...sampleBugData, status: 'open', priority: 'high' },
        { ...sampleBugData, status: 'in-progress', priority: 'medium' },
        { ...sampleBugData, status: 'resolved', priority: 'critical' },
        { ...sampleBugData, status: 'closed', priority: 'high' },
        { ...sampleBugData, status: 'open', priority: 'critical' },
      ]);
    });

    it('should return bug statistics', async () => {
      const res = await request(app).get('/api/bugs/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        total: 5,
        byStatus: {
          open: 2,
          inProgress: 1,
          resolved: 1,
          closed: 1,
        },
        byPriority: {
          high: 2,
          critical: 2,
        },
      });
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.message).toBe('Bug Tracker API is running');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.environment).toBeDefined();
    });
  });
});