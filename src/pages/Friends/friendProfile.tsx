import React, {useState, useEffect} from 'react';
import {db} from '../../firebaseConfig';
import {AiFillPrinter} from 'react-icons/ai';
import {
  collection,
  doc,
  getDocs,
  where,
  query,
  onSnapshot,
  arrayRemove,
  arrayUnion,
  updateDoc,
} from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import {
  Box,
  Stack,
  Avatar,
  Text,
  Button,
  VStack,
  Container,
  Flex,
  SimpleGrid,
  HStack,
  Heading,
  Center,
  Image,
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
import {FiBookOpen} from 'react-icons/fi';
import {useDocumentData} from 'react-firebase-hooks/firestore';

//Holds Component
const FriendProfile: React.FC = () => {
  //Necessary Hooks
  const toast = useToast();
  const [following, setFollowing] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [numPosts, setNumPosts] = useState(0);
  const [numFriends, setNumFriends] = useState(0);
  const [profile, setProfile] = useState<any>();
  const [email, setEmail] = useState('');
  const userEmail = JSON.parse(window.localStorage.getItem('EMAIL') as string);
  // get the current user's profile and create a listener to the db
  const [userProfile, userProfileLoading, userProfileError] = useDocumentData(
    doc(db, 'users/', userEmail),
  );
  //Fetch Data on Open
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
  //Fetch Data on Open
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
    }
  }, [email]);

  //Functions to adjust Title Size
  function titleSize(title: string) {
    return 34 - title.length * 0.2 + 'px';
  }

  // function to check if someone is in the current user's following list
  function isFollowing() {
    if (userProfile?.following.includes(email)) {
      return true;
    }
    return false;
  }

  function myProfile() {
    if (userEmail.localeCompare(email) === 0) {
      return true;
    }
    return false;
  }

  // function to add a follower to your following list
  async function addFollowing() {
    // if you don't follow them...
    if (!isFollowing()) {
      const getUser = doc(db, 'users/', userEmail);
      // update the user's doc, append their email to the end
      await updateDoc(getUser, {
        following: arrayUnion(email),
      });
    } else {
      console.log('Already following');
    }
  }

  // function to remove a follower from your following list
  async function removeFollowing() {
    // if you DO follow them...
    if (isFollowing()) {
      const getUser = doc(db, 'users/', userEmail);
      // remove their name from your list
      await updateDoc(getUser, {
        following: arrayRemove(email),
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
        <VStack w={'full'} px={useBreakpointValue({base: 4, md: 8})}>
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
              {
                // check if the poster is in the user's following list
                isFollowing() ? (
                  <Button
                    flex={1}
                    fontSize={'sm'}
                    isDisabled={myProfile()}
                    rounded={'full'}
                    bg={'red.400'}
                    color={'white'}
                    width={'600px'}
                    boxShadow={
                      '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
                    }
                    _hover={{
                      bg: 'red.500',
                    }}
                    _focus={{
                      bg: 'red.500',
                    }}
                    onClick={() => {
                      // if you follow this person,
                      // unfollow them on click
                      toast({
                        title: 'Unfollowed',
                        description: 'Removed from your friends',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                      });
                      removeFollowing();
                    }}>
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    flex={1}
                    fontSize={'sm'}
                    isDisabled={myProfile()}
                    rounded={'full'}
                    bg={'green.400'}
                    width={'600px'}
                    color={'white'}
                    boxShadow={
                      '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
                    }
                    _hover={{
                      bg: 'green.500',
                    }}
                    _focus={{
                      bg: 'green.500',
                    }}
                    onClick={() => {
                      // add this person to your following list
                      addFollowing();
                      toast({
                        title: 'Followed',
                        description: 'Added to your friends',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    }}>
                    Follow
                  </Button>
                )
              }
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
                                  //Show size of Title
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
                                {/* //MapIngredients */}
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
                                {/* //Print Recipe Details */}
                                <Text marginLeft={2}>Print Recipe</Text>
                              </Button>
                            </Link>
                          </HStack>
                        </Container>
                      ))
                    )
                  }
                </SimpleGrid>
              </Box>
            </HStack>
          </TabPanel>
          {/* //Unused Panel */}
          <TabPanel minH="100vh">
            <HStack spacing={10}></HStack>
          </TabPanel>
          <TabPanel minH="100vh">
            {/* posts display, incomplete */}
            {/* <Container
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

                <Box rounded="md" padding="4" bg="teal" maxW="container.lg">
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
            </Container> */}
          </TabPanel>
          {/* //UnusedPanel, Left for future use */}
          <TabPanel minH="100vh">
            {/* <VStack>
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
                    maxW="container.lg"
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
            </VStack> */}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
export default FriendProfile;
