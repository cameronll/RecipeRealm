import React, {useState, useEffect} from 'react';
import {db} from '../firebaseConfig';
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
        setFriendsPosts(allPostsData);
      }
    }
    getData();
  }, []);

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
        alignContent={'flex-end'}>
        <VStack
          w={'full'}
          justify={'center'}
          align={'right'}
          px={useBreakpointValue({base: 4, md: 8})}
          bgGradient={'linear(to-r, blackAlpha.600, transparent)'}>
          <Stack maxW={'2xl'} spacing={6}>
            <Stack direction={'row'}>
              <Link to="/friends">
                <Button
                  alignSelf={'right'}
                  bg={'green.300'}
                  rounded={'full'}
                  color={'white'}
                  _hover={{bg: 'whiteAlpha.500'}}>
                  View My Posts
                </Button>
              </Link>
              <Link to="/friends">
                <Button
                  alignSelf={'right'}
                  bg={'green.300'}
                  rounded={'full'}
                  color={'white'}
                  _hover={{bg: 'whiteAlpha.500'}}>
                  View Friends
                </Button>
              </Link>
            </Stack>
          </Stack>
        </VStack>
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
                <Flex>
                  <Container
                    maxW="container.lg"
                    rounded="md"
                    bg="blue.600"
                    color="white"
                    minH="500"
                    display="flex"
                    flexDirection="column">
                    <Box
                      boxShadow="xs"
                      rounded="md"
                      maxW="container.md"
                      bg="blue.600"
                      color="white"
                      minH="100%"
                      display="flex"
                      flexDirection="column">
                      <div style={{flex: 1, fontSize: '24px'}}>
                        {post?.title}
                      </div>
                      <AiOutlineHeart style={{fontSize: '24px'}} />
                      <Box
                        boxShadow="xs"
                        rounded="md"
                        padding="4"
                        bg="blue.400"
                        color="black"
                        maxW="container.md"
                        h="0.5">
                        <h1>Recipe Name: {post?.recipe?.data?.recipe_name}</h1>
                        Username:{' '}
                        {profiles[getIndex(profiles, post.email)]?.username}
                        <Button
                          colorScheme="teal"
                          variant="solid"
                          style={{flex: 1, fontSize: '14px'}}
                          onClick={() => {
                            addFollowing(post.email);
                          }}>
                          Follow
                        </Button>
                      </Box>
                      <Box
                        boxShadow="xs"
                        rounded="md"
                        padding="4"
                        bg="blue.200"
                        color="black"
                        maxW="container.sm">
                        <h1>Description: {post.description}</h1>
                      </Box>
                      <Box
                        boxShadow="xs"
                        rounded="md"
                        padding="4"
                        bg="blue.100"
                        color="black"
                        maxW="container.sm">
                        {post?.date_time.toDate().toString()}
                      </Box>
                    </Box>
                  </Container>
                </Flex>
              ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            <p>Friends</p>
            <VStack>
              {friendsPosts.map(post => (
                <Container
                  maxW="container.sm"
                  bg="blue.600"
                  color="white"
                  minH="350"
                  display="flex"
                  flexDirection="column">
                  <Box
                    boxShadow="xs"
                    rounded="md"
                    maxW="container.sm"
                    bg="blue.600"
                    color="white"
                    minH="350"
                    display="flex"
                    flexDirection="column">
                    <div style={{flex: 1, fontSize: '24px'}}>{post?.title}</div>
                    <AiOutlineHeart style={{fontSize: '24px'}} />
                    <Box
                      boxShadow="xs"
                      rounded="md"
                      padding="4"
                      bg="blue.400"
                      color="black"
                      maxW="container.sm">
                      <h1>Recipe Name: {post?.recipe?.data?.recipe_name}</h1>
                      <h1>
                        Username:{' '}
                        {profiles[getIndex(profiles, post.email)]?.username}
                        <Button
                          bg={'blue.400'}
                          color={'white'}
                          _hover={{
                            bg: 'blue.500',
                          }}
                          style={{flex: 1, fontSize: '14px'}}
                          onClick={() => {
                            toast({
                              title: 'Unfollowed',
                              description: 'Removed from your friends',
                              status: 'success',
                              duration: 3000,
                              isClosable: true,
                            });
                            removeFollowing(post.email);
                          }}>
                          Unfollow
                        </Button>
                      </h1>
                    </Box>
                    <Box
                      boxShadow="xs"
                      rounded="md"
                      padding="4"
                      bg="blue.200"
                      color="black"
                      maxW="container.sm">
                      <h1>Description: {post.description}</h1>
                    </Box>
                    <Box
                      boxShadow="xs"
                      rounded="md"
                      padding="4"
                      bg="blue.100"
                      color="black"
                      maxW="container.sm">
                      {post?.date_time.toDate().toString()}
                    </Box>
                  </Box>
                </Container>
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Explore;
