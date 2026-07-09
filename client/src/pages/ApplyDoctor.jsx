import { useState } from "react";
import { Form, Input, InputNumber, TimePicker, Row, Col, App as AntdApp } from "antd";
import api from "../config";

const { RangePicker } = TimePicker;

// Two-section application form. `user` prefills contact details; `onApplied` refreshes the shell.
export default function ApplyDoctor({ user, onApplied }) {
  const { message } = AntdApp.useApp();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      const timings = values.timings
        ? [values.timings[0].format("hh:mm A"), values.timings[1].format("hh:mm A")]
        : [];
      await api.post("/api/user/registerdoc", {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        specialization: values.specialization,
        experience: values.experience,
        fees: values.fees,
        timings,
      });
      message.success("Application submitted! An admin will review it shortly.");
      onApplied?.();
    } catch (err) {
      message.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-up" style={{ maxWidth: 760 }}>
      <Form
        layout="vertical"
        onFinish={submit}
        initialValues={{
          fullName: user?.fullName,
          email: user?.email,
          phone: user?.phone,
        }}
      >
        <div className="card-soft" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Personal Details</h3>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
                <Input placeholder="Dr. Jane Doe" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input placeholder="jane@clinic.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
                <Input placeholder="9876543210" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                <Input placeholder="City, Clinic address" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="card-soft" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Professional Details</h3>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Specialization"
                name="specialization"
                rules={[{ required: true }]}
              >
                <Input placeholder="Cardiologist" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Experience"
                name="experience"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. 8 years" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Fees (₹)" name="fees" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} placeholder="500" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Working Hours" name="timings" rules={[{ required: true }]}>
                <RangePicker use12Hours format="hh:mm A" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <button className="btn-brand" type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </Form>
    </div>
  );
}
