import React, {useState} from 'react';
import {
  Flex,
  Box,
  Input,
  Button,
  Image,  
  Spacer,
} from '@chakra-ui/react';
import {Router, Route, Routes} from 'react-router-dom';

//import Calendar from '../calendar';
//import Recipes from '../myrecipes';
import Profile from '../profile';
import Navbar from '../../components/Navbar';
import { signInWithEmailAndPassword } from "firebase/auth";
import{auth} from '../../firebaseConfig'
import { Link } from 'react-router-dom';
import{useNavigate} from 'react-router-dom';

const Login = () => {

  const [email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const navigate = useNavigate();

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();// doesnt reload page
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigate("/")
      })
      .catch((e) => {
        console.log(e);
      });
  };

  
 
  return (
    
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      direction="column"
      backgroundColor={'#D3D3D3'}>
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
         
        <Input placeholder="Username" value={email}  onChange={(e) => setEmail(e.target.value)} variant="filled" mb={4} />

        <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} variant="filled" type="password" mb={6} />

        <Flex>
          <Button colorScheme="teal" size="lg" onClick={signIn}>
            Login
          </Button>

          <Spacer />

          <Link to='/signup'>
          <Button colorScheme="teal" size="lg" >
            Sign Up!
          </Button>
          </Link>
          
        </Flex>
        </form>
      </Box>
      
    </Flex>
    
    
  );
};
export default Login;
