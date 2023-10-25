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
  const email = JSON.parse(localStorage.getItem('EMAIL') as string)

  useEffect(() => {
    async function getData(){
      if (localStorage.getItem('FOLLOWING') === null){
        console.log(email);
        const getUser = doc(db, "users/", email);
        const getUserData = await getDoc(getUser);
        const userFollowing = getUserData?.data()?.following;
        console.log(userFollowing);
        localStorage.setItem('FOLLOWING', JSON.stringify(userFollowing));
      }

      const allPostsQuery = query(collection(db, "posts"), orderBy("date_time", "desc"));
      const allPostsDocs = await getDocs(allPostsQuery);
      const allPostsData = allPostsDocs.docs.map((doc) => doc.data());
      setAllPosts(allPostsData);
    
      const following:string[] = JSON.parse(localStorage.getItem('FOLLOWING') as string);
      const friendsPostsQuery = query(collection(db, "posts"), where("email", "in", following), orderBy("date_time", "desc"));
      const friendsPostsDocs = await getDocs(friendsPostsQuery);
      const friendsPostsData = friendsPostsDocs.docs.map((doc) => doc.data());
      setFriendsPosts(friendsPostsData);
      }
    getData();
  }, []);

  const allPostsList = allPosts.map(post => (
    <li key="{post.title}">{["Title: ", post?.title, "          Posted: ", post?.date_time.toDate().toString()]}</li>
  ));
  const friendsPostsList = friendsPosts.map(post => (
    <li key="{post.title}">{["Title: ", post?.title, "          Posted: ", post?.date_time.toDate().toString()]}</li>
  ));
  return (
    <Box>
      <Navbar />
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Explore</Tab>
          <Tab>Friends</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <p>Explore</p>
            {allPostsList}
          </TabPanel>
          <TabPanel>
            <p>Friends</p>
            {friendsPostsList}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Explore;
