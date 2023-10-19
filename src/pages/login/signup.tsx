import React from 'react';
import {Flex, Input, Button, Stack, ButtonGroup, Box} from '@chakra-ui/react';
import {FormControl, FormLabel, FormHelperText} from '@chakra-ui/react';
import {useFormik} from 'formik';
import {auth} from '../../firebaseConfig';
import { getAuth } from "firebase/auth";
import {db} from '../../firebaseConfig';
import { doc, setDoc } from "firebase/firestore"; 
import {collection, addDoc, DocumentReference} from "firebase/firestore";
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {Link} from 'react-router-dom';
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

const SignUp = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      name: '',
      password: '',
    },
    onSubmit: async values => {
      try {
        // Create a new user in Firebase authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password,
        );

        const docRef = await setDoc(doc(db, "users", values.email), {
          email: values.email,
          name: values.name,
          username: values.username
        });
        console.log("Document written with ID: ", docRef);

        // Additional actions upon successful signup (if needed)
      } catch (e) {
        console.log(e);
      }
    },
  });

  return (
    <>
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        direction="column"
        backgroundColor={'#008080'}>
        <Box
          boxShadow="dark-lg"
          backgroundColor={'#C0C0C0'}
          p={8}
          borderWidth={2}
          borderRadius={15}
          bg="primary.50">
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
              <ButtonGroup variant="outline" spacing="6">
                <Button mt={4} colorScheme="teal" type="submit" size="lg">
                  Submit
                </Button>
                <Link to="/login">
                  <Button mt={4} colorScheme="red" size="lg">
                    Back
                  </Button>
                </Link>
              </ButtonGroup>
            </FormControl>
          </form>
        </Box>
      </Flex>
    </>
  );
};

export default SignUp;