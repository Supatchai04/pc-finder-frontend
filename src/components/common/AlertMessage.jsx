import Alert from 'react-bootstrap/Alert'

export default function AlertMessage({ variant = 'danger', children }) {
  if (!children) return null
  return <Alert variant={variant} className="mb-3">{children}</Alert>
}
