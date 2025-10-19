// App.js
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import HomeScreen from './HomeScreen';
import BattleScreen from './BattleScreen';
import ShopScreen from './ShopScreen';
import BankScreen from './BankScreen';
import InventoryScreen from './InventoryScreen';
import LessonsScreen from './LessonsScreen';
import ReceiptUploadScreen from './ReceiptUploadScreen';
import lessonsData from './lessons.json';

const API_URL = 'http://localhost:3001/api/ai';
const NESSIE2_URL = 'http://localhost:3001/api/nessie2';

export const PetContext = createContext(null);
export const usePets = () => useContext(PetContext);

export default function App() {
  // ... (All your existing state and functions remain unchanged) ...
  const [globalGold, setGlobalGold] = useState(150);
  const [userAge, setUserAge] = useState(10);
  const [pets, setPets] = useState([
    { id: 'p1', name: 'Moon', level: 3, hp: 35, maxHp: 35, attack: 7, xp: 0, xpToNextLevel: 300, inventory: [], equipped: {weapon: null, comsetic:null}, lessonProgress: 0, lessonsCompleted: false },
    { id: 'p2', name: 'Aqua',   level: 1, hp: 20, maxHp: 20, attack: 5, xp: 0, xpToNextLevel: 100, inventory: [], equipped: {weapon: null, comsetic:null}, lessonProgress: 0, lessonsCompleted: false },
  ]);
  const [selectedPetId, setSelectedPetId] = useState('p1');
  const selectedPet = useMemo(() => pets.find(p => p.id === selectedPetId) ?? null, [pets, selectedPetId]);

  
  const updatePet = (id, updater) =>
    setPets(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...(typeof updater === 'function' ? updater(p) : updater) }
          : p
      )
    );
  const addPet = (pet) => {
    const newPet = { ...pet, lessonProgress: 0, lessonsCompleted: false };
    setPets(prev => [...prev, newPet]);

  };
  const updateGlobalGold = (updater) => setGlobalGold(updater);
  
  const addXp = (id, amount) => {
    let petToUpdate = pets.find(p => p.id === id);
    if (!petToUpdate) return;
    let newXp = petToUpdate.xp + amount;
    let newLevel = petToUpdate.level;
    let newMaxHp = petToUpdate.maxHp;
    let newAttack = petToUpdate.attack;
    let newXpToNextLevel = petToUpdate.xpToNextLevel;
    let leveledUp = false;
    if (newXp >= newXpToNextLevel) {
      leveledUp = true;
      newLevel += 1;
      newXp -= newXpToNextLevel;
      newXpToNextLevel = Math.floor(newXpToNextLevel * 1.5);
      newMaxHp = Math.floor(newMaxHp * 1.2);
      newAttack = newAttack + 2;
      const levelUpGold = 50 * newLevel;
      updateGlobalGold(prev => prev + levelUpGold);
      alert(`${petToUpdate.name} grew to Level ${newLevel}!\nMax HP +${newMaxHp - petToUpdate.maxHp}, Attack +2.\nYou found ${levelUpGold} gold!`);
    }
    updatePet(id, (p) => ({ ...p, xp: newXp, level: newLevel, maxHp: newMaxHp, hp: leveledUp ? newMaxHp : p.hp, attack: newAttack, xpToNextLevel: newXpToNextLevel }));
  };

  const handleNewDay = () => {
    if (!selectedPetId) { alert("Please select a pet first."); return; }
    const randomAmount = Math.floor(Math.random() * 201) + 50;
    updateGlobalGold(prev => prev + randomAmount);
    const hpLoss = Math.floor(Math.random() * 5) + 1;
    updatePet(selectedPetId, (p) => ({ hp: Math.max(0, p.hp - hpLoss) }));
    alert(`New Day: Found ${randomAmount} gold and lost ${hpLoss} HP!`);
  };
  
  const advanceLesson = (id) => {
    updatePet(id, p => ({ lessonProgress: p.lessonProgress + 1 }));
  };
  
  const markLessonsCompleted = (id) => {
      const pet = pets.find(p => p.id === id);
      if (pet && !pet.lessonsCompleted) {
          updatePet(id, () => ({ lessonsCompleted: true }));
          updateGlobalGold(prev => prev + 250);
          alert("Congratulations! You've completed all lessons and earned 250 gold!");
      }
  };

  const value = useMemo(() => ({
    pets, selectedPet, selectedPetId, setSelectedPetId,
    updatePet, addPet, setPets,
    globalGold, updateGlobalGold, addXp,
    userAge, lessonsData, advanceLesson, markLessonsCompleted,
  }), [pets, selectedPet, selectedPetId, globalGold, userAge]);

  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState(null);
  const navigate = (nextScreen, nextParams = null) => {
    setScreen(nextScreen);
    setParams(nextParams);
    setMenuOpen(false);
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDebugMenuOpen, setDebugMenuOpen] = useState(false);
  const [debugAgeInput, setDebugAgeInput] = useState(userAge.toString());
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    setDebugAgeInput(userAge.toString());
  }, [userAge]);

  const handleChatSubmit = async () => {
    // ... (chat submit logic is unchanged) ...
    if (!chatInput.trim() || isBotTyping) return;
    const newUserMessage = { role: 'user', text: chatInput };
    
    let data2 = { text: "" };
    try {
        const userContext = await fetch(NESSIE2_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: "68f426849683f20dd519ff49" }),
        });
        if (userContext.ok) {
           data2 = await userContext.json();
        }
    } catch (e) {
        console.warn("Could not fetch user context", e);
    }

    setChatMessages(prev => [...prev, newUserMessage]);
    const currentInput = "Condense your answer into 5 action points and put them into bullet points. \
    " + chatInput + " The following contains relevant purchase, deposit, and transfer history: " + data2.text;
    setChatInput('');
    setIsBotTyping(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const botResponse = { role: 'bot', text: data.text };
      setChatMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorResponse = { role: 'bot', text: "Sorry, I'm having trouble connecting right now." };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // ... (renderMenu, renderDebugMenu, renderChatbot functions are unchanged) ...
  const renderMenu = () => {
    return (
      <Modal
        visible={menuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuPopup}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setChatOpen(true); setMenuOpen(false); }}>
                  <Text style={styles.menuItemText}>Chatbot</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { alert('Settings clicked!'); setMenuOpen(false); }}>
                  <Text style={styles.menuItemText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderDebugMenu = () => {
    if (!isDebugMenuOpen) return null;

    const handleSetAge = () => {
        const ageNum = parseInt(debugAgeInput, 10);
        if (!isNaN(ageNum) && ageNum > 0) {
            setUserAge(ageNum);
            pets.forEach(p => updatePet(p.id, () => ({lessonProgress: 0, lessonsCompleted: false})));
            alert(`User age set to ${ageNum}. Lesson series updated and progress reset.`);
        } else {
            alert("Please enter a valid age.");
        }
    };

    return (
      <View style={styles.debugPanel}>
        <Text style={styles.debugTitle}>Debug Panel</Text>
        <TouchableOpacity style={styles.debugButton} onPress={handleNewDay}>
            <Text>New Day</Text>
        </TouchableOpacity>
        
        <Text style={styles.debugTitle}>Set User Age</Text>
        <TextInput
            style={styles.debugInput}
            placeholder="User Age"
            keyboardType="numeric"
            value={debugAgeInput}
            onChangeText={setDebugAgeInput}
        />
        <TouchableOpacity style={styles.debugButton} onPress={handleSetAge}>
            <Text>Set Age</Text>
        </TouchableOpacity>

        <Text style={styles.debugTitle}>Add Custom Item</Text>
        <TextInput style={styles.debugInput} placeholder="Item Name" />
        <TextInput style={styles.debugInput} placeholder="Price" keyboardType="numeric" />
        <TouchableOpacity style={styles.debugButton} onPress={() => alert('Submit clicked (dummy)')}>
            <Text>Submit Item</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderChatbot = () => {
    return (
      <Modal
        visible={isChatOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setChatOpen(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1}}
        >
            <View style={styles.chatOverlay}>
                <View style={styles.chatPopup}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatTitle}>Chatbot</Text>
                    <TouchableOpacity onPress={() => setChatOpen(false)}>
                        <Text style={styles.closeButton}>X</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.chatMessagesContainer} contentContainerStyle={{ paddingBottom: 10 }}>
                    {chatMessages.map((msg, index) => (
                    <View key={index} style={styles.chatMessage(msg.role)}>
                        <Text style={styles.chatMessageText(msg.role)}>{msg.text}</Text>
                    </View>
                    ))}
                    {isBotTyping && <View style={styles.chatMessage('bot')}><Text style={styles.chatMessageText('bot')}>...</Text></View>}
                </ScrollView>
                <View style={styles.chatInputContainer}>
                    <TextInput
                        value={chatInput}
                        onChangeText={setChatInput}
                        placeholder="Enter your prompt..."
                        style={styles.chatInput}
                        onSubmitEditing={handleChatSubmit}
                        editable={!isBotTyping}
                    />
                    <TouchableOpacity onPress={handleChatSubmit} style={styles.chatSendButton} disabled={isBotTyping}>
                        <Text style={styles.chatSendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // --- NEW FUNCTION TO RENDER THE CORRECT FOOTER ---
  const renderFooter = () => {
    if (screen === 'Home') {
      return (
        <View style={styles.footerArea}>
          <TouchableOpacity
            style={styles.homeFooterButton}
            onPress={() => navigate('Lessons')}
          >
            <Text style={styles.homeButtonText}>Video Lessons</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeFooterButton}
            onPress={() => navigate('Bank')}
          >
            <Text style={styles.homeButtonText}>Bank</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeFooterButton}
            onPress={() => navigate('Shop', { view: 'pets' })}
          >
            <Text style={styles.homeButtonText}>Buy Pets</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // On all other screens
    return (
      <View style={styles.footerArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate('Home')}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <PetContext.Provider value={value}>
      <View style={styles.appContainer}>
        <View style={styles.deviceContainer}>
          <View style={styles.headerBar}>
            <Text style={styles.goldDisplay}>Gold: {globalGold}</Text>
            <TouchableOpacity onPress={() => setMenuOpen(true)}>
              <Text style={styles.menuButtonText}>☰ Menu</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentArea}>
            {screen === 'Home' && <HomeScreen navigate={navigate} />}
            {screen === 'Battle' && <BattleScreen navigate={navigate} params={params} />}
            {screen === 'Shop' && <ShopScreen navigate={navigate} params={params} />}
            {screen === 'Bank' && <BankScreen navigate={navigate} />}
            {screen === 'Inventory' && <InventoryScreen navigate={navigate} />}
            {screen === 'Lessons' && <LessonsScreen navigate={navigate} />}
            {screen === 'ReceiptUpload' && <ReceiptUploadScreen navigate={navigate} />}
          </View>

          {/* This one function now handles all footers */}
          {renderFooter()}

          <TouchableOpacity
            style={styles.debugToggleButton}
            onPress={() => setDebugMenuOpen(prev => !prev)}
          >
            <Text>Debug ⚙️</Text>
          </TouchableOpacity>
          {renderDebugMenu()}
        </View>
        {renderMenu()}
        {renderChatbot()}
      </View>
    </PetContext.Provider>
  );
}

const styles = StyleSheet.create({
  // --- STYLES FOR DEVICE AND LAYOUT ---
  appContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  deviceContainer: {
    width: '100%',
    maxWidth: 420,
    height: '100%',
    maxHeight: 840,
    aspectRatio: 1 / 2,
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#555',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1,
    width: '100%',
    position: 'relative',
    padding: 20,
  },
  // --- FOOTER STYLES ---
  footerArea: {
    padding: 15,
    paddingTop: 10,
    width: '100%',
    backgroundColor: 'rgba(40, 40, 40, 0.85)',
    borderTopWidth: 1,
    borderColor: '#555',
    gap: 10, // Adds spacing between home buttons
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center', // Centers text horizontally
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  homeFooterButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center', // Centers text horizontally
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  // --- HEADER ---
  headerBar: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 50,
    backgroundColor: '#dcdcdc',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    zIndex: 10,
    width: '100%',
  },
  goldDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff'
  },
  // --- DEBUG BUTTON (MOVED) ---
  debugToggleButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 70 : 90, // Align with header padding
    right: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 999,
  },
  debugPanel: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 120 : 140, // Below debug toggle
    right: 10,
    width: 200,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    zIndex: 998,
  },
  // --- All other modal/debug/chat styles remain unchanged ---
  debugTitle: {
    marginVertical: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugInput: {
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 8,
  },
  debugButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuPopup: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    textAlign: 'left',
  },
  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatPopup: {
    width: '90%',
    maxWidth: 500,
    height: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatTitle: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888'
  },
  chatMessagesContainer: {
    flex: 1,
    padding: 15,
  },
  chatMessage: role => ({
    padding: 10,
    borderRadius: 15,
    maxWidth: '80%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: role === 'user' ? '#007bff' : '#f1f1f1',
    marginBottom: 10,
  }),
  chatMessageText: role => ({
      color: role === 'user' ? 'white' : 'black',
  }),
  chatInputContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  chatInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  chatSendButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSendButtonText: {
      color: 'white',
      fontWeight: 'bold',
      paddingHorizontal: 5,
  }
});