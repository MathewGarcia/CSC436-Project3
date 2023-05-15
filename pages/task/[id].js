import TodoListPage from "../../components/TodoListPage";
import { getTaskById } from "../../util/data";

const TaskPage = ({ taskData }) => {
  return <TodoListPage taskData={taskData} />;
};

export async function getServerSideProps({ params }) {
  const taskData = await getTaskById(params.id);
  return { props: { taskData } };
}

export default TaskPage;
