// InventoryScreen.js
import React, { useMemo } from 'react';
import { usePets } from './App';
import items from './items.json'; // if your bundler complains, see note below

export default function InventoryScreen({ navigate }) {
  const { selectedPet, updatePet } = usePets();

  // Ensure we always have an inventory array
  const inventory = selectedPet?.inventory ?? [];

  // Group the catalog by slot/type for convenience
  const groupedCatalog = useMemo(() => {
    const groups = {};
    for (const it of items) {
      const key = it.slot || it.type || 'misc';
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    }
    return groups;
  }, []);

  // Helpers
  const addToInventory = (catalogItem) => {
    updatePet(selectedPet.id, (p) => {
      const inv = Array.isArray(p.inventory) ? p.inventory.slice() : [];
      // Avoid dupes by id (optional – remove if you *want* duplicates)
      if (!inv.find(i => i.id === catalogItem.id)) {
        inv.push({ ...catalogItem, ownedAt: Date.now() });
      }
      return { inventory: inv };
    });
  };

  const removeFromInventory = (itemId) => {
    updatePet(selectedPet.id, (p) => {
      const inv = (p.inventory || []).filter(i => i.id !== itemId);
      // If the removed item was equipped, unequip it too
      const unequip = {};
      if (p.equipped?.weapon === itemId) unequip.equipped = { ...p.equipped, weapon: null };
      if (p.equipped?.cosmetic === itemId) unequip.equipped = { ...(unequip.equipped || p.equipped), cosmetic: null };
      return { inventory: inv, ...(Object.keys(unequip).length ? unequip : {}) };
    });
  };

  const equipItem = (item) => {
    const slot = item.slot || item.type; // "weapon" or "cosmetic"
    if (!slot) return;

    updatePet(selectedPet.id, (p) => {
      const equipped = { ...(p.equipped || {}) };
      equipped[slot] = item.id;
      // You can apply stat effects here if desired (see commented example below)
      return { equipped };
    });
  };

  const unequipSlot = (slot) => {
    updatePet(selectedPet.id, (p) => {
      const equipped = { ...(p.equipped || {}) };
      equipped[slot] = null;
      return { equipped };
    });
  };

  const isEquipped = (item) => {
    const slot = item.slot || item.type;
    return Boolean(selectedPet?.equipped && selectedPet.equipped[slot] === item.id);
  };

  if (!selectedPet) {
    return (
      <div style={styles.container}>
        <h2>No pet selected</h2>
        <button style={styles.button} onClick={() => navigate('Roster')}>Go to Roster</button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Header / Selected Pet */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>{selectedPet.name}</h2>
          <div style={{ opacity: 0.7 }}>
            Lvl {selectedPet.level} • HP {selectedPet.hp ?? selectedPet.health}/{selectedPet.maxHp ?? 100} • ATK {selectedPet.attack ?? 5}
          </div>
        </div>
        <button style={styles.button} onClick={() => navigate('Home')}>Back</button>
      </div>

      {/* Equipped section */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Equipped</h3>
        <div style={styles.equippedRow}>
          <EquippedSlot
            label="Weapon"
            slot="weapon"
            selectedPet={selectedPet}
            inventory={inventory}
            onUnequip={() => unequipSlot('weapon')}
          />
          <EquippedSlot
            label="Cosmetic"
            slot="cosmetic"
            selectedPet={selectedPet}
            inventory={inventory}
            onUnequip={() => unequipSlot('cosmetic')}
          />
        </div>
      </div>

      {/* Inventory list */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Inventory</h3>
        {inventory.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No items yet.</div>
        ) : (
          <div>
            {inventory.map((it) => (
              <div key={it.id} style={styles.row}>
                <div style={styles.rowMain}>
                  <div style={styles.itemName}>{it.name}</div>
                  <div style={styles.itemMeta}>
                    Slot: {it.slot || it.type || '—'}{it.power ? ` • +${it.power} ATK` : ''}
                  </div>
                </div>
                <div style={styles.rowActions}>
                  {isEquipped(it) ? (
                    <button style={styles.smallButton} onClick={() => unequipSlot(it.slot || it.type)}>Unequip</button>
                  ) : (
                    <button style={styles.smallButton} onClick={() => equipItem(it)}>Equip</button>
                  )}
                  <button style={{ ...styles.smallButton, marginLeft: 8 }} onClick={() => removeFromInventory(it.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Catalog to add items (dev/demo) */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Catalog (add items)</h3>
        {Object.entries(groupedCatalog).map(([group, list]) => (
          <div key={group} style={{ marginBottom: 10 }}>
            <div style={styles.groupTitle}>{group.toUpperCase()}</div>
            {list.map((it) => (
              <div key={it.id} style={styles.row}>
                <div style={styles.rowMain}>
                  <div style={styles.itemName}>{it.name}</div>
                  <div style={styles.itemMeta}>
                    Slot: {it.slot || it.type || '—'}
                    {it.power ? ` • +${it.power} ATK` : ''}
                    {typeof it.price === 'number' ? ` • $${it.price}` : ''}
                  </div>
                </div>
                <div style={styles.rowActions}>
                  <button style={styles.smallButton} onClick={() => addToInventory(it)}>Add</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Shows what's equipped for a specific slot ("weapon" or "cosmetic")
function EquippedSlot({ label, slot, selectedPet, inventory, onUnequip }) {
  const equippedId = selectedPet?.equipped?.[slot] ?? null;
  const item = inventory.find(i => i.id === equippedId) || null;

  return (
    <div style={styles.equippedSlot}>
      <div style={styles.equippedLabel}>{label}</div>
      {item ? (
        <>
          <div style={styles.itemName}>{item.name}</div>
          <div style={styles.itemMeta}>
            Slot: {item.slot || item.type}
            {item.power ? ` • +${item.power} ATK` : ''}
          </div>
          <button style={styles.smallButton} onClick={onUnequip}>Unequip</button>
        </>
      ) : (
        <div style={{ opacity: 0.6 }}>Nothing equipped</div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    maxWidth: 800,
    margin: '0 auto',
  },
  container: {
    padding: 20,
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    padding: '8px 12px',
    fontSize: 14,
    cursor: 'pointer',
  },
  card: {
    border: '1px solid #e5e5e5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    margin: '0 0 8px 0',
  },
  equippedRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  equippedSlot: {
    border: '1px solid #eee',
    borderRadius: 8,
    padding: 12,
    minHeight: 92,
  },
  equippedLabel: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottom: '1px solid #f3f3f3',
  },
  rowMain: {
    display: 'flex',
    flexDirection: 'column',
  },
  rowActions: {
    display: 'flex',
    alignItems: 'center',
  },
  smallButton: {
    padding: '6px 10px',
    fontSize: 13,
    cursor: 'pointer',
  },
  itemName: { fontWeight: 'bold' },
  itemMeta: { opacity: 0.7, fontSize: 13 },
  groupTitle: { fontWeight: 'bold', margin: '8px 0' },
};
