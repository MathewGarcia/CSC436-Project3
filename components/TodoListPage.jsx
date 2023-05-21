import { useEffect, useState } from "react";
import { updateTask, deleteTask, getCurrentUser } from "@/util/data";
import Link from "next/link";
import { useRouter } from "next/router";

const TodoListPage = ({ taskData }) => {
  const [editing, setEditing] = useState(false);
  const [taskEditing, setTaskEditing] = useState({});
  const [editedTaskValue, setEditedTaskValue] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const tasksWithCompletion = taskData.tasks.map((task, index) => ({
    ...task,
    isCompleted: task.isCompleted,
    order: task.order,
  }));
  const [tasks, setTasks] = useState(tasksWithCompletion);
  const route = useRouter();

  const highestTaskId = Math.max(...tasks.map((task) => task.id), 0);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, [taskData]);

  const editHandle = () => {
    if (currentUser != null && currentUser.id === taskData.user_id) {
      setEditing(editing ? false : true);
    } else {
      route.push("/home");
    }
  };

  const handleTaskEdit = (taskId, isChecked, newValue) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            isCompleted: isChecked,
            value: newValue !== undefined ? newValue : task.value,
          };
        } else {
          return task;
        }
      });
      return updatedTasks;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    for (const task of tasks) {
      const originalTask = taskData.tasks.find((t) => t.id === task.id);

      if (!originalTask) {
        await updateTask(taskData.id, task.id, { ...task, order: task.order });
        continue;
      }
      if (
        task.value !== originalTask.value ||
        task.isCompleted !== originalTask.isCompleted ||
        task.order !== originalTask.order
      ) {
        await updateTask(taskData.id, task.id, { ...task, order: task.order });
      }
    }

    // Reset the state
    setEditing(false);
    setTaskEditing({});
    setEditedTaskValue("");
  };

  const moveTaskUp = (taskId) => {
    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((task) => task.id === taskId);
      debugger;
      if (taskIndex > 0) {
        const newTasks = prevTasks.map((task, index) => {
          if (index === taskIndex) {
            return { ...task, order: prevTasks[taskIndex - 1].order };
          } else if (index === taskIndex - 1) {
            return { ...task, order: prevTasks[taskIndex].order };
          } else {
            return task;
          }
        });
        console.log("newTasks", newTasks);
        return newTasks;
      }
      return prevTasks;
    });
  };

  const moveTaskDown = (taskId) => {
    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((task) => task.id === taskId);
      if (taskIndex < prevTasks.length - 1) {
        const newTasks = prevTasks.map((task, index) => {
          if (index === taskIndex) {
            return { ...task, order: prevTasks[taskIndex + 1].order };
          } else if (index === taskIndex + 1) {
            return { ...task, order: prevTasks[taskIndex].order };
          } else {
            return task;
          }
        });
        return newTasks;
      }
      return prevTasks;
    });
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskData.id, taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <>
      <div className={"flex flex-col items-center"}>
        <h1 className={"underline"}>{taskData.title}</h1>
        {tasks
          .sort((a, b) => a.order - b.order)
          .map((task) => {
            return (
              <div key={task.id}>
                {editing && (
                  <div className={"flex justify-center"}>
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={(e) =>
                        handleTaskEdit(task.id, e.target.checked, task.value)
                      }
                    />
                    <input
                      type="text"
                      value={task.value ? task.value : ""}
                      onChange={(e) =>
                        handleTaskEdit(
                          task.id,
                          task.isCompleted,
                          e.target.value
                        )
                      }
                    />
                    <button onClick={() => moveTaskUp(task.id)}>^</button>
                    <button
                      onClick={() => moveTaskDown(task.id)}
                      className={"mx-3"}
                    >
                      V
                    </button>
                    <button onClick={() => handleDelete(task.id)}>X</button>
                  </div>
                )}
                {!editing && (
                  <div
                    key={task.id}
                    className={` ${
                      task.isCompleted ? "card-completed" : "card"
                    }`}
                  >
                    <p>
                      {task.value} {task.isCompleted ? "\u2705" : "\u274C"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        {editing && (
          <button
            className={"plus-sign mx-2 my-2"}
            onClick={(e) => {
              e.preventDefault();
              setTasks((tasks) => [
                ...tasks,
                { id: highestTaskId + 1, value: "", isCompleted: false },
              ]);
            }}
          ></button>
        )}
        <button onClick={editHandle}>{editing ? "Cancel" : "Edit"}</button>
        {editing && <button onClick={handleSubmit}>Save Changes</button>}
        <p>
          <small>
            {" "}
            Posted By:{" "}
            <Link href={`/profile/${taskData.user_id}`}>
              {taskData.userName}
            </Link>
          </small>
        </p>
      </div>
    </>
  );
};

export default TodoListPage;
