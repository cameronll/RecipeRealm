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
  Link,
  Badge,
  Center,
} from '@chakra-ui/react';
import {SmallCloseIcon} from '@chakra-ui/icons';
import Posts from './posts/posts';

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

const Friends: React.FC = () => {
  const [newUsername, setNewUsername] = useState('');
  const [newBiography, setNewBiography] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profile, setProfile] = useState<any>();
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);

  useEffect(() => {
    async function getProfile() {
      const getUser = doc(db, 'users/', email);
      const getProfile = await getDoc(getUser);
      setProfile(getProfile.data());
    }
    getProfile();
    const username_from_storage: any =
      window.localStorage.getItem('NEWUSERNAME');
    const email_from_storage: any = window.localStorage.getItem('NEWBIOGRAPHY');

    setNewUsername(JSON.parse(username_from_storage));
    setNewBiography(JSON.parse(email_from_storage));
  }, []);

  const handleUsernameChange = (e: any) => {
    const name = e.target.value;
    window.localStorage.setItem('NEWUSERNAME', JSON.stringify(name));
    setNewUsername(name);
  };

  const handleBiographyChange = (e: any) => {
    const name = e.target.value;
    window.localStorage.setItem('NEWBIOGRAPHY', JSON.stringify(name));
    setNewBiography(name);
  };

  const handlePasswordChange = (e: any) => {
    const name = e.target.value;
    setNewPassword(name);
  };

  return (
    <>
      <Navbar />
      <Posts />
      <Center py={6}>
        <Box
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
        </Box>
      </Center>
    </>
  );
};

export default Friends;
