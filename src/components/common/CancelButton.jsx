import AppButton from './AppButton.jsx'

export default function CancelButton({ children = 'ยกเลิก', ...props }) {
  return <AppButton variant="outline-secondary" {...props}>{children}</AppButton>
}
