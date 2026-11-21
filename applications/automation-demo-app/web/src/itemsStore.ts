export interface Item {
  id: string;
  name: string;
  description: string;
  status: string;
  ownerEmail: string;
}

const STORAGE_KEY = 'demo-app-items';

function readAll(): Item[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Item[];
  } catch {
    return [];
  }
}

function writeAll(items: Item[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listItems(ownerEmail: string): Item[] {
  return readAll().filter((item) => item.ownerEmail === ownerEmail);
}

export function createItem(
  ownerEmail: string,
  input: { name: string; description: string; status?: string },
): Item {
  const item: Item = {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    description: input.description,
    status: input.status ?? 'Active',
    ownerEmail,
  };
  const all = readAll();
  all.push(item);
  writeAll(all);
  return item;
}

export function updateItem(
  ownerEmail: string,
  id: string,
  patch: Partial<Pick<Item, 'name' | 'description' | 'status'>>,
): Item {
  const all = readAll();
  const index = all.findIndex((i) => i.id === id && i.ownerEmail === ownerEmail);
  if (index < 0) {
    throw new Error('Item not found');
  }
  all[index] = { ...all[index], ...patch };
  writeAll(all);
  return all[index];
}
