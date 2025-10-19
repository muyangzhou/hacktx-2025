// InventoryScreen.js
import React, { useMemo } from 'react';
import { usePets } from './App';
import items from './items.json'; // if your bundler complains, see note below
import { petImages, weaponImages } from './assets/petImages'
import { Image } from 'react-native'

export default function InventoryScreen({ navigate }) {
  // ... (all helper functions remain the same) ...
  const { selectedPet, updatePet } = usePets();
  const inventory = selectedPet?.inventory ?? [];
  const groupedCatalog = useMemo(() => {
    const groups = {};
    for (const it of items) {
      const key = it.slot || it.type || 'misc';
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    }
    return groups;
  }, []);
  const addToInventory = (catalogItem) => {
    updatePet(selectedPet.id, (p) => {
      const inv = Array.isArray(p.inventory) ? p.inventory.slice() : [];
      if (!inv.find(i => i.id === catalogItem.id)) {
        inv.push({ ...catalogItem, ownedAt: Date.now() });
      }
      return { inventory: inv };
    });
  };
  const removeFromInventory = (itemId) => {
    updatePet(selectedPet.id, (p) => {
      const inv = (p.inventory || []).filter(i => i.id !== itemId);
      const unequip = {};
      if (p.equipped?.weapon === itemId) unequip.equipped = { ...p.equipped, weapon: null };
      if (p.equipped?.cosmetic === itemId) unequip.equipped = { ...(unequip.equipped || p.equipped), cosmetic: null };
      return { inventory: inv, ...(Object.keys(unequip).length ? unequip : {}) };
    });
  };
  const equipItem = (item) => {
    const slot = item.slot || item.type;
    if (!slot) return;
    updatePet(selectedPet.id, (p) => {
      const equipped = { ...(p.equipped || {}) };
      equipped[slot] = item.id;
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
  const renderItemRow = (it, type) => {
    return (
      <div key={it.id} style={styles.row}>
        <div style={styles.rowMain}>
          <div style={styles.itemName}>{it.name}</div>
          <Image
            source={weaponImages[it.id]}
            style={{ width: 20, height: 20 }}
            accessibilityLabel={it.name}
            />
          <div style={styles.itemMeta}>
            Slot: {it.slot || it.type || '—'}
            {it.power ? ` • +${it.power} ATK` : ''}
            {type === 'catalog' && typeof it.price === 'number' ? ` • $${it.price}` : ''}
          </div>
        </div>
        <div style={styles.rowActions}>
          {type === 'inventory' ? (
            <>
              {isEquipped(it) ? (
                <button style={styles.smallButton} onClick={() => unequipSlot(it.slot || it.type)}>Unequip</button>
              ) : (
                <button style={styles.smallButton} onClick={() => equipItem(it)}>Equip</button>
              )}
              <button style={{ ...styles.smallButton, marginLeft: 8 }} onClick={() => removeFromInventory(it.id)}>Remove</button>
            </>
          ) : (
            <button style={styles.smallButton} onClick={() => addToInventory(it)}>Add</button>
          )}
        </div>
      </div>
    );
  };

  if (!selectedPet) {
    return (
      <div style={styles.container}>
        <h2>No pet selected</h2>
        <button style={styles.button} onClick={() => navigate('Home')}>Go to Home</button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* ... (Header and Equipped sections remain same) ... */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>{selectedPet.name}</h2>
            <Image
                source={petImages[selectedPet.id]}
                style={{ width: 64, height: 64 }}
                accessibilityLabel={selectedPet.name}
            />
          <div style={{ opacity: 0.7 }}>
            Lvl {selectedPet.level} • HP {selectedPet.hp ?? selectedPet.health}/{selectedPet.maxHp ?? 100} • ATK {selectedPet.attack ?? 5}
          </div>
        </div>
        <button style={styles.button} onClick={() => navigate('Home')}>Back</button>
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Equipped</h3>
        <div style={styles.equippedRow}>
          <EquippedSlot label="Weapon" slot="weapon" selectedPet={selectedPet} inventory={inventory} onUnequip={() => unequipSlot('weapon')} />
          <EquippedSlot label="Cosmetic" slot="cosmetic" selectedPet={selectedPet} inventory={inventory} onUnequip={() => unequipSlot('cosmetic')} />
        </div>
      </div>

      {/* --- Inventory list (Scrollable) --- */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Inventory</h3>
        <div style={styles.scrollBox}>
          {inventory.length === 0 ? (
            <div style={{ opacity: 0.7, padding: 8 }}>No items yet.</div>
          ) : (
            inventory.map(it => renderItemRow(it, 'inventory'))
          )}
        </div>
      </div>

      {/* --- Catalog (Split and Scrollable) --- */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Catalog (add items)</h3>
        
        <div style={styles.groupTitle}>WEAPONS</div>
        <div style={styles.scrollBox}>
          {(groupedCatalog.weapon || []).length === 0 ? (
            <div style={{ opacity: 0.7, padding: 8 }}>No weapons in catalog.</div>
          ) : (
            (groupedCatalog.weapon || []).map(it => renderItemRow(it, 'catalog'))
          )}
        </div>

        <div style={{ ...styles.groupTitle, marginTop: 16 }}>COSMETICS</div>
        <div style={styles.scrollBox}>
          {(groupedCatalog.cosmetic || []).length === 0 ? (
            <div style={{ opacity: 0.7, padding: 8 }}>No cosmetics in catalog.</div>
          ) : (
            (groupedCatalog.cosmetic || []).map(it => renderItemRow(it, 'catalog'))
          )}
        </div>
      </div>
    </div>
  );
}

// ... (EquippedSlot function remains the same) ...
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
  // ... (other styles remain same) ...
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
  // --- Updated Style ---
  scrollBox: {
    maxHeight: '100px', // Changed from 200px
    overflowY: 'auto',
    border: '1px solid #f0f0f0',
    borderRadius: 5,
    padding: '0 4px',
  },
};