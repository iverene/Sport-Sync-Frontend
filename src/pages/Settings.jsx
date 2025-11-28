import Layout from "../components/Layout";
import SettingsTabs from "../components/settings/SettingsTabs";


export default function Settings() {
  return (
    <Layout>
        {/* Header */}
        <div className="mb-5">
        <h1 className="page-title">System Settings</h1>
      </div>

      <SettingsTabs />


    </Layout>
  );
}