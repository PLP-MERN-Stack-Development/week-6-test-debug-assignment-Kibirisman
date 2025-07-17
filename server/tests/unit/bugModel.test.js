const Bug = require('../../src/models/Bug');
const mongoose = require('mongoose');

describe('Bug Model', () => {
  describe('Validation', () => {
    it('should create a valid bug with required fields', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description with enough characters',
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();

      expect(savedBug._id).toBeDefined();
      expect(savedBug.title).toBe(bugData.title);
      expect(savedBug.description).toBe(bugData.description);
      expect(savedBug.reporter).toBe(bugData.reporter);
      expect(savedBug.status).toBe('open'); // default value
      expect(savedBug.priority).toBe('medium'); // default value
      expect(savedBug.category).toBe('other'); // default value
    });

    it('should fail validation if title is missing', async () => {
      const bugData = {
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      
      await expect(bug.save()).rejects.toThrow(/title.*required/i);
    });

    it('should fail validation if description is missing', async () => {
      const bugData = {
        title: 'Test Bug',
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      
      await expect(bug.save()).rejects.toThrow(/description.*required/i);
    });

    it('should fail validation if reporter is missing', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
      };

      const bug = new Bug(bugData);
      
      await expect(bug.save()).rejects.toThrow(/reporter.*required/i);
    });

    it('should fail validation if title is too long', async () => {
      const bugData = {
        title: 'a'.repeat(101), // 101 characters
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      
      await expect(bug.save()).rejects.toThrow(/title.*100 characters/i);
    });

    it('should fail validation if description is too long', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'a'.repeat(2001), // 2001 characters
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      
      await expect(bug.save()).rejects.toThrow(/description.*2000 characters/i);
    });

    it('should fail validation with invalid status', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
        status: 'invalid-status',
      };

      const bug = new Bug(bugData);
      
      await expect(bug.save()).rejects.toThrow(/status/i);
    });

    it('should fail validation with invalid priority', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
        priority: 'invalid-priority',
      };

      const bug = new Bug(bugData);
      
      await expect(bug.save()).rejects.toThrow(/priority/i);
    });

    it('should accept all valid status values', async () => {
      const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
      
      for (const status of validStatuses) {
        const bugData = {
          title: `Test Bug ${status}`,
          description: 'This is a test bug description',
          reporter: 'Test Reporter',
          status,
        };

        const bug = new Bug(bugData);
        const savedBug = await bug.save();
        
        expect(savedBug.status).toBe(status);
      }
    });

    it('should accept all valid priority values', async () => {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      
      for (const priority of validPriorities) {
        const bugData = {
          title: `Test Bug ${priority}`,
          description: 'This is a test bug description',
          reporter: 'Test Reporter',
          priority,
        };

        const bug = new Bug(bugData);
        const savedBug = await bug.save();
        
        expect(savedBug.priority).toBe(priority);
      }
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate age in days correctly', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();

      expect(savedBug.ageInDays).toBeDefined();
      expect(savedBug.ageInDays).toBeGreaterThanOrEqual(0);
      expect(typeof savedBug.ageInDays).toBe('number');
    });

    it('should calculate resolution time when bug is resolved', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
        status: 'resolved',
        resolvedAt: new Date(),
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();

      expect(savedBug.resolutionTimeInHours).toBeDefined();
      expect(savedBug.resolutionTimeInHours).toBeGreaterThanOrEqual(0);
      expect(typeof savedBug.resolutionTimeInHours).toBe('number');
    });

    it('should return null for resolution time when bug is not resolved', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();

      expect(savedBug.resolutionTimeInHours).toBeNull();
    });
  });

  describe('Pre-save Middleware', () => {
    it('should set resolvedAt when status changes to resolved', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();

      // Change status to resolved
      savedBug.status = 'resolved';
      const resolvedBug = await savedBug.save();

      expect(resolvedBug.resolvedAt).toBeDefined();
      expect(resolvedBug.resolvedAt).toBeInstanceOf(Date);
    });

    it('should clear resolvedAt when status changes from resolved to open', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: 'Test Resolver',
        resolution: 'Test resolution',
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();

      // Change status back to open
      savedBug.status = 'open';
      const reopenedBug = await savedBug.save();

      expect(reopenedBug.resolvedAt).toBeUndefined();
      expect(reopenedBug.resolvedBy).toBeUndefined();
      expect(reopenedBug.resolution).toBeUndefined();
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test bugs
      const testBugs = [
        {
          title: 'Open Bug',
          description: 'This is an open bug',
          reporter: 'Reporter 1',
          status: 'open',
          priority: 'high',
          assignee: 'Assignee 1',
        },
        {
          title: 'Resolved Bug',
          description: 'This is a resolved bug',
          reporter: 'Reporter 2',
          status: 'resolved',
          priority: 'medium',
          assignee: 'Assignee 2',
        },
        {
          title: 'Critical Bug',
          description: 'This is a critical bug',
          reporter: 'Reporter 3',
          status: 'in-progress',
          priority: 'critical',
          assignee: 'Assignee 1',
        },
      ];

      await Bug.insertMany(testBugs);
    });

    it('should find bugs by status', async () => {
      const openBugs = await Bug.findByStatus('open');
      const resolvedBugs = await Bug.findByStatus('resolved');

      expect(openBugs).toHaveLength(1);
      expect(openBugs[0].status).toBe('open');
      
      expect(resolvedBugs).toHaveLength(1);
      expect(resolvedBugs[0].status).toBe('resolved');
    });

    it('should find bugs by priority', async () => {
      const highPriorityBugs = await Bug.findByPriority('high');
      const criticalPriorityBugs = await Bug.findByPriority('critical');

      expect(highPriorityBugs).toHaveLength(1);
      expect(highPriorityBugs[0].priority).toBe('high');
      
      expect(criticalPriorityBugs).toHaveLength(1);
      expect(criticalPriorityBugs[0].priority).toBe('critical');
    });

    it('should find bugs by assignee', async () => {
      const assignee1Bugs = await Bug.findByAssignee('Assignee 1');
      const assignee2Bugs = await Bug.findByAssignee('Assignee 2');

      expect(assignee1Bugs).toHaveLength(2);
      expect(assignee2Bugs).toHaveLength(1);
      
      assignee1Bugs.forEach(bug => {
        expect(bug.assignee).toBe('Assignee 1');
      });
    });
  });

  describe('Instance Methods', () => {
    it('should resolve a bug correctly', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();

      const resolvedBy = 'Test Resolver';
      const resolution = 'Fixed the issue by updating the code';

      const resolvedBug = await savedBug.resolve(resolvedBy, resolution);

      expect(resolvedBug.status).toBe('resolved');
      expect(resolvedBug.resolvedBy).toBe(resolvedBy);
      expect(resolvedBug.resolution).toBe(resolution);
      expect(resolvedBug.resolvedAt).toBeDefined();
      expect(resolvedBug.resolvedAt).toBeInstanceOf(Date);
    });

    it('should assign a bug correctly', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();

      const assignee = 'Test Assignee';
      const assignedBug = await savedBug.assignTo(assignee);

      expect(assignedBug.assignee).toBe(assignee);
      expect(assignedBug.status).toBe('in-progress'); // Should change from 'open' to 'in-progress'
    });

    it('should not change status when assigning bug that is not open', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'Test Reporter',
        status: 'resolved',
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();

      const assignee = 'Test Assignee';
      const assignedBug = await savedBug.assignTo(assignee);

      expect(assignedBug.assignee).toBe(assignee);
      expect(assignedBug.status).toBe('resolved'); // Should not change
    });
  });
});