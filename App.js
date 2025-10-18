// App.js
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import HomeScreen from './HomeScreen';
import BattleScreen from './BattleScreen';
import ShopScreen from './ShopScreen';
import BankScreen from './BankScreen';
import InventoryScreen from './InventoryScreen';
import RosterScreen from './RosterScreen';
// If using Expo/Native, prefer AsyncStorage; for web-only, localStorage is fine.
// import AsyncStorage from '@react-native-async-storage/async-storage';

export const PetContext = createContext(null);
export const usePets = () => useContext(PetContext);

export default function App() {
  // Global player currency
  const [globalGold, setGlobalGold] = useState(150);
  
  // Simple demo seed (removed 'gold' from pets)
  const [pets, setPets] = useState([
    { id: 'p1', name: 'Aegis', level: 3, hp: 35, maxHp: 35, attack: 7, inventory: [], equipped: {weapon: null, comsetic:null}},
    { id: 'p2', name: 'Nyx',   level: 1, hp: 20, maxHp: 20, attack: 5, inventory: [], equipped: {weapon: null, comsetic:null}},
  ]);
  const [selectedPetId, setSelectedPetId] = useState('p1');

  // --- optional: persist roster & gold ---
  // ... (persistence logic would need to save globalGold too)

  const selectedPet = useMemo(
    () => pets.find(p => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  // helpers
  const updatePet = (id, updater) => {
    setPets(prev => prev.map(p => (p.id === id ? { ...p, ...updater(p) } : p)));
  };

  const addPet = (pet) => {
    setPets(prev => [...prev, pet]);
  };

  // Helper for global currency
  const updateGlobalGold = (updater) => {
    setGlobalGold(updater); // updater can be a value or a function like (prev => prev + 10)
  };

  const value = useMemo(() => ({
    pets,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    updatePet,   // (id, updaterFn) -> merges updaterFn(p) into pet
    addPet,      // add a new pet
    setPets,     // in case you want full control later
    globalGold,
    updateGlobalGold,
  }), [pets, selectedPet, selectedPetId, globalGold]);

  // ---- your existing mini-router ----
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState(null);
  const navigate = (nextScreen, nextParams = null) => {
    setScreen(nextScreen);
    setParams(nextParams);
  };

  return (
    <PetContext.Provider value={value}>
      {screen === 'Home'   && <HomeScreen   navigate={navigate} />}
      {screen === 'Battle' && <BattleScreen navigate={navigate} params={params} />}
      {screen === 'Shop'   && <ShopScreen   navigate={navigate} />}
      {screen === 'Bank'   && <BankScreen   navigate={navigate} />}
      {screen === 'Roster' && <RosterScreen navigate={navigate} />}
      {screen === 'Inventory' && <InventoryScreen navigate = {navigate} />}
    </PetContext.Provider>
  );
}