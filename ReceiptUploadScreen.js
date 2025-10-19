import React, { useState, useEffect, useRef } from 'react';
import { usePets } from './App';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const NESSIE_ACCOUNT_ID = "68f426849683f20dd519ff49";
const API_URL = 'http://localhost:3001/api/process-receipt';

// Promisify FileReader for web
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export default function ReceiptUploadScreen({ navigate }) {
    const [preview, setPreview] = useState(null);
    const [base64Image, setBase64Image] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const { updateGlobalGold } = usePets();
    const fileInputRef = useRef(null);

    // Request permissions on component load for native platforms
    useEffect(() => {
        if (Platform.OS !== 'web') {
            (async () => {
                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (cameraStatus.status !== 'granted' || libraryStatus.status !== 'granted') {
                    alert('Sorry, we need camera and camera roll permissions to make this work!');
                }
            })();
        }
    }, []);
    
    // --- Image Picker Handlers ---

    const handleFileChangeForWeb = async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            try {
                const dataUrl = await readFileAsBase64(file);
                setPreview(dataUrl);
                setBase64Image(dataUrl.split(',')[1]);
                setStatusMessage('');
            } catch (error) {
                console.error("Error reading file:", error);
                setStatusMessage("Error: Could not read the selected file.");
            }
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setPreview(result.assets[0].uri);
            setBase64Image(result.assets[0].base64);
            setStatusMessage('');
        }
    };

    const pickImageFromLibrary = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setPreview(result.assets[0].uri);
            setBase64Image(result.assets[0].base64);
            setStatusMessage('');
        }
    };

    // --- Submission Logic ---

    const handleSubmit = async () => {
        if (!base64Image) {
            setStatusMessage('Please select or take a photo first.');
            return;
        }
        setIsLoading(true);
        setStatusMessage('Processing your receipt...');
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageData: base64Image,
                    nessieAccountId: NESSIE_ACCOUNT_ID,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Server error');

            const total = parseFloat(result.geminiData?.amount) || 0;
            const goldReward = Math.max(5, Math.floor(total));
            updateGlobalGold(prev => prev + goldReward);
            setStatusMessage(`Success! Receipt for $${total.toFixed(2)} processed. You earned ${goldReward} gold!`);
            setPreview(null);
            setBase64Image(null);

        } catch (error) {
            console.error("Frontend: Error during submission:", error);
            setStatusMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Platform-Specific Render Logic ---

    const renderUploadButtons = () => {
        if (Platform.OS === 'web') {
            return (
                <>
                    <input type="file" accept="image/*" onChange={handleFileChangeForWeb} style={{ display: 'none' }} ref={fileInputRef} />
                    <TouchableOpacity onPress={() => fileInputRef.current.click()} style={styles.uploadButton}>
                        <Text style={styles.buttonText}>Choose Image</Text>
                    </TouchableOpacity>
                </>
            );
        } else {
            return (
                <View style={styles.nativeButtonContainer}>
                    <TouchableOpacity onPress={takePhoto} style={styles.uploadButton}>
                        <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImageFromLibrary} style={styles.uploadButton}>
                        <Text style={styles.buttonText}>Choose from Library</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Upload Receipt</Text>
                <Text style={styles.paragraph}>Take a photo or upload a receipt to earn gold based on the total purchase amount!</Text>
                
                {renderUploadButtons()}

                {preview && (
                    <View style={styles.previewContainer}>
                        <Text style={{color: '#FFFFFF', textAlign: 'center'}}>Image Preview:</Text>
                        <Image source={{ uri: preview }} style={styles.previewImage} />
                    </View>
                )}

                <TouchableOpacity onPress={handleSubmit} disabled={isLoading || !base64Image} style={{...styles.button, opacity: (isLoading || !base64Image) ? 0.5 : 1}}>
                    <Text style={styles.buttonText}>{isLoading ? 'Processing...' : 'Submit Receipt'}</Text>
                </TouchableOpacity>

                {statusMessage && <Text style={styles.statusText}>{statusMessage}</Text>}

                <TouchableOpacity onPress={() => navigate('Bank')} style={{...styles.button, backgroundColor: '#6c757d'}}>
                    <Text style={styles.buttonText}>Back to Bank</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = {
    container: {
        padding: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    card: {
        width: '100%',
        maxWidth: 500,
        padding: '25px',
        backgroundColor: 'rgba(40, 40, 40, 0.85)',
        borderRadius: 10,
        border: '1px solid #555',
        alignItems: 'center',
    },
    title: {
        color: '#FFFFFF',
        marginBottom: '15px',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    paragraph: {
        color: '#DDDDDD',
        marginBottom: '25px',
        lineHeight: 22,
        fontSize: '16px',
        textAlign: 'center',
    },
    nativeButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: '20px',
    },
    uploadButton: {
        padding: '12px 20px',
        backgroundColor: '#007bff',
        borderRadius: 5,
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5, // For native buttons
        marginBottom: 10, // For web button
    },
    button: {
        padding: '12px 25px',
        fontSize: '16px',
        cursor: 'pointer',
        marginVertical: 5,
        backgroundColor: '#28a745',
        borderRadius: '5px',
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
    },
    previewContainer: {
        marginVertical: '20px',
        width: '100%',
    },
    previewImage: {
        width: '100%',
        height: undefined,
        aspectRatio: 4 / 5,
        borderRadius: 5,
        border: '1px solid #555',
        marginTop: '10px',
        resizeMode: 'contain',
    },
    statusText: {
        marginTop: '20px',
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
    }
};

