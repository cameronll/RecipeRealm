import React, {useState, useEffect, useRef} from 'react';
import {db} from '../../firebaseConfig';
import {AiOutlineConsoleSql, AiOutlineHeart} from 'react-icons/ai';
import {CgBowl} from 'react-icons/cg';
import {
  BsWindow,
  BsFillChatDotsFill,
  BsKanbanFill,
  BsBookmarks,
} from 'react-icons/bs';
import {AiFillPrinter} from 'react-icons/ai';
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
import Navbar from '../../components/Navbar';
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
  useToast,
  TabPanel,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  useBreakpointValue,
} from '@chakra-ui/react';
import {Link} from 'react-router-dom';
import {FaUserFriends} from 'react-icons/fa';
import {FiBookOpen} from 'react-icons/fi';
import {RiPagesLine} from 'react-icons/ri';

// type that holds nutrition facts
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

type Recipe = {
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

async function saveRecipe(recipe: Recipe, creatorEmail: string) {
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const docRef = doc(db, 'users', creatorEmail);
  const docSnap = await getDoc(docRef);
  if (docSnap) {
    const username = docSnap.data()?.username;
    await setDoc(
      doc(db, 'users/' + email + '/SavedRecipes', recipe.recipe_name),
      {
        // name in database: variable
        data: recipe,
        creator: username,
      },
    );
  }
}

const FriendProfile: React.FC = (friend: any) => {
  const toast = useToast();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [numPosts, setNumPosts] = useState(0);
  const [profile, setProfile] = useState<any>();
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function getEmail() {
      const username = JSON.parse(localStorage.getItem('USERNAME') as string);
      console.log(username);
      const queryUsers = await getDocs(collection(db, 'users'));
      const users: any = queryUsers.docs.map(doc => doc.data());
      for (let i = 0; i < users.length; i++) {
        if (users[i].username.localeCompare(username) === 0) {
          setEmail(users[i].email);
        }
      }
    }
    getEmail();
  }, []);

  useEffect(() => {
    if (email) {
      const recipesQuery = query(
        collection(db, 'users/' + email + '/Recipes'),
        where('posted', '==', true),
      );
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
      const profileSnapshot = onSnapshot(doc(db, 'users/', email), doc => {
        setProfile(doc.data());
      });
      console.log(email);
    }
  }, [email]);

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
              @{profile?.username}
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
                <Heading>{profile?.name}'s Page</Heading>
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
            <FaUserFriends />
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
                              <Text as="b" fontSize="34px" textColor="white">
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
                            bg="white"
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
                                  <Text noOfLines={1} textColor="white">
                                    Calories:{' '}
                                    {recipe.data.nutrients.calories.toFixed(2)}{' '}
                                    kCal
                                  </Text>
                                  <Text noOfLines={1} textColor="white">
                                    Protein:{' '}
                                    {recipe.data.nutrients.protein.toFixed(2)}g
                                  </Text>
                                  <Text noOfLines={1} textColor="white">
                                    Carbs:{' '}
                                    {recipe.data.nutrients.total_carbohydrate.toFixed(
                                      2,
                                    )}
                                    g
                                  </Text>
                                  <Text
                                    noOfLines={1}
                                    style={{paddingLeft: '20px'}}
                                    textColor="white">
                                    Sugar:{' '}
                                    {recipe.data.nutrients.sugars.toFixed(2)}g
                                  </Text>
                                  <Text noOfLines={1} textColor="white">
                                    Fat:{' '}
                                    {recipe.data.nutrients.total_fat.toFixed(2)}
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
                                    {recipe.data.instructions}
                                  </Text>
                                </Box>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                        </VStack>
                        <HStack align="right" marginTop={2}></HStack>
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
                                    Protein: {recipe.data.nutrients.protein}
                                  </Text>
                                  <Text noOfLines={1}>
                                    Carbs:{' '}
                                    {recipe.data.nutrients.total_carbohydrate}g
                                  </Text>
                                  <Text
                                    noOfLines={1}
                                    style={{paddingLeft: '20px'}}>
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
                        <HStack align="right" marginTop={2}>
                          <Button
                            boxShadow="xs"
                            rounded="md"
                            variant="outline"
                            padding="4"
                            colorScheme="teal"
                            color="teal"
                            maxW="container.sm"
                            onClick={() => {
                              //Print Recipe
                            }}>
                            <AiFillPrinter />
                            <Text marginLeft={2}>Print Recipe</Text>
                          </Button>
                        </HStack>
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
export default FriendProfile;
