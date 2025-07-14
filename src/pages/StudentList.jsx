// src/pages/StudentList.jsx

import React, { useState, useEffect } from "react";
import { Button, Table, Spinner, Alert } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import StudentModal from "../components/StudentModal";

const StudentList = ({ students, classes, months }) => {
  const { t } = useTranslation();
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [originalStudent, setOriginalStudent] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(false);

  const handleOpenStudentModal = (student) => {
    setSelectedStudent(student ? { ...student } : { payments: {} });
    setOriginalStudent(student || null);
    setShowStudentModal(true);
  };

  const handleCloseStudentModal = () => {
    setShowStudentModal(false);
    setSelectedStudent(null);
    setOriginalStudent(null);
    setError("");
  };

  const handleSaveStudent = async () => {
    setIsSaving(true);
    try {
      // Save logic here
    } catch (err) {
      setError(t("error_saving_student"));
    } finally {
      setIsSaving(false);
      handleCloseStudentModal();
    }
  };

  const handleDeleteStudent = async (student) => {
    setIsSaving(true);
    try {
      // Delete logic here
    } catch (err) {
      setError(t("error_deleting_student"));
    } finally {
      setIsSaving(false);
      handleCloseStudentModal();
    }
  };

  return (
    <div>
      <h1>{t("student_list")}</h1>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      <Button onClick={() => handleOpenStudentModal(null)}>
        {t("add_new_student")}
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t("name")}</th>
            <th>{t("class")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>
                {classes.find((c) => c._id === student.classe)?.name ||
                  t("class_not_found")}
              </td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => handleOpenStudentModal(student)}
                >
                  {t("edit")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <StudentModal
        show={showStudentModal}
        handleClose={handleCloseStudentModal}
        student={selectedStudent}
        setStudent={setSelectedStudent}
        originalStudent={originalStudent}
        handleSave={handleSaveStudent}
        handleDelete={handleDeleteStudent}
        months={months}
        autocompleteEnabled={autocompleteEnabled}
        setAutocompleteEnabled={setAutocompleteEnabled}
        error={error}
        setError={setError}
        isSaving={isSaving}
        classes={classes}
        allStudents={students} // Pass all students to check class dependencies
      />
    </div>
  );
};

export default StudentList;
