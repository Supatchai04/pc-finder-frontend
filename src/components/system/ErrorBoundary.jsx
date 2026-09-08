import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('PC FINDER render error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="fatal-error-page">
        <div className="fatal-error-card">
          <div className="fatal-error-icon"><AlertTriangle size={34} /></div>
          <h1>หน้าเว็บเกิดข้อผิดพลาด</h1>
          <p>ระบบหยุดการแสดงผลส่วนที่มีปัญหาไว้ เพื่อไม่ให้ข้อมูลส่วนอื่นเสียหาย กรุณารีเฟรชหน้าแล้วลองอีกครั้ง</p>
          <button className="primary-btn" onClick={() => window.location.reload()}><RotateCcw size={16} /> โหลดหน้าใหม่</button>
        </div>
      </main>
    );
  }
}
