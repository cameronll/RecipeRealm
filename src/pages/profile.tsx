import React, {useState, useEffect, useRef} from 'react';
import Navbar from '../components/Navbar';
import {db, storage } from '../firebaseConfig';
import { getBlob, getDownloadURL, getStream, ref, uploadBytes } from "firebase/storage";
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
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import {
  AuthCredential,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
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
  Center,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  VStack,
  useBreakpointValue,
  Text,
} from '@chakra-ui/react';
import {SmallCloseIcon} from '@chakra-ui/icons';
import {Link} from 'react-router-dom';

async function toDB(
  newBiography: string,
  newUsername: string,
  newPassword: string,
  oldPassword: string,
) {
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const auth = getAuth();
  const user = auth.currentUser;
  if (newPassword && oldPassword) {
    const credential = EmailAuthProvider.credential(email, oldPassword);
    if (user) {
      reauthenticateWithCredential(user, credential).then(async () => {
        updatePassword(user, newPassword);
      });
    }
  }

  const docRef = doc(db, 'users/', email);
  await updateDoc(docRef, {
    username: newUsername,
    biography: newBiography,
  });
}

async function uploadImage(file:any){
  const storageRef = ref(storage, 'image');

  // 'file' comes from the Blob or File API
  uploadBytes(storageRef, file).then((snapshot) => {
    console.log('Uploaded a blob or file!');
});
}

/*
function downloadImage(){
  const storageRef = ref(storage, 'image');
  const stream = getBlob(storageRef, 1000000000000);
  console.log(stream);
}
*/
const Profile: React.FC = () => {
  const [newUsername, setNewUsername] = useState('');
  const [newBiography, setNewBiography] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [profile, setProfile] = useState<any>();
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const toast = useToast();

  useEffect(() => {
    const profileSnapshot = onSnapshot(doc(db, 'users/', email), doc => {
      setProfile(doc.data());
    });
    const username_from_storage: any =
      window.localStorage.getItem('NEWUSERNAME');
    const email_from_storage: any = window.localStorage.getItem('NEWBIOGRAPHY');

    //const image = downloadImage();
    //setSelectedImage(image);
    //console.log(image);

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

  //Handle Delete

  const handleDelete = async () => {
    //TODO: Delete USer from database
    await deleteDoc(doc(db, "users", email));
    
  };

  const {isOpen, onOpen, onClose} = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

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
          // bgGradient={'linear(to-r, blackAlpha.600, transparent)'}
        >
          <Stack maxW={'2xl'} spacing={6}>
            <Text textAlign="center" fontSize="6xl" as="b" color="white">
              Profile Page
            </Text>
          </Stack>
        </VStack>
      </Flex>
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
          <Heading lineHeight={1.1} fontSize={{base: '2xl', sm: '3xl'}}>
            User Profile Edit
            <h1>{profile?.username}</h1>
          </Heading>
          <FormControl id="userName">
            <FormLabel>User Icon</FormLabel>

            <Stack direction={['column', 'row']} spacing={36}>
              <Center>
              {selectedImage && (
                <div>
                  <img
                    alt="not found"
                    width={"250px"}
                    src={URL.createObjectURL(selectedImage)}
                  />
                  <br />
                  <button onClick={() => setSelectedImage(null)}>Remove</button>
                </div>
              )}
              </Center>
              <Stack direction={['column', 'column']} spacing={6}>
                <Center w="full">
                  <input
                    type="file"
                    name="myImage"
                    onChange={(event) => {
                      if (event?.target?.files){
                        console.log(event.target.files[0]);
                        setSelectedImage(event.target.files[0]);
                        uploadImage(event.target.files[0]);
                      }
                    }}
                  />
                </Center>
                <Center>
                  <>
                    <Button colorScheme="red" onClick={onOpen}>
                      Delete Acccount
                    </Button>

                    <AlertDialog
                      isOpen={isOpen}
                      leastDestructiveRef={cancelRef}
                      onClose={onClose}>
                      <AlertDialogOverlay>
                        <AlertDialogContent>
                          <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Account
                          </AlertDialogHeader>

                          <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                          </AlertDialogBody>

                          <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                              Cancel
                            </Button>
                            <Link to="/login">
                              <Button
                                colorScheme="red"
                                // onClick={() => {
                                //   handleDelete();
                                // }}
                                ml={3}>
                                Delete
                              </Button>
                            </Link>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialogOverlay>
                    </AlertDialog>
                  </>
                </Center>
              </Stack>
            </Stack>
          </FormControl>
          <FormControl id="userName" isRequired>
            <FormLabel>User name</FormLabel>
            <Input
              placeholder="UserName"
              _placeholder={{color: 'gray.500'}}
              type="text"
              value={newUsername}
              onChange={handleUsernameChange}
            />
          </FormControl>
          <FormControl id="oldpassword" isRequired>
            <FormLabel>Old Password</FormLabel>
            <Input
              placeholder="password"
              _placeholder={{color: 'gray.500'}}
              type="password"
              value={oldPassword}
              onChange={handleOldPasswordChange}
            />
          </FormControl>
          <FormControl id="newpassword" isRequired>
            <FormLabel>New Password</FormLabel>
            <Input
              placeholder="password"
              _placeholder={{color: 'gray.500'}}
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
            />
          </FormControl>
          <FormControl id="biography" isRequired>
            <FormLabel>Biography</FormLabel>
            <Input
              placeholder="tell us about yourself"
              _placeholder={{color: 'gray.500'}}
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
              bg={'green.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'blue.500',
              }}
              onClick={() => {
                toast({
                  title: 'Success!',
                  description: 'Your profile data has been updated',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
                {
                  setNewUsername('');
                  setOldPassword('');
                  setNewPassword('');
                  setNewBiography('');
                }
                toDB(newBiography, newUsername, newPassword, oldPassword);
              }}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </>
  );
};

export default Profile;
