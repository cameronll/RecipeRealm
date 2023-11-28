import React, {useState, useEffect, useRef} from 'react';
import Navbar from '../components/Navbar';
import {auth, db, storage} from '../firebaseConfig';
import {useDownloadURL, useUploadFile} from 'react-firebase-hooks/storage';
import {
  getBlob,
  getDownloadURL,
  getStream,
  ref,
  uploadBytes,
} from 'firebase/storage';
import {BsUpload} from 'react-icons/bs';
import {FaTrashAlt} from 'react-icons/fa';
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
  Spacer,
} from '@chakra-ui/react';
import {SmallCloseIcon} from '@chakra-ui/icons';
import {Link, Navigate, useNavigate} from 'react-router-dom';
import {useDocumentData} from 'react-firebase-hooks/firestore';
import {FirebaseError} from 'firebase/app';

async function uniqueUsername(username: string): Promise<boolean> {
  const queryUsernames = await getDocs(collection(db, 'users'));
  const usernames = queryUsernames.docs.map(doc => doc.data().username);
  if (usernames.includes(username)) {
    return false;
  }
  return true;
}
/**
 * FUnction to populate data onto Profile page
 * @returns
 */
const Profile: React.FC = () => {
  const [newUsername, setNewUsername] = useState(''); //assigns new username
  const [newBiography, setNewBiography] = useState(''); //assigns new biography
  const [newPassword, setNewPassword] = useState(''); //assigns new password
  const [firstName, setFirstName] = useState(''); //assigns a new first name for user
  const [lastName, setLastName] = useState(''); //assigns a new lastname for users
  const [oldPassword, setOldPassword] = useState(''); //uses old password for authenticating changes in profile
  const [deletePassword, setDeletePassword] = useState('');
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const toast = useToast();
  const [profile, profileLoading, profileError] = useDocumentData(
    doc(db, 'users/', email),
  );
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<any>();

  useEffect(() => {
    const username_from_storage: any =
      window.localStorage.getItem('NEWUSERNAME');
    const bio_from_storage: any = window.localStorage.getItem('NEWBIOGRAPHY');
    const firstName_from_storage: any =
      window.localStorage.getItem('NEWFIRSTNAME');
    const lastName_from_storage: any =
      window.localStorage.getItem('NEWLASTNAME');

    setNewUsername(JSON.parse(username_from_storage));
    setNewBiography(JSON.parse(bio_from_storage));
    setFirstName(JSON.parse(firstName_from_storage));
    setLastName(JSON.parse(lastName_from_storage));

    // on mount, get the download url from database and set the url to selectedFile
    if (profile) {
      getDownloadURL(ref(storage, profile.profilePic)).then(url =>
        setSelectedFile(url),
      );
    }
  }, [profile]);

  async function uploadImage(file: any) {
    const storageRef = ref(storage, email + 'Profile');
    // 'file' comes from the Blob or File API
    uploadBytes(storageRef, file).then(async snapshot => {
      const userRef = doc(db, 'users/', email);
      await getDownloadURL(snapshot.ref).then(async link => {
        console.log(link);
        await updateDoc(userRef, {
          profilePic: link,
        });
      });
    });
  }
  /**
   * method to change username in the database
   *
   * @param e
   */
  const handleUsernameChange = (e: any) => {
    const name = e.target.value;
    window.localStorage.setItem('NEWUSERNAME', JSON.stringify(name));
    setNewUsername(name);
  };
  /**
   * method to change biography in the database
   * @param e
   */
  const handleBiographyChange = (e: any) => {
    const name = e.target.value;
    window.localStorage.setItem('NEWBIOGRAPHY', JSON.stringify(name));
    setNewBiography(name);
  };
  /**
   * method to change the first name in the data base
   * @param e
   */
  const handleFirstNameChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('NEWFIRSTNAME', JSON.stringify(targ));
    setFirstName(targ);
  };
  /**
   * method to change the last name
   * @param e
   */
  const handleLastNameChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('NEWLASTNAME', JSON.stringify(targ));
    setLastName(targ);
  };
  /**
   * method to handle old password change
   * @param e
   */
  const handleOldPasswordChange = (e: any) => {
    const name = e.target.value;
    setOldPassword(name);
  };
  /**
   * changes the current password to this new one in the database
   * @param e
   */
  const handlePasswordChange = (e: any) => {
    const name = e.target.value;
    setNewPassword(name);
  };

  //Handle Delete

  const handleDelete = async (password: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(email, password);
    if (user) {
      const authenticated = reauthenticateWithCredential(user, credential)
        .then(async snap => {
          toast({
            //
            title: 'Account Deleted',
            description: 'Your account has been permanently removed',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          navigate('/login');

          //TODO: Delete User from database
          await deleteDoc(doc(db, 'users', email));
          const deleted = user?.delete(); //should delete user
          console.log(deleted);

          const q = query(
            collection(db, 'posts/'),
            where('email', '==', email),
          );
          const docs = await getDocs(q);
          docs.forEach(doc => {
            deleteDoc(doc.ref);
          });
        })
        .catch(error => {
          console.log(error);
          toast({
            //
            title: 'Incorrect Password',
            description: 'This password is incorrect',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  const {isOpen, onOpen, onClose} = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const enableDeleteButton = () => {
    if (1 != Math.random()) {
      return false;
    }
    return true;
  };

  /**
   * function call that updates the database with the specified parameters
   * @param newBiography //biography added to the database
   * @param newUsername //username added to the database
   * @param newFirstName //first name added to the database
   * @param newLastName //last name added to the database
   * @param newPassword //password added in the database
   * @param oldPassword //previous password in the database
   */
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
        const reauth = reauthenticateWithCredential(user, credential)
          .then(async () => {
            updatePassword(user, newPassword);
            console.log(reauth);
          })
          .catch(error => {
            toast({
              //
              title: 'Incorrect Password',
              description: 'This password is incorrect',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          });
      }
    }

    if (newBiography === null) {
      newBiography = profile?.biography;
    }
    if (newUsername === null) {
      newUsername = profile?.username;
    }
    
    const unique = await uniqueUsername(newUsername);
    if (!unique){
      newUsername = profile?.username;
      toast({
        title: 'Username Already Taken',
        description: 'Please choose a unique username',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }

    var newName: string = '';
    if (newFirstName === null || newLastName === null) {
      newName = profile?.name;
    } else {
      newName = newFirstName + ' ' + newLastName;
    }
    const docRef = doc(db, 'users/', email);
    await updateDoc(docRef, {
      username: newUsername,
      biography: newBiography,
      name: newName,
    });
  }

  function handleDeletePasswordChange(e: any) {
    const password = e.target.value;
    setDeletePassword(password);
  }
  function handleReauthenticate(password: string) {}
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
                      <img alt="No Image" width={'250px'} src={selectedFile} />
                      <br />
                    </div>
                  )}
                </Center>
                <HStack>
                  <Center w="full">
                    <input
                      type="file"
                      name="myImage"
                      onChange={event => {
                        if (event?.target?.files) {
                          // when the file is chosen, change it into a url and make it the selected file
                          setSelectedFile(
                            URL.createObjectURL(event.target.files[0]),
                          );
                          // upload the image to storage
                          uploadImage(event.target.files[0]);
                        }
                      }}
                    />
                  </Center>
                  <Button
                    colorScheme="red"
                    onClick={() => setSelectedFile(undefined)}>
                    <FaTrashAlt /> Remove Picture
                  </Button>
                </HStack>
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
                        <FormControl>
                          <FormLabel
                            htmlFor="costPerServing"
                            fontSize="sm"
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                            mt="2%">
                            {/* Passsword input */}
                            Enter Password
                          </FormLabel>
                          <Input
                            type="text"
                            name="costPerServing"
                            id="costPerServing"
                            focusBorderColor="brand.400"
                            shadow="sm"
                            size="sm"
                            w="full"
                            rounded="md"
                            //HandlePassword
                            value={deletePassword}
                            onChange={handleDeletePasswordChange}
                          />
                        </FormControl>
                      </AlertDialogBody>

                      <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                          Cancel
                        </Button>
                        <Spacer />

                        <Button
                          colorScheme="red"
                          onClick={() => {
                            handleDelete(deletePassword);
                          }}>
                          Delete Account
                        </Button>
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
                  placeholder={profile?.name}
                  _placeholder={{color: 'gray.500'}}
                  type="text"
                  value={firstName}
                  onChange={handleFirstNameChange}
                />
              </FormControl>
              <FormControl id="LastName" isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  placeholder={profile?.name}
                  _placeholder={{color: 'gray.500'}}
                  type="text"
                  value={lastName}
                  onChange={handleLastNameChange}
                />
              </FormControl>
            </VStack>
            <VStack w="full">
              <FormControl isRequired>
                <FormLabel>User name</FormLabel>
                <Input
                  placeholder={profile?.username}
                  _placeholder={{color: 'gray.500'}}
                  type="text"
                  value={newUsername}
                  onChange={handleUsernameChange}
                />
              </FormControl>
              <FormControl id="oldpassword" isRequired>
                <FormLabel>Old Password</FormLabel>
                <Input
                  placeholder="Old Password"
                  _placeholder={{color: 'gray.500'}}
                  type="password"
                  value={oldPassword}
                  onChange={handleOldPasswordChange}
                />
              </FormControl>
              <FormControl id="newpassword" isRequired>
                <FormLabel>New Password</FormLabel>
                <Input
                  placeholder="New Password"
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
              placeholder={profile?.biography}
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
                toDB(
                  newBiography,
                  newUsername,
                  firstName,
                  lastName,
                  newPassword,
                  oldPassword,
                );
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
