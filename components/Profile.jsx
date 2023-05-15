import { getTasksByUserId } from "@/util/data";
import { useEffect, useState } from "react";
import Link from "next/link";

const Profile = ({ userData }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const taskData = await getTasksByUserId(userData.user_id);
      setTasks(taskData);
    };
    fetchData();
  }, [userData]);

  return (
    <div className={"flex flex-col items-center"}>
      <p>{userData.username}</p>
      {tasks.map((task) => {
        return (
          <div key={task.id}>
            <Link href={`/task/${task.id}`}>{task.title}</Link>
          </div>
        );
      })}
    </div>
  );
};
export default Profile;
