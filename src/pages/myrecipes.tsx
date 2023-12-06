import React, {useState, useEffect, useRef} from 'react';
import {db, storage} from '../firebaseConfig';
import {AiFillPrinter, AiOutlineHeart} from 'react-icons/ai';
import {FiBookOpen} from 'react-icons/fi';
import {CgBowl} from 'react-icons/cg';

import {
  BsWindow,
  BsBookmarks,
  BsPeople,
  BsPersonPlusFill,
} from 'react-icons/bs';
import {RiPagesLine} from 'react-icons/ri';

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
  deleteDoc,
  orderBy,
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
  useToast,
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
  Spacer,
} from '@chakra-ui/react';
import {Link, useNavigate} from 'react-router-dom';
import {
  useCollection,
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {getDownloadURL, ref} from 'firebase/storage';

const Recipes: React.FC = () => {
  // toast for popups
  const toast = useToast();
  const navigate = useNavigate();
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const [liked, setLiked] = useState<any[]>([]);
  // email from local storage to get the current user
  /*
  console.log(email)
  useEffect(() => {
    console.log(email);
    if (email === null){
      console.clear();
      console.log("navigate!")
      navigate("/login");
    }
  }, [email])
  */

  const [followingProfiles, setFollowingProfiles] = useState<any[]>([]);

  // get all the recipes and create a listener to the DB
  const recipesQuery = query(collection(db, 'users/' + email + '/Recipes'));
  const [recipes, recipesLoading, recipesError] =
    useCollectionData(recipesQuery);

  // get all the saved recipes and create a listener to the db
  const savedRecipesQuery = query(
    collection(db, 'users/' + email + '/SavedRecipes'),
  );
  const [savedRecipes, savedRecipesLoading, savedRecipesError] =
    useCollectionData(savedRecipesQuery);

  // get the current user's profile and create a listener to the db
  const [profile, profileLoading, profileError] = useDocumentData(
    doc(db, 'users/', email),
  );

  // get the current user's posts and create a listener to the db
  const postsQuery = query(
    collection(db, 'posts'),
    where('email', '==', email),
  );
  const [posts, postsLoading, postsError] = useCollectionData(postsQuery);
  // number of posts
  const numPosts = posts?.length;

  // useEffect, when user has loaded, set the following list and the liked list
  useEffect(() => {
    //setLiked(profile?.liked);
    async function getLikedPosts() {
      const likedPostsQuery = query(
        collection(db, 'posts'),
        where('date_time', 'in', profile?.liked),
        orderBy('date_time', 'desc'),
      );
      const querySnapshot = await getDocs(likedPostsQuery);
      const tempArray: any[] = [];
      querySnapshot?.forEach(doc => {
        tempArray.push(doc.data());
      });
      console.log(tempArray);
      setLiked(tempArray);
    }
    if (profile) {
      getLikedPosts();
    }
  }, [profile]);

  // function to delete a recipe
  async function deleteMyRecipe(recipeName: string) {
    if (recipeName === null) {
      recipeName = 'null';
    }
    // delete from db
    await deleteDoc(doc(db, 'users/', email, 'Recipes/', recipeName));
  }

  // function to delete a saved recipe
  async function deleteSavedRecipe(recipeName: string) {
    if (recipeName === null) {
      recipeName = 'null';
    }
    // delete from db
    await deleteDoc(doc(db, 'users/', email, 'SavedRecipes/', recipeName));
  }

  async function deletePost(datetime: any){
    // update the post
    const q = query(
      collection(db, 'posts/'),
      where('date_time', '==', datetime),
    );
    const docs = await getDocs(q);
    // add a like to the post
    docs.forEach(async doc => {
      await deleteDoc(doc.ref);
    });
  }

  // useEffect(() => {
  //   friends();
  // }, []);

  // //funciton to get friends data
  // async function friends() {
  //   const tempArray: any[] = [];
  //   for (let i = 0; i < profile?.following.length; i++) {
  //     console.log(profile?.following[i]);
  //     const docRef = doc(db, 'users', profile?.following[i]);
  //     const docSnap = await getDoc(docRef);
  //     tempArray.push(docSnap?.data());
  //     console.log(tempArray);
  //   }
  //   setFollowingProfiles(tempArray);
  // }

  //Functions to adjust Title Size
  function titleSize(title: string) {
    return 34 - title.length * 0.2 + 'px';
  }

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
              @
              {
                // username at the top
                profile?.username
              }
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
                name={
                  // default's to the current user's initials
                  profile?.name
                }
                src={
                  // display the current user's profile picture
                  profile?.profilePic
                }
              />{' '}
              <VStack marginLeft={10}>
                <Heading>
                  {
                    // display the current user's name
                    profile?.name
                  }
                </Heading>
                {/* Displaye Recipe Length */}
                {recipes?.length === 1 ? (
                  <Text fontSize={18}>
                    {
                      // display the number of recipes
                      recipes?.length
                    }{' '}
                    recipe
                  </Text>
                ) : (
                  <Text fontSize={18}>{recipes?.length} recipes</Text>
                )}
                {/* Display Recipe Length */}
                {numPosts === 1 ? (
                  <Text fontSize={18}>{numPosts} post</Text>
                ) : (
                  <Text fontSize={18}>{numPosts} posts</Text>
                )}
                {/* Display # friends */}
                {profile?.following.length === 1 ? (
                  <Text fontSize={18}>{profile?.following.length} friend</Text>
                ) : (
                  <Text fontSize={18}>{profile?.following.length} friends</Text>
                )}

                <Text color={'black'} fontSize={'lg'} maxWidth={500}>
                  {
                    // display the bio of the user
                    profile?.biography
                  }
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
                    // button that links to create recipe
                    // removes everything from localstorage on click
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
                <Button
                  w="300px"
                  rightIcon={<BsWindow />}
                  colorScheme="gray"
                  onClick={() => {
                    window.localStorage.removeItem('TITLE');
                    window.localStorage.removeItem('DESCRIPTION');
                    window.localStorage.removeItem('RECIPE');
                  }}>
                  Create Post
                </Button>
              </Link>
            </HStack>
          </VStack>
        </HStack>
      </Container>

      <Tabs isManual variant="enclosed" colorScheme="gray" size="lg">
        {/* tabs for different data */}
        <TabList
          sx={{
            justifyContent: 'center',
          }}>
          <Tab>
            {' '}
            <FiBookOpen />
            <Text marginLeft={2}>Recipe Book</Text>
          </Tab>
          <Tab>
            {' '}
            <BsBookmarks />
            <Text marginLeft={2}>Saved Recipes</Text>
          </Tab>
          <Tab>
            {' '}
            <RiPagesLine />
            <Text marginLeft={2}>My Posts</Text>
          </Tab>
          <Tab>
            {' '}
            <AiOutlineHeart style={{fontSize: '34px'}} />
            <Text marginLeft={2}>Liked Posts</Text>
          </Tab>
          <Tab>
            {' '}
            <BsPeople />
            <Text marginLeft={2}>My Friends</Text>
          </Tab>
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
                  {
                    // if they have no recipes
                    recipes?.length === 0 ? (
                      <Center>
                        <Heading
                          alignSelf="center"
                          minH="350"
                          textAlign="center">
                          You have 0 recipes
                        </Heading>
                      </Center>
                    ) : (
                      // when recipes loads,
                      recipes &&
                      // map each individual recipe
                      recipes.map(recipe => (
                        <Container
                          boxShadow={'2xl'}
                          maxW="md"
                          borderRadius="lg"
                          overflow="hidden"
                          justify-content="space-between"
                          bg="teal"
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
                                minH="250px"
                                src={
                                  // image attached to the recipe
                                  recipe.data.pic
                                }
                                alt="No Picture"
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
                                <Text
                                  as="b"
                                  fontSize={titleSize(recipe.data.recipe_name)}
                                  textColor="white">
                                  {
                                    // name of the recipe
                                    recipe.data.recipe_name
                                  }
                                </Text>
                              </Center>
                            </Button>
                            <Box
                              boxShadow="xs"
                              rounded="md"
                              padding="4"
                              bg="white"
                              color="black"
                              maxW="container.sm">
                              {/* displaying recipe data */}
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
                                  {/* accordion for nutrition data  */}
                                  <AccordionButton bg="white">
                                    <Box as="span" flex="1" textAlign="left">
                                      <Text as="b" textColor="black">
                                        Nutrition Data
                                      </Text>
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                  <Box
                                    padding="4"
                                    color="black"
                                    maxW="container.sm">
                                    {/* each accordion panel contains:  */}
                                    <Text noOfLines={1} textColor="white">
                                      Calories:{' '}
                                      {recipe.data.nutrients.calories.toFixed(
                                        2,
                                      )}{' '}
                                      kCal
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Protein:{' '}
                                      {recipe.data.nutrients.protein.toFixed(2)}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Carbs:{' '}
                                      {recipe.data.nutrients.total_carbohydrate.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Sugar:{' '}
                                      {recipe.data.nutrients.sugars.toFixed(2)}g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Fat:{' '}
                                      {recipe.data.nutrients.total_fat.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Saturated Fat:{' '}
                                      {recipe.data.nutrients.saturated_fat.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Cholesterol:{' '}
                                      {recipe.data.nutrients.cholesterol.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Sodium:{' '}
                                      {recipe.data.nutrients.sodium.toFixed(2)}g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Fiber:{' '}
                                      {recipe.data.nutrients.dietary_fiber.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                  </Box>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                            <Accordion allowMultiple>
                              <AccordionItem>
                                <h2>
                                  <AccordionButton bg="white">
                                    <Box as="span" flex="1" textAlign="left">
                                      <Text as="b" textColor="black">
                                        Ingredients
                                      </Text>
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                  {recipe.data.ingredients.map(
                                    (ingredient: string, index: number) => (
                                      <Text
                                        key={index}
                                        textColor="whiteAlpha.900">
                                        {' '}
                                        <li> {ingredient}</li>
                                      </Text>
                                    ),
                                  )}
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                            <Accordion allowMultiple>
                              <AccordionItem>
                                <h2>
                                  {/* accordion for the instructions */}
                                  <AccordionButton bg="white">
                                    <Box as="span" flex="1" textAlign="left">
                                      <Text as="b" textColor="black">
                                        Instructions:
                                      </Text>
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                  <Box
                                    padding="4"
                                    color="black"
                                    maxW="container.sm">
                                    <Text textColor="white">
                                      {/* display the instructions */}
                                      {recipe.data.instructions}
                                    </Text>
                                  </Box>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          </VStack>
                          <HStack align="right" marginTop={2}>
                            <Link to="/RecipeDetail">
                              <Button
                                boxShadow="xs"
                                rounded="md"
                                variant="outline"
                                padding="4"
                                colorScheme="teal"
                                color="white"
                                maxW="container.sm"
                                onClick={() => {
                                  window.localStorage.setItem(
                                    'VIEWRECIPE',
                                    JSON.stringify(recipe.data),
                                  );
                                }}>
                                <AiFillPrinter />
                                <Text marginLeft={2}>Print Recipe</Text>
                              </Button>
                            </Link>
                            <Button
                              marginLeft={130}
                              boxShadow="xs"
                              rounded="md"
                              padding="4"
                              bg={'red.400'}
                              _hover={{
                                bg: 'red.500',
                              }}
                              _focus={{
                                bg: 'red.500',
                              }}
                              maxW="container.sm"
                              onClick={() => {
                                // delete button
                                // on click, popup saying recipe deleted,
                                // remove recipe from db
                                toast({
                                  title: 'Recipe deleted.',
                                  description:
                                    'This recipe has been removed from your recipe book.',
                                  status: 'success',
                                  duration: 3000,
                                  isClosable: true,
                                });
                                // passing the name of the recipe
                                deleteMyRecipe(recipe.data.recipe_name);
                              }}>
                              <Text textColor="white">Delete Recipe</Text>
                            </Button>
                          </HStack>
                        </Container>
                      ))
                    )
                  }
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
                  {
                    // if they have no recipes, display nothing
                    savedRecipes?.length === 0 ? (
                      <Heading textAlign="center">You have 0 recipes</Heading>
                    ) : (
                      // when savedRecipes loads, map savedRecipes individually
                      savedRecipes &&
                      savedRecipes.map(recipe => (
                        <Container
                          boxShadow={'2xl'}
                          minW="sm"
                          borderRadius="lg"
                          overflow="hidden"
                          justify-content="space-between"
                          bg="teal"
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
                                minH="250px"
                                src={
                                  // image attached to the recipe
                                  recipe.data.pic
                                }
                                alt="No Picture"
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
                                <Text
                                  as="b"
                                  fontSize={titleSize(recipe.data.recipe_name)}
                                  textColor="white">
                                  {
                                    // display the recipe name
                                    recipe.data.recipe_name
                                  }
                                </Text>
                              </Center>
                            </Button>
                            <Box
                              boxShadow="xs"
                              rounded="md"
                              padding="4"
                              bg="white"
                              color="black"
                              maxW="container.sm">
                              {/* display saved recipe data  */}
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
                              {/* accordion for the nutrition data */}
                              <AccordionItem>
                                <h2>
                                  <AccordionButton bg="white">
                                    <Box as="span" flex="1" textAlign="left">
                                      <Text as="b" textColor="black">
                                        Nutrition Data
                                      </Text>
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                </h2>
                                {/* accordion contains:  */}
                                <AccordionPanel pb={4}>
                                  <Box
                                    padding="4"
                                    color="black"
                                    maxW="container.sm">
                                    <Text noOfLines={1} textColor="white">
                                      Calories:{' '}
                                      {recipe.data.nutrients.calories.toFixed(
                                        2,
                                      )}{' '}
                                      kCal
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Protein:{' '}
                                      {recipe.data.nutrients.protein.toFixed(2)}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Carbs:{' '}
                                      {recipe.data.nutrients.total_carbohydrate.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Sugar:{' '}
                                      {recipe.data.nutrients.sugars.toFixed(2)}g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Fat:{' '}
                                      {recipe.data.nutrients.total_fat.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Saturated Fat:{' '}
                                      {recipe.data.nutrients.saturated_fat.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Cholesterol:{' '}
                                      {recipe.data.nutrients.cholesterol.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Sodium:{' '}
                                      {recipe.data.nutrients.sodium.toFixed(2)}g
                                    </Text>
                                    <Text noOfLines={1} textColor="white">
                                      Fiber:{' '}
                                      {recipe.data.nutrients.dietary_fiber.toFixed(
                                        2,
                                      )}
                                      g
                                    </Text>
                                  </Box>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                            {/* accordion for the instructions */}
                            <Accordion allowMultiple>
                              <AccordionItem>
                                <h2>
                                  <AccordionButton bg="white">
                                    <Box as="span" flex="1" textAlign="left">
                                      <Text as="b" textColor="black">
                                        Instructions:
                                      </Text>
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                  <Box
                                    padding="4"
                                    color="black"
                                    maxW="container.sm">
                                    <Text textColor="white">
                                      {
                                        // display the instructions
                                        recipe.data.instructions
                                      }
                                    </Text>
                                  </Box>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          </VStack>
                          <HStack align="right" marginTop={2}>
                            <Link to="/RecipeDetail">
                              <Button
                                boxShadow="xs"
                                rounded="md"
                                variant="outline"
                                padding="4"
                                colorScheme="teal"
                                color="white"
                                maxW="container.sm"
                                onClick={() => {
                                  window.localStorage.setItem(
                                    'VIEWRECIPE',
                                    JSON.stringify(recipe.data),
                                  );
                                }}>
                                <AiFillPrinter />
                                <Text marginLeft={2}>Print Recipe</Text>
                              </Button>
                            </Link>
                            <Button
                              marginLeft={130}
                              boxShadow="xs"
                              rounded="md"
                              padding="4"
                              bg={'red.400'}
                              _hover={{
                                bg: 'red.500',
                              }}
                              _focus={{
                                bg: 'red.500',
                              }}
                              maxW="container.sm"
                              onClick={() => {
                                // delete button
                                // on click, popup saying recipe deleted
                                // remove recipe from DB
                                toast({
                                  title: 'Recipe removed.',
                                  description:
                                    'This recipe has been removed from your saved recipes.',
                                  status: 'success',
                                  duration: 3000,
                                  isClosable: true,
                                });
                                deleteSavedRecipe(recipe.data.recipe_name);
                              }}>
                              <Text textColor="white">Remove Recipe</Text>
                            </Button>
                          </HStack>
                        </Container>
                      ))
                    )
                  }
                </SimpleGrid>
              </Box>
            </HStack>
          </TabPanel>
          <TabPanel minH="100vh">
            {/* posts display, incomplete */}
            {posts?.map(post => (
              <Container
                // minH="100vh"
                shadow={1000}
                maxW="container.lg"
                color="white"
                display="flex"
                flexDirection="column"
                padding={1}
                rounded="lg"
                boxShadow="dark-lg"
                backgroundColor="rgba(0, 128, 128, 1)">
                <Box
                  padding={4}
                  rounded="md"
                  maxW="container.lg"
                  backgroundColor="rgba(0, 128, 128, 1)"
                  color="white"
                  minH="350"
                  display="flex"
                  flexDirection="column">
                  <HStack>
                    <div style={{flex: 1, fontSize: '24px'}}>
                      {post?.recipe.data.recipe_name}
                    </div>
                    <Button
                      marginLeft={130}
                      boxShadow="xs"
                      rounded="md"
                      padding="4"
                      bg={'red.400'}
                      _hover={{
                        bg: 'red.500',
                      }}
                      _focus={{
                        bg: 'red.500',
                      }}
                      maxW="container.sm"
                      onClick={() => {
                        // delete button
                        // on click, popup saying recipe deleted
                        // remove recipe from DB
                        deletePost(post?.date_time)
                        toast({
                          title: 'Post Deleted',
                          description:
                            'This post has been permanently removed',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      }}>
                      <Text textColor="white">Delete Post</Text>
                    </Button>
                  </HStack>
                  <Center>
                    <Image
                      borderRadius="30px"
                      src={post.pic}
                      alt="No Picture"
                      w={300}
                      mb={15}
                    />
                  </Center>
                  <Stack
                    direction="row"
                    spacing={4}
                    align="stretch"
                    marginBottom={3}>
                    <Spacer />
                    <Text fontSize={20}>
                      {
                        // formatting the time to look nice
                        post?.date_time.toDate().getMonth()
                      }
                      /{post?.date_time.toDate().getDay()}/
                      {post?.date_time.toDate().getFullYear()}
                    </Text>
                  </Stack>

                  <Box
                    // boxShadow="xs"
                    rounded="md"
                    padding="4"
                    bg="teal"
                    maxW="container.lg"
                    // bgColor="#4fb9af"
                  >
                    <Flex>
                      <Text fontSize={18}>Posted by: </Text>
                      <Text fontSize={18} marginLeft={2}>
                        {profile?.username}
                      </Text>

                      <Button
                        marginLeft={2}
                        colorScheme="whiteAlpha"
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          window.localStorage.setItem(
                            'VIEWRECIPE',
                            JSON.stringify(post?.recipe.data),
                          );
                          navigate('../recipeDetail');
                        }}>
                        View Recipe
                      </Button>
                    </Flex>

                    <Text fontSize={20}>Caption:</Text>
                    <Text>{post.description}</Text>
                  </Box>
                </Box>
              </Container>
            ))}
          </TabPanel>
          <TabPanel minH="100vh">
            {/* posts display, incomplete */}
            {liked?.map(post => (
              <Container
                // minH="100vh"
                shadow={1000}
                maxW="container.lg"
                color="white"
                display="flex"
                flexDirection="column"
                padding={1}
                rounded="lg"
                boxShadow="dark-lg"
                backgroundColor="rgba(0, 128, 128, 1)">
                <Box
                  padding={4}
                  rounded="md"
                  maxW="container.lg"
                  backgroundColor="rgba(0, 128, 128, 1)"
                  color="white"
                  minH="350"
                  display="flex"
                  flexDirection="column">
                  <div style={{flex: 1, fontSize: '24px'}}>
                    {post?.recipe.data.recipe_name}
                  </div>
                  <Center>
                    <Image
                      borderRadius="30px"
                      src={post.pic}
                      alt="No Picture"
                      w={300}
                      mb={15}
                    />
                  </Center>
                  <Stack
                    direction="row"
                    spacing={4}
                    align="stretch"
                    marginBottom={3}>
                    <Spacer />
                    <Text fontSize={20}>
                      {
                        // formatting the time to look nice
                        post?.date_time.toDate().getMonth()
                      }
                      /{post?.date_time.toDate().getDay()}/
                      {post?.date_time.toDate().getFullYear()}
                    </Text>
                  </Stack>

                  <Box
                    // boxShadow="xs"
                    rounded="md"
                    padding="4"
                    bg="teal"
                    maxW="container.lg"
                    // bgColor="#4fb9af"
                  >
                    <Flex>
                      <Text fontSize={18}>Posted by: </Text>
                      <Text fontSize={18} marginLeft={2}>
                        {profile?.username}
                      </Text>

                      <Button
                        marginLeft={2}
                        colorScheme="whiteAlpha"
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          window.localStorage.setItem(
                            'VIEWRECIPE',
                            JSON.stringify(post?.recipe.data),
                          );
                          navigate('../recipeDetail');
                        }}>
                        View Recipe
                      </Button>
                    </Flex>

                    <Text fontSize={20}>Caption:</Text>
                    <Text>{post.description}</Text>
                  </Box>
                </Box>
              </Container>
            ))}
          </TabPanel>
          <TabPanel minH="100vh">
            <VStack>
              {profile?.following.length === 0 ? (
                <Text> You have zero friends</Text>
              ) : (
                followingProfiles.map(friend => (
                  <Container
                    boxShadow={'2xl'}
                    minW="container.md"
                    borderRadius="lg"
                    overflow="hidden"
                    justifyContent="space-between"
                    bg="teal"
                    minH="auto"
                    display="flex"
                    flexDirection="column"
                    rounded="md"
                    padding={4}
                    margin={4}
                    marginRight={10}
                    marginLeft={10}
                    shadow={'dark-lg'}>
                    <VStack align="2x1">
                      <HStack>
                        <Avatar
                          size="2xl"
                          name="Kola Tioluwani"
                          src="https://bit.ly/tioluwani-kolawole"
                        />
                        <VStack marginLeft={10}>
                          <Heading>{friend}'s Page</Heading>
                          <Text>{}</Text>
                          <Text>User's Recipes</Text>
                          <Text>User's Posts</Text>
                          <Text color={'black'} fontSize={'lg'}>
                            {/* Use friend here instead of profile */}
                            {friend.biography}
                          </Text>
                        </VStack>
                      </HStack>
                      <Button
                        variant="link"
                        rounded="md"
                        as="h3"
                        size="lg"
                        color="black"
                        padding={1}>
                        <Center>
                          <Text as="b" fontSize="34px" textColor="white"></Text>
                        </Center>
                      </Button>
                      <Box
                        boxShadow="xs"
                        rounded="md"
                        padding="4"
                        bg="white"
                        color="black"
                        maxW="container.md"></Box>
                    </VStack>
                    <HStack align="right" marginTop={2}>
                      <Button
                        boxShadow="xs"
                        rounded="md"
                        variant="outline"
                        padding="4"
                        colorScheme="teal"
                        color="white"
                        maxW="container.400"
                        onClick={() => {
                          // Print Recipe
                        }}>
                        <BsPersonPlusFill />
                        <Text marginLeft={2}>Follow</Text>
                      </Button>
                      <Link to="/FriendsProfile">
                        <Button
                          variant="outline"
                          flex={1}
                          fontSize={'sm'}
                          _focus={{
                            bg: 'gray.200',
                          }}
                          onClick={() => {}}>
                          <Text textColor="white">View Recipes</Text>
                        </Button>
                      </Link>
                    </HStack>
                  </Container>
                ))
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
export default Recipes;
