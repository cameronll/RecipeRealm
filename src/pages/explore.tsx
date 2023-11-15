import React, {useState, useEffect, useRef} from 'react';
import {db, storage} from '../firebaseConfig';
import {
  useDocument,
  useCollection,
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {
  BsFillChatDotsFill,
  BsBookmarks,
  BsFillBookmarksFill,
} from 'react-icons/bs';
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
  increment,
  arrayRemove,
  arrayUnion,
  deleteDoc,
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
  Image,
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
} from '@chakra-ui/react';

import {CopyIcon} from '@chakra-ui/icons';
import {
  collapseTextChangeRangesAcrossMultipleVersions,
  forEachChild,
} from 'typescript';
import {AiFillHeart, AiOutlineHeart} from 'react-icons/ai';
import {Link} from 'react-router-dom';
import {getDownloadURL, ref} from 'firebase/storage';

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

const Explore: React.FC = () => {
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  // useState to create constants
  const [following, setFollowing] = useState<any[]>([]);
  const [liked, setLiked] = useState<any[]>([]);

  const toast = useToast();

  const userQuery = doc(db, 'users/', email);
  const [user, userLoading, userError] = useDocumentData(userQuery);

  const allPostsQuery = query(
    collection(db, 'posts'),
    orderBy('date_time', 'desc'),
  );
  const [allPosts, allPostsLoading, allPostsError] =
    useCollectionData(allPostsQuery);

  const profilesQuery = query(collection(db, 'users'));
  const [profiles, profileLoading, profilesError] =
    useCollectionData(profilesQuery);

  const savedRecipesQuery = query(
    collection(db, 'users/' + email + '/SavedRecipes'),
  );
  const [savedRecipes, savedRecipesLoading, savedRecipesError] =
    useCollectionData(savedRecipesQuery);

  useEffect(() => {
    setFollowing(user?.following);
    setLiked(user?.liked);
  }, [user]);

  var friendsPostsQuery: any;
  if (following) {
    if (following.length !== 0) {
      friendsPostsQuery = query(
        collection(db, 'posts'),
        where('email', 'in', following),
        orderBy('date_time', 'desc'),
      );
    }
  } else {
    friendsPostsQuery = query(
      collection(db, 'posts'),
      where('email', '==', 'gibberish8239283989122389783'),
      orderBy('date_time', 'desc'),
    );
  }
  const [friendsPosts, friendsPostsLoading, friendsPostsError] =
    useCollectionData(friendsPostsQuery);

  async function addFollowing(followingEmail: string) {
    if (!isFollowing(followingEmail)) {
      const getUser = doc(db, 'users/', email);
      await updateDoc(getUser, {
        following: arrayUnion(followingEmail),
      });
    } else {
      console.log('Already following');
    }
  }

  async function removeFollowing(followingEmail: string) {
    if (isFollowing(followingEmail)) {
      const getUser = doc(db, 'users/', email);
      await updateDoc(getUser, {
        following: arrayRemove(followingEmail),
      });
    }
  }
  const initRef = useRef<HTMLButtonElement | null>(null);

  function isFollowing(followingEmail: string) {
    if (following?.includes(followingEmail)) {
      return true;
    }
    return false;
  }

  function isLiked(datetime: any) {
    for (let i = 0; i < liked?.length; i++) {
      if (liked[i].seconds === datetime.seconds) {
        return true;
      }
    }
    return false;
  }

  async function like(datetime: any) {
    const docRef = doc(db, 'users/', email);
    await updateDoc(docRef, {
      liked: arrayUnion(datetime),
    });
    const q = query(
      collection(db, 'posts/'),
      where('date_time', '==', datetime),
    );
    const docs = await getDocs(q);
    docs.forEach(doc => {
      updateDoc(doc.ref, {
        likes: increment(1),
      });
    });
  }

  async function unlike(datetime: any) {
    const docRef = doc(db, 'users/', email);
    await updateDoc(docRef, {
      liked: arrayRemove(datetime),
    });
    const q = query(
      collection(db, 'posts/'),
      where('date_time', '==', datetime),
    );
    const docs = await getDocs(q);
    docs.forEach(doc => {
      updateDoc(doc.ref, {
        likes: increment(-1),
      });
    });
  }

  function isSaved(recipe: Recipe) {
    if (savedRecipes) {
      for (let i = 0; i < savedRecipes.length; i++) {
        if (savedRecipes[i].data.recipe_name === recipe.recipe_name) {
          return true;
        }
      }
    }
    return false;
  }

  async function saveRecipe(recipe: Recipe, creatorEmail: string) {
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

  async function unsaveRecipe(recipe: Recipe) {
    await deleteDoc(
      doc(db, 'users/' + email + '/SavedRecipes', recipe.recipe_name),
    );
  }

  function getIndex(profiles: any[], email: string): number {
    for (let i = 0; i < profiles?.length; i++) {
      if (profiles[i].email === email) {
        return i;
      }
    }
    return -1;
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
            // bgGradient={'linear(to-r, blackAlpha.600, transparent)'}
          >
            <Stack maxW={'2xl'} spacing={6}>
              <Text textAlign="center" fontSize="6xl" as="b" color="white">
                Explore
              </Text>
            </Stack>
          </VStack>
        </Flex>
      </Flex>
      <Tabs isFitted variant="enclosed" size="lg">
        <TabList mb="1em">
          <Tab>
            <Text as="b">Explore</Text>
          </Tab>
          <Tab>
            <Text as="b">Friends</Text>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack minH="100vh">
              {allPosts &&
                profiles &&
                savedRecipes &&
                allPosts.map(post => (
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
                          alt="No Image"
                          w={300}
                          mb={15}
                        />
                      </Center>
                      <Stack
                        direction="row"
                        spacing={4}
                        align="stretch"
                        marginBottom={3}>
                        {isLiked(post.date_time) ? (
                          <Button
                            variant="link"
                            colorScheme="white"
                            onClick={() => unlike(post?.date_time)}>
                            <AiFillHeart style={{fontSize: '34px'}} />
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            colorScheme="white"
                            onClick={() => like(post?.date_time)}>
                            <AiOutlineHeart style={{fontSize: '34px'}} />
                          </Button>
                        )}
                        <Button variant="link" colorScheme="white">
                          <BsFillChatDotsFill style={{fontSize: '34px'}} />
                        </Button>
                        {isSaved(post.recipe.data) ? (
                          <Button
                            variant="link"
                            colorScheme="white"
                            onClick={() => {
                              toast({
                                title: 'Unsaved',
                                description:
                                  'Recipe removed from your saved recipe book',
                                status: 'error',
                                duration: 3000,
                                isClosable: true,
                              });
                              unsaveRecipe(post.recipe.data);
                            }}>
                            <BsFillBookmarksFill style={{fontSize: '34px'}} />
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            colorScheme="white"
                            onClick={() => {
                              toast({
                                title: 'Saved!',
                                description:
                                  'Recipe added to your saved recipe book',
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                              });
                              saveRecipe(post.recipe.data, post.email);
                            }}>
                            <BsBookmarks style={{fontSize: '34px'}} />
                          </Button>
                        )}
                        <Spacer />
                        <Text fontSize={20}>
                          {post?.date_time.toDate().getMonth()}/
                          {post?.date_time.toDate().getDay()}/
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
                        <Text fontSize={25}>{post.title}</Text>
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
                                    size="xs">
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
                                              profiles[
                                                getIndex(profiles, post.email)
                                              ]?.profilePic
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
                                            fontFamily={'body'}
                                            textColor="white">
                                            @
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
                                            {
                                              profiles[
                                                getIndex(profiles, post.email)
                                              ]?.name
                                            }
                                          </Text>
                                          <Text
                                            textAlign={'center'}
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
                                                variant="outline"
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
                                                <Text textColor="white">
                                                  View Recipes
                                                </Text>
                                              </Button>
                                            </Link>
                                            {isFollowing(post.email) ? (
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
                                                    status: 'error',
                                                    duration: 3000,
                                                    isClosable: true,
                                                  });
                                                  removeFollowing(post.email);
                                                }}>
                                                Unfollow
                                              </Button>
                                            ) : (
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
                                                  if (post.email === email) {
                                                    toast({
                                                      title: 'Cannot Follow',
                                                      description:
                                                        "You can't follow yourself!",
                                                      status: 'error',
                                                      duration: 3000,
                                                      isClosable: true,
                                                    });
                                                  } else {
                                                    addFollowing(post.email);
                                                    toast({
                                                      title: 'Followed',
                                                      description:
                                                        'Added to your friends',
                                                      status: 'success',
                                                      duration: 3000,
                                                      isClosable: true,
                                                    });
                                                  }
                                                }}>
                                                Follow
                                              </Button>
                                            )}
                                          </Stack>
                                        </Box>
                                      </Box>
                                    </PopoverBody>
                                  </PopoverContent>
                                </Portal>
                              </>
                            )}
                          </Popover>
                          <Button
                            marginLeft={2}
                            colorScheme="whiteAlpha"
                            variant="outline"
                            size="xs">
                            View Recipe
                          </Button>
                        </Flex>

                        <Text fontSize={20}>Caption:</Text>
                        <Text>{post.description}</Text>
                      </Box>
                    </Box>
                  </Container>
                ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack minH="100vh">
              {friendsPosts?.length === 0 ? (
                <Heading textAlign="center" minH="100vh" fontSize={80}>
                  You have no friends
                </Heading>
              ) : (
                friendsPosts &&
                profiles &&
                savedRecipes &&
                friendsPosts.map(post => (
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
                          alt="No Image"
                          w={300}
                          mb={15}
                        />
                      </Center>
                      <Stack
                        direction="row"
                        spacing={4}
                        align="stretch"
                        marginBottom={3}>
                        {isLiked(post.date_time) ? (
                          <Button
                            variant="link"
                            colorScheme="white"
                            onClick={() => unlike(post?.date_time)}>
                            <AiFillHeart style={{fontSize: '34px'}} />
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            colorScheme="white"
                            onClick={() => like(post?.date_time)}>
                            <AiOutlineHeart style={{fontSize: '34px'}} />
                          </Button>
                        )}
                        <Button variant="link" colorScheme="white">
                          <BsFillChatDotsFill style={{fontSize: '34px'}} />
                        </Button>
                        {isSaved(post.recipe.data) ? (
                          <Button
                            variant="link"
                            colorScheme="white"
                            onClick={() => {
                              toast({
                                title: 'Unsaved',
                                description:
                                  'Recipe removed from your saved recipe book',
                                status: 'error',
                                duration: 3000,
                                isClosable: true,
                              });
                              unsaveRecipe(post.recipe.data);
                            }}>
                            <BsFillBookmarksFill style={{fontSize: '34px'}} />
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            colorScheme="white"
                            onClick={() => {
                              toast({
                                title: 'Saved!',
                                description:
                                  'Recipe added to your saved recipe book',
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                              });
                              saveRecipe(post.recipe.data, post.email);
                            }}>
                            <BsBookmarks style={{fontSize: '34px'}} />
                          </Button>
                        )}
                        <Spacer />
                        <Text>{post?.date_time.toDate().toString()}</Text>
                      </Stack>

                      <Box
                        // boxShadow="xs"
                        rounded="md"
                        padding="4"
                        bg="teal"
                        maxW="container.lg"
                        // bgColor="#4fb9af"
                      >
                        <Text fontSize={25}>{post.title}</Text>
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
                                    size="xs">
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
                                              profiles[
                                                getIndex(profiles, post.email)
                                              ]?.profilePic
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
                                            fontFamily={'body'}
                                            textColor="white">
                                            @
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
                                            {
                                              profiles[
                                                getIndex(profiles, post.email)
                                              ]?.name
                                            }
                                          </Text>
                                          <Text
                                            textAlign={'center'}
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
                                                variant="outline"
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
                                                <Text textColor="white">
                                                  View Recipes
                                                </Text>
                                              </Button>
                                            </Link>
                                            {isFollowing(post.email) ? (
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
                                                    status: 'error',
                                                    duration: 3000,
                                                    isClosable: true,
                                                  });
                                                  removeFollowing(post.email);
                                                }}>
                                                Unfollow
                                              </Button>
                                            ) : (
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
                                                  if (post.email === email) {
                                                    toast({
                                                      title: 'Cannot Follow',
                                                      description:
                                                        "You can't follow yourself!",
                                                      status: 'error',
                                                      duration: 3000,
                                                      isClosable: true,
                                                    });
                                                  } else {
                                                    addFollowing(post.email);
                                                    toast({
                                                      title: 'Followed',
                                                      description:
                                                        'Added to your friends',
                                                      status: 'success',
                                                      duration: 3000,
                                                      isClosable: true,
                                                    });
                                                  }
                                                }}>
                                                Follow
                                              </Button>
                                            )}
                                          </Stack>
                                        </Box>
                                      </Box>
                                    </PopoverBody>
                                  </PopoverContent>
                                </Portal>
                              </>
                            )}
                          </Popover>
                          <Button
                            marginLeft={2}
                            colorScheme="whiteAlpha"
                            variant="outline"
                            size="xs">
                            View Recipe
                          </Button>
                        </Flex>

                        <Text fontSize={20}>Caption:</Text>
                        <Text>{post.description}</Text>
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
