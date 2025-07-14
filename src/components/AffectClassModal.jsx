import React from "react";
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
  Select,
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const AffectClassModal = ({
  show,
  onHide,
  selectedStudentIds,
  targetClassId,
  setTargetClassId,
  loadingClasses,
  isSaving,
  error,
  classes,
  handleAffectClass,
}) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={show} onClose={onHide} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {t("affect_selected_students", {
            count: selectedStudentIds.size,
          })}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormControl>
            <FormLabel>{t("select_target_class")}</FormLabel>
            <Select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              isDisabled={loadingClasses || isSaving}
              placeholder={t("select_a_class") + "..."}
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onHide} isDisabled={isSaving}>
              {t("cancel")}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAffectClass}
              isDisabled={!targetClassId || isSaving}
              isLoading={isSaving}
              loadingText={t("affecting") + "..."}
            >
              {t("affect_class")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AffectClassModal;
