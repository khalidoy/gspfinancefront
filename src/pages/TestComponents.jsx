import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Avatar,
  IconButton,
  Spinner,
  Badge,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Textarea,
  Alert,
  AlertDescription,
  Grid,
  GridItem,
  Center,
  Code,
  Accordion,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  SkeletonText,
  Tooltip,
  useDisclosure,
  createToaster,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
} from "@chakra-ui/react";

const TestComponents = () => {
  return (
    <Box p={4}>
      <Text>Testing components...</Text>
      <Button>Test Button</Button>
      <Card>
        <CardHeader>Test Header</CardHeader>
        <CardBody>Test Body</CardBody>
      </Card>
      <Alert>
        <AlertDescription>Test Alert</AlertDescription>
      </Alert>
      <Accordion>
        <AccordionItem>
          <AccordionItemTrigger>Test Trigger</AccordionItemTrigger>
          <AccordionItemContent>Test Content</AccordionItemContent>
        </AccordionItem>
      </Accordion>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Test Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <DialogRoot open={false}>
        <DialogContent>
          <DialogHeader>Test Dialog</DialogHeader>
          <DialogBody>Test Body</DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default TestComponents;
