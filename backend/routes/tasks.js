const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/tasks - Add new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    // Validation
    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }

    const task = new Task({
      title,
      description: description || '',
      dueDate: new Date(dueDate),
      userId: req.user._id
    });

    await task.save();
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tasks - Get user's tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .sort({ dueDate: 1, createdAt: -1 });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await Task.find({
      userId: req.user._id,
      dueDate: { $lt: today },
      status: { $ne: 'completed' }
    }).sort({ dueDate: 1 });

    res.json({ tasks: overdueTasks });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/tasks/:id - Update task
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Find task
    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // TRICKY RULE: Cannot mark future tasks as completed
    if (status === 'completed') {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (task.dueDate > today) {
        return res.status(400).json({ 
          message: 'Cannot mark future tasks as completed' 
        });
      }
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;