import React, {useState, useEffect, useRef} from 'react';
import {db} from '../../firebaseConfig';
import {AiOutlineConsoleSql, AiOutlineHeart} from 'react-icons/ai';
import {CgBowl} from 'react-icons/cg';
import {
  BsWindow,
  BsFillChatDotsFill,
  BsKanbanFill,
  BsBookmarks,
  BsPeople,
  BsPersonPlusFill,
} from 'react-icons/bs';
import {AiFillPrinter} from 'react-icons/ai';
import {FaUserPlus} from 'react-icons/fa';
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
  arrayRemove,
  arrayUnion,
  updateDoc,
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
  Spacer,
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

const FriendProfile: React.FC = (friend: any) => {
  const toast = useToast();
  const [following, setFollowing] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [numPosts, setNumPosts] = useState(0);
  const [numFriends, setNumFriends] = useState(0);
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

  //Functions to adjust Title Size
  function titleSize(title: string) {
    return 34 - title.length * 0.2 + 'px';
  }

  // function to check if someone is in the current user's following list
  function isFollowing(followingEmail: string) {
    if (following?.includes(followingEmail)) {
      return true;
    }
    return false;
  }

  // function to add a follower to your following list
  async function addFollowing(followingEmail: string) {
    // if you don't follow them...
    if (!isFollowing(followingEmail)) {
      const getUser = doc(db, 'users/', email);
      // update the user's doc, append their email to the end
      await updateDoc(getUser, {
        following: arrayUnion(followingEmail),
      });
    } else {
      console.log('Already following');
    }
  }

  // function to remove a follower from your following list
  async function removeFollowing(followingEmail: string) {
    // if you DO follow them...
    if (isFollowing(followingEmail)) {
      const getUser = doc(db, 'users/', email);
      // remove their name from your list
      await updateDoc(getUser, {
        following: arrayRemove(followingEmail),
      });
    }
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
              {/* {isFollowing() ? (

              ) : (

              )} */}
              <Link to="/CreateRecipe">
                <Button
                  w="300px"
                  rightIcon={<FaUserPlus />}
                  colorScheme="green"
                  onClick={() => {}}>
                  Follow
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
                          width="md"
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
                                      <Text key={index}>
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
                            <Button
                              boxShadow="xs"
                              rounded="md"
                              variant="outline"
                              padding="4"
                              colorScheme="teal"
                              color="white"
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
                    )
                  }
                </SimpleGrid>
              </Box>
            </HStack>
          </TabPanel>
          <TabPanel minH="100vh">
            <HStack spacing={10}></HStack>
          </TabPanel>
          <TabPanel minH="100vh">
            {/* posts display, incomplete */}
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
                  post?.recipe.data.recipe_name
                </div>
                <Center>
                  <Image
                    borderRadius="30px"
                    src={
                      'default-image-icon-missing-picture-page-vector-40546530.jpg'
                    }
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
                  <Text>post?.date_time.toDate().toString()</Text>
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
                      profiles[getIndex(profiles, post.email)]?.username
                    </Text>

                    <Button
                      marginLeft={2}
                      colorScheme="whiteAlpha"
                      variant="outline"
                      size="xs">
                      View Recipe
                    </Button>
                  </Flex>

                  <Text fontSize={20}>Caption:</Text>
                  <Text>post.description</Text>
                </Box>
              </Box>
            </Container>
          </TabPanel>
          <TabPanel minH="100vh">
            <VStack>
              <Container
                boxShadow={'2xl'}
                minW="container.md"
                borderRadius="lg"
                overflow="hidden"
                justify-content="space-between"
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
                      <Heading> User's Page</Heading>
                      <Text>Uesr's Recipes</Text>
                      <Text>User's Posts</Text>
                      <Text color={'black'} fontSize={'lg'}>
                        {profile?.biography}
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
                      //Print Recipe
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
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
export default FriendProfile;
