// src/Home.jsx

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./Home.css";
import { Button, Alert } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";

import SchoolYearModal from "./../components/SchoolYearModal";
import StudentModal from "./../components/StudentModal";
import StudentStatistics from "./../components/StudentStatistics";
import Filters from "./../components/Filters";
import StudentTable from "./../components/StudentTable";

// Configure axios with a base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

const currentUserId = "670ac94fc3d3342280ec3d62";

const months = [
  { key: "m9", displayName: "M9", monthNum: 9, order: 1 },
  { key: "m10", displayName: "M10", monthNum: 10, order: 2 },
  { key: "m11", displayName: "M11", monthNum: 11, order: 3 },
  { key: "m12", displayName: "M12", monthNum: 12, order: 4 },
  { key: "m1", displayName: "M1", monthNum: 1, order: 5 },
  { key: "m2", displayName: "M2", monthNum: 2, order: 6 },
  { key: "m3", displayName: "M3", monthNum: 3, order: 7 },
  { key: "m4", displayName: "M4", monthNum: 4, order: 8 },
  { key: "m5", displayName: "M5", monthNum: 5, order: 9 },
  { key: "m6", displayName: "M6", monthNum: 6, order: 10 },
];

function Home() {
  const { t, i18n } = useTranslation();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // Default to 'active'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [originalStudentData, setOriginalStudentData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSchoolYears, setLoadingSchoolYears] = useState(false);
  const [error, setError] = useState("");
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(false);

  // School Year Period modal state
  const [showNewSchoolYearModal, setShowNewSchoolYearModal] = useState(false);
  const [schoolYearForm, setSchoolYearForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    error: "",
  });
  const [creatingSchoolYear, setCreatingSchoolYear] = useState(false);

  const [schoolYearPeriods, setSchoolYearPeriods] = useState([]);
  const [selectedSchoolYearPeriod, setSelectedSchoolYearPeriod] = useState("");

  // New state for saving
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSchoolYearPeriods = async () => {
      setLoadingSchoolYears(true);
      try {
        const response = await api.get("/schoolyearperiods/");
        const periods = response.data.data;
        if (!periods || periods.length === 0) {
          setError(t("no_school_year_periods"));
          setLoadingSchoolYears(false);
          return;
        }

        // Sort the periods by start_date in descending order
        periods.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        setSchoolYearPeriods(periods);

        // Set the selectedSchoolYearPeriod to the latest one
        setSelectedSchoolYearPeriod(periods[0]._id.$oid || periods[0]._id);

        setLoadingSchoolYears(false);
      } catch (err) {
        console.error("Error fetching school year periods:", err);
        setError(t("failed_to_fetch_school_year_periods"));
        setLoadingSchoolYears(false);
      }
    };

    fetchSchoolYearPeriods();
  }, [t]);

  const fetchStudents = async (schoolYearPeriod) => {
    if (!schoolYearPeriod) {
      // Do not fetch students until a school year period is selected
      return;
    }

    setLoadingStudents(true);
    setError("");
    try {
      const params = { schoolyearperiod: schoolYearPeriod };
      const response = await api.get("/students", { params });

      if (!response.data || !response.data.students) {
        throw new Error("Invalid response structure.");
      }

      const processedData = response.data.students.map((student) => ({
        ...student,
        _id: student._id && student._id.$oid ? student._id.$oid : student._id,
        isNew: student.isNew || false,
        isLeft: student.isLeft || false,
        payments: student.payments || {
          real_payments: { insurance_real: 0 },
          agreed_payments: {},
        },
      }));

      setStudents(processedData);
      setLoadingStudents(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(t("failed_to_fetch_students"));
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents(selectedSchoolYearPeriod);
  }, [selectedSchoolYearPeriod]);

  // Function to open the New School Year Period modal
  const handleOpenNewSchoolYearModal = () => {
    setSchoolYearForm({
      name: "",
      startDate: "",
      endDate: "",
      error: "",
    });
    setShowNewSchoolYearModal(true);
  };

  // Function to close the New School Year Period modal
  const handleCloseNewSchoolYearModal = () => {
    setShowNewSchoolYearModal(false);
  };

  // Function to handle the submission of the new School Year Period
  const handleCreateSchoolYearPeriod = async (e) => {
    e.preventDefault();
    const { name, startDate, endDate } = schoolYearForm;

    // Basic validation
    if (!name || !startDate || !endDate) {
      setSchoolYearForm((prev) => ({
        ...prev,
        error: t("all_fields_required"),
      }));
      return;
    }

    // Validate date ranges
    if (new Date(startDate) >= new Date(endDate)) {
      setSchoolYearForm((prev) => ({
        ...prev,
        error: t("start_date_before_end_date"),
      }));
      return;
    }

    setCreatingSchoolYear(true);
    setSchoolYearForm((prev) => ({ ...prev, error: "" }));

    try {
      const payload = {
        name,
        start_date: startDate,
        end_date: endDate,
      };

      const response = await api.post("/schoolyearperiods/", payload);

      if (response.data.status === "success") {
        // Add the new period to state
        const newPeriod = response.data.data;
        setSchoolYearPeriods((prev) => [newPeriod, ...prev]);

        // Set the selectedSchoolYearPeriod to the newly created one
        setSelectedSchoolYearPeriod(newPeriod.id || newPeriod._id);

        // Close the modal
        setShowNewSchoolYearModal(false);
      } else {
        setSchoolYearForm((prev) => ({
          ...prev,
          error:
            response.data.message || t("failed_to_create_school_year_period"),
        }));
      }
    } catch (error) {
      console.error("Error creating School Year Period:", error);
      setSchoolYearForm((prev) => ({
        ...prev,
        error:
          error.response?.data?.message ||
          t("error_creating_school_year_period"),
      }));
    } finally {
      setCreatingSchoolYear(false);
    }
  };

  const handleRowClick = (student) => {
    setSelectedStudent({ ...student });
    setOriginalStudentData(JSON.parse(JSON.stringify(student)));
    setAutocompleteEnabled(false);
    setError("");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setOriginalStudentData(null);
    setAutocompleteEnabled(false);
    setError("");
  };

  const handleDelete = async (student) => {
    if (!window.confirm(t("delete_confirmation", { name: student.name }))) {
      return;
    }
    try {
      await api.put(`/students/${student._id}/delete`);
      setStudents((prevStudents) =>
        prevStudents.filter((s) => s._id !== student._id)
      );
      handleClose();
    } catch (error) {
      console.error("There was an error deleting the student!", error);
      setError(t("failed_to_delete_student"));
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedStudent) {
      handleClose();
      return;
    }

    // Start saving
    setIsSaving(true);

    try {
      if (!originalStudentData) {
        // Adding a new student
        const newStudentData = {
          name: selectedStudent.name,
          joined_month: selectedStudent.joined_month || 9, // Default to month 9 (September)
          payments: selectedStudent.payments,
          observations: selectedStudent.observations || "",
          school_year_id: selectedSchoolYearPeriod, // Use the selected school year
          isNew: selectedStudent.isNew,
          isLeft: selectedStudent.isLeft,
        };
        // Post request to create a new student
        await api.post("/students", newStudentData);

        // Re-fetch the students after adding the new student
        await fetchStudents(selectedSchoolYearPeriod);
      } else {
        // Editing an existing student
        const isEqual =
          JSON.stringify(selectedStudent) ===
          JSON.stringify(originalStudentData);
        if (!isEqual) {
          const realChangedPayments = [];
          const agreedChangedPayments = {};

          // Detect changes in real payments, ignoring transport-related fields
          for (let key in selectedStudent.payments.real_payments) {
            if (key.includes("transport")) continue;
            if (
              selectedStudent.payments.real_payments[key] !==
              originalStudentData.payments.real_payments[key]
            ) {
              const payment_type =
                key === "insurance_real" ? "insurance" : "monthly";
              const paymentObj = {
                student_id: selectedStudent._id,
                user_id: currentUserId,
                amount: selectedStudent.payments.real_payments[key],
                payment_type: payment_type,
              };
              if (payment_type !== "insurance") {
                const monthKey = key.split("_")[0];
                const monthNum = parseInt(monthKey.substring(1));
                paymentObj.month = monthNum;
              }
              realChangedPayments.push(paymentObj);
            }
          }

          // Detect changes in agreed payments, ignoring transport-related fields
          for (let key in selectedStudent.payments.agreed_payments) {
            if (key.includes("transport")) continue;
            if (
              selectedStudent.payments.agreed_payments[key] !==
              originalStudentData.payments.agreed_payments[key]
            ) {
              agreedChangedPayments[key] =
                selectedStudent.payments.agreed_payments[key];
            }
          }

          // Update real payments
          for (let payment of realChangedPayments) {
            await api.post("/payments/create_or_update", payment);
          }

          // Update agreed payments
          if (Object.keys(agreedChangedPayments).length > 0) {
            const agreedPaymentsNumber = {};
            for (let key in agreedChangedPayments) {
              agreedPaymentsNumber[key] =
                Number(agreedChangedPayments[key]) || 0;
            }

            await api.post("/payments/agreed_changes", {
              student_id: selectedStudent._id,
              user_id: currentUserId,
              agreed_payments: agreedPaymentsNumber,
              date: new Date().toISOString(),
            });
          }

          // Update student basic info
          const studentUpdateData = {
            name: selectedStudent.name,
            observations: selectedStudent.observations,
            joined_month: selectedStudent.joined_month,
            isNew: selectedStudent.isNew,
            isLeft: selectedStudent.isLeft,
          };

          await api.put(`/students/${selectedStudent._id}`, studentUpdateData);

          setStudents((prevStudents) =>
            prevStudents.map((s) =>
              s._id === selectedStudent._id ? selectedStudent : s
            )
          );
        }
      }
      // Close the modal after saving changes
      handleClose();
    } catch (error) {
      console.error("There was an error saving the changes!", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(
          `${t("failed_to_save_changes")}: ${error.response.data.message}`
        );
      } else {
        setError(t("failed_to_save_changes"));
      }
    } finally {
      // End saving
      setIsSaving(false);
    }
  };

  const handleAddNewStudent = () => {
    const defaultPayments = {
      agreed_payments: {
        m9_agreed: "0",
        m10_agreed: "0",
        m11_agreed: "0",
        m12_agreed: "0",
        m1_agreed: "0",
        m2_agreed: "0",
        m3_agreed: "0",
        m4_agreed: "0",
        m5_agreed: "0",
        m6_agreed: "0",
        insurance_agreed: "0",
      },
      real_payments: {
        m9_real: 0,
        m10_real: 0,
        m11_real: 0,
        m12_real: 0,
        m1_real: 0,
        m2_real: 0,
        m3_real: 0,
        m4_real: 0,
        m5_real: 0,
        m6_real: 0,
        insurance_real: 0,
      },
    };

    setSelectedStudent({
      name: "",
      joined_month: 9, // Default to September
      payments: defaultPayments,
      observations: "",
      school_year_id: selectedSchoolYearPeriod,
      isNew: false,
      isLeft: false,
    });
    setOriginalStudentData(null); // Reset the original data for new student
    setAutocompleteEnabled(false); // Ensure autocomplete is in the desired default state
    setError("");
    setShowModal(true);
  };

  const handleSchoolYearChange = (e) => {
    const selectedId = e.target.value;
    setSelectedSchoolYearPeriod(selectedId);
    fetchStudents(selectedId);
  };

  // Calculate statistics using isNew and isLeft
  const leftStudents = useMemo(
    () => students.filter((s) => s.isLeft).length,
    [students]
  );
  const newStudents = useMemo(
    () => students.filter((s) => s.isNew).length,
    [students]
  );
  const unregisteredStudents = useMemo(
    () =>
      students.filter((s) => s.payments.real_payments.insurance_real === 0)
        .length - leftStudents,
    [students, leftStudents]
  );
  const registeredStudents = useMemo(
    () =>
      students.filter((s) => s.payments.real_payments.insurance_real > 0)
        .length,
    [students]
  );

  // Filtering students based on search term and status
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearchTerm = student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesStatus = true;

      if (statusFilter === "active") {
        matchesStatus = !student.isLeft;
      } else if (statusFilter === "left") {
        matchesStatus = student.isLeft;
      } else if (statusFilter === "new") {
        matchesStatus = student.isNew;
      } // else statusFilter === "all", so matchesStatus remains true

      return matchesSearchTerm && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  // Inline Edit Handler
  const handleInlineEdit = async (studentId, key, value) => {
    const updatedStudents = students.map((student) => {
      if (student._id === studentId) {
        const updatedPayments = { ...student.payments.real_payments };
        updatedPayments[key] = Number(value) || 0;
        return {
          ...student,
          payments: {
            ...student.payments,
            real_payments: updatedPayments,
          },
        };
      }
      return student;
    });

    setStudents(updatedStudents);

    try {
      // Determine payment type and month
      if (key.endsWith("insurance_real")) {
        // Insurance payment
        const payment_type = "insurance";
        const paymentObj = {
          student_id: studentId,
          user_id: currentUserId,
          amount: Number(value) || 0,
          payment_type: payment_type,
          // No month for insurance
        };

        await api.post("/payments/create_or_update", paymentObj);
      } else if (key.endsWith("real") && !key.includes("transport")) {
        // Monthly payment
        const payment_type = "monthly";
        const monthKey = key.split("_")[0]; // e.g., 'm9'
        const monthNum = parseInt(monthKey.substring(1)); // e.g., 9

        const paymentObj = {
          student_id: studentId,
          user_id: currentUserId,
          amount: Number(value) || 0,
          payment_type: payment_type,
          month: monthNum,
        };

        await api.post("/payments/create_or_update", paymentObj);
      }
    } catch (err) {
      console.error("Error updating payment:", err);
      setError(t("failed_to_update_payment"));
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{t("student_data")}</h1>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {/* Student Statistics */}
      <StudentStatistics
        left={leftStudents}
        newCount={newStudents}
        unregistered={unregisteredStudents}
        registered={registeredStudents}
      />

      {/* Filters and Search */}
      <Filters
        loadingSchoolYears={loadingSchoolYears}
        schoolYearPeriods={schoolYearPeriods}
        selectedSchoolYearPeriod={selectedSchoolYearPeriod}
        handleSchoolYearChange={handleSchoolYearChange}
        handleOpenNewSchoolYearModal={handleOpenNewSchoolYearModal}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Add New Student Button */}
      <Button
        variant="primary"
        className="mb-4"
        onClick={handleAddNewStudent}
        disabled={!selectedSchoolYearPeriod || isSaving} // Disable if no school year or saving
      >
        <FaPlus className="mr-2" />
        {t("add_new_student")}
      </Button>

      {/* Student Table */}
      <StudentTable
        students={students}
        months={months}
        handleRowClick={handleRowClick}
        filteredStudents={filteredStudents}
        loadingStudents={loadingStudents}
        error={error}
        handleInlineEdit={handleInlineEdit}
      />

      {/* New School Year Period Modal */}
      <SchoolYearModal
        show={showNewSchoolYearModal}
        handleClose={handleCloseNewSchoolYearModal}
        handleCreate={handleCreateSchoolYearPeriod}
        creating={creatingSchoolYear}
        error={schoolYearForm.error}
        formData={{
          name: schoolYearForm.name,
          startDate: schoolYearForm.startDate,
          endDate: schoolYearForm.endDate,
        }}
        setFormData={(data) =>
          setSchoolYearForm((prev) => ({ ...prev, ...data }))
        }
      />

      {/* Student Modal */}
      {selectedStudent && (
        <StudentModal
          show={showModal}
          handleClose={handleClose}
          student={selectedStudent}
          setStudent={setSelectedStudent}
          originalStudent={originalStudentData}
          handleSave={handleSaveChanges}
          handleDelete={handleDelete}
          months={months}
          autocompleteEnabled={autocompleteEnabled}
          setAutocompleteEnabled={setAutocompleteEnabled}
          error={error}
          setError={setError}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

export default Home;
