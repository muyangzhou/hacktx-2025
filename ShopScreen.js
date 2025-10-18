// ShopScreen.js
import React from 'react';
import { usePets } from './App';

const items = [
  { id: '1', name: 'Cool Hat', price: 50, type: 'cosmetic' },
  { id: '2', name: 'Power Sword', price: 100, type: 'weapon' },
];

export default function ShopScreen({ navigate }) {
  const { selectedPet, updatePet } = usePets();

  const buy = (item) => {
    if (selectedPet.gold >= item.price) {
      updatePet(selectedPet.id, (p) => ({ gold: p.gold - item.price }));
      alert(`${selectedPet.name} bought ${item.name}!`);
      // You could also attach inventory to that pet:
      // updatePet(selectedPet.id, (p) => ({ inventory: [...(p.inventory||[]), item] }));
    } else {
      alert(`Not enough gold! Need ${item.price - selectedPet.gold} more.`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Shop</h3>
      <p>{selectedPet.name} Gold: {selectedPet.gold}</p>
      {items.map(it => (
        <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
          <div>{it.name} — ${it.price}</div>
          <button onClick={() => buy(it)}>Buy</button>
        </div>
      ))}
      <button onClick={() => navigate('Home')} style={{ marginTop: 16 }}>Back</button>
    </div>
  );
}
