import {Box, Center, Text} from '@chakra-ui/react';
import Post from './posts';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Feed: React.FC = () => {
  return (
    <Center>
      <Box px="4">{/* links to posts go here */}</Box>
    </Center>
  );
};

export default Feed;
