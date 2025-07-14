import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Spinner,
  FormErrorMessage,
  FormHelperText,
  HStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const ClassModal = ({ show, handleClose, classe, handleSave, isSaving }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [order, setOrder] = useState(999);
  const [nameError, setNameError] = useState("");
  useEffect(() => {
    if (classe) {
      setName(classe.name || "");
      setOrder(classe.order !== undefined ? classe.order : 999);
    } else {
      setName("");
      setOrder(999);
    }
    setNameError("");
  }, [classe, show]);
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setNameError(t("please_enter_class_name"));
      return;
    }

    setNameError("");
    handleSave({
      name,
      order: parseInt(order, 10),
    });
  };
  return (
    <Modal isOpen={show} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{classe ? t("edit_class") : t("add_class")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!nameError}>
                <FormLabel>{t("class_name")}</FormLabel>
                <Input
                  type="text"
                  placeholder={t("enter_class_name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {nameError && <FormErrorMessage>{nameError}</FormErrorMessage>}
              </FormControl>

              <FormControl>
                <FormLabel>{t("display_order")}</FormLabel>
                <Input
                  type="number"
                  min="1"
                  placeholder={t("enter_display_order")}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
                <FormHelperText>
                  {t("lower_numbers_appear_first")}
                </FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose}>
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSaving}
                loadingText={t("saving")}
                spinner={<Spinner size="sm" />}
              >
                {t("save")}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ClassModal;
