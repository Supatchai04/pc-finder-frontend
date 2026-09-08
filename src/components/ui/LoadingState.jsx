import { Spinner } from 'react-bootstrap';

export default function LoadingState({ label = 'กำลังโหลด...', fullPage = false }) {
  return (
    <div className={fullPage ? 'state-screen' : 'state-box'}>
      <Spinner animation="border" size="sm" />
      <span>{label}</span>
    </div>
  );
}
