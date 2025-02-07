
import { useState } from "react";
import UserProfile from "./userprofilecomponents/UserProfile";
import AccountOverview from "./userprofilecomponents/AccountOverview";
import ManageAddresses from "./userprofilecomponents/ManageAddresses";
import MyOrders from "./userprofilecomponents/MyOrders";

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("Account Overview");

  const renderContent = () => {
    switch (activeTab) {
      case "Account Overview":
        return <AccountOverview />;
      case "My Orders":
        return <MyOrders />;
      case "Manage Addresses":
        return <ManageAddresses />;
      default:
        return <AccountOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserProfile activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-3/4 p-6">{renderContent()}</div>
    </div>
  );
};

export default AccountPage;