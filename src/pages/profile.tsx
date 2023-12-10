import React, {useState, useEffect, useRef} from 'react';
import Navbar from '../components/Navbar';
import {db, storage} from '../firebaseConfig';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import {FaTrashAlt} from 'react-icons/fa';
import {
  collection,
  doc,
  getDocs,
  where,
  query,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
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
import {useDocumentData} from 'react-firebase-hooks/firestore';
import {useNavigate} from 'react-router-dom';

// function to check if a username is unique
async function uniqueUsername(username: string): Promise<boolean> {
  const queryUsernames = await getDocs(collection(db, 'users'));
  // get the usernames
  const usernames = queryUsernames.docs.map(doc => doc.data().username);
  // if the username parameter is in the username array, return true
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
  const [deletePassword, setDeletePassword] = useState(''); // holds the password to validate delete
  const email = JSON.parse(localStorage.getItem('EMAIL') as string); // get the current user's email from local storage
  const toast = useToast(); // toast for popups
  const [profile] = useDocumentData(doc(db, 'users/', email)); //listener to the user's profile
  const navigate = useNavigate(); // navigate hook to switch between pages

  const [selectedFile, setSelectedFile] = useState<any>();

  useEffect(() => {
    // get everything from local storage
    const username_from_storage: any =
      window.localStorage.getItem('NEWUSERNAME');
    const bio_from_storage: any = window.localStorage.getItem('NEWBIOGRAPHY');
    const firstName_from_storage: any =
      window.localStorage.getItem('NEWFIRSTNAME');
    const lastName_from_storage: any =
      window.localStorage.getItem('NEWLASTNAME');

    // set the useState variables with the approp
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

  // method to upload an image to firebase storage
  async function uploadImage(file: any) {
    const storageRef = ref(storage, email + 'Profile');
    // upload the file to firebase storage
    uploadBytes(storageRef, file).then(async snapshot => {
      const userRef = doc(db, 'users/', email);
      // get the download url of the uploaded file
      await getDownloadURL(snapshot.ref).then(async link => {
        // add the link to the user's profile
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

  // method to delete the user's account
  const handleDelete = async (password: string) => {
    // get the current user
    const auth = getAuth();
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(email, password);
    if (user) {
      // reauthenticate with the password
      const authenticated = reauthenticateWithCredential(user, credential)
        .then(async snap => {
          // toast to show delete
          toast({
            //
            title: 'Account Deleted',
            description: 'Your account has been permanently removed',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          // navigate back to log in
          navigate('/login');

          // delete the user from the database
          await deleteDoc(doc(db, 'users', email));
          // delete the user from authentication
          const deleted = user?.delete(); //should delete user

          // delete the user's posts
          const q = query(
            collection(db, 'posts/'),
            where('email', '==', email),
          );
          const docs = await getDocs(q);
          docs.forEach(doc => {
            deleteDoc(doc.ref);
          });
        })
        // if the password is incorrect, catch the error
        .catch(error => {
          toast({
            // popup to show incorrect password
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
    // get the current user's email
    const email = JSON.parse(localStorage.getItem('EMAIL') as string);
    // get the current user from auth
    const auth = getAuth();
    const user = auth.currentUser;
    // if newPassword and oldPassword have data...
    if (newPassword && oldPassword) {
      const credential = EmailAuthProvider.credential(email, oldPassword);
      if (user) {
        // reauthenticate the user with the oldPassword
        const reauth = reauthenticateWithCredential(user, credential)
          // update the password
          .then(async () => {
            updatePassword(user, newPassword);
          })
          // catch any error
          .catch(error => {
            // toast that the password is incorrect
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
    // if either vaiable is null, set them to the value stored in the db
    if (newBiography === null) {
      newBiography = profile?.biography;
    }
    if (newUsername === null) {
      newUsername = profile?.username;
    }

    // check that the username is unique
    const unique = await uniqueUsername(newUsername);
    if (!unique) {
      newUsername = profile?.username;
      // popup to show failure
      toast({
        title: 'Username Already Taken',
        description: 'Please choose a unique username',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    // load the newName variable
    var newName: string = '';
    if (newFirstName === null || newLastName === null) {
      newName = profile?.name;
    } else {
      newName = newFirstName + ' ' + newLastName;
    }
    // update the user in the db with form data
    const docRef = doc(db, 'users/', email);
    await updateDoc(docRef, {
      username: newUsername,
      biography: newBiography,
      name: newName,
    });
  }

  // function to track the changes in the delete account: password text input
  function handleDeletePasswordChange(e: any) {
    const password = e.target.value;
    setDeletePassword(password);
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
        <VStack w={'full'} px={useBreakpointValue({base: 4, md: 8})}>
          <Stack maxW={'2xl'} spacing={6}>
            {/* //Profile Page Title */}
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
          {/* //Editing Profile Heading */}
          <Heading lineHeight={1.1} fontSize={{base: '2xl', sm: '3xl'}}>
            Edit Profile
          </Heading>
          <FormControl id="userName">
            {/* //User Icon */}
            <FormLabel>User Icon</FormLabel>

            <Stack direction={['column', 'row']}>
              <VStack>
                <Center>
                  {// make sure the selectedFile variable has data
                  selectedFile && (
                    <div>
                      <img alt="No Image" width={'250px'} 
                      // the source of the image is the selectedFile variable
                      src={selectedFile} />
                      <br />
                    </div>
                  )}
                </Center>
                <HStack>
                  <Center w="full">
                    {/* //Handle change profile picture */}
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
                  {/* //Remove Picture */}
                  <Button
                    colorScheme="red"
                    onClick={() => setSelectedFile(undefined)}>
                    <FaTrashAlt /> Remove Picture
                  </Button>
                </HStack>
              </VStack>
              <VStack alignSelf="end">
                {/* //Delete Account Button */}
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
                          {/* //Handle Delete check */}
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
                            // handle the delete password change
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
                          // when the button is clicked, delete the account
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
              {/* //Handle First Name change */}
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
                {/* //Handle Last Name Change */}
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
                {/* //Handle Username Change */}
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
                {/* //Password check */}
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
                {/* New Password input */}
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
            {/* //Biography Check handle change */}
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
            {/* //Apply handle Change Button */}
            <Button
              bg={'green.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'blue.500',
              }}
              onClick={() => {
                // toast popup to show success
                toast({
                  title: 'Success!',
                  description: 'Your profile data has been updated',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
                // reset the text inputs
                {
                  setNewUsername('');
                  setOldPassword('');
                  setNewPassword('');
                  setNewBiography('');
                  setFirstName('');
                  setLastName('');
                  // clean local storage
                  localStorage.removeItem('FIRSTNAME');
                  localStorage.removeItem('LASTNAME');
                  localStorage.removeItem('NEWUSERNAME');
                  localStorage.removeItem('NEWBIOGRAPHY');
                }
                // send everything to the db
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
