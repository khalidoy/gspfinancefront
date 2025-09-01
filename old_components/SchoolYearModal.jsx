// src/components/SchoolYearModal.jsx

import React from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const SchoolYearModal = ({
  show,
  handleClose,
  handleCreate,
  creating,
  error,
  formData,
  setFormData,
}) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("add_new_school_year_period_title")}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleCreate}>
        <Modal.Body>
          {error && (
            <Alert
              variant="danger"
              onClose={() => setFormData({ ...formData, error: "" })}
              dismissible
            >
              {error}
            </Alert>
          )}
          <Form.Group controlId="newSchoolYearName">
            <Form.Label>{t("name")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("enter_name")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group controlId="newSchoolYearStartDate">
            <Form.Label>{t("start_date")}</Form.Label>
            <Form.Control
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group controlId="newSchoolYearEndDate">
            <Form.Label>{t("end_date")}</Form.Label>
            <Form.Control
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" disabled={creating}>
            {creating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                {t("creating")}...
              </>
            ) : (
              t("create")
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SchoolYearModal;
