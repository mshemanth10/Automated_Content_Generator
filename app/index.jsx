import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  TextInput,
  ScrollView,
  Share,
  Clipboard,  
} from 'react-native';
import React, { useState } from 'react';
import Header from "../components/Header";
import ScreenWrapper from '../components/ScreenWrapper';
import { wp } from '../constants/helpers/common';
import { theme } from '../constants/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { Image } from 'expo-image';
import { useEffect } from "react";
import { showAlert } from "../utilities/showAlert";
import Icon from 'react-native-vector-icons/FontAwesome';

export const GOOGLE_AI_API_KEY="AIzaSyDo02j-sD7XgdI8FnGy50HKFGMCmxRtTJo";

const doctor = () => {
  const [loadingW, setLoadingW] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInput1, setUserInput1] = useState('');
  const [userInput2, setUserInput2] = useState('');
  const [userInput3, setUserInput3] = useState('');
  const [isImg, setIsImage] = useState(false);
  const [isText, setIsText] = useState(false);
  const [botResponse, setBotResponse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const GPT_API_KEY = "AIzaSyDo02j-sD7XgdI8FnGy50HKFGMCmxRtTJo"; 

  const categories = [
    { id: 'type', name: 'Content type', options: ['Ad Creatives', 'Social Media', 'E-Commerce'] },
    { id: 'creative', name: 'Creative Type', options: ['Image', 'Image with caption', 'Text'] },
    { id: 'ifimage', name: 'Image dimension', options: ['Square', 'Portrait', 'Landscape'] },
  ];

  const handleCategoryPress = (id) => {
    setSelectedCategory((prev) => (prev === id ? null : id));
  };

  const handleOptionSelect = (categoryId, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [categoryId]: option,
    }));
  };

  const handleBoth = async () => {
    handleChatSubmit();
    handleImageText();
  };

  const handleImageTextAll = () => {
    setIsImage(false);
    setIsText(false);
    if (!selectedCategory) {
      showAlert("Category", "Please select a category.");
      return;
    }
    if (!selectedOptions['creative']) {
      showAlert("Creative", "Please select a creative option.");
      return;
    }
    if (selectedOptions['creative'] === "Text") {
      handleChatSubmit();
    } else if (selectedOptions['creative'] === "Image") {
      handleImageText();
    } else {
      handleBoth();
    }
  };

  const handleImageText = async () => {
    setIsImage(true);
    setLoadingW(true);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userInput3 }), // Using userInput1 as the prompt
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const generatedImageUrl = data.images[0]; // Assuming the first image is what we need
        setBotResponse(generatedImageUrl); // Set the URL to botResponse
        
      } else {
        //showAlert("Error", data.error || "Failed to generate image");
        fetchImageFromGoogle(userInput1+userInput2);
      }
    } catch (error) {
      console.error("Error generating image:", error);
     // showAlert("Error", "An error occurred while generating the image.");
      fetchImageFromGoogle(userInput1+userInput2);
    } finally {
      setLoadingW(false);
    }
  };
  const fetchImageFromGoogle = async (query) => {
    try {
      const apiKey = "AIzaSyD3AAsVFoPKd5snVQP3WUQCF1S_clVMPPM";
      const cx = "e705eb8caa8264b09";
      const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&searchType=image&key=${apiKey}&cx=${cx}`;
  
      const googleResponse = await fetch(googleSearchUrl);
      const googleData = await googleResponse.json();
  
      if (googleResponse.ok && googleData.items && googleData.items.length > 0) {
        const imageUrl = googleData.items[0].link;  // Get the first image link
        setBotResponse(imageUrl);  // Set the image URL to botResponse
      } else {
        //showAlert("Error", "No images found on Google.");
      }
    } catch (error) {
      console.error("Error fetching image from Google:", error);
      
    }
  };

  const handleChatSubmit = async () => {
    if (!userInput1 || !userInput2 || !userInput3) {
      showAlert("Error", "Please fill all the input fields.");
      return;
    }

    setLoadingW(true);
    setIsText(true)
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GPT_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate engaging social media content based on the following: 
    title: ${userInput1}, 
    subtitle: ${userInput2}, 
    details: ${userInput3}, 
    ${Object.entries(selectedOptions)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")} 
    The content should be optimized for FaceBook in simple, give me only one option with text to share only`;

    try {
      const result = await model.generateContent(prompt);
      if (result && result.response) {
        setBotResponse(result.response.text || "No response from Gemini");
      } else {
        setBotResponse("No response available.");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setBotResponse("Error generating content. Please try again.");
    } finally {
      setLoadingW(false);
    }
  };

  const renderCategoryOptions = (categoryId, options) =>
    options.map((option, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => handleOptionSelect(categoryId, option)}
        style={[
          styles.optionButton,
          selectedOptions[categoryId] === option && styles.selectedOption,
        ]}
      >
        <Text
          style={[
            styles.optionText,
            selectedOptions[categoryId] === option && styles.selectedOptionText,
          ]}
        >
          {option}
        </Text>
      </TouchableOpacity>
    ));

  const handleShare = async () => {
    try {
      await Share.share({
        message: botResponse,  // Sharing the generated response
      });
    } catch (error) {
      alert('Error sharing content: ' + error.message);
    }
  };

  const handleCopy = async () => {
    if (botResponse) {
      try {
        await Clipboard.setString(botResponse);  // Copy text to clipboard
        showAlert("Success", "Content copied to clipboard!");
      } catch (error) {
        console.error("Error copying content:", error);
        showAlert("Error", "Failed to copy content.");
      }
    } else {
      showAlert("Error", "No content to copy.");
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title={"Automated Content Generator"} mb={20} showBackButton={false} />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.heading}>Select a Type of Content</Text>
          {categories
            .filter(
              (category) =>
                !(category.id === 'ifimage' && selectedOptions['creative'] === 'Text')
            )
            .map((category) => (
              <View key={category.id} style={styles.categoryContainer}>
                <Pressable
                  onPress={() => handleCategoryPress(category.id)}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.activeCategory,
                  ]}
                >
                  <Text style={styles.categoryText}>{category.name}</Text>
                </Pressable>
                {selectedCategory === category.id && (
                  <View style={styles.optionsContainer}>
                    {renderCategoryOptions(category.id, category.options)}
                  </View>
                )}
              </View>
            ))}

          <Text style={styles.heading}>Enter Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={userInput1}
            onChangeText={setUserInput1}
          />
          <TextInput
            style={styles.input}
            placeholder="Sub Title"
            value={userInput2}
            onChangeText={setUserInput2}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={userInput3}
            multiline
            onChangeText={setUserInput3}
          />
          {Object.keys(selectedOptions).length > 0 && (
            <View style={styles.selectedOptionsContainer}>
              <Text style={styles.heading}>Selected Options:</Text>
              {Object.entries(selectedOptions).map(([key, value]) => (
                <Text key={key} style={styles.selectedOptionText}>
                  {value}
                </Text>
              ))}
            </View>
          )}
          <TouchableOpacity onPress={handleImageTextAll} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Generate</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
              (isImg && <View style={[styles.generatedContentBox,{justifyContent:'center'}]}>
                <Image source={{ uri: botResponse }} style={{ alignItems:'center', justifyContent:'center', width: 200, height: 300 }} />
              </View>)
          )}
          {loadingW ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : ( isText && botResponse && (
            <View style={styles.generatedContentBox}>
              <Text style={styles.botResponse}>{botResponse}</Text>
              {/* Copy Button */}
              <TouchableOpacity onPress={handleCopy} style={styles.shareButton}>
                  <Icon name="copy" size={19} color="#fff" />
                  <Text style={styles.shareButtonText}>Copy</Text>
                </TouchableOpacity>
            </View>

          ))}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                
                {/* Share Button */}
                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                  <FontAwesomeIcon icon={faShareAlt} size={20} color="#fff" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default doctor; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(4),
    backgroundColor: '#f9f9f9',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginVertical: 10,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  activeCategory: {
    backgroundColor: '#EA9433',
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  optionsContainer: {
    marginTop: 10,
    flexDirection: 'row', 
    flexWrap: 'wrap',      
    marginLeft: 10,
  },
  optionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: '#EABE33',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  generatedContentBox: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 20,
    alignItems: 'center',
    flexDirection:'row',
    width: '100%',  // Ensures the content box fills its container
  },  
  botResponse: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
  shareButton: {
   flex:"end",
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
});
