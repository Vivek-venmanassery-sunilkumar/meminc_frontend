// src/components/UserProfile.jsx
import { Button } from "@/components/ui/button";

const UserProfile = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: "Account Overview", href: "#account-overview" },
    { name: "My Orders", href: "#my-orders" },
    { name: "Manage Addresses", href: "#manage-addresses" },
  ];

  return (
    <div className="w-1/4 bg-white p-6 shadow-md">
      <nav>
        <ul>
          {tabs.map((tab) => (
            <li key={tab.name} className="mb-2">
              <Button
                variant={activeTab === tab.name ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(tab.name)}
              >
                {tab.name}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default UserProfile;