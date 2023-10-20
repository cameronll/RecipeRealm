import React, { useState, useEffect } from 'react';
import {db} from '../firebaseConfig';
import {collection, addDoc, doc, setDoc, getDoc, getDocs, where, query, orderBy} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import {Box, Button, Tab, TabList, TabPanel, TabPanels, Tabs} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

const Explore: React.FC = () => {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [friendsPosts, setFriendsPosts] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [following, setFollowing] = useState<string[]>([]);
  const [following_storage, setFollowing_Storage] = useState<string[]>([]);
  var auth:any;
  var user:any;

  useEffect(() => {
    auth = getAuth();
  }, []);

  useEffect(() => {
    user = auth.currentUser;
    console.log(user);
    const email_from_storage: any = window.localStorage.getItem('EMAIL');
    if (email_from_storage !== null) {
      setEmail(JSON.parse(email_from_storage));
    }
    if (user){
      setEmail(user.email);
    }
  }, [auth]);

  useEffect(() => {
    console.clear();
    if (user) {
      setEmail(user.email);
      window.localStorage.setItem('EMAIL', JSON.stringify(email));
    }
    async function toStorage(){
      console.log(email);
      const getUser = doc(db, "users", email);
      const getUserData = await getDoc(getUser);
      const userFollowing = getUserData?.data()?.following;
      console.log(userFollowing);
      localStorage.setItem('FOLLOWING', JSON.stringify(userFollowing));
      setFollowing(userFollowing);
    }
    toStorage();
  }, [email]);

  useEffect(() => {
    async function getData(){
      const allPostsQuery = query(collection(db, "posts"), orderBy("date_time"));
      const allPostsDocs = await getDocs(allPostsQuery);
      const allPostsData = allPostsDocs.docs.map((doc) => doc.data());
      setAllPosts(allPostsData);
    
      if (following){
        if (following.indexOf("btingle1@uncc.edu") !== -1){
          try{
            console.log(following);
            const friendsPostsQuery = query(collection(db, "posts"), where("email", "in", ['btingle1@uncc.edu']), orderBy("date_time"));
            const friendsPostsDocs = await getDocs(friendsPostsQuery);
            const friendsPostsData = friendsPostsDocs.docs.map((doc) => doc.data());
            console.log(friendsPostsData);
            setFriendsPosts(friendsPostsData);
          }
          catch(error){
            console.error("Error");
          }
        }
     }
    }
    getData();
  }, [following]);


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
      <Button
        onClick={() => {
          console.log("All Posts");
          for (let i = 0; i < allPosts.length; i++){
            console.log(allPosts[i]?.title);
          }
          console.log("Friends");
          for (let i = 0; i < friendsPosts.length; i++){
            console.log(friendsPosts[i]?.title);
          }
        }}>
          Test
        </Button>
    </Box>
  );
};

export default Explore;
