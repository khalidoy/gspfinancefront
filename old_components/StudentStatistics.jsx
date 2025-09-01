// src/components/StudentStatistics.jsx

import React from "react";
import { useTranslation } from "react-i18next";

const StudentStatistics = ({ left, newCount, unregistered, registered }) => {
  const { t } = useTranslation();

  return (
    <div className="student-statistics mb-4">
      <ul className="list-inline">
        <li className="list-inline-item">
          <span className="stat-label">{t("students_left")}</span> {left}
        </li>
        <li className="list-inline-item">
          <span className="stat-label">{t("new_students")}</span> {newCount}
        </li>
        <li className="list-inline-item">
          <span className="stat-label">{t("unregistered_students")}</span>{" "}
          {unregistered}
        </li>
        <li className="list-inline-item">
          <span className="stat-label">{t("registered_students")}</span>{" "}
          {registered}
        </li>
      </ul>
    </div>
  );
};

export default StudentStatistics;
