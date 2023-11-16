import React, {useEffect, useState} from 'react';
import {
  Flex,
  Box,
  Input,
  Button,
  Image,
  Spacer,
  useColorModeValue,
  Stack,
  Avatar,
  Text,
  Center,
  InputGroup,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
//import Calendar from '../calendar';
//import Recipes from '../myrecipes';
import Profile from '../profile';
import {EmailAuthCredential, signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../../firebaseConfig';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import LoginNavbar from '../../components/LoginNav';
import GoogleButton from 'react-google-button';

import {getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';

const provider = new GoogleAuthProvider();

const googleSignIn = async () => {
  signInWithPopup(auth, provider)
    .then(result => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      //const credential = GoogleAuthProvider.credentialFromResult(result);
      //const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch(error => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const navigate = useNavigate();
  const toast = useToast();

  const signIn = (e: React.FormEvent) => {
    e.preventDefault(); // doesnt reload page
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;

        localStorage.clear();
        localStorage.setItem('EMAIL', JSON.stringify(email));
        console.log(user);
        if (user.email !== null) {
          navigate('../recipes');
        }
      })
      .catch(e => {
        toast({
          //
          title: 'Incorrect Information',
          description: 'We could not validate your information',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <>
      <LoginNavbar />
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
          borderRadius={15}
          bg="primary.50">
          <Center>
            <Image
              borderRadius="30px"
              src="newlogoteal.png"
              alt="Logo"
              w={350}
              mb={15}
            />
          </Center>
          <Center>
            <Text as="b" fontSize={30} marginBottom={4}>
              Login below to start your experience!
            </Text>
          </Center>
          <form onSubmit={signIn}>
            <Input
              placeholder="Username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              variant="filled"
              mb={4}
            />

            {/* <Input
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              variant="filled"
              type="password"
              mb={6}
            /> */}
            <InputGroup size="md">
              <Input
                value={password}
                onChange={e => setPassword(e.target.value)}
                variant="filled"
                mb={6}
                // pr="4.5rem"
                type={show ? 'text' : 'password'}
                placeholder="Enter password"
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                  {show ? 'Hide' : 'Show'}
                </Button>
              </InputRightElement>
            </InputGroup>

            <Flex>
            <Link to="/Recipes">
                <Button colorScheme="teal" size="lg" onClick={signIn}>
                  Login
                </Button>
              </Link>

              <Spacer />

              
              <Link to="/signup">
                <Button
                  color="teal"
                  colorScheme="white"
                  size="lg"
                  variant="outline">
                  <Text color="teal">Sign up</Text>
                </Button>
              </Link>
            </Flex>
          </form>
        </Box>
      </Flex>
      <Stack
        bg={useColorModeValue('gray.50', 'gray.800')}
        py={16}
        px={8}
        spacing={{base: 8, md: 10}}
        align={'center'}
        direction={'column'}>
        <Box textAlign={'center'}></Box>
      </Stack>
    </>
  );
};

export default Login;
