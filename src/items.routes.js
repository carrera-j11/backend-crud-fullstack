import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// Corrección de rutas absoluta compatible con Windows
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, 'items.data.json');

function loadItems() {
  if (!existsSync(dataPath)) {
    writeFileSync(dataPath, JSON.stringify([]));
  }
  const raw = readFileSync(dataPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveItems(items) {
  writeFileSync(dataPath, JSON.stringify(items, null, 2));
}

router.get('/', (req, res) => {
  const items = loadItems();
  res.json(items);
});

router.get('/:id', (req, res) => {
  const items = loadItems();
  const item = items.find(i => i.id === Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Elemento no encontrado' });
  }
  res.json(item);
});

router.post('/', (req, res) => {
  const items = loadItems();
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'El campo nombre es obligatorio' });
  }

  const newItem = {
    id: items.length ? Math.max(...items.map(i => i.id)) + 1 : 1,
    nombre,
    descripcion: descripcion || '',
    precio: Number(precio) || 0,
    stock: Number(stock) || 0
  };

  items.push(newItem);
  saveItems(items);
  res.status(201).json(newItem);
});

router.put('/:id', (req, res) => {
  const items = loadItems();
  const id = Number(req.params.id);
  const index = items.findIndex(i => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Elemento no encontrado' });
  }

  const { nombre, descripcion, precio, stock } = req.body;
  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'El campo nombre es obligatorio' });
  }

  items[index] = {
    ...items[index],
    nombre,
    descripcion: descripcion ?? items[index].descripcion,
    precio: precio !== undefined ? Number(precio) : items[index].precio,
    stock: stock !== undefined ? Number(stock) : items[index].stock
  };

  saveItems(items);
  res.json(items[index]);
});

router.delete('/:id', (req, res) => {
  const items = loadItems();
  const id = Number(req.params.id);
  const exists = items.some(i => i.id === id);

  if (!exists) {
    return res.status(404).json({ error: 'Elemento no encontrado' });
  }

  const newItems = items.filter(i => i.id !== id);
  saveItems(newItems);
  res.status(204).send();
});

export { router };
