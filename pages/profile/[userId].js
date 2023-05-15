import Profile from "../../components/Profile";
import { getUserById } from "../../util/data";

const UserProfilePage = ({ userData }) => {
  return <Profile userData={userData} />;
};

export async function getServerSideProps({ params }) {
  const userData = await getUserById(params.userId);
  return { props: { userData } };
}

export default UserProfilePage;
