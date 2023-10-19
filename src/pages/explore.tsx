import React, { useState, useEffect } from 'react';
import {db} from '../firebaseConfig';
import {collection, addDoc, doc, setDoc, getDoc, getDocs, where, query} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import {Box, Button, Tab, TabList, TabPanel, TabPanels, Tabs} from '@chakra-ui/react';

const auth = getAuth();
const user = auth.currentUser;

const Explore: React.FC = () => {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [friendsPosts, setFriendsPosts] = useState<any[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const email_from_storage:any = window.localStorage.getItem('EMAIL')
    if (email_from_storage !== 'null'){
      setEmail(JSON.parse(email_from_storage));
    }
  }, [])

  useEffect(() => {
    if (user){
      setEmail(user.email);
    }
    window.localStorage.setItem('EMAIL', JSON.stringify(email));

    async function getAllPosts() {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsData = querySnapshot.docs.map((doc) => doc.data());
      setAllPosts(postsData);
    }
    async function getFriendsPosts(){
      const q = query(collection(db, "posts"), where("likes", "==", 0));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => doc.data());
      setFriendsPosts(postsData);
    }
    console.clear();
    getFriendsPosts();
    getAllPosts();
  }, [email]);

  const allPostsList = allPosts.map((post) => <li key="{post.title}">{post.title}</li>);
  const friendsPostsList = friendsPosts.map((post) => <li key="{post.title}">{post.title}</li>);
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
            <ul>{allPostsList}</ul>
          </TabPanel>
          <TabPanel>
            <p>My recipes</p>
            <ul>{friendsPostsList}</ul>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Button
        onClick={() => {
          for (let i = 0; i < allPosts.length; i++){
            console.log(allPosts[i].description);
          }
        }}>
          Test
        </Button>
    </Box>
  );
};

export default Explore;
