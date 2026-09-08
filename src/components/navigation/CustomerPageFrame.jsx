import CustomerSidebar from './CustomerSidebar';

export default function CustomerPageFrame({ children }) {
  return <div className="customer-layout"><CustomerSidebar/><main className="customer-main customer-page-main">{children}</main></div>;
}
