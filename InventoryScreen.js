// InventoryScreen.js
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { usePets } from './App';
import items from './items.json'; 
import { petImages, weaponImages } from './assets/petImages';

export default function InventoryScreen({ navigate }) {
  // ... (All logic functions are unchanged) ...
  const { selectedPet, updatePet, globalGold, updateGlobalGold } = usePets();
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
    const price = Number(catalogItem.price ?? 0);
    const alreadyOwned = (selectedPet?.inventory || []).some(i => i.id === catalogItem.id);
    if (alreadyOwned) return alert(`${catalogItem.name} is already in your inventory.`);
    if (globalGold < price) {
        return alert(`Not enough gold! Need ${price - globalGold} more.`);
    }
    updateGlobalGold(prev => prev - price);
    updatePet(selectedPet.id, (p) => ({
        ...p,
        inventory: [ ...(p.inventory || []), { ...catalogItem, ownedAt: Date.now() } ]
    }));
    alert(`${selectedPet.name} bought ${catalogItem.name}!`);
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
    // ... (logic unchanged) ...
    const isOwned = (selectedPet?.inventory || []).some(x => x.id === it.id);
    const canAfford = globalGold >= (Number(it.price) || 0);

    return (
      <View key={it.id} style={styles.row}>
        <View style={styles.rowMain}>
          <Text style={styles.itemName}>{it.name}</Text>
          <Image
            source={weaponImages[it.id]}
            style={{ width: 20, height: 20, marginVertical: 4 }}
            accessibilityLabel={it.name}
            />
          <Text style={styles.itemMeta}>
            Slot: {it.slot || it.type || '—'}
            {it.power ? ` • +${it.power} ATK` : ''}
            {type === 'catalog' && typeof it.price === 'number' ? ` • $${it.price}` : ''}
          </Text>
        </View>
        <View style={styles.rowActions}>
          {type === 'inventory' ? (
            <>
              {isEquipped(it) ? (
                <TouchableOpacity style={styles.smallButton} onPress={() => unequipSlot(it.slot || it.type)}>
                    <Text style={styles.smallButtonText}>Unequip</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.smallButton} onPress={() => equipItem(it)}>
                    <Text style={styles.smallButtonText}>Equip</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={{ ...styles.smallButton, marginLeft: 8 }} onPress={() => removeFromInventory(it.id)}>
                <Text style={styles.smallButtonText}>Remove</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
                style={[styles.smallButton, (isOwned || !canAfford) && styles.smallButtonDisabled]}
                onPress={() => addToInventory(it)}
                disabled={isOwned || !canAfford}
            >
                <Text style={styles.smallButtonText}>
                    { isOwned ? 'Owned' : `Add ($${it.price ?? 0})` }
                </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!selectedPet) {
    return (
      <View style={styles.container}>
        <Text style={styles.cardTitle}>No pet selected</Text>
        {/* "Go to Home" button removed from here */}
      </View>
    );
  }

  return (
    // The main wrapper is now a ScrollView to handle many items
    <ScrollView style={styles.wrapper}>
      <View style={styles.header}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.petName}>{selectedPet.name}</Text>
          <View style={styles.petImageContainer}>
            <Image
                source={petImages[selectedPet.id]}
                style={{ width: 64, height: 64 }}
                accessibilityLabel={selectedPet.name}
            />
            </View>
          <Text style={styles.petStats}>
            Lvl {selectedPet.level} • HP {selectedPet.hp ?? selectedPet.health}/{selectedPet.maxHp ?? 100} • ATK {selectedPet.attack ?? 5}
          </Text>
        </View>
        {/* The "Back" button was here and is now removed */}
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Equipped</Text>
        <View style={styles.equippedRow}>
          <EquippedSlot label="Weapon" slot="weapon" selectedPet={selectedPet} inventory={inventory} onUnequip={() => unequipSlot('weapon')} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Inventory</Text>
        <ScrollView style={styles.scrollBox}>
          {inventory.length === 0 ? (
            <Text style={styles.emptyText}>No items yet.</Text>
          ) : (
            inventory.map(it => renderItemRow(it, 'inventory'))
          )}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Catalog (add items)</Text>
        
        <Text style={styles.groupTitle}>WEAPONS</Text>
        <ScrollView style={styles.scrollBox}>
          {(groupedCatalog.weapon || []).length === 0 ? (
            <Text style={styles.emptyText}>No weapons in catalog.</Text>
          ) : (
            (groupedCatalog.weapon || []).map(it => renderItemRow(it, 'catalog'))
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

// ... (EquippedSlot function is unchanged) ...
function EquippedSlot({ label, slot, selectedPet, inventory, onUnequip }) {
  const equippedId = selectedPet?.equipped?.[slot] ?? null;
  const item = inventory.find(i => i.id === equippedId) || null;
  return (
    <View style={styles.equippedSlot}>
      <Text style={styles.equippedLabel}>{label}</Text>
      {item ? (
        <>
        
          <Image
            source={weaponImages[item.id]}
            style={{ width: 20, height: 20 }}
            accessibilityLabel={item.name}
            />
          <View style={styles.itemName}><Text>{item.name}</Text></View>
          <View style={styles.itemMeta}>
            <Text>Slot: {item.slot || item.type}
            {item.power ? ` • +${item.power} ATK` : ''}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>Nothing equipped</Text>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    // Padding removed, handled by App.js
    width: '100%',
    height: '100%',
  },
  container: {
    // Padding removed
    width: '100%',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center', // Changed from space-between
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(162, 162, 162, 0.8)',
    borderRadius: 10,
    padding: 15,
  },
  // ... (all other styles are unchanged) ...
  petName: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  petStats: {
      opacity: 0.7,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
  },
  card: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(162, 162, 162, 0.8)',
  },
  cardTitle: {
    margin: 0,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  equippedRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  equippedSlot: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    flex: 1,
  },
  equippedLabel: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  rowMain: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  rowActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  smallButtonDisabled: {
      backgroundColor: '#6c757d',
      opacity: 0.7,
  },
  smallButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
  },
  itemName: { fontWeight: 'bold' },
  itemMeta: { opacity: 0.7, fontSize: 13 },
  groupTitle: { fontWeight: 'bold', marginVertical: 8, fontSize: 16 },
  scrollBox: {
    maxHeight: 150, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
    padding: 4,
  },
  petImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', // Changed
    marginVertical: 10,
  },
  emptyText: {
      opacity: 0.7,
      padding: 8,
  }
});