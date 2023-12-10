import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
  Image,
  Center,
} from '@chakra-ui/react';
import {FaInstagram, FaTwitter, FaYoutube} from 'react-icons/fa';
import {ReactNode} from 'react';

//Social Button butotn 
const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      // uses the Colormode value
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}>
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function SmallWithLogoLeft() {
  return (
    <div>
      <Box
        bg={useColorModeValue('gray.50', 'gray.900')}
        color={useColorModeValue('gray.700', 'gray.200')}>
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{base: 'column', md: 'row'}}
          spacing={4}
          justify={{base: 'center', md: 'space-between'}}
          align={{base: 'center', md: 'center'}}>
          <Stack>
            <Image
              borderRadius="30px"
              src="newlogoteal.png"
              alt="Logo"
              w={150}
              mb={15}
            />
          </Stack>
          <Stack text-align={Center}>
            <Text>© 2023 Recipe Realm Full Stack Studs</Text>
            <div text-align={Center}>Elevate Your Home Cookbook Today!</div>
          </Stack>
          <Stack direction={'row'} spacing={6}>
            <SocialButton label={'Twitter'} href={'#'}>
              <FaTwitter />
            </SocialButton>
            <SocialButton label={'YouTube'} href={'#'}>
              <FaYoutube />
            </SocialButton>
            <SocialButton label={'Instagram'} href={'#'}>
              <FaInstagram />
            </SocialButton>
          </Stack>
        </Container>
      </Box>
    </div>
  );
}
