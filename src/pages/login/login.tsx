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
} from '@chakra-ui/react';
//import Calendar from '../calendar';
//import Recipes from '../myrecipes';
import Profile from '../profile';
import {EmailAuthCredential, signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../../firebaseConfig';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import LoginNavbar from '../../components/LoginNav';
import GoogleButton from 'react-google-button'

import {getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();



const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log(user);
    // Redirect or perform actions after successful login
    // e.g., redirect to a profile page
  } catch (error) {
    console.error(error);
    // Handle errors
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const signIn = (e: React.FormEvent) => {
    e.preventDefault(); // doesnt reload page
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        localStorage.clear();
        localStorage.setItem('EMAIL', JSON.stringify(email));
        navigate('../recipes');
      })
      .catch(e => {
        console.log(e);
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
          backgroundColor={'#008080'}
          p={8}
          borderWidth={2}
          borderRadius={15}
          bg="primary.50">
          <Image
            borderRadius="30px"
            src="logo192.png"
            alt="Logo"
            w={550}
            mb={15}
          />
          <form onSubmit={signIn}>
            <Input
              placeholder="Username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              variant="filled"
              mb={4}
            />

            <Input
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              variant="filled"
              type="password"
              mb={6}
            />

            <Flex>
              <Link to="/Recipes">
                <Button colorScheme="teal" size="lg" onClick={signIn}>
                  Login
                </Button>

                {/* <Button mt={4} colorScheme="red" size="lg"></Button> */}
              </Link>

              <Spacer />

              <Link to="/signup">
                <Button colorScheme="teal" size="lg">
                  Sign Up!
                </Button>
              </Link>
            </Flex>
          </form>
          <GoogleButton
                onClick={() => googleSignIn()}              
          />
        </Box>
      </Flex>
      <Stack
        bg={useColorModeValue('gray.50', 'gray.800')}
        py={16}
        px={8}
        spacing={{base: 8, md: 10}}
        align={'center'}
        direction={'column'}>
        <Text
          fontSize={{base: 'xl', md: '2xl'}}
          textAlign={'center'}
          maxW={'3xl'}>
          "I love Jane"
        </Text>
        <Box textAlign={'center'}>
          <Avatar
            src={
              'https://i.ytimg.com/vi/WH7uKNQDzWI/hqdefault.jpg?sqp=-oaymwE9CNACELwBSFryq4qpAy8IARUAAAAAGAElAADIQj0AgKJDeAHwAQH4AbYIgALQBYoCDAgAEAEYZSBYKEowDw==&rs=AOn4CLCPPCr7AOoCWseh5XdjlHeFmyc2rQ'
            }
            mb={2}
          />

<div>
      <h2>Login with Google</h2>
      <div id="firebaseui-auth-container"></div>
    </div>
        </Box>
      </Stack>
    </>
  );
};

export default Login;
