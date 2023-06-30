import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;
      
      const tasks = database.select('tasks', search ? {
        title: search,
        description: search,
      } : null);

      return res.end(JSON.stringify(tasks));
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      if (!req.body) {
        return res.writeHead(400).end(JSON.stringify('Maybe you forgot the body request'));
      }

      if (!req.body.title) {
        return res.writeHead(400).end(JSON.stringify('title is required'));
      }

      if (!req.body.description) {
        return res.writeHead(400).end(JSON.stringify('description is required'));
      }

      const { title, description } = req.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert('tasks', task);

      return res.writeHead(201).end();
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const completed = database.completed('tasks', id);

      if (completed === 'completed') {
        return res.writeHead(204).end();
      } 
        
      return res.writeHead(404).end(JSON.stringify('Task not found.'));
      
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      if (!req.body) {
        return res.writeHead(400).end(JSON.stringify('Maybe you forgot the body request'));
      }

      if (!req.body.title && !req.body.description) {
        return res.writeHead(400).end(JSON.stringify('title or description is required'));
      }

      const { title, description } = req.body;

      const updated = database.update('tasks', id, {
        title,
        description,
        updated_at: new Date(),
      })

      if (updated === 'updated') {
        return res.writeHead(204).end();
      } 

      return res.writeHead(404).end(JSON.stringify('Task not found.'));
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const deleted = database.delete('tasks', id);

      if (deleted === 'deleted') {
        return res.writeHead(204).end();
      } 
      
      return res.writeHead(404).end(JSON.stringify('Task not found.'));
    }
  },
]
