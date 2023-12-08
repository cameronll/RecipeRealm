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
  Text,
  Center,
  InputGroup,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../../firebaseConfig';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import LoginNavbar from '../../components/LoginNav';

/**
 * Function to login in to website
 * @returns
 */
const Login = () => {
  useEffect(() => {
    localStorage.removeItem('EMAIL');
  }, []);
  const [email, setEmail] = useState('');
  //establishes email in the database
  const [password, setPassword] = useState('');
  //establishes the password in the database
  const [show, setShow] = React.useState(false);
  //allows the option to view password
  const handleClick = () => setShow(!show);
  const navigate = useNavigate();
  const toast = useToast();
  /**
   * controls for to allow fo rsign in authorization
   * @param e
   */
  const signIn = (e: React.FormEvent) => {
    e.preventDefault(); // doesnt reload page
    signInWithEmailAndPassword(auth, email, password)
      //method that passes in established values to login to website
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
      {/* //Navbar */}
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
          {/* //Logo this is the logo for the site */}
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
            {/* //Log in title */}
            <Text as="b" fontSize={30} marginBottom={4}>
              Login below to start your experience!
            </Text>
          </Center>
          <form onSubmit={signIn}>
            {/* //Email input */}
            <Input
              placeholder="Email"
              value={email.toLowerCase()}
              onChange={e => setEmail(e.target.value)}
              variant="filled"
              mb={4}
            />
            {/* //Password input */}
            <InputGroup size="md">
              <Input
                value={password}
                onChange={e => setPassword(e.target.value)}
                variant="filled"
                mb={6}
                type={show ? 'text' : 'password'}
                placeholder="Enter password"
              />
              {/* //showing button */}
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                  {show ? 'Hide' : 'Show'}
                </Button>
              </InputRightElement>
            </InputGroup>

            <Flex>
              <Link to="/signup">
                <Button
                  color="teal"
                  colorScheme="white"
                  size="lg"
                  variant="outline">
                  <Text color="teal">Sign up</Text>
                </Button>
              </Link>

              <Spacer />

              <Link to="/Recipes">
                <Button colorScheme="teal" size="lg" onClick={signIn}>
                  Login
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
