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
  getCountFromServer,
  onSnapshot,
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
  useBreakpointValue,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react';
import {Link} from 'react-router-dom';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [numPosts, setNumPosts] = useState(0);
  const [profile, setProfile] = useState<any>();
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);

  useEffect(() => {
    const recipesQuery = query(collection(db, 'users/' + email + '/Recipes'));
    const recipesSnapshot = onSnapshot(recipesQuery, querySnapshot => {
      const temp: any[] = [];
      var tempNum = 0;
      querySnapshot.forEach(doc => {
        if (doc.data().posted === true) {
          tempNum++;
        }
        temp.push(doc.data());
      });
      console.log('recipes');
      setNumPosts(tempNum);
      setRecipes(temp);
    });

    const savedRecipesQuery = query(
      collection(db, 'users/' + email + '/SavedRecipes'),
    );
    const savedRecipesSnapshot = onSnapshot(
      savedRecipesQuery,
      querySnapshot => {
        const temp: any[] = [];
        querySnapshot.forEach(doc => {
          temp.push(doc.data());
        });
        setSavedRecipes(temp);
        console.log('saved recipes');
      },
    );

    const profileSnapshot = onSnapshot(doc(db, 'users/', email), doc => {
      setProfile(doc.data());
    });
  }, []);

  // MAP SAVED RECIPES TO A NEW TAB LIKE NORMAL RECIPES, DISPLAY THE SAME + ADD
  // recipe.creator to get the username of who posted it

  return (
    <>
      <Navbar />
      <Flex
        w={'full'}
        h={'100'}
        backgroundSize={'cover'}
        backgroundPosition={'center center'}
        alignContent={'flex-end'}
        backgroundColor="rgba(0, 128, 128)">
        <VStack
          w={'full'}
          px={useBreakpointValue({base: 4, md: 8})}
          // bgGradient={'linear(to-r, blackAlpha.600, transparent)'}
        >
          <Stack minW={'2xl'} spacing={6}>
            <Text textAlign="center" fontSize="6xl" as="b" color="white">
              {profile?.username}'s Page
            </Text>
          </Stack>
        </VStack>
      </Flex>
      <Container
        maxW={'10xl'}
        py={12}
        bg=""
        alignContent="center"
        display="flex"
        justifyContent="center"
        alignItems="center">
        <HStack spacing="65px">
          <VStack>
            <HStack spacing={4}>
              <Avatar
                size="2xl"
                name="Segun Adebayo"
                src={
                  'https://i.ytimg.com/vi/3EDFSswI29c/hqdefault.jpg?sqp=-oaymwE9CNACELwBSFryq4qpAy8IARUAAAAAGAElAADIQj0AgKJDeAHwAQH4AbYIgALQBYoCDAgAEAEYZSBZKEgwDw==&rs=AOn4CLDJAwWFyjufCBlFlIm1PDteqDDfCA'
                }
              />{' '}
              <VStack marginLeft={10}>
                <Heading>{profile?.username}'s Page</Heading>
                <Text>{recipes.length} Recipes</Text>
                <Text>{numPosts} Posts</Text>
                <Text color={'black'} fontSize={'lg'}>
                  {profile?.biography}
                </Text>
              </VStack>
            </HStack>
            <HStack marginTop={10}>
              <Link to="/CreateRecipe">
                <Button
                  w="300px"
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
                <Button w="300px" rightIcon={<BsWindow />} colorScheme="gray">
                  Create Post
                </Button>
              </Link>
            </HStack>
          </VStack>
        </HStack>
      </Container>
      {/* <VStack
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
            {profile?.username}'s Recipes
          </Heading>
        </Box>
      </VStack> */}
      <Tabs isManual variant="enclosed" colorScheme="gray" size="lg">
        <TabList
          sx={{
            justifyContent: 'center',
          }}>
          <Tab>My Recipes</Tab>
          <Tab>Saved Recipes</Tab>
          <Tab>My Posts</Tab>
          <Tab>My Friends</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <HStack spacing={10}>
              <Box>
                <SimpleGrid
                  columns={3}
                  padding={9}
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
                        bg="#f0f0f0"
                        minH="350"
                        display="flex"
                        flexDirection="column"
                        rounded="md"
                        padding={4}
                        margin={4}
                        marginRight={10}
                        marginLeft={10}
                        shadow={'dark-lg'}>
                        <VStack align="2x1">
                          <Center>
                            <Image
                              borderRadius="30px"
                              src="default-image-icon-missing-picture-page-vector-40546530.jpg"
                              alt="Logo"
                              w={300}
                              mb={15}
                            />
                          </Center>

                          <Button
                            variant="link"
                            rounded="md"
                            as="h3"
                            size="lg"
                            color="black"
                            padding={1}>
                            <Center>
                              <Text as="b" fontSize="34px">
                                {recipe.data.recipe_name}
                              </Text>
                            </Center>
                          </Button>
                          {/* <Stack direction="row" spacing={4} align="stretch">
                      <Button variant="link" colorScheme="red">
                        <AiOutlineHeart style={{fontSize: '34px'}} />
                      </Button>
                      <Button variant="link" colorScheme="green">
                        <BsFillChatDotsFill style={{fontSize: '34px'}} />
                      </Button>
                    </Stack> */}

                          <Box
                            boxShadow="xs"
                            rounded="md"
                            padding="4"
                            bg="#22b8bf"
                            color="black"
                            maxW="container.sm">
                            <Text noOfLines={1}>
                              Difficulty: {recipe.data.difficulty}
                            </Text>
                            <Text noOfLines={1}>
                              Time: {recipe.data.cooking_time}
                            </Text>
                            <Text noOfLines={1}>
                              Servings: {recipe.data.servings}
                            </Text>
                            <Text noOfLines={1}>
                              Cost Per Serving: {recipe.data.cost_per_serving}
                            </Text>
                            <Text noOfLines={1}>
                              Cooking Applications:{' '}
                              {recipe.data.cooking_applications}
                            </Text>
                            <Text noOfLines={1}>
                              Allergens: {recipe.data.allergens}
                            </Text>
                          </Box>
                          <Accordion allowMultiple>
                            <AccordionItem>
                              <h2>
                                <AccordionButton bg="#22b8bf">
                                  <Box as="span" flex="1" textAlign="left">
                                    <Text as="b">Nutrition Data</Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <Box
                                  padding="4"
                                  color="black"
                                  maxW="container.sm">
                                  <Text noOfLines={1}>
                                    Calories: {recipe.data.nutrients.calories}
                                  </Text>
                                  <Text noOfLines={1}>
                                    Protein: {recipe.data.nutrients.protein}g
                                  </Text>
                                  <Text noOfLines={1}>
                                    Carbs:{' '}
                                    {recipe.data.nutrients.total_carbohydrate}g
                                  </Text>
                                  <Text noOfLines={1} style={{ paddingLeft: '20px' }}>
                                    Sugar: {recipe.data.nutrients.sugars}g
                                  </Text>
                                  <Text noOfLines={1}>
                                    Fat: {recipe.data.nutrients.total_fat}g
                                  </Text>
                                  <Text noOfLines={1}>
                                    Saturated Fat:{' '}
                                    {recipe.data.nutrients.saturated_fat}g
                                  </Text>
                                  <Text noOfLines={1}>
                                    Cholesterol:{' '}
                                    {recipe.data.nutrients.cholesterol}g
                                  </Text>
                                  <Text noOfLines={1}>
                                    Sodium: {recipe.data.nutrients.sodium}g
                                  </Text>
                                  <Text noOfLines={1}>
                                    Fiber: {recipe.data.nutrients.dietary_fiber}g
                                  </Text>
                                </Box>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                          <Accordion allowMultiple>
                            <AccordionItem>
                              <h2>
                                <AccordionButton bg="#22b8bf">
                                  <Box as="span" flex="1" textAlign="left">
                                    <Text as="b">Instructions:</Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <Box
                                  padding="4"
                                  color="black"
                                  maxW="container.sm">
                                  <Text>{recipe.data.instructions}</Text>
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
          </TabPanel>
          <TabPanel minH="100vh">
            <HStack spacing={10}>
              <Box>
                <SimpleGrid
                  columns={3}
                  padding={9}
                  alignContent="center"
                  display="flex"
                  justifyContent="center"
                  alignItems="center">
                  {recipes.length === 0 ? (
                    <Heading textAlign="center">You have 0 recipes</Heading>
                  ) : (
                    savedRecipes.map(recipe => (
                      <Container
                        boxShadow={'2xl'}
                        minW="sm"
                        borderRadius="lg"
                        overflow="hidden"
                        justify-content="space-between"
                        bg="#f0f0f0"
                        minH="350"
                        display="flex"
                        flexDirection="column"
                        rounded="md"
                        padding={4}
                        margin={4}
                        marginRight={10}
                        marginLeft={10}
                        shadow={'dark-lg'}>
                        <VStack align="2x1">
                          <Center>
                            <Image
                              borderRadius="30px"
                              src="default-image-icon-missing-picture-page-vector-40546530.jpg"
                              alt="Logo"
                              w={300}
                              mb={15}
                            />
                          </Center>

                          <Button
                            variant="link"
                            rounded="md"
                            as="h3"
                            size="lg"
                            color="black"
                            padding={1}>
                            <Center>
                              <Text as="b" fontSize="34px">
                                {recipe.data.recipe_name}
                              </Text>
                            </Center>
                          </Button>
                          {/* <Stack direction="row" spacing={4} align="stretch">
                      <Button variant="link" colorScheme="red">
                        <AiOutlineHeart style={{fontSize: '34px'}} />
                      </Button>
                      <Button variant="link" colorScheme="green">
                        <BsFillChatDotsFill style={{fontSize: '34px'}} />
                      </Button>
                    </Stack> */}

                          <Box
                            boxShadow="xs"
                            rounded="md"
                            padding="4"
                            bg="#22b8bf"
                            color="black"
                            maxW="container.sm">
                            <Text noOfLines={1}>
                              Difficulty: {recipe.data.difficulty}
                            </Text>
                            <Text noOfLines={1}>
                              Time: {recipe.data.cooking_time}
                            </Text>
                            <Text noOfLines={1}>
                              Servings: {recipe.data.servings}
                            </Text>
                            <Text noOfLines={1}>
                              Cost Per Serving: {recipe.data.cost_per_serving}
                            </Text>
                            <Text noOfLines={1}>
                              Cooking Applications:{' '}
                              {recipe.data.cooking_applications}
                            </Text>
                            <Text noOfLines={1}>
                              Allergens: {recipe.data.allergens}
                            </Text>
                          </Box>
                          <Accordion allowMultiple>
                            <AccordionItem>
                              <h2>
                                <AccordionButton bg="#22b8bf">
                                  <Box as="span" flex="1" textAlign="left">
                                    <Text as="b">Nutrition Data</Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <Box
                                  padding="4"
                                  color="black"
                                  maxW="container.sm">
                                  <Text noOfLines={1}>
                                    Calories: {recipe.data.nutrients.calories}
                                  </Text>
                                  <Text noOfLines={1}>
                                    Protein: {recipe.data.nutrients.protein}
                                  </Text>
                                  <Text noOfLines={1}>
                                    Carbs:{' '}
                                    {recipe.data.nutrients.total_carbohydrate}g                                 
                                    
                                  </Text>
                                  <Text noOfLines={1} style={{ paddingLeft: '20px' }}>
                                    Sugar: {recipe.data.nutrients.sugars}
                                  </Text>
                                  <Text noOfLines={1}>
                                    Fat: {recipe.data.nutrients.total_fat}
                                  </Text>
                                  <Text noOfLines={1}>
                                    Saturated Fat:{' '}
                                    {recipe.data.nutrients.saturated_fat}
                                  </Text>
                                  <Text noOfLines={1}>
                                    Cholesterol:{' '}
                                    {recipe.data.nutrients.cholesterol}
                                  </Text>
                                  <Text noOfLines={1}>
                                    Sodium: {recipe.data.nutrients.sodium}
                                  </Text>
                                  <Text noOfLines={1}>
                                    Fiber: {recipe.data.nutrients.dietary_fiber}
                                  </Text>
                                </Box>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                          <Accordion allowMultiple>
                            <AccordionItem>
                              <h2>
                                <AccordionButton bg="#22b8bf">
                                  <Box as="span" flex="1" textAlign="left">
                                    <Text as="b">Instructions:</Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <Box
                                  padding="4"
                                  color="black"
                                  maxW="container.sm">
                                  <Text>{recipe.data.instructions}</Text>
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
          </TabPanel>
          <TabPanel minH="100vh"></TabPanel>
          <TabPanel minH="100vh"></TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
export default Recipes;
