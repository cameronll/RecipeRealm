import React, {useState, useEffect, useRef} from 'react';
import {db} from '../firebaseConfig';
import {AiOutlineHeart} from 'react-icons/ai';
import {CgBowl} from 'react-icons/cg';
import {BsWindow, BsFillChatDotsFill, BsKanbanFill} from 'react-icons/bs';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  where,
  query,
} from 'firebase/firestore';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
} from 'firebase/auth';
import Navbar from '../components/Navbar';
import {
  Box,
  useColorModeValue,
  Stack,
  Avatar,
  Text,
  Button,
  VStack,
  Container,
  Flex,
  SimpleGrid,
  HStack,
  Input,
  Heading,
  Center,
  Badge,
  FormControl,
  FormLabel,
  Textarea,
  FormHelperText,
  AbsoluteCenter,
  Select,
  Icon,
  Image,
  StackDivider,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import {Link} from 'react-router-dom';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>();
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);

  useEffect(() => {
    async function getRecipes() {
      const querySnapshot = await getDocs(
        collection(db, 'users/' + email + '/Recipes'),
      );
      const recipesData = querySnapshot.docs.map(doc => doc.data());
      setRecipes(recipesData);
    }
    async function getNumPosts() {
      const myQuery = query(
        collection(db, 'users/' + email + '/Recipes'),
        where('posted', '==', 'true'),
      );
      const numPosts = await getDocs(myQuery);
      const numPostsData = numPosts.docs.map(doc => doc.data());
      setPosts(numPostsData);
    }
    async function getProfile() {
      const docRef = doc(db, 'users/', email);
      const docSnap = await getDoc(docRef);
      setProfile(docSnap.data());
    }
    getNumPosts();
    getProfile();
    getRecipes();
  }, []);

  /*
  data that can be displayed: 
  recipe.data.<recipe_name, difficulty, allergens, cooking_time, cost_per_serving, instructions, servings>
  recipe.data.nutrients.<calories, cholesterol, 
      dietary_fiber, protein, saturated_fat, sodium, sugars, total_carbohydrate, total_fat>
  */

  // example display
  const recipesList = recipes.map(recipe => (
    <div id="my-recipe-tiles" key={recipe.data.recipe_name}>
      {[
        'Name: ',
        recipe.data.recipe_name,
        ' Difficulty: ',
        recipe.data.difficulty,
        ' Calories: ',
        recipe.data.nutrients.calories,
      ]}
    </div>
  ));

  return (
    <>
      <Navbar />

      <Container
        maxW={'10xl'}
        py={12}
        bgGradient="linear(to-t, grey, #05e0f0)"
        alignContent="center"
        display="flex"
        justifyContent="center"
        alignItems="center">
        <HStack spacing="65px">
          <Stack spacing={4}>
            <Text
              textTransform={'uppercase'}
              color={'blue.400'}
              fontWeight={600}
              fontSize={'sm'}
              bg={useColorModeValue('blue.50', 'blue.900')}
              p={2}
              alignSelf={'flex-start'}
              rounded={'md'}>
              {}
            </Text>
            <Heading>{profile?.email}'s Page</Heading>
            <Text>{recipes.length} Recipes</Text>
            <Text>{posts}# Posts</Text>
            <Text color={'black'} fontSize={'lg'}>
              {profile?.biography}
            </Text>
          </Stack>
          <Stack>
            <Image
              rounded={'md'}
              alt={'feature image'}
              src={
                'https://i.ytimg.com/vi/3EDFSswI29c/hqdefault.jpg?sqp=-oaymwE9CNACELwBSFryq4qpAy8IARUAAAAAGAElAADIQj0AgKJDeAHwAQH4AbYIgALQBYoCDAgAEAEYZSBZKEgwDw==&rs=AOn4CLDJAwWFyjufCBlFlIm1PDteqDDfCA'
              }
              objectFit={'cover'}
            />
          </Stack>
          <Stack>
            <Link to="/CreateRecipe">
              <Button
                w="200px"
                rightIcon={<CgBowl />}
                colorScheme="teal"
                onClick={() => {
                  window.localStorage.removeItem('RECIPENAME');
                  window.localStorage.removeItem('COOKINGTIME');
                  window.localStorage.removeItem('DIFFICULTY');
                  window.localStorage.removeItem('APPLIANCES');
                  window.localStorage.removeItem('COST');
                  window.localStorage.removeItem('ALLERGENS');
                  window.localStorage.removeItem('SERVINGS');
                  window.localStorage.removeItem('INSTRUCTIONS');
                  window.localStorage.removeItem('INGREDIENTSTRING');
                  window.localStorage.removeItem('INGREDIENTCOUNT');
                }}>
                Create Recipe
              </Button>
            </Link>
            <Link to="/Posts">
              <Button w="200px" rightIcon={<BsWindow />} colorScheme="gray">
                Create Post
              </Button>
            </Link>
          </Stack>
        </HStack>
      </Container>
      <VStack
        w={'full'}
        h={'80px'}
        backgroundImage={
          'url(https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.dreamstime.com%2Fphotos-images%2Ffood-background.html&psig=AOvVaw19YTiVWLg69rXtH_pxsMAt&ust=1698854868045000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCLjS8djVoIIDFQAAAAAdAAAAABAJ)'
        }
        bgColor="gray.400"
        borderColor="gray.200"
        dropShadow="lg">
        <Box margin={4} textAlign="center">
          <Heading
            size="sm"
            fontSize="35px"
            textAlign="center"
            alignSelf={'center'}>
            {profile?.email}'s Recipes
          </Heading>
        </Box>
      </VStack>

      <HStack spacing={10}>
        <Box>
          <SimpleGrid
            columns={3}
            padding={3}
            alignContent="center"
            display="flex"
            justifyContent="center"
            alignItems="center">
            {recipes.length === 0 ? (
              <Heading textAlign="center">You have 0 recipes</Heading>
            ) : (
              recipes.map(recipe => (
                <Container
                  boxShadow={'2xl'}
                  minW="sm"
                  borderRadius="lg"
                  overflow="hidden"
                  justify-content="space-between"
                  backgroundColor="rgba(6, 176, 189, 0.7)"
                  minH="350"
                  display="flex"
                  flexDirection="column"
                  rounded="md"
                  padding={4}
                  margin={4}
                  marginRight={10}
                  marginLeft={10}>
                  <VStack shadow={'xs'} align="stretch">
                    <Box rounded="md" bg="#D3D3D3" w="100%" p={4} color="white">
                      <Button
                        variant="link"
                        rounded="md"
                        as="h3"
                        size="lg"
                        color="black"
                        padding={1}>
                        {recipe.data.recipe_name}
                      </Button>
                    </Box>
                    <Stack direction="row" spacing={4} align="stretch">
                      <Button variant="link" colorScheme="red">
                        <AiOutlineHeart style={{fontSize: '34px'}} />
                      </Button>
                      <Button variant="link" colorScheme="green">
                        <BsFillChatDotsFill style={{fontSize: '34px'}} />
                      </Button>
                    </Stack>

                    <Box
                      boxShadow="xs"
                      rounded="md"
                      padding="4"
                      bg="#4fb9af"
                      color="black"
                      maxW="container.sm">
                      <Text noOfLines={1} as="b">
                        Difficulty: {recipe.data.difficulty}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Time: {recipe.data.cooking_time}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Servings: {recipe.data.servings}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Cost Per Serving: {recipe.data.cost_per_serving}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Cooking Applications: {recipe.data.cooking_applications}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Allergens: {recipe.data.allergens}
                      </Text>
                    </Box>
                    <Accordion allowToggle allowMultiple>
                      <AccordionItem>
                        <h2>
                          <AccordionButton bg="#4fb9af">
                            <Box as="span" flex="1" textAlign="left">
                              Nutrition Data
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <Box padding="4" color="black" maxW="container.sm">
                            <Text noOfLines={1} as="b">
                              Calories: {recipe.data.nutrients.calories}
                            </Text>
                            <Text as="b" noOfLines={1}>
                              Protein: {recipe.data.nutrients.protein}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Carbs: {recipe.data.nutrients.total_carbohydrate}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Sugar: {recipe.data.nutrients.sugars}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Fat: {recipe.data.nutrients.total_fat}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Saturated Fat:{' '}
                              {recipe.data.nutrients.saturated_fat}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Cholesterol: {recipe.data.nutrients.cholesterol}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Sodium: {recipe.data.nutrients.sodium}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Fiber: {recipe.data.nutrients.dietary_fiber}
                            </Text>
                          </Box>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                    <Accordion allowToggle allowMultiple>
                      <AccordionItem>
                        <h2>
                          <AccordionButton bg="#4fb9af">
                            <Box as="span" flex="1" textAlign="left">
                              Instructions:
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <Box padding="4" color="black" maxW="container.sm">
                            <Text as="b">{recipe.data.instructions}</Text>
                          </Box>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </VStack>
                </Container>
              ))
            )}
          </SimpleGrid>
        </Box>
      </HStack>
    </>
  );
};
export default Recipes;
