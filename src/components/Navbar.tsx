import React from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Image,
} from '@chakra-ui/react';
import {HamburgerIcon, CloseIcon} from '@chakra-ui/icons';
import {Link} from 'react-router-dom';

interface NavLinkProps {
  href: string; // Define href as a prop
  children: React.ReactNode;
}

const Links = [
  {text: 'Calendar', href: '/calendar'},
  {text: 'Profile', href: '/profile'},
  {text: 'Recipe Book', href: '/recipes'},
  {text: 'Explore', href: '/explore'},
  {text: 'My Friends', href: '/friends'},
];

const NavLink = (props: NavLinkProps) => {
  const {children, href} = props;

  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      href={href} // Use the href prop
    >
      {children}
    </Box>
  );
};

const Navbar: React.FC = () => {
  const {isOpen, onOpen, onClose} = useDisclosure();

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{md: 'none'}}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Image
              borderRadius="40px"
              src="newlogoteal.png"
              alt="Logo"
              w={100}
            />
            <HStack as={'nav'} spacing={4} display={{base: 'none', md: 'flex'}}>
              {Links.map(link => (
                <NavLink key={link.text} href={link.href}>
                  {link.text}
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'} height="17">
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar size={'sm'} src={'../../public/brodyexample.png'} />
              </MenuButton>
              <MenuList>
                <MenuItem>Settings</MenuItem>
                <MenuItem>Add Friends</MenuItem>
                <MenuDivider />
                <Link to="/login">
                  <MenuItem>Logout</MenuItem>
                </Link>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{md: 'none'}}>
            <Stack as={'nav'} spacing={4}>
              {Links.map(link => (
                <NavLink key={link.text} href={link.href}>
                  {link.text}
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default Navbar;
