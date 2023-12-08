import React, {useState, useEffect, useRef} from 'react';
import {db} from '../firebaseConfig';
import {
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
  increment,
  arrayRemove,
  arrayUnion,
  deleteDoc,
} from 'firebase/firestore';
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
  Heading,
  HStack,
  Avatar,
  PopoverHeader,
  Spacer,
  useDisclosure,
  Divider,
  Textarea,
  PopoverArrow,
} from '@chakra-ui/react';

import {AiFillHeart, AiOutlineHeart, AiOutlineSend} from 'react-icons/ai';
import {Link, useNavigate} from 'react-router-dom';

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

// type that holds recipe information
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

type Comment = {
  date_time: any;
  comment: string;
  pic: any;
  username: string;
};

const Explore: React.FC = () => {
  // email from local storage, used to identify current user
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  // useState to create constants
  const [following, setFollowing] = useState<any[]>([]);
  const [liked, setLiked] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  // toast for popups
  const toast = useToast();
  // create a listener to the user called: user
  const userQuery = doc(db, 'users/', email);
  const [user] = useDocumentData(userQuery);

  // create a listener to the posts database called: allPosts
  // posts are sorted by time descending
  const allPostsQuery = query(
    collection(db, 'posts'),
    orderBy('date_time', 'desc'),
  );
  const [allPosts] = useCollectionData(allPostsQuery);

  // create a listener to all the profiles called: profiles
  const profilesQuery = query(collection(db, 'users'));
  const [profiles] = useCollectionData(profilesQuery);

  // create a listener for the user's saved recipes
  const savedRecipesQuery = query(
    collection(db, 'users/' + email + '/SavedRecipes'),
  );
  const [savedRecipes] = useCollectionData(savedRecipesQuery);

  const navigate = useNavigate();
  // useEffect, when user has loaded, set the following list and the liked list
  useEffect(() => {
    setFollowing(user?.following);
    setLiked(user?.liked);
  }, [user]);

  // if following has loaded, create a listener to all posts posted by friends
  var friendsPostsQuery: any;
  if (following) {
    if (following.length !== 0) {
      friendsPostsQuery = query(
        collection(db, 'posts'),
        where('email', 'in', following),
        orderBy('date_time', 'desc'),
      );
    }
    // if following has not loaded, create a fake query that returns nothing
  } else {
    friendsPostsQuery = query(
      collection(db, 'posts'),
      where('email', '==', 'gibberish8239283989122389783'),
      orderBy('date_time', 'desc'),
    );
  }
  const [friendsPosts, friendsPostsLoading, friendsPostsError] =
    useCollectionData(friendsPostsQuery);

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
  const initRef = useRef<HTMLButtonElement | null>(null);

  // function to check if someone is in the current user's following list
  function isFollowing(followingEmail: string) {
    if (following?.includes(followingEmail)) {
      return true;
    }
    return false;
  }

  // function to check if a post is in the current user's following list
  // uses the time posted as a unique key
  // time goes down to nanoseconds...so it's unique
  function isLiked(datetime: any) {
    for (let i = 0; i < liked?.length; i++) {
      if (liked[i].seconds === datetime.seconds) {
        return true;
      }
    }
    return false;
  }

  // function to like a post
  async function like(datetime: any) {
    // add the posts datetime (key) to your list
    const docRef = doc(db, 'users/', email);
    await updateDoc(docRef, {
      liked: arrayUnion(datetime),
    });
    // update the post
    const q = query(
      collection(db, 'posts/'),
      where('date_time', '==', datetime),
    );
    const docs = await getDocs(q);
    // add a like to the post
    docs.forEach(doc => {
      updateDoc(doc.ref, {
        likes: increment(1),
      });
    });
  }

  // function to unlike a post
  async function unlike(datetime: any) {
    const docRef = doc(db, 'users/', email);
    // remove the datetime from your liked list
    await updateDoc(docRef, {
      liked: arrayRemove(datetime),
    });
    const q = query(
      collection(db, 'posts/'),
      where('date_time', '==', datetime),
    );
    // get the post, decrease it's number of likes by 1
    const docs = await getDocs(q);
    docs.forEach(doc => {
      updateDoc(doc.ref, {
        likes: increment(-1),
      });
    });
  }

  // function to see if the post is saved
  function isSaved(recipe: Recipe) {
    if (savedRecipes) {
      for (let i = 0; i < savedRecipes.length; i++) {
        // if the recipe is in the user's saved recipe list, return true
        if (savedRecipes[i].data.recipe_name === recipe.recipe_name) {
          return true;
        }
      }
    }
    return false;
  }

  // function to save a recipe
  async function saveRecipe(recipe: Recipe, creatorEmail: string) {
    // get the username of the creator of the post
    const docRef = doc(db, 'users', creatorEmail);
    const docSnap = await getDoc(docRef);
    if (docSnap) {
      const username = docSnap.data()?.username;
      await setDoc(
        // go to your account
        doc(db, 'users/' + email + '/SavedRecipes', recipe.recipe_name),
        {
          // create the recipe with the passed in data and the username
          // of the creator
          data: recipe,
          creator: username,
        },
      );
    }
  }

  // function to delete a recipe
  async function unsaveRecipe(recipe: Recipe) {
    // delete the doc from the user's Saved Recipe list
    await deleteDoc(
      doc(db, 'users/' + email + '/SavedRecipes', recipe.recipe_name),
    );
  }

  // function to get the index of an email in the profiles array
  function getIndex(profiles: any[], email: string): number {
    for (let i = 0; i < profiles?.length; i++) {
      // count until the email is found
      if (profiles[i].email === email) {
        return i;
      }
    }
    return -1;
  }
  // function to handle comment text input changing
  const handleCommentChange = (e: any) => {
    window.localStorage.setItem('COMMENT', JSON.stringify(e.target.value));
    setComment(e.target.value);
  };

  // function to add a comment to the db
  async function addComment(datetime: any) {
    // get the current date
    const date = new Date();
    // create a new comment
    const newComment: Comment = {
      date_time: date,
      username: user?.username,
      pic: user?.profilePic,
      comment: JSON.parse(window.localStorage.getItem('COMMENT') as string),
    };
    // get the right post
    const q = query(
      collection(db, 'posts/'),
      where('date_time', '==', datetime),
    );
    const docs = await getDocs(q);
    // update the comments array in the DB
    docs.forEach(doc => {
      console.log(doc.data());
      updateDoc(doc.ref, {
        comments: arrayUnion(newComment),
      });
    });
    // reset the comment
    setComment('');
    window.localStorage.removeItem('COMMENT');
  }

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
          <VStack w={'full'} px={useBreakpointValue({base: 4, md: 8})}>
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
            {/* two tabs: explore and friends */}
            <Text as="b">Explore</Text>
          </Tab>
          <Tab>
            <Text as="b">Friends</Text>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack minH="100vh">
              {
                // when all the data is loaded in...
                allPosts &&
                  profiles &&
                  savedRecipes &&
                  // map individual posts
                  allPosts.map(post => (
                    <Container
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
                          {
                            // the name of the recipe from the post
                            post?.recipe.data.recipe_name
                          }
                        </div>
                        <HStack>
                          <VStack width="40%">
                            <Center>
                              <Image
                                borderRadius="30px"
                                paddingTop={3}
                                src={
                                  // the picture attached to the post
                                  post.pic
                                }
                                alt="No Image"
                                w={300}
                                mb={15}
                              />
                            </Center>
                          </VStack>
                          <VStack width="60%" align="flex-start">
                            <Stack
                              direction="row"
                              spacing={4}
                              align="stretch"
                              marginBottom={3}
                              paddingLeft="4">
                              {
                                // check if the post has been liked
                                isLiked(post.date_time) ? (
                                  <Button
                                    variant="link"
                                    colorScheme="white"
                                    // if it has been liked, unlike it on click
                                    onClick={() => unlike(post?.date_time)}>
                                    <AiFillHeart style={{fontSize: '34px'}} />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="link"
                                    colorScheme="white"
                                    // if it has not been liked, like it on click
                                    onClick={() => like(post?.date_time)}>
                                    <AiOutlineHeart
                                      style={{fontSize: '34px'}}
                                    />
                                  </Button>
                                )
                              }
                              {
                                // Comments button for each post.
                              }
                              <Popover
                                placement="right"
                                initialFocusRef={initRef}>
                                <PopoverTrigger>
                                  <Button variant="link" colorScheme="white">
                                    <BsFillChatDotsFill
                                      style={{fontSize: '34px'}}
                                    />
                                  </Button>
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent minW={'600px'}>
                                    <PopoverArrow />
                                    <PopoverHeader
                                      bg={'teal'}
                                      paddingTop={'20px'}
                                      paddingBottom={'20px'}
                                      fontSize={'30px'}
                                      textAlign={'center'}
                                      color={'white'}>
                                      Comments on @
                                      {
                                        profiles[getIndex(profiles, post.email)]
                                          ?.username
                                      }
                                      's post
                                    </PopoverHeader>
                                    <PopoverCloseButton />
                                    <PopoverBody
                                      display={'flex'}
                                      flexDir={'column'}
                                      justifyContent={'space-between'}
                                      height={'100%'}
                                      minH={'645px'}
                                      maxH={'645px'}
                                      overflowY={'auto'}>
                                      <VStack>
                                        {post?.comments.map(
                                          (comment: Comment) => (
                                            <HStack
                                              key={comment.date_time}
                                              width={'103%'}
                                              minH={'60px'}
                                              bg={'teal'}
                                              rounded={'md'}>
                                              <VStack paddingLeft={3}>
                                                <Center>
                                                  <Avatar
                                                    paddingTop={2}
                                                    size={'xl'}
                                                    src={comment.pic}
                                                  />
                                                </Center>
                                                <Divider orientation="vertical" />
                                                <Center>
                                                  <Text
                                                    textColor={'white'}
                                                    paddingBottom={3}>
                                                    @{comment.username}
                                                  </Text>
                                                </Center>
                                              </VStack>
                                              <Text
                                                paddingLeft={5}
                                                width="65%"
                                                textColor={'white'}>
                                                {comment.comment}
                                              </Text>
                                              <Text
                                                paddingLeft={5}
                                                textColor={'white'}>
                                                {comment.date_time.seconds &&
                                                  new Date(
                                                    comment.date_time.seconds *
                                                      1000,
                                                  ).toLocaleString()}
                                              </Text>
                                            </HStack>
                                          ),
                                        )}
                                      </VStack>
                                    </PopoverBody>
                                    <Divider
                                      orientation="horizontal"
                                      color={'teal'}
                                    />
                                    <PopoverFooter blockSize={200}>
                                      <HStack>
                                        <Avatar src={user?.profilePic} />
                                        <Container width={500}>
                                          <Textarea
                                            placeholder="Type a comment here..."
                                            size={'lg'}
                                            blockSize={150}
                                            resize={'none'}
                                            width={'100%'}
                                            value={comment}
                                            onChange={handleCommentChange}
                                          />
                                        </Container>
                                        <Button
                                          bg={'teal'}
                                          color={'white'}
                                          variant={'solid'}
                                          fontSize={'x-large'}
                                          height={160}
                                          //isDisabled={commentDisabled()}
                                          //value={comment}
                                          width={'70px'}
                                          aria-label={'Send comment'}
                                          // send the comment on click
                                          onClick={() => {
                                            addComment(post?.date_time);
                                            // save comment to database and update comments with
                                            // the latest post at the top
                                          }}>
                                          <AiOutlineSend />
                                        </Button>
                                      </HStack>
                                    </PopoverFooter>
                                  </PopoverContent>
                                </Portal>
                              </Popover>

                              {
                                // check if this post has been saved
                                isSaved(post.recipe.data) ? (
                                  <Button
                                    variant="link"
                                    colorScheme="white"
                                    onClick={() => {
                                      // if it has been saved, when clicked:
                                      // do a popup to show it has been unsaved
                                      // remove the recipe from the saved list
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
                                    <BsFillBookmarksFill
                                      style={{fontSize: '34px'}}
                                    />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="link"
                                    colorScheme="white"
                                    onClick={() => {
                                      // if it has been saved, on click:
                                      // popup to show it has been added to recipe book
                                      // save the recipe
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
                                )
                              }
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
                              <Text fontSize={25}>{post.title}</Text>

                              <Flex>
                                <Text fontSize={18}>Posted by: </Text>
                                <Text fontSize={18} marginLeft={2}>
                                  {
                                    // get the profile of the person who posted this recipe
                                    profiles[getIndex(profiles, post.email)]
                                      ?.username
                                  }{' '}
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
                                                    // the picture of the person who posted it, gotten with getIndex
                                                    profiles[
                                                      getIndex(
                                                        profiles,
                                                        post.email,
                                                      )
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
                                                    // the username of the person who posted this recipe
                                                    profiles[
                                                      getIndex(
                                                        profiles,
                                                        post.email,
                                                      )
                                                    ]?.username
                                                  }
                                                </Heading>
                                                <Text
                                                  textAlign={'center'}
                                                  as="b"
                                                  color="white"
                                                  px={3}>
                                                  {
                                                    // the name of the person who posted the recipe
                                                    profiles[
                                                      getIndex(
                                                        profiles,
                                                        post.email,
                                                      )
                                                    ]?.name
                                                  }
                                                </Text>
                                                <Text
                                                  textAlign={'center'}
                                                  color="white"
                                                  px={3}>
                                                  <Text color="white">
                                                    {
                                                      // the biography of the person who posted the recipe
                                                      profiles[
                                                        getIndex(
                                                          profiles,
                                                          post.email,
                                                        )
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
                                                        // link to the friends profile
                                                        // store their username in local storage
                                                        // so that it can be accessed in the next page
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
                                                  {
                                                    // check if the poster is in the user's following list
                                                    isFollowing(post.email) ? (
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
                                                          // if you follow this person,
                                                          // unfollow them on click
                                                          toast({
                                                            title: 'Unfollowed',
                                                            description:
                                                              'Removed from your friends',
                                                            status: 'error',
                                                            duration: 3000,
                                                            isClosable: true,
                                                          });
                                                          removeFollowing(
                                                            post.email,
                                                          );
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
                                                          // if the email of the poster == the user's email
                                                          if (
                                                            post.email === email
                                                          ) {
                                                            // make sure you don't follow yourself
                                                            toast({
                                                              title:
                                                                'Cannot Follow',
                                                              description:
                                                                "You can't follow yourself!",
                                                              status: 'error',
                                                              duration: 3000,
                                                              isClosable: true,
                                                            });
                                                          } else {
                                                            // add this person to your following list
                                                            addFollowing(
                                                              post.email,
                                                            );
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
                                                    )
                                                  }
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
                              {
                                //display the likes
                                post.likes === 1 ? (
                                  <Text fontSize={18}>{post.likes} like</Text>
                                ) : (
                                  <Text fontSize={18}>{post.likes} likes</Text>
                                )
                              }
                              <Text fontSize={20}>Caption:</Text>
                              <Text>
                                {
                                  // display the caption
                                  post.description
                                }
                              </Text>
                            </Box>
                          </VStack>
                        </HStack>
                      </Box>
                    </Container>
                  ))
              }
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack minH="100vh">
              {
                // if your friends list is empty
                // display that you have no friends
                friendsPosts?.length === 0 ? (
                  <Heading textAlign="center" minH="100vh" fontSize={80}>
                    You have no friends
                  </Heading>
                ) : (
                  // when all the data loads in
                  friendsPosts &&
                  profiles &&
                  savedRecipes &&
                  // map the friends posts individually
                  friendsPosts.map(post => (
                    <Container
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
                          {
                            // the name of the recipe from the post
                            post?.recipe.data.recipe_name
                          }
                        </div>
                        <HStack>
                          <VStack width="40%">
                            <Center>
                              <Image
                                borderRadius="30px"
                                src={
                                  // the picture attached to the post
                                  post.pic
                                }
                                alt="No Image"
                                w={300}
                                mb={15}
                              />
                            </Center>
                          </VStack>
                          <VStack width="60%" align="flex-start">
                            <Stack
                              direction="row"
                              spacing={4}
                              align="stretch"
                              marginBottom={3}
                              paddingLeft="4">
                              {
                                // check if the post has been liked
                                isLiked(post.date_time) ? (
                                  <Button
                                    variant="link"
                                    colorScheme="white"
                                    // if it has been liked, unlike it on click
                                    onClick={() => unlike(post?.date_time)}>
                                    <AiFillHeart style={{fontSize: '34px'}} />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="link"
                                    colorScheme="white"
                                    // if it has not been liked, like it on click
                                    onClick={() => like(post?.date_time)}>
                                    <AiOutlineHeart
                                      style={{fontSize: '34px'}}
                                    />
                                  </Button>
                                )
                              }
                              {
                                // Comments button for each post.
                              }
                              <Popover
                                placement="right"
                                initialFocusRef={initRef}>
                                <PopoverTrigger>
                                  <Button
                                    variant="link"
                                    colorScheme="white" /*onClick={onOpen}*/
                                  >
                                    <BsFillChatDotsFill
                                      style={{fontSize: '34px'}}
                                    />
                                  </Button>
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent minWidth={'825px'}>
                                    <PopoverArrow />
                                    <PopoverHeader
                                      bg={'teal'}
                                      paddingTop={'20px'}
                                      paddingBottom={'20px'}
                                      fontSize={'30px'}
                                      textAlign={'center'}
                                      color={'white'}>
                                      Comments on @
                                      {
                                        profiles[getIndex(profiles, post.email)]
                                          ?.username
                                      }
                                      's post
                                    </PopoverHeader>
                                    <PopoverCloseButton />
                                    <PopoverBody
                                      display={'flex'}
                                      flexDir={'column'}
                                      justifyContent={'space-between'}
                                      height={'100%'}
                                      minH={'645px'}
                                      maxH={'645px'}
                                      overflowY={'auto'}>
                                      <VStack>
                                        {post?.comments.map(
                                          (comment: Comment) => {
                                            <HStack
                                              width={'103%'}
                                              minH={'60px'}
                                              bg={'teal'}
                                              rounded={'md'}>
                                              <Avatar
                                                size={'xl'}
                                                src={
                                                  // the picture of the person who posted it, gotten with getIndex
                                                  comment.pic
                                                }
                                              />
                                              <Divider orientation="vertical" />
                                              <Text paddingLeft={5}>
                                                {comment.username}
                                              </Text>
                                              <Text paddingLeft={5}>
                                                {comment.comment}
                                              </Text>
                                              <Text paddingLeft={5}>
                                                {comment.date_time}
                                              </Text>
                                            </HStack>;
                                          },
                                        )}
                                      </VStack>
                                    </PopoverBody>
                                    <Divider
                                      orientation="horizontal"
                                      color={'teal'}
                                    />
                                    <PopoverFooter blockSize={200}>
                                      <HStack>
                                        <Avatar />
                                        <Container width={500}>
                                          <Textarea
                                            placeholder="Type a comment here..."
                                            size={'lg'}
                                            blockSize={150}
                                            resize={'none'}
                                            width={'100%'}
                                            onChange={handleCommentChange}
                                          />
                                        </Container>
                                        <Button
                                          bg={'teal'}
                                          color={'white'}
                                          variant={'solid'}
                                          fontSize={'x-large'}
                                          //isDisabled={commentDisabled()}
                                          //value={comment}
                                          height={160}
                                          width={'70px'}
                                          aria-label={'Send comment'}
                                          // add the comment to the db
                                          onClick={() => {
                                            console.log(post);
                                            addComment(post?.date_time);
                                            // save comment to database and update comments with
                                            // latest post at top
                                          }}>
                                          <AiOutlineSend />
                                        </Button>
                                      </HStack>
                                    </PopoverFooter>
                                  </PopoverContent>
                                </Portal>
                              </Popover>
                              {
                                // check if this post has been saved
                                isSaved(post.recipe.data) ? (
                                  <Button
                                    variant="link"
                                    colorScheme="white"
                                    onClick={() => {
                                      // if it has been saved, when clicked:
                                      // do a popup to show it has been unsaved
                                      // remove the recipe from the saved list
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
                                    <BsFillBookmarksFill
                                      style={{fontSize: '34px'}}
                                    />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="link"
                                    colorScheme="white"
                                    onClick={() => {
                                      // if it has been saved, on click:
                                      // popup to show it has been added to recipe book
                                      // save the recipe
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
                                )
                              }
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
                              <Text fontSize={25}>{post.title}</Text>

                              <Flex>
                                <Text fontSize={18}>Posted by: </Text>
                                <Text fontSize={18} marginLeft={2}>
                                  {
                                    // get the profile of the person who posted this recipe
                                    profiles[getIndex(profiles, post.email)]
                                      ?.username
                                  }{' '}
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
                                                    // the picture of the person who posted it, gotten with getIndex
                                                    profiles[
                                                      getIndex(
                                                        profiles,
                                                        post.email,
                                                      )
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
                                                    // the username of the person who posted this recipe
                                                    profiles[
                                                      getIndex(
                                                        profiles,
                                                        post.email,
                                                      )
                                                    ]?.username
                                                  }
                                                </Heading>
                                                <Text
                                                  textAlign={'center'}
                                                  as="b"
                                                  color="white"
                                                  px={3}>
                                                  {
                                                    // the name of the person who posted the recipe
                                                    profiles[
                                                      getIndex(
                                                        profiles,
                                                        post.email,
                                                      )
                                                    ]?.name
                                                  }
                                                </Text>
                                                <Text
                                                  textAlign={'center'}
                                                  color="white"
                                                  px={3}>
                                                  <Text color="white">
                                                    {
                                                      // the biography of the person who posted the recipe
                                                      profiles[
                                                        getIndex(
                                                          profiles,
                                                          post.email,
                                                        )
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
                                                        // link to the friends profile
                                                        // store their username in local storage
                                                        // so that it can be accessed in the next page
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
                                                  {
                                                    // check if the poster is in the user's following list
                                                    isFollowing(post.email) ? (
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
                                                          // if you follow this person,
                                                          // unfollow them on click
                                                          toast({
                                                            title: 'Unfollowed',
                                                            description:
                                                              'Removed from your friends',
                                                            status: 'error',
                                                            duration: 3000,
                                                            isClosable: true,
                                                          });
                                                          removeFollowing(
                                                            post.email,
                                                          );
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
                                                          // if the email of the poster == the user's email
                                                          if (
                                                            post.email === email
                                                          ) {
                                                            // make sure you don't follow yourself
                                                            toast({
                                                              title:
                                                                'Cannot Follow',
                                                              description:
                                                                "You can't follow yourself!",
                                                              status: 'error',
                                                              duration: 3000,
                                                              isClosable: true,
                                                            });
                                                          } else {
                                                            // add this person to your following list
                                                            addFollowing(
                                                              post.email,
                                                            );
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
                                                    )
                                                  }
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
                              {
                                //display the likes
                                post.likes === 1 ? (
                                  <Text fontSize={18}>{post.likes} like</Text>
                                ) : (
                                  <Text fontSize={18}>{post.likes} likes</Text>
                                )
                              }
                              <Text fontSize={20}>Caption:</Text>
                              <Text>
                                {
                                  // display the caption
                                  post.description
                                }
                              </Text>
                            </Box>
                          </VStack>
                        </HStack>
                      </Box>
                    </Container>
                  ))
                )
              }
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Explore;
