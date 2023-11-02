import React from 'react';
import {Calendar, Whisper, Popover, Badge} from 'rsuite';
import Navbar from '../components/Navbar';
import {
  Box,
  Button,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  VStack,
  Flex,
  Stack,
  Text,
  useBreakpointValue,
  Center,
  Image,
} from '@chakra-ui/react';

function getTodoList(date: {getDate: () => any}) {
  const day = date.getDate();

  switch (day) {
    case 10:
      return [
        {time: '10:30 am', title: 'Meeting'},
        {time: '12:00 pm', title: 'Lunch'},
      ];
    case 15:
      return [
        {time: '09:30 pm', title: 'Products Introduction Meeting'},
        {time: '12:30 pm', title: 'Client entertaining'},
        {time: '02:00 pm', title: 'Product design discussion'},
        {time: '05:00 pm', title: 'Product test and acceptance'},
        {time: '06:30 pm', title: 'Reporting'},
        {time: '10:00 pm', title: 'Going home to walk the dog'},
      ];
    default:
      return [];
  }
}

const CalendarPage: React.FC = () => {
  // function renderCell(date: any) {
  //   const list = getTodoList(date);
  //   const displayList = list.filter((item, index) => index < 2);

  //   if (list.length) {
  //     const moreCount = list.length - displayList.length;
  //     const moreItem = (
  //       <li>
  //         <Whisper
  //           placement="top"
  //           trigger="click"
  //           speaker={
  //             <Popover>
  //               {list.map((item, index) => (
  //                 <p key={index}>
  //                   <b>{item.time}</b> - {item.title}
  //                 </p>
  //               ))}
  //             </Popover>
  //           }>
  //           <a>{moreCount} more</a>
  //         </Whisper>
  //       </li>
  //     );

  //     return (
  //       <>
  //         {/* <ul className="calendar-todo-list">
  //           {displayList.map((item, index) => (
  //             <li key={index}>
  //               <Badge /> <b>{item.time}</b> - {item.title}
  //             </li>
  //           ))}
  //           {moreCount ? moreItem : null}
  //         </ul> */}
  //       </>
  //     );
  //   }

  //   return null;
  // }

  return (
    <Box>
      <Navbar />
      <Flex
        w={'full'}
        h={'100'}
        backgroundSize={'cover'}
        backgroundPosition={'center center'}
        alignContent={'flex-end'}
        backgroundColor="rgba(0, 128, 128, 0.7)">
        <VStack
          w={'full'}
          px={useBreakpointValue({base: 4, md: 8})}
          bgGradient={'linear(to-r, blackAlpha.600, transparent)'}>
          <Stack maxW={'2xl'} spacing={6}>
            <Text textAlign="center" fontSize="6xl" as="b">
              Calendar Page
            </Text>
          </Stack>
        </VStack>
      </Flex>
      <Image src="https://i.etsystatic.com/18744872/r/il/89ee05/5410420625/il_794xN.5410420625_ltih.jpg"></Image>
    </Box>
  );
};

export default CalendarPage;
