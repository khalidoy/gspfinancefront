import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Alert,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faUserGroup,
  faGripVertical,
  faArrowUp,
  faArrowDown,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ClassModal from "../components/ClassModal";
import StudentTransferModal from "../components/StudentTransferAlert";
import "./ClassesPage.css";
import { flushSync } from "react-dom";

const tableRowStyle = {
  cursor: "pointer",
};

const normalizeClasse = (classe) => {
  if (classe && classe._id && typeof classe._id === "string") {
    return { ...classe, _id: { $oid: classe._id } };
  }
  return classe;
};

const ClassesPage = () => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [studentsInClass, setStudentsInClass] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [studentCounts, setStudentCounts] = useState({});
  const [schoolYearPeriods, setSchoolYearPeriods] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [localClasses, setLocalClasses] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + "/classes";
  const STUDENTS_API_URL = process.env.REACT_APP_BACKEND_URL + "/students";
  const SCHOOL_YEARS_API_URL =
    process.env.REACT_APP_BACKEND_URL + "/schoolyearperiods";

  const fetchSchoolYearPeriods = async () => {
    try {
      const response = await axios.get(`${SCHOOL_YEARS_API_URL}`);
      if (response.data.status === "success") {
        setSchoolYearPeriods(response.data.data);

        const currentSchoolYear = sessionStorage.getItem("currentSchoolYear");
        if (currentSchoolYear) {
          setSelectedSchoolYear(currentSchoolYear);
        } else if (response.data.data.length > 0) {
          setSelectedSchoolYear(response.data.data[0]._id.$oid);
        }
      }
    } catch (err) {
      console.error("Error fetching school year periods:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}`);
      if (response.data.status === "success") {
        const sortedClasses = response.data.data
          .map(normalizeClasse)
          .sort((a, b) => {
            if (a.order !== b.order) {
              return a.order - b.order;
            }
            return a.name.localeCompare(b.name);
          });
        setClasses(sortedClasses);
        setLocalClasses(sortedClasses);
        setHasOrderChanges(false);
        if (selectedSchoolYear) {
          fetchStudentCounts(sortedClasses);
        }
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError(t("error_fetching_classes"));
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCounts = async (classesList) => {
    try {
      if (!selectedSchoolYear) {
        console.error("No school year selected");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/counts?school_year_id=${selectedSchoolYear}`
      );

      if (response.data.status === "success") {
        setStudentCounts(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching student counts:", err);
    }
  };

  const fetchClassStudents = async (classId) => {
    try {
      setLoadingStudents(true);
      if (!selectedSchoolYear) {
        console.error("No school year selected");
        return;
      }

      const response = await axios.get(
        `${STUDENTS_API_URL}?schoolyearperiod=${selectedSchoolYear}`
      );

      if (response.data && response.data.students) {
        const filteredStudents = response.data.students.filter(
          (student) => student.classe && student.classe.id === classId
        );
        setClassStudents(filteredStudents);
      } else {
        setClassStudents([]);
      }
    } catch (err) {
      console.error("Error fetching class students:", err);
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSchoolYearChange = (e) => {
    const newSchoolYearId = e.target.value;
    setSelectedSchoolYear(newSchoolYearId);
    sessionStorage.setItem("currentSchoolYear", newSchoolYearId);
    if (classes.length > 0) {
      fetchStudentCounts(classes);
    }
  };

  useEffect(() => {
    fetchSchoolYearPeriods();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedSchoolYear && classes.length > 0) {
      fetchStudentCounts(classes);
    }
  }, [selectedSchoolYear]);

  const getObjectId = (idObject) => {
    if (idObject && typeof idObject === "object") {
      if (idObject.$oid) return idObject.$oid;
      if (typeof idObject.toString === "function") return idObject.toString();
    }
    return String(idObject || "");
  };

  const getSafeId = (idObject) => {
    const id = getObjectId(idObject);
    return id.replace(/[^a-zA-Z0-9-_]/g, "_");
  };

  const handleAddClass = () => {
    setCurrentClass(null);
    setShowModal(true);
  };

  const handleEditClass = (classe) => {
    setCurrentClass(classe);
    setShowModal(true);
  };

  const handleSaveClass = async (classData) => {
    try {
      setIsSaving(true);
      setError("");
      if (currentClass && currentClass._id) {
        const id = getObjectId(currentClass._id);
        const response = await axios.put(`${API_BASE_URL}/${id}`, classData);
        if (response.data.status === "success") {
          const updatedClasses = classes.map((c) =>
            getObjectId(c._id) === id ? normalizeClasse(response.data.data) : c
          );
          setClasses(updatedClasses);
          fetchStudentCounts(updatedClasses);
          setShowModal(false);
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}`, classData);
        if (response.data.status === "success") {
          const updatedClasses = [
            ...classes,
            normalizeClasse(response.data.data),
          ];
          setClasses(updatedClasses);
          fetchStudentCounts(updatedClasses);
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error("Error saving class:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(t("error_saving_class"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBtn = (classe) => {
    setClassToDelete(classe);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    try {
      setIsSaving(true);
      const id = getObjectId(classToDelete._id);
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      if (response.data.status === "success") {
        setClasses(classes.filter((c) => getObjectId(c._id) !== id));
        setShowDeleteConfirmModal(false);
        setClassToDelete(null);
      }
    } catch (err) {
      console.error("Error deleting class:", err);
      if (err.response && err.response.data) {
        if (err.response.data.students) {
          setStudentsInClass(err.response.data.students);
          setShowDeleteConfirmModal(false);
          setShowTransferModal(true);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(t("error_deleting_class"));
        }
      } else {
        setError(t("error_deleting_class"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransferSuccess = () => {
    if (classToDelete) {
      const id = getObjectId(classToDelete._id);
      setClasses(classes.filter((c) => getObjectId(c._id) !== id));
      setShowTransferModal(false);
      setStudentsInClass(null);
      setClassToDelete(null);
    }
  };

  const handleClassRowClick = (classe) => {
    if (hasOrderChanges) return;
    setSelectedClass(classe);
    fetchClassStudents(getObjectId(classe._id));
    setShowStudentsModal(true);
  };

  const handleMoveUp = (classIndex) => {
    if (classIndex <= 0) return;

    const updatedClasses = [...localClasses];
    const temp = { ...updatedClasses[classIndex - 1] };
    updatedClasses[classIndex - 1] = { ...updatedClasses[classIndex] };
    updatedClasses[classIndex] = temp;

    updatedClasses.forEach((c, idx) => {
      c.order = (idx + 1) * 1000;
    });

    setLocalClasses(updatedClasses);
    setHasOrderChanges(true);
  };

  const handleMoveDown = (classIndex) => {
    if (classIndex >= localClasses.length - 1) return;

    const updatedClasses = [...localClasses];
    const temp = { ...updatedClasses[classIndex + 1] };
    updatedClasses[classIndex + 1] = { ...updatedClasses[classIndex] };
    updatedClasses[classIndex] = temp;

    updatedClasses.forEach((c, idx) => {
      c.order = (idx + 1) * 1000;
    });

    setLocalClasses(updatedClasses);
    setHasOrderChanges(true);
  };

  const handleDragStart = (start) => {
    setIsDragging(true);
    const draggedItemId = getObjectId(localClasses[start.source.index]._id);

    if (!selectedRows.includes(draggedItemId)) {
      setSelectedRows([draggedItemId]);
    }
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const draggedIds = selectedRows.includes(
      getObjectId(localClasses[source.index]._id)
    )
      ? selectedRows
      : [getObjectId(localClasses[source.index]._id)];

    const draggedClasses = [];
    const remainingClasses = [];

    localClasses.forEach((c) => {
      if (draggedIds.includes(getObjectId(c._id))) {
        draggedClasses.push(c);
      } else {
        remainingClasses.push(c);
      }
    });

    const insertIndex = destination.index;
    const newClasses = [
      ...remainingClasses.slice(0, insertIndex),
      ...draggedClasses,
      ...remainingClasses.slice(insertIndex),
    ];

    newClasses.forEach((c, idx) => {
      c.order = (idx + 1) * 1000;
    });

    setLocalClasses(newClasses);
    setHasOrderChanges(true);
    clearSelection();
  };

  const onDragEndStrict = useCallback(
    (result) => {
      flushSync(() => {
        handleDragEnd(result);
      });
    },
    [localClasses, selectedRows]
  );

  const isRowSelected = (classe) =>
    selectedRows.includes(getObjectId(classe._id));

  const handleRowSelect = (classe, event) => {
    const id = getObjectId(classe._id);
    if (event.ctrlKey || event.metaKey) {
      setSelectedRows((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    } else if (event.shiftKey && selectedRows.length > 0) {
      const lastIndex = classes.findIndex(
        (c) => getObjectId(c._id) === selectedRows[selectedRows.length - 1]
      );
      const currIndex = classes.findIndex((c) => getObjectId(c._id) === id);
      const [start, end] = [lastIndex, currIndex].sort((a, b) => a - b);
      const rangeIds = classes
        .slice(start, end + 1)
        .map((c) => getObjectId(c._id));
      setSelectedRows(Array.from(new Set([...selectedRows, ...rangeIds])));
    } else {
      setSelectedRows([id]);
    }
  };

  const clearSelection = () => setSelectedRows([]);

  const saveClassesOrder = async () => {
    try {
      setSavingOrder(true);

      const orderUpdates = localClasses.map((classe, index) => ({
        id: getObjectId(classe._id),
        order: (index + 1) * 1000,
      }));

      const response = await axios.post(`${API_BASE_URL}/batch-update-order`, {
        classes: orderUpdates,
      });

      if (response.data.status === "success") {
        setClasses(response.data.data.map(normalizeClasse));
        setLocalClasses(response.data.data.map(normalizeClasse));
        setHasOrderChanges(false);
      }
    } catch (err) {
      console.error("Error saving class order:", err);
      setError(t("error_saving_class_order"));
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <Container fluid className="p-3">
      <Row className="mb-3">
        <Col>
          <h2 className="text-center">{t("classes_management")}</h2>
        </Col>
      </Row>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>{t("classes")}</h4>
          <div className="d-flex align-items-center">
            <Form.Group className="me-3">
              <Form.Select
                value={selectedSchoolYear}
                onChange={handleSchoolYearChange}
                aria-label="School Year"
                disabled={hasOrderChanges}
              >
                <option value="">{t("select_school_year")}</option>
                {schoolYearPeriods.map((year) => (
                  <option key={year._id.$oid} value={year._id.$oid}>
                    {year.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {hasOrderChanges && (
              <Button
                variant="success"
                className="me-2"
                onClick={saveClassesOrder}
                disabled={savingOrder}
              >
                {savingOrder ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSort} className="me-1" />
                    {t("save_order")}
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={() => {
                setLocalClasses([...classes]);
                setHasOrderChanges(false);
              }}
              disabled={!hasOrderChanges || savingOrder}
            >
              {t("cancel_changes")}
            </Button>
            <Button
              variant="primary"
              onClick={handleAddClass}
              disabled={hasOrderChanges}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              {t("add_class")}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

          {hasOrderChanges && (
            <Alert variant="warning">{t("unsaved_order_changes")}</Alert>
          )}
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">{t("loading")}</span>
              </Spinner>
            </div>
          ) : (
            <DragDropContext
              onDragEnd={onDragEndStrict}
              onDragStart={handleDragStart}
            >
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("order")}</th>
                    <th>{t("class_name")}</th>
                    <th>
                      <FontAwesomeIcon icon={faUserGroup} className="me-2" />
                      {t("students_count")}
                    </th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <Droppable droppableId="classes-table" direction="vertical">
                  {(provided) => (
                    <tbody
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="classes-tbody"
                    >
                      {localClasses.length > 0 ? (
                        localClasses.map((classe, index) => {
                          const safeId = getSafeId(classe._id);
                          const selected = isRowSelected(classe);
                          return (
                            <Draggable
                              key={safeId}
                              draggableId={safeId}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <tr
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  onClick={(e) => {
                                    if (!isDragging && !hasOrderChanges) {
                                      handleRowSelect(classe, e);
                                    }
                                    if (
                                      !isDragging &&
                                      !hasOrderChanges &&
                                      !e.ctrlKey &&
                                      !e.metaKey &&
                                      !e.shiftKey
                                    ) {
                                      handleClassRowClick(classe);
                                    }
                                  }}
                                  style={{
                                    ...tableRowStyle,
                                    opacity: hasOrderChanges ? 0.7 : 1,
                                    cursor: hasOrderChanges
                                      ? "not-allowed"
                                      : "pointer",
                                    backgroundColor: selected
                                      ? "#b3d7ff"
                                      : snapshot.isDragging
                                      ? "#e9ecef"
                                      : "",
                                    ...provided.draggableProps.style,
                                  }}
                                  className={`class-row ${
                                    selected ? "selected" : ""
                                  } ${snapshot.isDragging ? "dragging" : ""}`}
                                  onMouseOver={(e) =>
                                    !snapshot.isDragging &&
                                    !hasOrderChanges &&
                                    (e.currentTarget.style.backgroundColor =
                                      "#f5f5f5")
                                  }
                                  onMouseOut={(e) =>
                                    !snapshot.isDragging &&
                                    !hasOrderChanges &&
                                    (e.currentTarget.style.backgroundColor =
                                      selected ? "#b3d7ff" : "")
                                  }
                                >
                                  <td>{index + 1}</td>
                                  <td
                                    onClick={(e) => e.stopPropagation()}
                                    className="d-flex align-items-center justify-content-between"
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      style={{ cursor: "grab" }}
                                      className="drag-handle"
                                    >
                                      <FontAwesomeIcon icon={faGripVertical} />
                                    </div>
                                    <div className="ms-2 order-arrows">
                                      <Button
                                        variant="light"
                                        size="sm"
                                        className="p-0 me-1"
                                        disabled={index === 0}
                                        onClick={() => handleMoveUp(index)}
                                        title={t("move_up")}
                                      >
                                        <FontAwesomeIcon icon={faArrowUp} />
                                      </Button>
                                      <Button
                                        variant="light"
                                        size="sm"
                                        className="p-0"
                                        disabled={
                                          index === localClasses.length - 1
                                        }
                                        onClick={() => handleMoveDown(index)}
                                        title={t("move_down")}
                                      >
                                        <FontAwesomeIcon icon={faArrowDown} />
                                      </Button>
                                    </div>
                                  </td>
                                  <td>{classe.name}</td>
                                  <td>
                                    {studentCounts[getObjectId(classe._id)] ||
                                      0}
                                  </td>
                                  <td onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => handleEditClass(classe)}
                                      disabled={hasOrderChanges}
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDeleteBtn(classe)}
                                      disabled={hasOrderChanges}
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                  </td>
                                </tr>
                              )}
                            </Draggable>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            {t("no_classes_found")}
                          </td>
                        </tr>
                      )}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </Table>
            </DragDropContext>
          )}
        </Card.Body>
      </Card>
      <ClassModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
        }}
        classe={currentClass}
        handleSave={handleSaveClass}
        isSaving={isSaving}
      />
      <Modal
        show={showDeleteConfirmModal}
        onHide={() => setShowDeleteConfirmModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("confirm_delete")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("confirm_delete_class", { name: classToDelete?.name })}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteConfirmModal(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteClass}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t("deleting")}
              </>
            ) : (
              t("delete")
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <StudentTransferModal
        show={showTransferModal}
        students={studentsInClass}
        classId={classToDelete?._id}
        onClose={() => {
          setShowTransferModal(false);
          setStudentsInClass(null);
          setClassToDelete(null);
        }}
        onSuccess={handleTransferSuccess}
        onError={setError}
      />
      <Modal
        show={showStudentsModal}
        onHide={() => setShowStudentsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedClass?.name} - {t("students")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingStudents ? (
            <div className="text-center py-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">{t("loading")}</span>
              </Spinner>
            </div>
          ) : classStudents.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("student_name")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>{student.name}</td>
                    <td>
                      {student.isLeft ? (
                        <span className="text-danger">{t("left")}</span>
                      ) : student.isNew ? (
                        <span className="text-success">{t("new")}</span>
                      ) : (
                        <span className="text-info">{t("continuing")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center">{t("no_students_in_class")}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowStudentsModal(false)}
          >
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClassesPage;
