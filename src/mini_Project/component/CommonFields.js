import React from "react";

const CommonFields = ({ formDetails, handleChange }) => {
  return (
    <>
      <div className="login-block">
        <label className="input-label">
          Full Name <span className="required">*</span>
        </label>
        <input
          type="text"
          name="fullname"
          className="modern-input2"
          placeholder="Enter full name"
          value={formDetails.fullname}
          onChange={handleChange}
        />
      </div>

      <div className="login-block">
        <label className="input-label">
          Email <span className="required">*</span>
        </label>
        <input
          type="email"
          name="email"
          className="modern-input2"
          placeholder="Enter email"
          value={formDetails.email}
          onChange={handleChange}
        />
      </div>

      <div className="login-block">
        <label className="input-label">
          Password <span className="required">*</span>
        </label>
        <input
          type="password"
          name="password"
          className="modern-input2"
          placeholder="Enter password"
          value={formDetails.password}
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default CommonFields;
