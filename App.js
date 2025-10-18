// App.js
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import HomeScreen from './HomeScreen';
import BattleScreen from './BattleScreen';
import ShopScreen from './ShopScreen';
import BankScreen from './BankScreen';
import InventoryScreen from './InventoryScreen';
// If using Expo/Native, prefer AsyncStorage; for web-only, localStorage is fine.
// import AsyncStorage from '@react-native-async-storage/async-storage';

export const PetContext = createContext(null);
export const usePets = () => useContext(PetContext);

export default function App() {
  // Simple demo seed
  const [pets, setPets] = useState([
    { id: 'p1', name: 'Aegis', level: 3, hp: 35, maxHp: 35, attack: 7, gold: 120 , inventory: [], equipped: {weapon: null, comsetic:null}},
    { id: 'p2', name: 'Nyx',   level: 1, hp: 20, maxHp: 20, attack: 5, gold: 60  , inventory: [], equipped: {weapon: null, comsetic:null}},
  ]);
  const [selectedPetId, setSelectedPetId] = useState('p1');

  // --- optional: persist roster ---
  // useEffect(() => {
  //   (async () => {
  //     const raw = await AsyncStorage.getItem('ROSTER');
  //     if (raw) {
  //       const { pets, selectedPetId } = JSON.parse(raw);
  //       if (pets?.length) setPets(pets);
  //       if (selectedPetId) setSelectedPetId(selectedPetId);
  //     }
  //   })();
  // }, []);
  // useEffect(() => {
  //   AsyncStorage.setItem('ROSTER', JSON.stringify({ pets, selectedPetId }));
  // }, [pets, selectedPetId]);

  const selectedPet = useMemo(
    () => pets.find(p => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  // helpers to keep updates immutable & scoped by id
  const updatePet = (id, updater) => {
    setPets(prev => prev.map(p => (p.id === id ? { ...p, ...updater(p) } : p)));
  };

  const addPet = (pet) => {
    setPets(prev => [...prev, pet]);
  };

  const value = useMemo(() => ({
    pets,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    updatePet,   // (id, updaterFn) -> merges updaterFn(p) into pet
    addPet,      // add a new pet
    setPets      // in case you want full control later
  }), [pets, selectedPet, selectedPetId]);

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

// Inline here for brevity; feel free to split into its own file.
function RosterScreen({ navigate }) {
  const { pets, selectedPetId, setSelectedPetId, addPet } = usePets();

  const handleSelect = (id) => {
    setSelectedPetId(id);
    navigate('Home');
  };

  const handleAdd = () => {
    const id = `p${Math.random().toString(36).slice(2, 7)}`;
    addPet({ id, name: 'New Pet', level: 1, hp: 20, maxHp: 20, attack: 5, gold: 0 });
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>Pet Roster</h2>
      {pets.map(p => (
        <div key={p.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 10
        }}>
          <div>
            <div><strong>{p.name}</strong> {p.id === selectedPetId ? ' (Selected)' : ''}</div>
            <div>Lvl {p.level} • HP {p.hp}/{p.maxHp} • ATK {p.attack} • Gold {p.gold}</div>
          </div>
          <div>
            <button onClick={() => handleSelect(p.id)} style={{ marginRight: 8 }}>
              {p.id === selectedPetId ? 'Use' : 'Select'}
            </button>
          </div>
        </div>
      ))}
      <button onClick={handleAdd} style={{ marginTop: 10 }}>+ Add New Pet</button>
      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate('Home')}>Back</button>
      </div>
    </div>
  );
}
