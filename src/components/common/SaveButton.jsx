import AppButton from './AppButton.jsx'

export default function SaveButton({ children = 'บันทึก', ...props }) {
  return <AppButton variant="primary" {...props}>{children}</AppButton>
}
