import Spinner from 'react-bootstrap/Spinner'

export default function FullPageLoader({ label = 'กำลังโหลด...' }) {
  return (
    <div className="full-page-loader">
      <Spinner animation="border" role="status" />
      <span>{label}</span>
    </div>
  )
}
