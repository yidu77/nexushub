const express = require('express');
const pool = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken);

// Maps each category to its code prefix, per the spec's resource list.
const CATEGORY_PREFIXES = {
  'Laptop': 'LP',
  'Desktop': 'DT',
  'Printer': 'PR',
  'Meeting Room': 'MR',
  'Vehicle': 'VH',
  'Projector': 'PJ',
  'Furniture': 'FN',
};

// Figures out the next code for a category, e.g. "LP-011".
// Looks at existing codes with that prefix, finds the highest number used, adds 1.
const generateResourceCode = async (category) => {
  const prefix = CATEGORY_PREFIXES[category] || 'RS'; // fallback for unknown categories

  const existing = await pool.query(
    `SELECT resource_code FROM resources WHERE resource_code LIKE $1`,
    [`${prefix}-%`]
  );

  let highest = 0;
  for (const row of existing.rows) {
    const numberPart = row.resource_code.split('-')[1];
    const num = parseInt(numberPart, 10);
    if (!isNaN(num) && num > highest) {
      highest = num;
    }
  }

  const nextNumber = highest + 1;
  const padded = String(nextNumber).padStart(3, '0'); // 1 -> "001"
  return `${prefix}-${padded}`;
};

// GET all resources (with Search AND Filters)
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = 'SELECT * FROM resources WHERE 1=1';
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (resource_code ILIKE $${values.length} OR name ILIKE $${values.length})`;
    }
    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }
    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const resources = await pool.query(query, values);
    res.json(resources.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET the list of valid categories (handy for populating a dropdown on the frontend)
router.get('/categories', (req, res) => {
  res.json(Object.keys(CATEGORY_PREFIXES));
});

// POST (Create) - ADMIN ONLY
// resource_code is no longer sent by the frontend — it's generated here automatically.
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, category, status } = req.body;

    if (!category || !CATEGORY_PREFIXES[category]) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${Object.keys(CATEGORY_PREFIXES).join(', ')}`,
      });
    }

    const resource_code = await generateResourceCode(category);

    const newResource = await pool.query(
      'INSERT INTO resources (resource_code, name, category, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [resource_code, name, category, status || 'Available']
    );
    res.status(201).json(newResource.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT (Update) - ADMIN ONLY
// resource_code is intentionally NOT editable here — it's permanent once assigned,
// like a serial number. Only name/category/status can change.
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, status } = req.body;
    const updatedResource = await pool.query(
      'UPDATE resources SET name=$1, category=$2, status=$3 WHERE id=$4 RETURNING *',
      [name, category, status, id]
    );
    if (updatedResource.rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    res.json(updatedResource.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - ADMIN ONLY
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedResource = await pool.query('DELETE FROM resources WHERE id=$1 RETURNING *', [id]);
    if (deletedResource.rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Resource deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;