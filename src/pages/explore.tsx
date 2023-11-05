import React, {useState, useEffect, useRef} from 'react';
import {db} from '../firebaseConfig';
import {BsFillChatDotsFill, BsBookmarks} from 'react-icons/bs';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  where,
  query,
  orderBy,
  updateDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import {
  Box,
  Button,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  VStack,
  Flex,
  Stack,
  Text,
  useBreakpointValue,
  Center,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Portal,
  PopoverBody,
  PopoverCloseButton,
  PopoverFooter,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useColorModeValue,
  HStack,
  Avatar,
  AvatarBadge,
  IconButton,
  Badge,
  PopoverHeader,
  Spacer,
  AccordionPanel,
  AccordionIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
} from '@chakra-ui/react';

import {CopyIcon} from '@chakra-ui/icons';
import {collapseTextChangeRangesAcrossMultipleVersions} from 'typescript';
import {AiOutlineHeart} from 'react-icons/ai';
import {Link} from 'react-router-dom';

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

async function saveRecipe(recipe: Recipe, creatorEmail: string){
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const docRef = doc(db, "users", creatorEmail);
  const docSnap = await getDoc(docRef);
  if (docSnap){
    const username = docSnap.data()?.username;
    await setDoc(doc(db, 'users/' + email + '/SavedRecipes', recipe.recipe_name), {
      // name in database: variable
      data: recipe,
      creator: username
    });
  }
}

function getIndex(profiles: any[], email: string): number {
  for (let i = 0; i < profiles.length; i++) {
    if (profiles[i].email === email) {
      return i;
    }
  }
  return -1;
}

const Explore: React.FC = () => {
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  // useState to create constants
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [friendsPosts, setFriendsPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [click, setClick] = useState<any>(false);
  const toast = useToast();

  useEffect(() => {
    onSnapshot(doc(db, "users/", email), (doc) => {
      const userFollowing = doc?.data()?.following;
      setFollowing(userFollowing);
    });
  }, []);

  useEffect(() => {
    const profilesQuery = query(collection(db, 'users'));
    onSnapshot(profilesQuery, (querySnapshot) => {
      const temp:any = [];
      querySnapshot.forEach((doc) => {
        temp.push(doc.data());
      })
      setProfiles(temp);
    })

    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('date_time', 'desc'),
    );
    onSnapshot(postsQuery, (querySnapshot) => {
      const allTemp:any[] = [];
      const friendsTemp:any[] = [];
      querySnapshot.forEach((doc) => {
          if (following.includes(doc.data().email)){
            friendsTemp.push(doc.data())
          }
        allTemp.push(doc.data());
      })
      setFriendsPosts(friendsTemp);
      setAllPosts(allTemp);
    })
  }, [following]);


  async function addFollowing(followingEmail: string) {
    if (!following.includes(followingEmail)) {
      following.push(followingEmail);
      const getUser = doc(db, 'users/', email);
      await updateDoc(getUser, {
        following: following,
      });
    } else {
      console.log('Already following');
    }
  }

  async function removeFollowing(followingEmail: string) {
    if (following.includes(followingEmail)) {
      let index = following.indexOf(followingEmail);
      following.splice(index, 1);
      const getUser = doc(db, 'users/', email);
      await updateDoc(getUser, {
        following: following,
      });
    }
  }
  const initRef = useRef<HTMLButtonElement | null>(null);

 function isFollowing (email: string):boolean {
    if (following.includes(email)) {
      return true;
    }
    return false;
  };

  const clicked = () => {
    setClick(!click);
  }

  /*
  data that can be displayed:
  post.username.<description, title, username, recipe_name>
  post.username.date_time.toDate().toString()
  */
  return (
    <Box>
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
            bgGradient={'linear(to-r, blackAlpha.600, transparent)'}>
            <Stack maxW={'2xl'} spacing={6}>
              <Text textAlign="center" fontSize="6xl" as="b">
                Explore Page
              </Text>
            </Stack>
          </VStack>
        </Flex>
      </Flex>
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Explore</Tab>
          <Tab>Friends</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack>
              {allPosts.map(post => (
                <Container
                  shadow={1000}
                  maxW="container.lg"
                  color="white"
                  minH="350"
                  display="flex"
                  flexDirection="column"
                  padding={1}
                  rounded="lg"
                  boxShadow="dark-lg"
                  bgColor="black">
                  <Box
                    border="1px solid black"
                    padding={4}
                    boxShadow="xs"
                    rounded="md"
                    maxW="container.lg"
                    backgroundColor="rgba(0, 128, 128, 1)"
                    color="white"
                    minH="350"
                    display="flex"
                    flexDirection="column">
                    <div style={{flex: 1, fontSize: '24px'}}>{post?.title}</div>
                    <Center>Image goes here</Center>
                    <Stack direction="row" spacing={4} align="stretch">
                      <Button variant="link" colorScheme="red">
                        <AiOutlineHeart style={{fontSize: '34px'}} />
                      </Button>
                      <Button variant="link" colorScheme="blue">
                        <BsFillChatDotsFill style={{fontSize: '34px'}} />
                      </Button>
                      <Button variant="link" colorScheme="green"
                      onClick = {() => {
                        toast({
                          title: 'Recipe Saved.',
                          description: "This recipe has been added to My Recipes.",
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                        saveRecipe(post.recipe?.data, post.email)
                        }}>
                        <BsBookmarks style={{fontSize: '34px'}} />
                      </Button>
                      <Spacer />
                      <Text>{post?.date_time.toDate().toString()}</Text>
                    </Stack>

                    <Box
                      boxShadow="xs"
                      rounded="md"
                      padding="4"
                      bg="teal"
                      color="black"
                      maxW="container.lg"
                      bgColor="#4fb9af">
                      <Flex>
                        <Text fontSize={18}>Posted by: </Text>
                        <Text fontSize={18} marginLeft={2}>
                          {profiles[getIndex(profiles, post.email)]?.username}{' '}
                        </Text>
                        <Popover
                          closeOnBlur={false}
                          placement="left"
                          initialFocusRef={initRef}>
                          {({isOpen, onClose}) => (
                            <>
                              <PopoverTrigger>
                                <Button
                                  marginLeft={2}
                                  colorScheme="whiteAlpha"
                                  variant="outline"
                                  size="sm">
                                  {isOpen ? 'Close' : 'View'} Profile
                                </Button>
                              </PopoverTrigger>
                              <Portal>
                                <PopoverContent>
                                  <PopoverCloseButton />
                                  <PopoverBody
                                    bg="teal"
                                    boxShadow="dark-lg"
                                    rounded={'lg'}>
                                    <Box>
                                      <Box
                                        maxW={'320px'}
                                        w={'full'}
                                        bg="teal"
                                        boxShadow={'2xl'}
                                        rounded={'lg'}
                                        p={6}
                                        textAlign={'center'}>
                                        <Avatar
                                          size={'xl'}
                                          src={
                                            'https://i.ytimg.com/vi/WH7uKNQDzWI/hqdefault.jpg?sqp=-oaymwE9CNACELwBSFryq4qpAy8IARUAAAAAGAElAADIQj0AgKJDeAHwAQH4AbYIgALQBYoCDAgAEAEYZSBYKEowDw==&rs=AOn4CLCPPCr7AOoCWseh5XdjlHeFmyc2rQ'
                                          }
                                          mb={4}
                                          pos={'relative'}
                                          _after={{
                                            content: '""',
                                            w: 4,
                                            h: 4,
                                            bg: 'green.300',
                                            border: '2px solid white',
                                            rounded: 'full',
                                            pos: 'absolute',
                                            bottom: 0,
                                            right: 3,
                                          }}
                                        />
                                        <Heading
                                          fontSize={'2xl'}
                                          fontFamily={'body'}>
                                          {
                                            profiles[
                                              getIndex(profiles, post.email)
                                            ]?.username
                                          }
                                        </Heading>
                                        <Text
                                          textAlign={'center'}
                                          as="b"
                                          color="white"
                                          px={3}>
                                          <Text color="white">
                                            {
                                              profiles[
                                                getIndex(profiles, post.email)
                                              ]?.biography
                                            }
                                          </Text>
                                        </Text>

                                        <Stack
                                          mt={8}
                                          direction={'row'}
                                          spacing={4}>
                                          <Link to="/FriendsProfile">
                                            <Button
                                              flex={1}
                                              fontSize={'sm'}
                                              rounded={'full'}
                                              _focus={{
                                                bg: 'gray.200',
                                              }}
                                              onClick={() => {
                                                window.localStorage.setItem(
                                                  'USERNAME',
                                                  JSON.stringify(
                                                    profiles[
                                                      getIndex(
                                                        profiles,
                                                        post.email,
                                                      )
                                                    ]?.username,
                                                  ),
                                                );
                                              }}>
                                              View Recipes
                                            </Button>
                                          </Link>
                                            <div>
                                              {isFollowing(post.email) && 
                                              <Button
                                              flex={1}
                                              fontSize={'sm'}
                                              rounded={'full'}
                                              bg={'red.400'}
                                              color={'white'}
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
                                                toast({
                                                  title: 'Unfollowed',
                                                  description:
                                                    'Removed from your friends',
                                                  status: 'success',
                                                  duration: 3000,
                                                  isClosable: true,
                                                });
                                                removeFollowing(post.email);
                                                clicked();
                                              }}>
                                              Unfollow
                                            </Button>}

                                            {!isFollowing(post.email) && 
                                              <Button
                                              flex={1}
                                              fontSize={'sm'}
                                              rounded={'full'}
                                              bg={'green.400'}
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
                                                toast({
                                                  title: 'Followed',
                                                  description:
                                                    'Added to your friends',
                                                  status: 'success',
                                                  duration: 3000,
                                                  isClosable: true,
                                                });
                                                addFollowing(post.email);
                                                clicked();
                                              }}>
                                              Follow
                                            </Button>}
                                            </div>
                                        </Stack>
                                      </Box>
                                    </Box>
                                  </PopoverBody>
                                </PopoverContent>
                              </Portal>
                            </>
                          )}
                        </Popover>
                      </Flex>

                      <Text fontSize={20}>Description:</Text>
                      <Text>{post.description}</Text>
                      <Box
                      boxShadow="xs"
                      rounded="md"
                      padding="4"
                      bg="#4fb9af"
                      color="black"
                      maxW="container.sm">
                      <Text noOfLines={1} as="b">
                        Difficulty: {post.recipe.data.difficulty}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Time: {post.recipe.data.cooking_time}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Servings: {post.recipe.data.servings}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Cost Per Serving: {post.recipe.data.cost_per_serving}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Cooking Applications: {post.recipe.data.cooking_applications}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Allergens: {post.recipe.data.allergens}
                      </Text>
                                            </Box>
                    <Accordion allowMultiple>
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
                              Calories: {post.recipe.data.nutrients.calories}
                            </Text>
                            <Text as="b" noOfLines={1}>
                              Protein: {post.recipe.data.nutrients.protein}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Carbs: {post.recipe.data.nutrients.total_carbohydrate}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Sugar: {post.recipe.data.nutrients.sugars}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Fat: {post.recipe.data.nutrients.total_fat}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Saturated Fat:{' '}
                              {post.recipe.data.nutrients.saturated_fat}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Cholesterol: {post.recipe.data.nutrients.cholesterol}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Sodium: {post.recipe.data.nutrients.sodium}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Fiber: {post.recipe.data.nutrients.dietary_fiber}
                            </Text>
                          </Box>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                    <Accordion allowMultiple>
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
                            <Text as="b">{post.recipe.data.instructions}</Text>
                          </Box>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                    </Box>
                  </Box>
                </Container>
              ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack>
              {friendsPosts.length === 0 ? (
                <Heading textAlign="center">You have no friends</Heading>
              ) : (
                friendsPosts.map(post => (
                  <Container
                    shadow={1000}
                    maxW="container.lg"
                    color="white"
                    minH="350"
                    display="flex"
                    flexDirection="column"
                    padding={1}
                    rounded="lg"
                    boxShadow="dark-lg"
                    bgColor="black">
                    <Box
                      border="1px solid black"
                      padding={4}
                      boxShadow="xs"
                      rounded="md"
                      maxW="container.lg"
                      backgroundColor="rgba(0, 128, 128, 1)"
                      color="white"
                      minH="350"
                      display="flex"
                      flexDirection="column">
                      <div style={{flex: 1, fontSize: '24px'}}>
                        {post?.title}
                      </div>
                      <Center>Image goes here</Center>
                      <Stack direction="row" spacing={4} align="stretch">
                        <Button variant="link" colorScheme="red">
                          <AiOutlineHeart style={{fontSize: '34px'}} />
                        </Button>
                        <Button variant="link" colorScheme="blue">
                          <BsFillChatDotsFill style={{fontSize: '34px'}} />
                        </Button>
                        <Button variant="link" colorScheme="green"
                        onClick = {() => {
                          toast({
                            title: 'Recipe Saved.',
                            description: "This recipe has been added to My Recipes.",
                            status: 'success',
                            duration: 3000,
                            isClosable: true,
                          });
                          saveRecipe(post.recipe?.data, post.email)
                          }}>
                          <BsBookmarks style={{fontSize: '34px'}} />
                        </Button>
                        <Spacer />
                        <Text>{post?.date_time.toDate().toString()}</Text>
                      </Stack>
                      
                      <Box
                        boxShadow="xs"
                        rounded="md"
                        padding="4"
                        bg="teal"
                        color="black"
                        maxW="container.lg"
                        bgColor="#4fb9af">
                        <Flex>
                          <Text fontSize={18}>Posted by: </Text>
                          <Text fontSize={18} marginLeft={2}>
                            {profiles[getIndex(profiles, post.email)]?.username}{' '}
                          </Text>
                          <Popover
                            closeOnBlur={false}
                            placement="left"
                            initialFocusRef={initRef}>
                            {({isOpen, onClose}) => (
                              <>
                                <PopoverTrigger>
                                  <Button
                                    marginLeft={2}
                                    colorScheme="whiteAlpha"
                                    variant="outline"
                                    size="sm">
                                    {isOpen ? 'Close' : 'View'} Profile
                                  </Button>
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent>
                                    <PopoverCloseButton />
                                    <PopoverBody
                                      bg="teal"
                                      boxShadow="dark-lg"
                                      rounded={'lg'}>
                                      <Box>
                                        <Box
                                          maxW={'320px'}
                                          w={'full'}
                                          bg="teal"
                                          boxShadow={'2xl'}
                                          rounded={'lg'}
                                          p={6}
                                          textAlign={'center'}>
                                          <Avatar
                                            size={'xl'}
                                            src={
                                              'https://i.ytimg.com/vi/WH7uKNQDzWI/hqdefault.jpg?sqp=-oaymwE9CNACELwBSFryq4qpAy8IARUAAAAAGAElAADIQj0AgKJDeAHwAQH4AbYIgALQBYoCDAgAEAEYZSBYKEowDw==&rs=AOn4CLCPPCr7AOoCWseh5XdjlHeFmyc2rQ'
                                            }
                                            mb={4}
                                            pos={'relative'}
                                            _after={{
                                              content: '""',
                                              w: 4,
                                              h: 4,
                                              bg: 'green.300',
                                              border: '2px solid white',
                                              rounded: 'full',
                                              pos: 'absolute',
                                              bottom: 0,
                                              right: 3,
                                            }}
                                          />
                                          <Heading
                                            fontSize={'2xl'}
                                            fontFamily={'body'}>
                                            {
                                              profiles[
                                                getIndex(profiles, post.email)
                                              ]?.username
                                            }
                                          </Heading>
                                          <Text
                                            textAlign={'center'}
                                            as="b"
                                            color="white"
                                            px={3}>
                                            <Text color="white">
                                              {
                                                profiles[
                                                  getIndex(profiles, post.email)
                                                ]?.biography
                                              }
                                            </Text>
                                          </Text>

                                          <Stack
                                            mt={8}
                                            direction={'row'}
                                            spacing={4}>
                                            <Link to="/FriendsProfile">
                                              <Button
                                                flex={1}
                                                fontSize={'sm'}
                                                rounded={'full'}
                                                _focus={{
                                                  bg: 'gray.200',
                                                }}
                                                onClick={() => {
                                                  window.localStorage.setItem(
                                                    'USERNAME',
                                                    JSON.stringify(
                                                      profiles[
                                                        getIndex(
                                                          profiles,
                                                          post.email,
                                                        )
                                                      ]?.username,
                                                    ),
                                                  );
                                                }}>
                                                View Recipes
                                              </Button>
                                            </Link>
                                            <div>
                                              {isFollowing(post.email) && 
                                              <Button
                                              flex={1}
                                              fontSize={'sm'}
                                              rounded={'full'}
                                              bg={'red.400'}
                                              color={'white'}
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
                                                toast({
                                                  title: 'Unfollowed',
                                                  description:
                                                    'Removed from your friends',
                                                  status: 'success',
                                                  duration: 3000,
                                                  isClosable: true,
                                                });
                                                removeFollowing(post.email);
                                                clicked();
                                              }}>
                                              Unfollow
                                            </Button>}

                                            {!isFollowing(post.email) && 
                                              <Button
                                              flex={1}
                                              fontSize={'sm'}
                                              rounded={'full'}
                                              bg={'green.400'}
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
                                                toast({
                                                  title: 'Followed',
                                                  description:
                                                    'Added to your friends',
                                                  status: 'success',
                                                  duration: 3000,
                                                  isClosable: true,
                                                });
                                                addFollowing(post.email);
                                                clicked();
                                              }}>
                                              Follow
                                            </Button>}
                                            </div>
                                            
                                          </Stack>
                                        </Box>
                                      </Box>
                                    </PopoverBody>
                                  </PopoverContent>
                                </Portal>
                              </>
                            )}
                          </Popover>
                        </Flex>

                        <Text fontSize={20}>Description:</Text>
                        <Text>{post.description}</Text>
                        <Box
                      boxShadow="xs"
                      rounded="md"
                      padding="4"
                      bg="#4fb9af"
                      color="black"
                      maxW="container.sm">
                      <Text noOfLines={1} as="b">
                        Difficulty: {post.recipe.data.difficulty}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Time: {post.recipe.data.cooking_time}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Servings: {post.recipe.data.servings}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Cost Per Serving: {post.recipe.data.cost_per_serving}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Cooking Applications: {post.recipe.data.cooking_applications}
                      </Text>
                      <Text noOfLines={1} as="b">
                        Allergens: {post.recipe.data.allergens}
                      </Text>
                                            </Box>
                    <Accordion allowMultiple>
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
                              Calories: {post.recipe.data.nutrients.calories}
                            </Text>
                            <Text as="b" noOfLines={1}>
                              Protein: {post.recipe.data.nutrients.protein}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Carbs: {post.recipe.data.nutrients.total_carbohydrate}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Sugar: {post.recipe.data.nutrients.sugars}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Fat: {post.recipe.data.nutrients.total_fat}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Saturated Fat:{' '}
                              {post.recipe.data.nutrients.saturated_fat}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Cholesterol: {post.recipe.data.nutrients.cholesterol}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Sodium: {post.recipe.data.nutrients.sodium}
                            </Text>
                            <Text noOfLines={1} as="b">
                              Fiber: {post.recipe.data.nutrients.dietary_fiber}
                            </Text>
                          </Box>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                    <Accordion allowMultiple>
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
                            <Text as="b">{post.recipe.data.instructions}</Text>
                          </Box>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                      </Box>
                    </Box>
                  </Container>
                ))
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Explore;
