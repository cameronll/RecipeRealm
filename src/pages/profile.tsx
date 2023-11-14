import React, {useState, useEffect, useRef} from 'react';
import Navbar from '../components/Navbar';
import {db, storage} from '../firebaseConfig';
import {useDownloadURL, useUploadFile} from 'react-firebase-hooks/storage';
import {
  getBlob,
  getDownloadURL,
  getStream,
  ref,
  uploadBytes,
} from 'firebase/storage';
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
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { FirebaseError } from 'firebase/app';

const Profile: React.FC = () => {
  const [newUsername, setNewUsername] = useState('');
  const [newBiography, setNewBiography] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const toast = useToast();
  const [profile, profileLoading, profileError] = useDocumentData(doc(db, 'users/', email));

  const [selectedFile, setSelectedFile] = useState<any>();

  useEffect(() => {
    const username_from_storage: any = window.localStorage.getItem('NEWUSERNAME');
    const bio_from_storage: any = window.localStorage.getItem('NEWBIOGRAPHY');
    const firstName_from_storage: any = window.localStorage.getItem('NEWFIRSTNAME');
    const lastName_from_storage: any = window.localStorage.getItem('NEWLASTNAME');

    setNewUsername(JSON.parse(username_from_storage));
    setNewBiography(JSON.parse(bio_from_storage));
    setFirstName(JSON.parse(firstName_from_storage));
    setLastName(JSON.parse(lastName_from_storage));

    // on mount, get the download url from database and set the url to selectedFile
    if (profile){
      getDownloadURL(ref(storage, profile.profilePic)).then((url) => setSelectedFile(url));
    }
  }, [profile]);

  async function uploadImage(file: any) {
    const storageRef = ref(storage, (email + 'Profile'));
    // 'file' comes from the Blob or File API
    uploadBytes(storageRef, file).then(async snapshot => {
      const userRef = doc(db, 'users/', email);
      await getDownloadURL(snapshot.ref).then(async link => {
        console.log(link);
        await updateDoc(userRef, {
          profilePic: link
      })
    }); 
    });
  }

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

  const handleFirstNameChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('NEWFIRSTNAME', JSON.stringify(targ));
    setFirstName(targ);
  }

  const handleLastNameChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('NEWLASTNAME', JSON.stringify(targ));
    setLastName(targ);
  }

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
    await deleteDoc(doc(db, 'users', email));
    // const user = firebase.auth().currentUser;
    // user?.delete();
  };

  const {isOpen, onOpen, onClose} = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  async function toDB(
    newBiography: string,
    newUsername: string,
    newFirstName: string,
    newLastName: string,
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
  

    if (newBiography === null){
      newBiography = profile?.biography
    }
    if (newUsername === null){
      newUsername = profile?.username
    }

    var newName:string = '';
    if (newFirstName === null || newLastName === null){
      newName = profile?.name;
    }
    else {
      newName = newFirstName + " " + newLastName;
    }
    const docRef = doc(db, 'users/', email);
    await updateDoc(docRef, {
      username: newUsername,
      biography: newBiography,
      name: newName
    });
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
        justify={'center'}
        bg={useColorModeValue('gray.50', 'gray.800')}>
        <Stack
          spacing={4}
          w={'80%'}
          bg={useColorModeValue('white', 'gray.700')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}
          my={12}>
          <Heading lineHeight={1.1} fontSize={{base: '2xl', sm: '3xl'}}>
            Edit Profile
          </Heading>
          <FormControl id="userName">
            <FormLabel>User Icon</FormLabel>

            <Stack direction={['column', 'row']}>
              <VStack>
                <Center>
                  {selectedFile && (
                    <div>
                      <img
                        alt="No Image"
                        width={'250px'}
                        src={selectedFile}
                      />
                      <br />
                      <button onClick={() => setSelectedFile(undefined)}>
                        Remove
                      </button>
                    </div>
                  )}
                </Center>

                <Center w="full">
                  <input
                    type="file"
                    name="myImage"
                    onChange={event => {
                      if (event?.target?.files) {
                        // when the file is chosen, change it into a url and make it the selected file
                        setSelectedFile(URL.createObjectURL(event.target.files[0]));
                        // upload the image to storage
                        uploadImage(event.target.files[0]);
                      }
                    }}
                  />
                </Center>
              </VStack>
              <VStack alignSelf="end">
                <Button alignSelf="end" colorScheme="red" onClick={onOpen}>
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
              </VStack>
            </Stack>
          </FormControl>
          <HStack>
            <VStack w="full">
              <FormControl id="firstName" isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  placeholder="First Name"
                  _placeholder={{color: 'gray.500'}}
                  type="text"
                  value={firstName}
                  onChange={handleFirstNameChange}
                />
              </FormControl>
              <FormControl id="LastName" isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  placeholder="Last Name"
                  _placeholder={{color: 'gray.500'}}
                  type="text"
                  value={lastName}
                  onChange={handleLastNameChange}
                />
              </FormControl>
            </VStack>
            <VStack w="full">
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
            </VStack>
          </HStack>
          <FormControl id="biography" isRequired>
            <FormLabel>Biography</FormLabel>
            <Input
              minH={100}
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
                  setFirstName('');
                  setLastName('');
                  localStorage.removeItem('FIRSTNAME');
                  localStorage.removeItem('LASTNAME');
                  localStorage.removeItem('NEWUSERNAME');
                  localStorage.removeItem('NEWBIOGRAPHY');
                }
                toDB(newBiography, newUsername, firstName, lastName, newPassword, oldPassword);
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
