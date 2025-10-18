// ShopScreen.js
import React from 'react';
import { usePets } from './App';

const items = [
  { id: '1', name: 'Cool Hat', price: 50, type: 'cosmetic' },
  { id: '2', name: 'Power Sword', price: 100, type: 'weapon' },
];

// Define pets available for purchase
const buyablePets = [
  { id: 'p3', name: 'Ignis', level: 1, hp: 25, maxHp: 25, attack: 6, price: 200, inventory: [], equipped: {weapon: null, comsetic:null} },
  { id: 'p4', name: 'Terra', level: 1, hp: 30, maxHp: 30, attack: 4, price: 200, inventory: [], equipped: {weapon: null, comsetic:null} },
  { id: 'p5', name: 'Aqua', level: 1, hp: 20, maxHp: 20, attack: 7, price: 200, inventory: [], equipped: {weapon: null, comsetic:null} },
];

export default function ShopScreen({ navigate }) {
  // Get global currency functions and data
  const { 
    selectedPet, 
    updatePet, 
    addPet, 
    pets, 
    globalGold, 
    updateGlobalGold 
  } = usePets();

  const buy = (item) => {
    // Check globalGold
    if (globalGold >= item.price) {
      // Subtract from globalGold
      updateGlobalGold(prev => prev - item.price);
      
      // Add item to the selected pet's inventory
      updatePet(selectedPet.id, (p) => ({ 
        inventory: [...(p.inventory||[]), item]
      }));
      alert(`${selectedPet.name} bought ${item.name}!`);
    } else {
      alert(`Not enough gold! Need ${item.price - globalGold} more.`);
    }
  };

  const buyPet = (pet) => {
    // Check if pet is already owned
    if (pets.find(p => p.id === pet.id)) {
      alert('You already own this pet!');
      return;
    }

    // Check globalGold
    if (globalGold >= pet.price) {
      // 1. Subtract gold from global total
      updateGlobalGold(prev => prev - pet.price);
      
      // 2. Add the new pet to the roster
      const { price, ...newPetData } = pet; 
      addPet(newPetData);

      alert(`You bought ${pet.name}! Go to the Roster to select them.`);
    } else {
      alert(`Not enough gold! Need ${pet.price - globalGold} more.`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Shop</h3>
      {/* Display globalGold */}
      <p>Player Gold: {globalGold}</p>
      
      <h4 style={{marginTop: 10, marginBottom: 5}}>Buy Items</h4>
      {items.map(it => (
        <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
          <div>{it.name} — ${it.price}</div>
          <button onClick={() => buy(it)}>Buy</button>
        </div>
      ))}

      <h4 style={{marginTop: 30, marginBottom: 5}}>Buy New Pets</h4>
      {buyablePets.map(pet => (
        <div key={pet.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
          <div>{pet.name} (Lvl {pet.level}, HP {pet.hp}) — ${pet.price}</div>
          <button onClick={() => buyPet(pet)}>Buy Pet</button>
        </div>
      ))}

      <button onClick={() => navigate('Home')} style={{ marginTop: 24 }}>Back</button>
    </div>
  );
}