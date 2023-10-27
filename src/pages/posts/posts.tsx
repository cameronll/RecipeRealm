import React, {useState, useEffect, useRef} from 'react';
import {db} from '../../firebaseConfig';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
} from 'firebase/auth';
import Navbar from '../../components/Navbar';
import {
  Box,
  useColorModeValue,
  Stack,
  Avatar,
  Text,
  Button,
  Flex,
  Input,
} from '@chakra-ui/react';
import { Header } from 'rsuite';


function posts() {
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSubmit = () => {
    setSubmittedText(inputText);
  };

  return (
    
      <Box p={4}>
        <Input
          type="text"
          placeholder="Enter your text"
          value={inputText}
          onChange={handleInputChange}
        />
        <Button colorScheme="teal" onClick={handleSubmit}>/**submits the form */
          Submit
        </Button>
        
      </Box>
    
  );
}

export default posts;
