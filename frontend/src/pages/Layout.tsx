import { Box } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box minH="100vh" w="100vw" overflowX="hidden">
      <Navbar />
      {children}
    </Box>
  );
};

export default Layout;
