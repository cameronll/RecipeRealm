import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
import {
  getAuth,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
} from 'firebase/auth';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  HStack,
  Avatar,
  AvatarBadge,
  IconButton,
  Box,
  Text,
  Badge,
  Center,
  VStack,
  useBreakpointValue,
  Tabs,
  TabList,
  Image,
  Tab,
  TabPanel,
  TabPanels,
  InputGroup,
  InputLeftElement,
  InputRightAddon,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Container,
} from '@chakra-ui/react';
import {BsPersonPlusFill} from 'react-icons/bs';
import {Link} from 'react-router-dom';
import {Search2Icon, SmallCloseIcon} from '@chakra-ui/icons';
import Posts from './posts/posts';
import {AiFillPrinter} from 'react-icons/ai';

/**
 * call to database to to store and retrieve information
 * @param newBiography //holds new biography information
 * @param newUsername //stores new username
 * @param newPassword stores new password
 */
async function toDB(
  newBiography: string,
  newUsername: string,
  newPassword: string,
) {
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const auth = getAuth();
  const user = auth.currentUser;
  const docRef = doc(db, 'users/', email);

  if (user) {
    updatePassword(user, newPassword);
    await updateDoc(docRef, {
      username: newUsername,
      biography: newBiography,
    });
    console.log('Document Written');
  } else {
    console.log('No user!');
  }
}
/**
 * 
 * @returns 
 */
const Friends: React.FC = () => {
  const [newUsername, setNewUsername] = useState('');
  const [newBiography, setNewBiography] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profile, setProfile] = useState<any>();
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);

  useEffect(() => {
    /**
     * method created to retrieve current profile from the database
     */
    async function getProfile() {
      const getUser = doc(db, 'users/', email);
      const getProfile = await getDoc(getUser);
      setProfile(getProfile.data());
    }
    getProfile();//retieves current profile
    const username_from_storage: any =
      window.localStorage.getItem('NEWUSERNAME');//retrieves current username fron storage
    const email_from_storage: any = window.localStorage.getItem('NEWBIOGRAPHY');//retrieves email from local storage

    setNewUsername(JSON.parse(username_from_storage));//changes username in database
    setNewBiography(JSON.parse(email_from_storage));//changes biography in database
  }, []);
/**
 * method to change user name
 * @param e 
 */
  const handleUsernameChange = (e: any) => {
    const name = e.target.value;
    window.localStorage.setItem('NEWUSERNAME', JSON.stringify(name));
    setNewUsername(name);
  };
/**
 * mthod to change biography
 * @param e 
 */
  const handleBiographyChange = (e: any) => {
    const name = e.target.value;
    window.localStorage.setItem('NEWBIOGRAPHY', JSON.stringify(name));
    setNewBiography(name);
  };
/**
 * sets password 
 * @param e 
 */
  const handlePasswordChange = (e: any) => {
    const name = e.target.value;
    setNewPassword(name);
  };

  return (
    <>
      <Navbar />
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
          backgroundColor="rgba(0, 128, 128, 0.7)">
          <Stack maxW={'2xl'} spacing={6}>
            <Text textAlign="center" fontSize="6xl" as="b" textColor="white">
              Friends Page
            </Text>
          </Stack>
        </VStack>
      </Flex>
      <Center>
        <InputGroup
          borderRadius={5}
          size="lg" // Change the size to "lg" for a larger input group
          minH="50px" // Increase the minimum height as needed
          marginBottom={3}
          maxW="60%" // Increase the maximum width as needed
          marginTop={3}
          rounded="3xl"
          bg="white">
          <InputLeftElement children={<Search2Icon color="gray.600" />} />
          <Input type="text" placeholder="Search..." rounded="lg" />
          <InputRightAddon p={0} border="none" marginLeft={3}>
            <Button colorScheme="teal" size="lg">
              Search
            </Button>
          </InputRightAddon>
        </InputGroup>
      </Center>
      <Box py={6} minH="100vh">
        <Box alignSelf="center">
          <Tabs isFitted variant="enclosed" size="lg">
            <TabList>
              <Tab>Find Friends</Tab>
              <Tab>My Friends</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {' '}
                <VStack>
                  <Container
                    boxShadow={'2xl'}
                    minW="xl"
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
                        maxW="container.sm"></Box>
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
              <TabPanel></TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* <Box
          maxW={'320px'}
          w={'full'}
          bg={useColorModeValue('white', 'gray.900')}
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
          <Heading fontSize={'2xl'} fontFamily={'body'}>
            Brody Tingle
          </Heading>
          <Text fontWeight={600} color={'gray.500'} mb={4}>
            @TingleMyPingle
          </Text>
          <Text
            textAlign={'center'}
            color={useColorModeValue('gray.700', 'gray.400')}
            px={3}>
            I love Jane <Text color={'blue.400'}>#Engaged</Text>
          </Text>

          <Stack align={'center'} justify={'center'} direction={'row'} mt={6}>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue('gray.50', 'gray.800')}
              fontWeight={'400'}>
              #Jane
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue('gray.50', 'gray.800')}
              fontWeight={'400'}>
              #Kevin
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue('gray.50', 'gray.800')}
              fontWeight={'400'}>
              #Jesus
            </Badge>
          </Stack>

          <Stack mt={8} direction={'row'} spacing={4}>
            <Button
              flex={1}
              fontSize={'sm'}
              rounded={'full'}
              _focus={{
                bg: 'gray.200',
              }}>
              View Posts
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
              }}>
              Follow
            </Button>
          </Stack>
        </Box> */}
      </Box>
    </>
  );
};

export default Friends;
