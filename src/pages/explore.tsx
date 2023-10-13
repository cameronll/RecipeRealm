import React from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import {Box, Tab, TabList, TabPanel, TabPanels, Tabs} from '@chakra-ui/react';

const Explore: React.FC = () => {
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
