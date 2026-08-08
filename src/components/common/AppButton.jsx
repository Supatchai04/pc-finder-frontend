import Button from 'react-bootstrap/Button'

export default function AppButton({ variant = 'primary', children, className = '', ...props }) {
  return (
    <Button variant={variant} className={`pc-button ${className}`} {...props}>
      {children}
    </Button>
  )
}
