import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import {db} from '../firebaseConfig';
import {collection, addDoc, doc, setDoc, getDoc, getDocs, where, query, orderBy, updateDoc} from "firebase/firestore";
import { AuthCredential, EmailAuthProvider, getAuth, onAuthStateChanged, reauthenticateWithCredential, updateEmail, updatePassword } from "firebase/auth";
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
  Center,
  useToast,
} from '@chakra-ui/react';
import {SmallCloseIcon} from '@chakra-ui/icons';

async function toDB(newBiography:string, newUsername:string, newPassword: string, oldPassword: string){
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const auth = getAuth();
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(
    email,
    oldPassword
  )
  if (user){
    reauthenticateWithCredential(user, credential).then(async () => {
      if (newPassword){
        updatePassword(user, newPassword);
      }
    })
  }
  const docRef = doc(db, "users/", email)
  await updateDoc(docRef, {
    username: newUsername,
    biography: newBiography
    })
}

const Profile: React.FC = () => {
  const [newUsername, setNewUsername] = useState('');
  const [newBiography, setNewBiography] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [profile, setProfile] = useState<any>();
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const toast = useToast();

  useEffect(() => {
    async function getProfile() {
      const getUser = doc(db, 'users/', email);
      const getProfile = await getDoc(getUser);
      setProfile(getProfile.data());
    }
    getProfile();
    const username_from_storage:any = window.localStorage.getItem('NEWUSERNAME');
    const email_from_storage:any = window.localStorage.getItem('NEWBIOGRAPHY');
    
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

  const handleOldPasswordChange = (e: any) => {
    const name = e.target.value;
    setOldPassword(name);
  };

  const handlePasswordChange = (e: any) => {
    const name = e.target.value;
    setNewPassword(name);
  };

  return (
    <>
      <Navbar />
      <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack
        spacing={4}
        w={'full'}
        maxW={'md'}
        bg={useColorModeValue('white', 'gray.700')}
        rounded={'xl'}
        boxShadow={'lg'}
        p={6}
        my={12}>
        <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
          User Profile Edit
          <h1>{profile?.username}</h1>
        </Heading>
        <FormControl id="userName">
          <FormLabel>User Icon</FormLabel>
          <Stack direction={['column', 'row']} spacing={6}>
            <Center>
              <Avatar size="xl" src="https://i.ytimg.com/vi/WH7uKNQDzWI/hqdefault.jpg?sqp=-oaymwE9CNACELwBSFryq4qpAy8IARUAAAAAGAElAADIQj0AgKJDeAHwAQH4AbYIgALQBYoCDAgAEAEYZSBYKEowDw==&rs=AOn4CLCPPCr7AOoCWseh5XdjlHeFmyc2rQ">
                <AvatarBadge
                  as={IconButton}
                  size="sm"
                  rounded="full"
                  top="-10px"
                  colorScheme="red"
                  aria-label="remove Image"
                  icon={<SmallCloseIcon />}
                />
              </Avatar>
            </Center>
            <Center w="full">
              <Button w="full">Change Icon</Button>
            </Center>
          </Stack>
        </FormControl>
        <FormControl id="userName" isRequired>
          <FormLabel>User name</FormLabel>
          <Input
            placeholder="UserName"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            value={newUsername}
            onChange={handleUsernameChange}
          />
        </FormControl>
        <FormControl id="oldpassword" isRequired>
          <FormLabel>Old Password</FormLabel>
          <Input
            placeholder="password"
            _placeholder={{ color: 'gray.500' }}
            type="password"
            value={oldPassword}
            onChange={handleOldPasswordChange}
          />
        </FormControl>
        <FormControl id="newpassword" isRequired>
          <FormLabel>New Password</FormLabel>
          <Input
            placeholder="password"
            _placeholder={{ color: 'gray.500' }}
            type="password"
            value={newPassword}
            onChange={handlePasswordChange}
          />
        </FormControl>
        <FormControl id="biography" isRequired>
          <FormLabel>Biography</FormLabel>
          <Input
            placeholder="tell us about yourself"
            _placeholder={{ color: 'gray.500' }}
            type="biography"
            value={newBiography}
            onChange={handleBiographyChange}
          />
        </FormControl>
        <Stack spacing={6} direction={['column', 'row']}>
          <Button
            bg={'red.400'}
            color={'white'}
            w="full"
            _hover={{
              bg: 'red.500',
            }}>
            Cancel
          </Button>
          <Button
            bg={'blue.400'}
            color={'white'}
            w="full"
            _hover={{
              bg: 'blue.500',
            }}
            onClick={() => {
              toast({
                title: 'Success!',
                description: "Your profile data has been updated",
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
              {
                setNewUsername("");
                setOldPassword("");
                setNewPassword("");
                setNewBiography("");
              }
              toDB(newBiography, newUsername, newPassword, oldPassword);
            }}>
            Submit
          </Button>
        </Stack>
      </Stack>
    </Flex>
    </>
  );
};

export default Profile;