import React from 'react';
import {
  Flex,
  Input,
  Button,
  Stack,
  ButtonGroup,
  Box,
  VStack,
  Text,
  useBreakpointValue,
  Spacer,
  Image,
  Center,
} from '@chakra-ui/react';
import {FormControl, FormLabel, FormHelperText} from '@chakra-ui/react';
import {useFormik} from 'formik';
import {auth} from '../../firebaseConfig';
import {getAuth} from 'firebase/auth';
import {db} from '../../firebaseConfig';
import {doc, getDocs, setDoc} from 'firebase/firestore';
import {collection, addDoc, DocumentReference} from 'firebase/firestore';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {Link, useNavigate} from 'react-router-dom';
import {useToast} from '@chakra-ui/react';
import Footer from '../../components/Footer';

function validateName(value: any) {
  let error;
  if (!value) {
    error = 'username is required';
  } else if (false) {
    //check database to see if username is taken
    error = 'username is taken';
  }
  return error;
}

async function uniqueUsername(email: string): Promise<boolean> {
  const queryUsernames = await getDocs(collection(db, 'users'));
  const usernames = queryUsernames.docs.map(doc => doc.data().username);
  if (usernames.includes(email)) {
    return false;
  }
  return true;
}

const SignUp = () => {
  const navigate = useNavigate(); //navigate to login
  const toast = useToast();
  const following: string[] = [];
  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      name: '',
      password: '',
      profilePic: 'default.jpeg'
    },
    onSubmit: async values => {
      if (await uniqueUsername(values.username)) {
        try {
          // Create a new user in Firebase authentication
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            values.email,
            values.password,
          );

          const docRef = await setDoc(doc(db, 'users', values.email), {
            email: values.email,
            name: values.name,
            username: values.username,
            following: following,
          });
          console.log('Document written with ID: ', docRef);

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
          console.log(e);
        }
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
            <Image
              borderRadius="30px"
              src="circleLogo.png"
              alt="Logo"
              w={350}
              mb={15}
            />
          </Center>
          <form onSubmit={formik.handleSubmit}>
            <FormControl isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                name="email"
                id="email"
                type="email"
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              <FormHelperText>We'll never share your email.</FormHelperText>

              <FormLabel>First Name</FormLabel>
              <Input
                name="name"
                id="name"
                placeholder="First Name"
                onChange={formik.handleChange}
                value={formik.values.name}
              />

              <FormLabel>Last Name</FormLabel>
              <Input
                name="lastname"
                id="lastname"
                placeholder="Last Name"
                onChange={formik.handleChange}
                value={formik.values.name}
              />

              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                id="username"
                placeholder="Username..."
                onChange={formik.handleChange}
                value={formik.values.username}
              />

              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                id="password"
                placeholder="Password..."
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              <Flex>
                <Box p="2">
                  <Link to="/login">
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
                <Box p="2">
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
