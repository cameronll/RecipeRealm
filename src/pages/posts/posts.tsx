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
  Heading,
  Center,
  Link,
  Badge,
  SimpleGrid,
  FormControl,
  FormLabel,
  Textarea,
  FormHelperText,
  AbsoluteCenter,
} from '@chakra-ui/react';
import {Header} from 'rsuite';

const Posts: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSubmit = () => {
    setSubmittedText(inputText);
  };

  return (
    <>
      <Navbar />
      <Heading w="100%" textAlign={'center'} fontWeight="normal">
        Create Posts
      </Heading>
      <Center h="100%">
        <SimpleGrid w="75" columns={1}>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              Posts Stuff
            </FormLabel>
            <Textarea
              placeholder="Brody's Stuff"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: 'sm',
              }}
            />
            <FormHelperText>
              *I am text on this line that helps the user do things
            </FormHelperText>
          </FormControl>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              Posts Stuff
            </FormLabel>
            <Textarea
              placeholder="Brody's Stuff"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: 'sm',
              }}
            />
            <FormHelperText>
              *I am text on this line that helps the user do things
            </FormHelperText>
          </FormControl>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              Posts Stuff
            </FormLabel>
            <Textarea
              placeholder="Brody's Stuff"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: 'sm',
              }}
            />
            <FormHelperText>
              *I am text on this line that helps the user do things
            </FormHelperText>
          </FormControl>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              Posts Stuff
            </FormLabel>
            <Textarea
              placeholder="Brody's Stuff"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: 'sm',
              }}
            />
            <FormHelperText>
              *I am text on this line that helps the user do things
            </FormHelperText>
          </FormControl>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              Posts Stuff
            </FormLabel>
            <Textarea
              placeholder="Brody's Stuff"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: 'sm',
              }}
            />
            <FormHelperText>
              *I am text on this line that helps the user do things
            </FormHelperText>
          </FormControl>
        </SimpleGrid>
      </Center>
      <Box p={4}>
        <Button colorScheme="teal" onClick={handleSubmit}>
          Create
        </Button>
      </Box>
    </>
  );
};

export default Posts;
