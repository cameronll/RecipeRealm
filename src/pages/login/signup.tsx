import React from 'react';
import {
  Flex,
  Input,
  Button,
  Stack,
  Box,
  VStack,
  Text,
  useBreakpointValue,
  Spacer,
  Image,
  Center,
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react';
import {FormControl, FormLabel, FormHelperText} from '@chakra-ui/react';
import {useFormik} from 'formik';
import {auth} from '../../firebaseConfig';
import {db} from '../../firebaseConfig';
import {doc, getDocs, setDoc} from 'firebase/firestore';
import {collection} from 'firebase/firestore';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {Link, useNavigate} from 'react-router-dom';
import {useToast} from '@chakra-ui/react';
/**
 * check name value to see if name already exists in the database
 * @param value
 * @returns
 */
/**
 * checks the username is not already taken
 * @param username
 * @returns
 */
async function uniqueUsername(username: string): Promise<boolean> {
  const queryUsernames = await getDocs(collection(db, 'users'));
  const usernames = queryUsernames.docs.map(doc => doc.data().username);
  if (usernames.includes(username)) {
    return false;
  }
  return true;
}
/**
 * method to sign up a new user including formik for handling the form data
 * @returns
 */
const SignUp = () => {
  const navigate = useNavigate(); //navigate to login
  const toast = useToast(); //USe toast to display messages
  const [show, setShow] = React.useState(false); //Sets show state to help handle visibility of certain
  const handleClick = () => setShow(!show);//Handle the show and toggle the state
  const following: string[] = [];//set following string
  const liked: any[] = ['non-empty'];//handling liked strings
  const events: any[] = [];//events events strings
  //Handdels the profile pic
  const profilePic =
    'https://firebasestorage.googleapis.com' +
    '/v0/b/reciperealm-cbc4f.appspot.com/o/default.jpeg?alt=media&token=e68e229a-2860-495a-8ced-8480f6c79b7f';
  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      firstname: '',
      lastname: '',
      password: '',
    },
    //onSubmit button to handle the comunication between the data base
    onSubmit: async values => {
      if (await uniqueUsername(values.username)) {
        try {
          // Create a new user in Firebase authentication
          await createUserWithEmailAndPassword(
            auth,
            values.email,
            values.password,
          ).then(async userCredential => {
            const name = values.firstname + ' ' + values.lastname;
            const docRef = await setDoc(doc(db, 'users', values.email), {
              email: values.email,
              name: name,
              username: values.username,
              following: following,
              profilePic: profilePic,
              liked: liked,
            });
          });

          // Additional actions upon successful signup (if needed)
          toast({
            //
            title: 'Account created.',
            description: "We've created your recipe for you.",
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          navigate('/login'); //navigate to login
        } catch (e) {
          toast({
            //
            title: 'Email Already In Use',
            description: 'This email already has an account',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Additional actions upon successful signup (if needed)
        toast({
          //
          title: 'Username Taken',
          description: 'Please choose a unique username',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <>
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
            // bgGradient={'linear(to-r, blackAlpha.600, transparent)'}
          >
            <Stack maxW={'2xl'} spacing={6}>
              <Text textAlign="center" fontSize="6xl" as="b" color="white">
                Sign up
              </Text>
            </Stack>
          </VStack>
        </Flex>
      </Flex>
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        direction="column"
        backgroundColor={'#D3D3D3'}
        backgroundImage={
          'url(https://hips.hearstapps.com/hmg-prod/images/wdy050113taco-01-1624540365.jpg)'
        }>
        <Box
          boxShadow="dark-lg"
          backgroundColor="white"
          p={8}
          borderWidth={2}
          minWidth="650px"
          maxWidth="650px"
          borderRadius={15}
          bg="primary.50">
          <Center>
            {/* //Display Logo */}
            <Image
              borderRadius="30px"
              src="newlogoteal.png"
              alt="Logo"
              w={350}
              mb={15}
            />
          </Center>
          <form onSubmit={formik.handleSubmit}>
            <FormControl isRequired>
              {/* //Handle Ematil Address */}
              <FormLabel>Email address</FormLabel>
              <Input
                name="email"
                id="email"
                type="email"
                onChange={formik.handleChange}
                value={formik.values.email.toLowerCase()}
              />
              <FormHelperText>We'll never share your email.</FormHelperText>
              {/* //Handle First Name */}
              <FormLabel>First Name</FormLabel>
              <Input
                name="firstname"
                id="firstname"
                placeholder="First Name"
                onChange={formik.handleChange}
                value={formik.values.firstname}
              />
              {/* //Hande Last Name */}
              <FormLabel>Last Name</FormLabel>
              <Input
                name="lastname"
                id="lastname"
                placeholder="Last Name"
                onChange={formik.handleChange}
                value={formik.values.lastname}
              />
              {/* //Hande UserName */}
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                id="username"
                placeholder="Username..."
                onChange={formik.handleChange}
                value={formik.values.username}
              />
              {/* //Handle Password */}
              <FormLabel>Password</FormLabel>
              <InputGroup size="md">
                <Input
                  name="password"
                  id="password"
                  placeholder="Password..."
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  type={show ? 'text' : 'password'}
                />
                <InputRightElement width="4.5rem">
                  {/* //Handle Hiding Toggle */}
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Flex>
                <Box>
                  <Link to="/login">
                    {/* //Back Button */}
                    <Button
                      mt={4}
                      colorScheme="red"
                      size="lg"
                      variant="solid"
                      marginRight={83}>
                      Back
                    </Button>
                  </Link>
                </Box>
                <Spacer />
                <Box>
                  {/* //Handle Submit */}
                  <Button
                    mt={4}
                    variant="solid"
                    colorScheme="teal"
                    type="submit"
                    size="lg">
                    Submit
                  </Button>
                </Box>
              </Flex>
            </FormControl>
          </form>
        </Box>
      </Flex>
    </>
  );
};

export default SignUp;
