import React, {useState, useEffect, useRef} from 'react';
import {db} from '../../firebaseConfig';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {useNavigate} from 'react-router-dom';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
} from 'firebase/auth';
import Navbar from '../../components/Navbar';
import {BsUpload} from 'react-icons/bs';
import {useToast} from '@chakra-ui/react';
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
  Select,
  HStack,
  Image,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import {Header} from 'rsuite';

function getRecipeIndex(recipes: any[], recipe_name: string): number {
  for (let i = 0; i < recipes.length; i++) {
    if (recipes[i]?.data.recipe_name === recipe_name) {
      return i;
    }
  }
  return -1;
}

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

async function toDB(title: string, description: string, recipe: any) {
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const getUser = doc(db, 'users/', email);
  const getUserData = await getDoc(getUser);
  const username = getUserData?.data()?.username;
  const date = new Date();
  const recipeDoc = doc(
    db,
    'users/',
    email,
    'Recipes/',
    recipe.data.recipe_name,
  );
  const updated = await updateDoc(recipeDoc, {
    posted: true,
  });
  await addDoc(collection(db, 'posts'), {
    // name in database: variable
    email: email,
    username: username,
    date_time: date,
    title: title,
    description: description,
    recipe: recipe,
    likes: 0,
  });
}
const Posts: React.FC = () => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipeName, setRecipeName] = useState<any>();
  const [postRecipe, setPostRecipe] = useState<any>();
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const navigate = useNavigate();

  useEffect(() => {
    const recipesQuery = query(collection(db, 'users/' + email + '/Recipes'));
    const recipesSnapshot = onSnapshot(recipesQuery, querySnapshot => {
      const temp: any[] = [];
      var tempNum = 0;
      querySnapshot.forEach(doc => {
        temp.push(doc.data());
      });
      console.log('recipes');
      setRecipes(temp);
    });
    if (window.localStorage.getItem('TITLE')) {
      const title_store: any = window.localStorage.getItem('TITLE');
      setTitle(JSON.parse(title_store));
    }
    if (window.localStorage.getItem('DESCRIPTION')) {
      const description_store: any = window.localStorage.getItem('DESCRIPTION');
      setDescription(JSON.parse(description_store));
    }
    if (window.localStorage.getItem('RECIPE')) {
      const recipe_store: any = window.localStorage.getItem('RECIPE');
      setPostRecipe(JSON.parse(recipe_store));
    }
  }, []);

  const handleTitleChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('TITLE', JSON.stringify(targ));
    setTitle(targ);
  };
  const handleDescriptionChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('DESCRIPTION', JSON.stringify(targ));
    setDescription(targ);
  };

  const handleRecipeChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('RECIPE', JSON.stringify(targ));
    setRecipeName(targ);
  };

  const handleSubmit = () => {
    const title = JSON.parse(localStorage.getItem('TITLE') as string);
    const description = JSON.parse(
      localStorage.getItem('DESCRIPTION') as string,
    );
    const recipe =
      recipes[
        getRecipeIndex(
          recipes,
          JSON.parse(localStorage.getItem('RECIPE') as string),
        )
      ];
    console.log(recipe);
    toDB(title, description, recipe);
    console.log('Document created!');
    navigate('/explore');
  };

  return (
    <>
      <Navbar />
      <Flex
        w={'full'}
        h={'100'}
        backgroundImage={
          'url(https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.dreamstime.com%2Fphotos-images%2Ffood-background.html&psig=AOvVaw19YTiVWLg69rXtH_pxsMAt&ust=1698854868045000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCLjS8djVoIIDFQAAAAAdAAAAABAJ)'
        }
        backgroundSize={'cover'}
        backgroundPosition={'center center'}
        alignContent={'flex-end'}
        backgroundColor="rgba(0, 128, 128, 0.7)">
        <Flex
          w={'full'}
          h={'100'}
          backgroundSize={'cover'}
          backgroundPosition={'center center'}
          alignContent={'flex-end'}
          backgroundColor="rgba(0, 128, 128, 0.7)">
          <VStack
            w={'full'}
            px={useBreakpointValue({base: 4, md: 8})}
            // bgGradient={'linear(to-r, blackAlpha.600, transparent)'}
          >
            <Stack maxW={'2xl'} spacing={6}>
              <Text textAlign="center" fontSize="6xl" as="b" color="white">
                Create Post
              </Text>
            </Stack>
          </VStack>
        </Flex>
      </Flex>
      {/* <Heading w="100%" textAlign={'center'} fontWeight="normal" marginTop={5}>
        <Text marginTop={5} as="b" fontSize={80}>
          Create Posts
        </Text>
      </Heading> */}
      <Center minH="80vh">
        <Box
          boxShadow="dark-lg"
          rounded="md"
          padding="4"
          color="black"
          minW="container.sm">
          <FormControl mt={1}>
            <HStack>
              <FormLabel
                fontSize="lg"
                fontWeight="md"
                color="gray.700"
                _dark={{
                  color: 'gray.50',
                }}>
                Title
              </FormLabel>
              <Input
                variant="flushed"
                onChange={handleTitleChange}
                value={title}></Input>
            </HStack>
          </FormControl>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              Description
            </FormLabel>
            <Textarea
              placeholder="Brody's Stuff"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: 'sm',
              }}
              onChange={handleDescriptionChange}
              value={description}
            />
          </FormControl>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              Recipe
            </FormLabel>
            <Select
              id="difficulty"
              name="difficulty"
              autoComplete="difficulty"
              placeholder="Select option"
              focusBorderColor="brand.400"
              shadow="sm"
              size="sm"
              w="full"
              rounded="md"
              onChange={handleRecipeChange}
              value={recipeName}>
              {recipes.map(recipe => (
                <option>{recipe?.data.recipe_name}</option>
              ))}
            </Select>
            <FormHelperText>
              *You can only choose from your recipe list
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
              Image
            </FormLabel>
            <Box>
              <Image
                boxSize="150px"
                rounded={3}
                src="default-image-icon-missing-picture-page-vector-40546530.jpg"
                alt="Image Missing"
                marginBottom={4}
              />
            </Box>
            <Button size="md">
              {' '}
              <BsUpload />
              <Text marginLeft={2}>File Upload</Text>
            </Button>
          </FormControl>
          <Flex justifyContent="right">
            <Button
              colorScheme="teal"
              onClick={() => {
                handleSubmit();
                toast({
                  title: 'Recipe created.',
                  description: "We've created your recipe for you.",
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
              }}
              ml="auto">
              Create Post
            </Button>
          </Flex>
        </Box>
      </Center>
    </>
  );
};

export default Posts;
