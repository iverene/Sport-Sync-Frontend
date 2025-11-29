import Layout from "../components/Layout";
import AddUser from "../components/AddUser";
import TableFilter from "../components/TableFilter";
import KpiCard from "../components/KpiCard";



export default function Users() {
  return (
    <Layout>
        {/* code here */}
      <AddUser/> 
      <KpiCard/>
      <TableFilter/>
    </Layout>
  );
}