import React from 'react';
import {
  Flex,
  Box,
  Input,
  Button,
  Image,
  ChakraProvider,
  extendTheme,
  Link,
  TagRightIcon,
  Spacer,
} from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import {useFormik} from 'formik';
import{auth} from '../../firebaseConfig'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';


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

const SignUp = () => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      name: '',
      password: '',
    },
    onSubmit: async (values) => {
      try {
        // Create a new user in Firebase authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        // Additional actions upon successful signup (if needed)
        navigate('/login');
      } catch (e) {
        console.log(e);
      }
    },
  });

  

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      direction="column"
      backgroundColor={'#D3D3D3'}>
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

        <FormLabel>Name</FormLabel>
        <Input
          name="name"
          id="name"
          placeholder="name"
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

        <Button mt={4} colorScheme="teal" type="submit">
          Submit
        </Button>
      </FormControl>
      </form>
    </Flex>
  );
};
export default SignUp;
