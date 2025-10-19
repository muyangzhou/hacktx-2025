// ShopScreen.js
import React from 'react';
import { usePets } from './App';
import { petImages, weaponImages } from './assets/petImages'
import { Image } from 'react-native'

// Expanded item list with minLevel property
const items = [
  { id: '1', name: 'Sword', price: 100, type: 'weapon', minLevel: 1 },
  { id: '2', name: 'Pickaxe', price: 100, type: 'weapon', minLevel: 1 },
  { id: '3', name: 'Shovel', price: 100, type: 'weapon', minLevel: 1 },
  { id: '4', name: 'War Hammer', price: 500, type: 'weapon', minLevel: 5 },
  { id: '5', name: 'War Axe', price: 100, type: 'weapon', minLevel: 1 },
  { id: '6', name: 'Bow and Arrow', price: 100, type: 'weapon', minLevel: 1 },
  { id: '7', name: 'Bomb', price: 100, type: 'weapon', minLevel: 1 },
  { id: '8', name: 'Hatchet', price: 100, type: 'weapon', minLevel: 1 },
  { id: '9', name: 'Cool Hat', price: 50, type: 'cosmetic', minLevel: 1 },
  { id: '10', name: 'Steel Armor', price: 250, type: 'cosmetic', minLevel: 3 },
  { id: '11', name: 'Magic Ring', price: 1000, type: 'cosmetic', minLevel: 10 },
];

// Define pets available for purchase (with XP properties)
const buyablePets = [
  { id: 'p3', name: 'Terra', level: 1, hp: 25, maxHp: 25, attack: 6, price: 200, xp: 0, xpToNextLevel: 100, inventory: [], equipped: {weapon: null, comsetic:null} },
  { id: 'p4', name: 'Diablo', level: 1, hp: 30, maxHp: 30, attack: 4, price: 200, xp: 0, xpToNextLevel: 100, inventory: [], equipped: {weapon: null, comsetic:null} },
  { id: 'p5', name: 'Star', level: 1, hp: 20, maxHp: 20, attack: 7, price: 200, xp: 0, xpToNextLevel: 100, inventory: [], equipped: {weapon: null, comsetic:null} },
];

export default function ShopScreen({ navigate, params }) {
  const { 
    selectedPet, 
    updatePet, 
    addPet, 
    pets, 
    globalGold, 
    updateGlobalGold 
  } = usePets();

  // Determine which view to show
  const view = params?.view || 'items';

  const buy = (item) => {
    if (globalGold >= item.price) {
      updateGlobalGold(prev => prev - item.price);
      updatePet(selectedPet.id, (p) => ({ 
        inventory: [...(p.inventory||[]), item]
      }));
      alert(`${selectedPet.name} bought ${item.name}!`);
    } else {
      alert(`Not enough gold! Need ${item.price - globalGold} more.`);
    }
  };

  const buyPet = (pet) => {
    if (pets.find(p => p.id === pet.id)) {
      alert('You already own this pet!');
      return;
    }
    if (globalGold >= pet.price) {
      updateGlobalGold(prev => prev - pet.price);
      const { price, ...newPetData } = pet; 
      addPet(newPetData);
      alert(`You bought ${pet.name}! You can select them on the Home screen.`);
    } else {
      alert(`Not enough gold! Need ${pet.price - globalGold} more.`);
    }
  };

  // --- Render Item Shop ---
  const renderItemShop = () => {
    if (!selectedPet) {
      return <p>Please select a pet from the Home screen to buy items.</p>;
    }

    // Filter items based on pet level
    const availableItems = items.filter(it => selectedPet.level >= it.minLevel);

    return (
      <>
        <h4 style={{marginTop: 10, marginBottom: 5}}>Buy Items for {selectedPet.name} (Lvl {selectedPet.level})</h4>
        {availableItems.length === 0 ? (
          <p>No new items available for your level.</p>
        ) : (
          availableItems.map(it => (
            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
              <div>{it.name} (Lvl {it.minLevel}+) — ${it.price}</div>
              <Image
              source={weaponImages[it.id]}
              style={{ width: 5, height: 5 }}
              accessibilityLabel={it.name}
              />
              <button onClick={() => buy(it)}>Buy</button>
            </div>
          ))
        )}
      </>
    );
  };

  // --- Render Pet Shop ---
  const renderPetShop = () => {
    return (
      <>
        <h4 style={{marginTop: 10, marginBottom: 5}}>Buy New Pets</h4>
        {buyablePets.map(pet => (
          <div key={pet.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
            <div>{pet.name} (Lvl {pet.level}, HP {pet.hp}) — ${pet.price}</div>
            <Image
              source={petImages[pet.id]}
              style={{ width: 64, height: 64 }}
              accessibilityLabel={pet.name}
            />
            <button onClick={() => buyPet(pet)}>Buy Pet</button>
          </div>
        ))}
      </>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Shop</h3>
      <p>Player Gold: {globalGold}</p>
      
      {view === 'items' ? renderItemShop() : renderPetShop()}

      <button onClick={() => navigate('Home')} style={{ marginTop: 24 }}>Back to Home</button>
    </div>
  );
}