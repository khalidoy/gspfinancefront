import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Form, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import axios from "axios";

const StudentTransferModal = ({
  show,
  students,
  classId,
  onClose,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();
  const [targetClass, setTargetClass] = useState("");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);

  // Fetch available classes for transfer
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/classes`
        );
        if (response.data.status === "success") {
          // Filter out the current class
          const classes = response.data.data.filter((c) => c._id !== classId);
          setAvailableClasses(classes);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        onError(t("error_fetching_classes"));
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchClasses();
    }
  }, [classId, onError, t, show]);

  // Reset form when modal is opened
  useEffect(() => {
    if (show) {
      setTargetClass("");
    }
  }, [show]);

  // Handle class selection change
  const handleClassChange = (e) => {
    setTargetClass(e.target.value);
  };

  // Transfer all students to the selected class
  const handleTransferStudents = async () => {
    if (!targetClass) {
      onError(t("please_select_target_class"));
      return;
    }

    try {
      setTransferring(true);

      // Update each student's class
      const transferPromises = students.map((student) =>
        axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/students/${student.id}`,
          { classe: targetClass }
        )
      );

      await Promise.all(transferPromises);

      // Now we can try to delete the class again
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/classes/${classId}?force=true`
      );

      if (response.data.status === "success") {
        onSuccess();
      }
    } catch (err) {
      console.error("Error transferring students:", err);
      onError(t("error_transferring_students"));
    } finally {
      setTransferring(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t("cannot_delete_class")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3">
          {t("class_has_students", { count: students ? students.length : 0 })}
        </p>

        {students && students.length > 0 && (
          <Table striped bordered hover size="sm" className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("student_name")}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <div className="mt-4">
          <h6>{t("transfer_options")}:</h6>

          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">{t("loading_classes")}</span>
            </div>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>{t("select_target_class")}</Form.Label>
              <Form.Select
                value={targetClass}
                onChange={handleClassChange}
                disabled={transferring}
              >
                <option value="">{t("choose_class")}</option>
                {availableClasses.map((classe) => (
                  <option key={classe._id} value={classe._id}>
                    {classe.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={transferring}
        >
          {t("cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={handleTransferStudents}
          disabled={!targetClass || transferring || loading}
        >
          {transferring ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t("transferring")}
            </>
          ) : (
            t("transfer_and_delete")
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StudentTransferModal;
