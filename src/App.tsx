import * as React from 'react';
import {ChakraProvider, theme} from '@chakra-ui/react';
import Login from './pages/login/login';
import SignUp from './pages/login/signup';
import { BrowserRouter as Router, Route} from 'react-router-dom';


export const App = () => (
  <ChakraProvider theme={theme}>
    <Login />
    <SignUp />
  </ChakraProvider>
  
);


