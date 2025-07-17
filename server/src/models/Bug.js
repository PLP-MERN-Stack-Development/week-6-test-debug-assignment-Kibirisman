const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Bug title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Bug description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in-progress', 'resolved', 'closed'],
      message: 'Status must be either open, in-progress, resolved, or closed',
    },
    default: 'open',
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be either low, medium, high, or critical',
    },
    default: 'medium',
  },
  assignee: {
    type: String,
    trim: true,
    maxlength: [50, 'Assignee name cannot be more than 50 characters'],
  },
  reporter: {
    type: String,
    required: [true, 'Reporter name is required'],
    trim: true,
    maxlength: [50, 'Reporter name cannot be more than 50 characters'],
  },
  category: {
    type: String,
    enum: {
      values: ['frontend', 'backend', 'database', 'api', 'ui/ux', 'performance', 'security', 'other'],
      message: 'Category must be one of the predefined values',
    },
    default: 'other',
  },
  severity: {
    type: String,
    enum: {
      values: ['minor', 'major', 'critical', 'blocker'],
      message: 'Severity must be either minor, major, critical, or blocker',
    },
    default: 'major',
  },
  environment: {
    type: String,
    enum: {
      values: ['development', 'staging', 'production'],
      message: 'Environment must be either development, staging, or production',
    },
    default: 'development',
  },
  stepsToReproduce: {
    type: [String],
    default: [],
  },
  expectedBehavior: {
    type: String,
    trim: true,
    maxlength: [500, 'Expected behavior cannot be more than 500 characters'],
  },
  actualBehavior: {
    type: String,
    trim: true,
    maxlength: [500, 'Actual behavior cannot be more than 500 characters'],
  },
  attachments: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution cannot be more than 1000 characters'],
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: String,
    trim: true,
    maxlength: [50, 'Resolver name cannot be more than 50 characters'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for bug age in days
bugSchema.virtual('ageInDays').get(function() {
  const today = new Date();
  const createdAt = this.createdAt;
  const diffTime = Math.abs(today - createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time in hours
bugSchema.virtual('resolutionTimeInHours').get(function() {
  if (this.resolvedAt && this.createdAt) {
    const diffTime = Math.abs(this.resolvedAt - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }
  return null;
});

// Index for better query performance
bugSchema.index({ status: 1, priority: 1 });
bugSchema.index({ assignee: 1 });
bugSchema.index({ reporter: 1 });
bugSchema.index({ category: 1 });
bugSchema.index({ createdAt: -1 });

// Pre-save middleware to set resolvedAt when status changes to resolved
bugSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' || this.status === 'closed') {
      if (!this.resolvedAt) {
        this.resolvedAt = new Date();
      }
    } else {
      this.resolvedAt = undefined;
      this.resolvedBy = undefined;
      this.resolution = undefined;
    }
  }
  next();
});

// Static method to find bugs by status
bugSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find bugs by priority
bugSchema.statics.findByPriority = function(priority) {
  return this.find({ priority });
};

// Static method to find bugs by assignee
bugSchema.statics.findByAssignee = function(assignee) {
  return this.find({ assignee });
};

// Instance method to resolve bug
bugSchema.methods.resolve = function(resolvedBy, resolution) {
  this.status = 'resolved';
  this.resolvedBy = resolvedBy;
  this.resolution = resolution;
  this.resolvedAt = new Date();
  return this.save();
};

// Instance method to assign bug
bugSchema.methods.assignTo = function(assignee) {
  this.assignee = assignee;
  if (this.status === 'open') {
    this.status = 'in-progress';
  }
  return this.save();
};

module.exports = mongoose.model('Bug', bugSchema);