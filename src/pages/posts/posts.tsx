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

type nutrition = {
  calories: number;
  total_fat: number;
  saturated_fat: number;
  cholesterol: number;
  sodium: number;
  total_carbohydrate: number;
  dietary_fiber: number;
  sugars: number;
  protein: number;
};

type recipe = {
  recipe_name: string;
  servings: string;
  allergens: string;
  cooking_applications: string;
  cooking_time: string;
  cost_per_serving: string;
  difficulty: string;
  posted: boolean;
  ingredients: string[];
  instructions: string;
  nutrients: nutrition;
};

async function toDB(title:string, description:string, recipe:recipe){
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const getUser = doc(db, 'users/', email);
  const getUserData = await getDoc(getUser);
  const username = getUserData?.data()?.username;
  const date = new Date();
  await setDoc(doc(db, 'posts/' + title), {
    // name in database: variable
    email: email,
    username: username,
    date_time: date,
    title: title,
    description: description,
    recipe: recipe
  });
}
const Posts: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);

  useEffect(() => {
    async function getRecipes() {
      const querySnapshot = await getDocs(
        collection(db, 'users/' + email + '/Recipes'),
      );
      const recipesData = querySnapshot.docs.map(doc => doc.data());
      console.log(recipesData);
      setRecipes(recipesData);
    }
    getRecipes();
  }, []);

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
              {recipes[0]?.data.recipe_name}
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
              {recipes[0]?.data.recipe_name}
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
              {recipes[0]?.recipe_name}
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
