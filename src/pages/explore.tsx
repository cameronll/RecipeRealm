import React, {useState, useEffect, useRef} from 'react';
import {db} from '../firebaseConfig';
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
  orderBy,
  updateDoc,
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
} from '@chakra-ui/react';

import {CopyIcon} from '@chakra-ui/icons';
import {collapseTextChangeRangesAcrossMultipleVersions} from 'typescript';
import {AiOutlineHeart} from 'react-icons/ai';
import {Link} from 'react-router-dom';

function getIndex(profiles: any[], email: string): number {
  for (let i = 0; i < profiles.length; i++) {
    if (profiles[i].email === email) {
      return i;
    }
  }
  return -1;
}
const isFollowing = (email: string) => {
  const following: string[] = JSON.parse(
    localStorage.getItem('FOLLOWING') as string,
  );
  if (following.includes(email)) {
    return true;
  }
  return false;
};

const Explore: React.FC = () => {
  // useState to create constants
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [friendsPosts, setFriendsPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const toast = useToast();

  useEffect(() => {
    async function getData() {
      const getUser = doc(db, 'users/', email);
      const getUserData = await getDoc(getUser);
      const userFollowing = getUserData?.data()?.following;
      localStorage.setItem('FOLLOWING', JSON.stringify(userFollowing));

      const profilesQuery = query(collection(db, 'users'));
      const profilesDocs = await getDocs(profilesQuery);
      const profilesData = profilesDocs.docs.map(doc => doc.data());
      setProfiles(profilesData);

      const allPostsQuery = query(
        collection(db, 'posts'),
        orderBy('date_time', 'desc'),
      );
      const allPostsDocs = await getDocs(allPostsQuery);
      const allPostsData = allPostsDocs.docs.map(doc => doc.data());
      setAllPosts(allPostsData);

      const following: string[] = JSON.parse(
        localStorage.getItem('FOLLOWING') as string,
      );
      if (following[0]) {
        const friendsPostsQuery = query(
          collection(db, 'posts'),
          where('email', 'in', following),
          orderBy('date_time', 'desc'),
        );
        const friendsPostsDocs = await getDocs(friendsPostsQuery);
        const friendsPostsData = friendsPostsDocs.docs.map(doc => doc.data());
        setFriendsPosts(friendsPostsData);
      } else {
        setFriendsPosts([]);
      }
    }
    getData();
  }, [addFollowing, removeFollowing]);

  async function addFollowing(followingEmail: string) {
    let following = JSON.parse(localStorage.getItem('FOLLOWING') as string);
    if (!following.includes(followingEmail)) {
      following.push(followingEmail);
      localStorage.setItem('FOLLOWING', JSON.stringify(following));
      const getUser = doc(db, 'users/', email);
      await updateDoc(getUser, {
        following: following,
      });
    } else {
      console.log('Already following');
    }
  }

  async function removeFollowing(followingEmail: string) {
    let following = JSON.parse(localStorage.getItem('FOLLOWING') as string);
    if (following.includes(followingEmail)) {
      let index = following.indexOf(followingEmail);
      following.splice(index, 1);
      localStorage.setItem('FOLLOWING', JSON.stringify(following));
      const getUser = doc(db, 'users/', email);
      await updateDoc(getUser, {
        following: following,
      });
    }
  }
  const initRef = useRef<HTMLButtonElement | null>(null);

  const isFollowing = (email: string) => {
    const following: string[] = JSON.parse(
      localStorage.getItem('FOLLOWING') as string,
    );
    if (following.includes(email)) {
      return true;
    }
    return false;
  };

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
            <p>Explore</p>
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
                                          <Link to="FriendsProfile">
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
                                                  JSON.stringify(post.username),
                                                );
                                              }}>
                                              View Recipes
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
                                                  status: 'success',
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
                                                toast({
                                                  title: 'Followed',
                                                  description:
                                                    'Added to your friends',
                                                  status: 'success',
                                                  duration: 3000,
                                                  isClosable: true,
                                                });
                                                addFollowing(post.email);
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
                      </Flex>

                      <Text fontSize={20}>Description:</Text>
                      <Text>{post.description}</Text>
                    </Box>
                  </Box>
                </Container>
              ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            <p>Friends</p>
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
                                            <Link to="FriendsProfile"></Link>
                                            <Button
                                              flex={1}
                                              fontSize={'sm'}
                                              rounded={'full'}
                                              _focus={{
                                                bg: 'gray.200',
                                              }}>
                                              View Recipes
                                            </Button>
                                            <Button
                                              flex={1}
                                              fontSize={'sm'}
                                              rounded={'full'}
                                              bg={'blue.400'}
                                              color={'white'}
                                              boxShadow={
                                                '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
                                              }
                                              _hover={{
                                                bg: 'blue.500',
                                              }}
                                              _focus={{
                                                bg: 'blue.500',
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
                                                addFollowing(post.email);
                                              }}>
                                              Follow
                                            </Button>
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
