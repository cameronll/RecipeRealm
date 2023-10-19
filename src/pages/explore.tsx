import React, { useState, useEffect } from 'react';
import {db} from '../firebaseConfig';
import {collection, addDoc, doc, setDoc, getDoc, getDocs} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import {Box, Tab, TabList, TabPanel, TabPanels, Tabs} from '@chakra-ui/react';

const auth = getAuth();
const user = auth.currentUser;
var email: any;
    // if there is a user logged in...
if (user){
// store the currently logged in user's email in email
  email = user.email;
}

const Explore: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function getPosts() {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const recipesData = querySnapshot.docs.map((doc) => doc.data());
      setPosts(recipesData);
    }
    getPosts();
  }, []);

  return (
    <Box>
      <Navbar />
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Explore</Tab>
          <Tab>My Recipes</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <p>Explore stuff</p>
          </TabPanel>
          <TabPanel>
            <p>My recipes</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Explore;
